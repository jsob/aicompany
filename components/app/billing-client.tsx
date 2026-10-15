'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatCents } from '@/lib/utils'
import { Check, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'

type Plan = {
  tier: string; name: string; priceCents: number; monthlyCreditCents: number
  maxEmployees: number; seats: number; highlights: string[]
}

export function BillingClient({
  plans, currentPlan, spentCents, monthlyCreditCents, employeeCount, canManage,
}: {
  plans: Plan[]; currentPlan: string; spentCents: number; monthlyCreditCents: number
  employeeCount: number; canManage: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  const usedPct = monthlyCreditCents > 0 ? Math.min(100, Math.round((spentCents / monthlyCreditCents) * 100)) : 0

  async function changePlan(tier: string) {
    if (tier === currentPlan) return
    setBusy(tier)
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: tier }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error)
      }
      toast.success('Тариф обновлён')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || 'Не удалось сменить тариф')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Биллинг и лимиты</h1>
        <p className="text-muted-foreground mt-1">Тариф компании и расход AI-бюджета.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Текущий тариф</p>
          <p className="mt-1 text-2xl font-semibold">{plans.find((p) => p.tier === currentPlan)?.name ?? currentPlan}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Цифровые сотрудники</p>
          <p className="mt-1 text-2xl font-semibold">{employeeCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">AI-расход (всего)</p>
          <p className="mt-1 text-2xl font-semibold">{formatCents(spentCents)}</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${usedPct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">бюджет периода {formatCents(monthlyCreditCents)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/60 p-4 text-sm text-muted-foreground">
        Управление тарифами в этой версии ведётся внутри платформы и не списывает реальных платежей. Подключение провайдера платежей — отдельный шаг.
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => {
          const current = p.tier === currentPlan
          return (
            <div key={p.tier} className={`flex flex-col rounded-xl border p-5 ${current ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                {current && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Текущий</span>}
              </div>
              <p className="mt-2 text-2xl font-semibold">{p.priceCents === 0 ? '$0' : formatCents(p.priceCents)}<span className="text-sm font-normal text-muted-foreground">/мес</span></p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {p.highlights.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{h}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full gap-1.5"
                variant={current ? 'outline' : 'default'}
                disabled={current || !canManage || busy === p.tier}
                onClick={() => changePlan(p.tier)}
              >
                {busy === p.tier ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : current ? 'Активен' : <><Zap className="h-3.5 w-3.5" /> Выбрать</>}
              </Button>
            </div>
          )
        })}
      </div>
      {!canManage && <p className="text-xs text-muted-foreground">Смена тарифа доступна владельцу или администратору компании.</p>}
    </div>
  )
}
