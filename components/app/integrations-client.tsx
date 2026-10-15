'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Plug, Check } from 'lucide-react'
import { toast } from 'sonner'

type Integration = {
  id: string; provider: string; name: string; category: string; status: string
}

const CATEGORY_LABEL: Record<string, string> = {
  comms: 'Коммуникации',
  storage: 'Хранилище',
  docs: 'Документы',
  crm: 'CRM',
  marketing: 'Маркетинг',
  other: 'Другое',
}

export function IntegrationsClient({ integrations }: { integrations: Integration[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function toggle(i: Integration) {
    const next = i.status === 'CONNECTED' ? 'AVAILABLE' : 'CONNECTED'
    setBusy(i.id)
    try {
      const res = await fetch(`/api/integrations/${i.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error()
      toast.success(next === 'CONNECTED' ? `${i.name} подключен` : `${i.name} отключен`)
      router.refresh()
    } catch {
      toast.error('Не удалось изменить интеграцию')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Интеграции</h1>
        <p className="text-muted-foreground mt-1">Каталог каналов для цифровых сотрудников.</p>
      </div>

      <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
        Реестр интеграций в этой версии управляет статусом подключения и доступностью каналов. Живой OAuth-обмен данными подключается отдельно.
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((i) => {
          const connected = i.status === 'CONNECTED'
          return (
            <div key={i.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Plug className="h-5 w-5 text-primary" />
                </div>
                {connected && (
                  <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    <Check className="h-3 w-3" /> Подключено
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-medium">{i.name}</h3>
              <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[i.category] ?? i.category}</p>
              <Button
                size="sm"
                variant={connected ? 'outline' : 'default'}
                className="mt-4 w-full"
                onClick={() => toggle(i)}
                disabled={busy === i.id}
              >
                {busy === i.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : connected ? 'Отключить' : 'Подключить'}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
