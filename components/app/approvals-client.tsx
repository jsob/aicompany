'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SafeDate } from '@/components/safe-format'
import { APPROVAL_LABEL } from '@/lib/ui-maps'
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

type Approval = {
  id: string; type: string; status: string; title: string; detail: string | null
  decisionNote: string | null; createdAt: string; decidedAt: string | null
  task: { id: string; title: string } | null
  artifact: { id: string; title: string } | null
  decidedBy: string | null
}

const STATUS_CLASS: Record<string, string> = {
  PENDING: 'bg-warning/15 text-warning',
  APPROVED: 'bg-success/15 text-success',
  REJECTED: 'bg-destructive/15 text-destructive',
}

export function ApprovalsClient({ approvals }: { approvals: Approval[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const pending = approvals.filter((a) => a.status === 'PENDING')
  const decided = approvals.filter((a) => a.status !== 'PENDING')

  async function decide(id: string, status: 'APPROVED' | 'REJECTED') {
    setBusy(id)
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, decisionNote: notes[id] ?? '' }),
      })
      if (!res.ok) throw new Error()
      toast.success(status === 'APPROVED' ? 'Согласовано' : 'Отклонено')
      router.refresh()
    } catch {
      toast.error('Не удалось обработать решение')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Согласования</h1>
        <p className="text-muted-foreground mt-1">Контрольные точки — ничто не публикуется и не отправляется без вашего решения.</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Ожидают решения ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <ShieldCheck className="mx-auto h-9 w-9 text-success/60" />
            <p className="mt-3 text-muted-foreground">Нет ожидающих согласований.</p>
          </div>
        ) : (
          pending.map((a) => (
            <div key={a.id} className="rounded-xl border border-warning/30 bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{a.title}</h3>
                  {a.detail && <p className="mt-1 text-sm text-muted-foreground">{a.detail}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {a.artifact && <span>Артефакт: {a.artifact.title}</span>}
                    {a.task && <span>Задача: {a.task.title}</span>}
                    <span><SafeDate date={a.createdAt} options={{ dateStyle: 'medium', timeStyle: 'short' }} /></span>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[a.status]}`}>{APPROVAL_LABEL[a.status as keyof typeof APPROVAL_LABEL]}</span>
              </div>
              <Textarea
                placeholder="Комментарий к решению (необязательно)"
                value={notes[a.id] ?? ''}
                onChange={(e) => setNotes((n) => ({ ...n, [a.id]: e.target.value }))}
                className="mt-3 min-h-[60px]"
              />
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => decide(a.id, 'APPROVED')} disabled={busy === a.id} className="gap-1.5">
                  {busy === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Согласовать
                </Button>
                <Button size="sm" variant="outline" onClick={() => decide(a.id, 'REJECTED')} disabled={busy === a.id} className="gap-1.5">
                  <XCircle className="h-3.5 w-3.5" /> Отклонить
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {decided.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">История решений</h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {decided.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {a.decidedBy && <span>{a.decidedBy}</span>}
                    {a.decidedAt && <span><SafeDate date={a.decidedAt} options={{ dateStyle: 'medium', timeStyle: 'short' }} /></span>}
                    {a.decisionNote && <span className="italic">«{a.decisionNote}»</span>}
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[a.status]}`}>{APPROVAL_LABEL[a.status as keyof typeof APPROVAL_LABEL]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
