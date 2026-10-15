import Link from 'next/link'
import { requireCompanyContext } from '@/lib/tenant'
import { prisma } from '@/lib/db'
import { PLANS } from '@/lib/pricing'
import { formatCents } from '@/lib/utils'
import { StatCard } from '@/components/app/stat-card'
import { Button } from '@/components/ui/button'
import { SafeDate } from '@/components/safe-format'
import { TASK_STATUS_LABEL, TASK_STATUS_CLASS } from '@/lib/ui-maps'
import { ArrowRight, Users, ListChecks, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const ctx = await requireCompanyContext()
  const companyId = ctx.company.id

  const periodStart = new Date()
  periodStart.setDate(1)
  periodStart.setHours(0, 0, 0, 0)

  const [employeeCount, activeTasks, pendingApprovals, doneTasks, spendAgg, sub, recentTasks, recentAudit] =
    await Promise.all([
      prisma.employee.count({ where: { companyId, status: { not: 'ARCHIVED' } } }),
      prisma.task.count({ where: { companyId, status: { in: ['BACKLOG', 'QUEUED', 'RUNNING', 'REVIEW', 'BLOCKED'] } } }),
      prisma.approval.count({ where: { companyId, status: 'PENDING' } }),
      prisma.task.count({ where: { companyId, status: 'DONE' } }),
      prisma.usageEvent.aggregate({ where: { companyId, createdAt: { gte: periodStart } }, _sum: { costCents: true } }),
      prisma.subscription.findUnique({ where: { companyId } }),
      prisma.task.findMany({
        where: { companyId },
        orderBy: { updatedAt: 'desc' },
        take: 6,
        include: { employee: true },
      }),
      prisma.auditEvent.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 8 }),
    ])

  const spent = spendAgg._sum.costCents ?? 0
  const budget = sub?.monthlyCreditCents ?? PLANS.FREE.monthlyCreditCents
  const pct = Math.min(100, Math.round((spent / Math.max(1, budget)) * 100))
  const planName = sub ? PLANS[sub.plan].name : 'Free'

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Командный центр</h1>
          <p className="text-sm text-muted-foreground">Обзор вашей цифровой компании</p>
        </div>
        <Link href="/app/tasks">
          <Button className="gap-2">Новая задача <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Цифровые сотрудники" value={String(employeeCount)} hint="активных в команде" />
        <StatCard label="Активные задачи" value={String(activeTasks)} hint={`${doneTasks} выполнено`} />
        <StatCard label="На согласовании" value={String(pendingApprovals)} hint="требуют решения" accent={pendingApprovals > 0 ? 'warning' : 'default'} />
        <StatCard
          label={`Расход · ${planName}`}
          value={formatCents(spent)}
          hint={`из ${formatCents(budget)} · ${pct}%`}
          accent={pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'default'}
        />
      </div>

      {/* Budget bar */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Месячный AI-бюджет</span>
          <span className="font-medium">{formatCents(spent)} / {formatCents(budget)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={
              'h-full rounded-full ' + (pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-warning' : 'bg-accent')
            }
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent tasks */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Последние задачи</h2>
            <Link href="/app/tasks" className="text-xs text-accent hover:underline">Все</Link>
          </div>
          {recentTasks.length === 0 ? (
            <EmptyRow icon={<ListChecks className="h-5 w-5" />} text="Пока нет задач" />
          ) : (
            <ul className="space-y-3">
              {recentTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.employee?.name ?? 'Без исполнителя'}
                    </p>
                  </div>
                  <span className={'shrink-0 rounded-full px-2.5 py-0.5 text-xs ' + TASK_STATUS_CLASS[t.status]}>
                    {TASK_STATUS_LABEL[t.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Активность</h2>
            <Link href="/app/audit" className="text-xs text-accent hover:underline">Журнал</Link>
          </div>
          {recentAudit.length === 0 ? (
            <EmptyRow icon={<ShieldCheck className="h-5 w-5" />} text="Нет событий" />
          ) : (
            <ul className="space-y-3">
              {recentAudit.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div className="min-w-0">
                    <p className="truncate">{a.summary ?? a.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.actorName ?? a.actorType} · <SafeDate date={a.createdAt} options={{ dateStyle: 'medium', timeStyle: 'short' }} />
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
      {icon}
      <p className="text-sm">{text}</p>
    </div>
  )
}
