import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCompany, isResponse } from '@/lib/api';
import { logAudit } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const { id } = await params;
  const existing = await prisma.artifact.findFirst({ where: { id, companyId: ctx.company.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.json();
  const data: any = {};
  if (body.reviewStatus) data.reviewStatus = body.reviewStatus;
  if (typeof body.title === 'string') data.title = body.title;
  if (typeof body.content === 'string') data.content = body.content;
  if (body.type) data.type = body.type;
  const artifact = await prisma.artifact.update({ where: { id }, data });
  await logAudit(ctx.company.id, {
    action: 'artifact.updated', actorName: ctx.user.name ?? ctx.user.email,
    entityType: 'artifact', entityId: id, summary: `Артефакт «${artifact.title}» обновлён.`,
  });
  return NextResponse.json({ artifact });
}
