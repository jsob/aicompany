import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCompany, isResponse } from '@/lib/api';
import { runTask } from '@/lib/agent-runtime';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const { id } = await params;
  const existing = await prisma.task.findFirst({ where: { id, companyId: ctx.company.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const result = await runTask(id, ctx.user.name ?? ctx.user.email);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
