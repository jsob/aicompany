import { redirect } from 'next/navigation'
import { getCompanyContext } from '@/lib/tenant'
import { prisma } from '@/lib/db'
import { PLANS, PLAN_ORDER } from '@/lib/pricing'
import { BillingClient } from '@/components/app/billing-client'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const ctx = await getCompanyContext()
  if (!ctx) redirect('/login')

  const [subscription, usageAgg, employeeCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { companyId: ctx.company.id } }),
    prisma.usageEvent.aggregate({ where: { companyId: ctx.company.id }, _sum: { costCents: true } }),
    prisma.employee.count({ where: { companyId: ctx.company.id, status: { not: 'ARCHIVED' } } }),
  ])

  const currentPlan = subscription?.plan ?? 'FREE'
  const spentCents = usageAgg._sum.costCents ?? 0
  const monthlyCreditCents = subscription?.monthlyCreditCents ?? PLANS.FREE.monthlyCreditCents

  const plans = PLAN_ORDER.map((tier) => ({
    tier,
    name: PLANS[tier].name,
    priceCents: PLANS[tier].priceCents,
    monthlyCreditCents: PLANS[tier].monthlyCreditCents,
    maxEmployees: PLANS[tier].maxEmployees,
    seats: PLANS[tier].seats,
    highlights: PLANS[tier].highlights,
  }))

  return (
    <BillingClient
      plans={plans}
      currentPlan={currentPlan}
      spentCents={spentCents}
      monthlyCreditCents={monthlyCreditCents}
      employeeCount={employeeCount}
      canManage={ctx.membership.role !== 'MEMBER'}
    />
  )
}
