import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCompany, isResponse } from '@/lib/api';
import { logAudit } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const { id } = await params;
  const existing = await prisma.task.findFirst({ where: { id, companyId: ctx.company.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.json();
  const data: any = {};
  for (const f of ['title', 'description', 'acceptanceCriteria'] as const) {
    if (typeof body[f] === 'string') data[f] = body[f];
  }
  if (body.status) data.status = body.status;
  if (body.priority) data.priority = body.priority;
  if (Number.isFinite(body.progress)) data.progress = Math.min(100, Math.max(0, Math.round(body.progress)));
  if ('employeeId' in body) {
    let employeeId: string | null = body.employeeId || null;
    if (employeeId) {
      const emp = await prisma.employee.findFirst({ where: { id: employeeId, companyId: ctx.company.id } });
      if (!emp) employeeId = null;
    }
    data.employeeId = employeeId;
  }
  const task = await prisma.task.update({ where: { id }, data });
  await logAudit(ctx.company.id, {
    action: 'task.updated', actorName: ctx.user.name ?? ctx.user.email,
    entityType: 'task', entityId: id, summary: `Обновлена задача «${task.title}».`,
  });
  return NextResponse.json({ task });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const { id } = await params;
  const existing = await prisma.task.findFirst({ where: { id, companyId: ctx.company.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.task.update({ where: { id }, data: { status: 'CANCELLED' } });
  await logAudit(ctx.company.id, {
    action: 'task.cancelled', actorName: ctx.user.name ?? ctx.user.email,
    entityType: 'task', entityId: id, summary: `Задача «${existing.title}» отменена.`,
  });
  return NextResponse.json({ ok: true });
}
