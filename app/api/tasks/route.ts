import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCompany, isResponse } from '@/lib/api';
import { logAudit } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const tasks = await prisma.task.findMany({
    where: { companyId: ctx.company.id },
    orderBy: { createdAt: 'desc' },
    include: {
      employee: { select: { id: true, name: true, title: true } },
      _count: { select: { artifacts: true } },
    },
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const body = await request.json();
  if (!body?.title || !body?.description) {
    return NextResponse.json({ error: 'Название и описание обязательны' }, { status: 400 });
  }
  // Validate employee belongs to company.
  let employeeId: string | null = body.employeeId || null;
  if (employeeId) {
    const emp = await prisma.employee.findFirst({ where: { id: employeeId, companyId: ctx.company.id } });
    if (!emp) employeeId = null;
  }
  const task = await prisma.task.create({
    data: {
      companyId: ctx.company.id,
      title: String(body.title).slice(0, 200),
      description: String(body.description).slice(0, 6000),
      acceptanceCriteria: body.acceptanceCriteria ? String(body.acceptanceCriteria).slice(0, 2000) : null,
      priority: body.priority || 'MEDIUM',
      employeeId,
      createdById: ctx.user.id,
    },
  });
  await logAudit(ctx.company.id, {
    action: 'task.created', actorName: ctx.user.name ?? ctx.user.email,
    entityType: 'task', entityId: task.id, summary: `Создана задача «${task.title}».`,
  });
  return NextResponse.json({ task }, { status: 201 });
}
