import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCompany, isResponse } from '@/lib/api';
import { logAudit } from '@/lib/tenant';
import { PLANS } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const employees = await prisma.employee.findMany({
    where: { companyId: ctx.company.id },
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { tasks: true, artifacts: true } }, manager: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ employees });
}

export async function POST(request: Request) {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const body = await request.json();

  const sub = await prisma.subscription.findUnique({ where: { companyId: ctx.company.id } });
  const max = PLANS[sub?.plan ?? 'FREE'].maxEmployees;
  if (max !== -1) {
    const count = await prisma.employee.count({ where: { companyId: ctx.company.id, status: { not: 'ARCHIVED' } } });
    if (count >= max) {
      return NextResponse.json({ error: `Достигнут лимит сотрудников для тарифа. Обновите план.` }, { status: 403 });
    }
  }

  if (!body?.name || !body?.title || !body?.instructions) {
    return NextResponse.json({ error: 'Имя, должность и инструкции обязательны' }, { status: 400 });
  }

  const employee = await prisma.employee.create({
    data: {
      companyId: ctx.company.id,
      name: String(body.name).slice(0, 120),
      title: String(body.title).slice(0, 120),
      roleKey: String(body.roleKey || 'custom').slice(0, 60),
      instructions: String(body.instructions).slice(0, 8000),
      model: String(body.model || 'gpt-5.4-mini'),
      kpi: body.kpi ? String(body.kpi).slice(0, 240) : null,
      budgetCents: Number.isFinite(body.budgetCents) ? Math.max(0, Math.round(body.budgetCents)) : 5000,
      managerId: body.managerId || null,
    },
  });
  await logAudit(ctx.company.id, {
    action: 'employee.created', actorName: ctx.user.name ?? ctx.user.email,
    entityType: 'employee', entityId: employee.id, summary: `Добавлен сотрудник ${employee.name} (${employee.title}).`,
  });
  return NextResponse.json({ employee }, { status: 201 });
}
