'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SafeDate } from '@/components/safe-format'
import { ARTIFACT_TYPE_LABEL, REVIEW_LABEL, REVIEW_CLASS } from '@/lib/ui-maps'
import { FileText, User2, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Artifact = {
  id: string; title: string; type: string; content: string; reviewStatus: string
  version: number; sources: string | null; createdAt: string
  task: { id: string; title: string } | null
  employee: { id: string; name: string; title: string } | null
}

export function ArtifactsClient({ artifacts }: { artifacts: Artifact[] }) {
  const router = useRouter()
  const [active, setActive] = useState<Artifact | null>(null)
  const [busy, setBusy] = useState(false)

  async function setReview(id: string, reviewStatus: 'APPROVED' | 'REJECTED' | 'IN_REVIEW') {
    setBusy(true)
    try {
      const res = await fetch(`/api/artifacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success('Статус артефакта обновлён')
      setActive(null)
      router.refresh()
    } catch {
      toast.error('Не удалось обновить артефакт')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Артефакты</h1>
        <p className="text-muted-foreground mt-1">Результаты работы цифровых сотрудников — брифы, отчёты, контент и документы.</p>
      </div>

      {artifacts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">Пока нет артефактов. Запустите задачу, чтобы сотрудник создал первый результат.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {artifacts.map((a) => (
            <button
              key={a.id}
              onClick={() => setActive(a)}
              className="group text-left rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:bg-card/80"
            >
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline" className="text-xs">{ARTIFACT_TYPE_LABEL[a.type] ?? a.type}</Badge>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${REVIEW_CLASS[a.reviewStatus as keyof typeof REVIEW_CLASS]}`}>
                  {REVIEW_LABEL[a.reviewStatus as keyof typeof REVIEW_LABEL]}
                </span>
              </div>
              <h3 className="mt-3 font-medium leading-snug line-clamp-2 group-hover:text-primary">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.content.replace(/[#*`>_-]/g, '').slice(0, 120)}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                {a.employee && (<><User2 className="h-3 w-3" />{a.employee.name}</>)}
                <span className="ml-auto"><SafeDate date={a.createdAt} options={{ dateStyle: 'medium' }} /></span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl">
          {active && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{ARTIFACT_TYPE_LABEL[active.type] ?? active.type}</Badge>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${REVIEW_CLASS[active.reviewStatus as keyof typeof REVIEW_CLASS]}`}>
                    {REVIEW_LABEL[active.reviewStatus as keyof typeof REVIEW_LABEL]}
                  </span>
                </div>
                <DialogTitle className="mt-2">{active.title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[50vh] rounded-lg border border-border bg-background/50 p-4">
                <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground/90">{active.content}</pre>
              </ScrollArea>
              {active.sources && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">Источники: </span>{active.sources}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button size="sm" onClick={() => setReview(active.id, 'APPROVED')} disabled={busy || active.reviewStatus === 'APPROVED'} className="gap-1.5">
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Принять
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReview(active.id, 'REJECTED')} disabled={busy} className="gap-1.5">
                  <XCircle className="h-3.5 w-3.5" /> Отклонить
                </Button>
                {active.task && (
                  <span className="ml-auto text-xs text-muted-foreground">Задача: {active.task.title}</span>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
