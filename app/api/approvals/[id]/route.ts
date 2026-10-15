import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCompany, isResponse } from '@/lib/api';
import { logAudit } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const { id } = await params;
  const existing = await prisma.approval.findFirst({ where: { id, companyId: ctx.company.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.json();
  const decision = body?.status as 'APPROVED' | 'REJECTED' | undefined;
  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    return NextResponse.json({ error: 'Некорректное решение' }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.approval.update({
      where: { id },
      data: {
        status: decision,
        decidedById: ctx.user.id,
        decisionNote: body.decisionNote ? String(body.decisionNote).slice(0, 2000) : null,
        decidedAt: new Date(),
      },
    });
    if (existing.artifactId) {
      await tx.artifact.update({
        where: { id: existing.artifactId },
        data: { reviewStatus: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED' },
      });
    }
    if (existing.taskId) {
      await tx.task.update({
        where: { id: existing.taskId },
        data: { status: decision === 'APPROVED' ? 'DONE' : 'REVIEW' },
      });
    }
  });

  await logAudit(ctx.company.id, {
    action: decision === 'APPROVED' ? 'approval.approved' : 'approval.rejected',
    actorName: ctx.user.name ?? ctx.user.email,
    entityType: 'approval', entityId: id,
    summary: `Согласование «${existing.title}»: ${decision === 'APPROVED' ? 'принято' : 'отклонено'}.`,
  });
  return NextResponse.json({ ok: true });
}
