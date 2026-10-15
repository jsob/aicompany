import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCompany, isResponse } from '@/lib/api';
import { logAudit } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

async function owned(companyId: string, id: string) {
  return prisma.employee.findFirst({ where: { id, companyId } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const { id } = await params;
  const existing = await owned(ctx.company.id, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.json();
  const data: any = {};
  for (const f of ['name', 'title', 'instructions', 'model', 'kpi'] as const) {
    if (typeof body[f] === 'string') data[f] = body[f];
  }
  if (body.status) data.status = body.status;
  if (Number.isFinite(body.budgetCents)) data.budgetCents = Math.max(0, Math.round(body.budgetCents));
  if ('managerId' in body) data.managerId = body.managerId || null;
  const employee = await prisma.employee.update({ where: { id }, data });
  await logAudit(ctx.company.id, {
    action: 'employee.updated', actorName: ctx.user.name ?? ctx.user.email,
    entityType: 'employee', entityId: id, summary: `Обновлён сотрудник ${employee.name}.`,
  });
  return NextResponse.json({ employee });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const { id } = await params;
  const existing = await owned(ctx.company.id, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.employee.update({ where: { id }, data: { status: 'ARCHIVED' } });
  await logAudit(ctx.company.id, {
    action: 'employee.archived', actorName: ctx.user.name ?? ctx.user.email,
    entityType: 'employee', entityId: id, summary: `Сотрудник ${existing.name} архивирован.`,
  });
  return NextResponse.json({ ok: true });
}
