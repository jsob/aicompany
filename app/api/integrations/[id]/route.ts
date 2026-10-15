import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCompany, isResponse } from '@/lib/api';
import { logAudit } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  const { id } = await params;
  const existing = await prisma.integration.findFirst({ where: { id, companyId: ctx.company.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.json();
  const status = body?.status as 'AVAILABLE' | 'CONNECTED' | 'DISABLED' | undefined;
  if (!status) return NextResponse.json({ error: 'Статус обязателен' }, { status: 400 });
  const integration = await prisma.integration.update({
    where: { id },
    data: { status, config: body.config ?? existing.config ?? undefined },
  });
  await logAudit(ctx.company.id, {
    action: 'integration.updated', actorName: ctx.user.name ?? ctx.user.email,
    entityType: 'integration', entityId: id,
    summary: `Интеграция ${integration.name}: ${status === 'CONNECTED' ? 'подключена' : status === 'DISABLED' ? 'отключена' : 'доступна'}.`,
  });
  return NextResponse.json({ integration });
}
