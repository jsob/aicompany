import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCompany, isResponse } from '@/lib/api';
import { logAudit } from '@/lib/tenant';
import { PLANS } from '@/lib/pricing';
import { PlanTier } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Change the company plan. Internal plan management (no external charge).
export async function POST(request: Request) {
  const ctx = await withCompany();
  if (isResponse(ctx)) return ctx;
  if (ctx.membership.role === 'MEMBER') {
    return NextResponse.json({ error: 'Недостаточно прав для смены тарифа' }, { status: 403 });
  }
  const body = await request.json();
  const plan = body?.plan as PlanTier;
  if (!plan || !PLANS[plan]) return NextResponse.json({ error: 'Неверный тариф' }, { status: 400 });
  const def = PLANS[plan];
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  const subscription = await prisma.subscription.upsert({
    where: { companyId: ctx.company.id },
    update: { plan, status: plan === 'FREE' ? 'TRIALING' : 'ACTIVE', monthlyCreditCents: def.monthlyCreditCents, seats: def.seats, currentPeriodEnd: periodEnd },
    create: { companyId: ctx.company.id, plan, status: plan === 'FREE' ? 'TRIALING' : 'ACTIVE', monthlyCreditCents: def.monthlyCreditCents, seats: def.seats, currentPeriodEnd: periodEnd },
  });
  await logAudit(ctx.company.id, {
    action: 'billing.plan_changed', actorName: ctx.user.name ?? ctx.user.email,
    entityType: 'subscription', entityId: subscription.id, summary: `Тариф изменён на ${def.name}.`,
  });
  return NextResponse.json({ subscription });
}
