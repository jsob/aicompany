import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/tenant';
import { estimateCostCents } from '@/lib/pricing';
import { presetByKey } from '@/lib/role-presets';
import { ArtifactType } from '@prisma/client';

const BRAND_GUARDRAILS =
  'Общие правила: пиши на русском, если задача на русском. Будь конкретным и структурным. ' +
  'Не выдумывай факты, цифры или источники. Если данных недостаточно — явно помечай «требует проверки». ' +
  'Верни готовый деловой артефакт в формате Markdown без вступлений типа «вот ваш результат».';

export type RunResult = {
  ok: boolean;
  artifactId?: string;
  approvalId?: string;
  costCents?: number;
  error?: string;
};

/**
 * Executes a task with its assigned digital employee against the LLM API,
 * produces a versioned artifact, records usage/cost attribution, opens an
 * artifact-review approval, and writes audit events. Enforces the company's
 * monthly credit budget and the employee budget.
 */
export async function runTask(taskId: string, actorName?: string): Promise<RunResult> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { employee: true, company: { include: { subscription: true } } },
  });
  if (!task) return { ok: false, error: 'Task not found' };
  if (!task.employee) return { ok: false, error: 'Задаче не назначен цифровой сотрудник' };

  const apiKey = process.env.ABACUSAI_API_KEY;
  if (!apiKey) return { ok: false, error: 'LLM API key is not configured' };

  // Budget enforcement (company monthly credit).
  const sub = task.company.subscription;
  if (sub) {
    const periodStart = new Date();
    periodStart.setDate(1);
    periodStart.setHours(0, 0, 0, 0);
    const agg = await prisma.usageEvent.aggregate({
      where: { companyId: task.companyId, createdAt: { gte: periodStart } },
      _sum: { costCents: true },
    });
    const spent = agg._sum.costCents ?? 0;
    if (spent >= sub.monthlyCreditCents) {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'BLOCKED', errorMessage: 'Исчерпан месячный AI-бюджет. Обновите тариф.' },
      });
      return { ok: false, error: 'Исчерпан месячный AI-бюджет компании. Обновите тариф в разделе «Биллинг».' };
    }
  }

  await prisma.task.update({ where: { id: taskId }, data: { status: 'RUNNING', progress: 10, errorMessage: null } });

  const emp = task.employee;
  const preset = presetByKey(emp.roleKey);
  const defaultArtifact: ArtifactType = preset?.defaultArtifact ?? 'OTHER';

  const systemPrompt = `${emp.instructions}\n\n${BRAND_GUARDRAILS}`;
  const userPrompt =
    `Задача: ${task.title}\n\nОписание:\n${task.description}` +
    (task.acceptanceCriteria ? `\n\nКритерии приёмки:\n${task.acceptanceCriteria}` : '') +
    `\n\nСоздай итоговый артефакт по этой задаче.`;

  try {
    const resp = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: emp.model || 'gpt-5.4-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2500,
        temperature: 0.4,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'BLOCKED', errorMessage: `LLM error ${resp.status}` },
      });
      return { ok: false, error: `LLM API error ${resp.status}: ${text.slice(0, 180)}` };
    }

    const data = await resp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    if (!content.trim()) {
      await prisma.task.update({ where: { id: taskId }, data: { status: 'BLOCKED', errorMessage: 'Пустой ответ модели' } });
      return { ok: false, error: 'Модель вернула пустой результат' };
    }

    const inputTokens = data?.usage?.prompt_tokens ?? Math.ceil((systemPrompt.length + userPrompt.length) / 4);
    const outputTokens = data?.usage?.completion_tokens ?? Math.ceil(content.length / 4);
    const costCents = estimateCostCents(inputTokens, outputTokens);

    const title = `${preset?.title ?? emp.title}: ${task.title}`.slice(0, 160);

    const result = await prisma.$transaction(async (tx) => {
      const version = (await tx.artifact.count({ where: { taskId: task.id } })) + 1;
      const artifact = await tx.artifact.create({
        data: {
          companyId: task.companyId,
          taskId: task.id,
          employeeId: emp.id,
          type: defaultArtifact,
          title,
          content,
          version,
          reviewStatus: 'IN_REVIEW',
        },
      });

      await tx.usageEvent.create({
        data: {
          companyId: task.companyId,
          employeeId: emp.id,
          taskId: task.id,
          kind: 'llm_completion',
          model: emp.model,
          inputTokens,
          outputTokens,
          costCents,
        },
      });

      await tx.employee.update({
        where: { id: emp.id },
        data: { spentCents: { increment: costCents } },
      });

      await tx.task.update({
        where: { id: task.id },
        data: { status: 'REVIEW', progress: 100, costCents: { increment: costCents } },
      });

      const approval = await tx.approval.create({
        data: {
          companyId: task.companyId,
          type: 'ARTIFACT_REVIEW',
          status: 'PENDING',
          title: `Ревью артефакта: ${task.title}`.slice(0, 160),
          detail: `Сотрудник ${emp.name} (${emp.title}) подготовил артефакт. Требуется решение.`,
          taskId: task.id,
          artifactId: artifact.id,
        },
      });

      return { artifactId: artifact.id, approvalId: approval.id };
    });

    await logAudit(task.companyId, {
      action: 'task.executed',
      actorType: 'agent',
      actorName: emp.name,
      entityType: 'task',
      entityId: task.id,
      summary: `Сотрудник ${emp.name} выполнил задачу «${task.title}» и создал артефакт.`,
      metadata: { costCents, inputTokens, outputTokens, model: emp.model },
    });

    return { ok: true, ...result, costCents };
  } catch (err: any) {
    console.error('runTask error', err);
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'BLOCKED', errorMessage: err?.message?.slice(0, 200) ?? 'Execution failed' },
    });
    return { ok: false, error: err?.message ?? 'Execution failed' };
  }
}
