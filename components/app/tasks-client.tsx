'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCents } from '@/lib/utils'
import {
  TASK_COLUMNS, TASK_STATUS_LABEL, PRIORITY_LABEL, PRIORITY_CLASS,
} from '@/lib/ui-maps'
import { toast } from 'sonner'
import { Plus, Loader2, Play, FileText, AlertCircle } from 'lucide-react'

type Employee = { id: string; name: string; title: string }
type Task = {
  id: string; title: string; description: string; status: string; priority: string
  progress: number; costCents: number; errorMessage: string | null
  employee: { id: string; name: string; title: string } | null
  _count: { artifacts: number }
}

export function TasksClient() {
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [acceptance, setAcceptance] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [employeeId, setEmployeeId] = useState('')

  const load = useCallback(async () => {
    const [tRes, eRes] = await Promise.all([fetch('/api/tasks'), fetch('/api/employees')])
    if (tRes.ok) setTasks((await tRes.json()).tasks)
    if (eRes.ok) setEmployees((await eRes.json()).employees.filter((e: any) => e.status !== 'ARCHIVED'))
  }, [])
  useEffect(() => { load() }, [load])

  async function create() {
    if (!title || !description) { toast.error('Заполните название и описание') ; return }
    setSaving(true)
    const res = await fetch('/api/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, acceptanceCriteria: acceptance, priority, employeeId: employeeId || null }),
    })
    setSaving(false)
    if (!res.ok) { toast.error('Ошибка создания') ; return }
    toast.success('Задача создана')
    setOpen(false)
    setTitle(''); setDescription(''); setAcceptance(''); setPriority('MEDIUM'); setEmployeeId('')
    load()
  }

  async function run(id: string) {
    setRunning(id)
    try {
      const res = await fetch(`/api/tasks/${id}/run`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast.error(data?.error ?? 'Ошибка выполнения') }
      else { toast.success(`Готово · стоимость ${formatCents(data.costCents ?? 0)}. Артефакт на проверке.`) }
    } catch { toast.error('Сетевая ошибка') }
    setRunning(null)
    load()
  }

  const canRun = (t: Task) => t.employee && !['RUNNING', 'DONE', 'CANCELLED'].includes(t.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Задачи</h1>
          <p className="text-sm text-muted-foreground">Граф работы цифровой команды</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Новая задача</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>Новая задача</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Название</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Описание</Label><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Что нужно сделать?" /></div>
              <div className="space-y-2"><Label>Критерии приёмки (опц.)</Label><Textarea rows={2} value={acceptance} onChange={(e) => setAcceptance(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Приоритет</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Исполнитель</Label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name} — {e.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {employees.length === 0 && (
                <p className="text-xs text-warning">Сначала добавьте цифрового сотрудника, чтобы запускать задачи.</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
              <Button onClick={create} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Создать</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {tasks === null ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {TASK_COLUMNS.map((c) => <Skeleton key={c} className="h-64 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {TASK_COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col)
            return (
              <div key={col} className="flex flex-col rounded-xl border border-border bg-card/40 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="text-sm font-medium">{TASK_STATUS_LABEL[col as keyof typeof TASK_STATUS_LABEL]}</span>
                  <span className="text-xs text-muted-foreground">{colTasks.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {colTasks.map((t) => (
                    <div key={t.id} className="rounded-lg border border-border bg-card p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{t.title}</p>
                        <span className={'shrink-0 rounded-full px-2 py-0.5 text-[10px] ' + PRIORITY_CLASS[t.priority as keyof typeof PRIORITY_CLASS]}>
                          {PRIORITY_LABEL[t.priority as keyof typeof PRIORITY_LABEL]}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
                      {t.employee && <p className="mt-2 text-xs text-muted-foreground">🤖 {t.employee.name}</p>}
                      {t.status === 'BLOCKED' && t.errorMessage && (
                        <p className="mt-2 flex items-start gap-1 text-xs text-destructive"><AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />{t.errorMessage}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {t._count.artifacts > 0 && (
                            <Link href="/app/artifacts" className="flex items-center gap-1 hover:text-foreground">
                              <FileText className="h-3 w-3" />{t._count.artifacts}
                            </Link>
                          )}
                          {t.costCents > 0 && <span>{formatCents(t.costCents)}</span>}
                        </div>
                        {canRun(t) && (
                          <Button size="sm" variant="secondary" className="h-7 gap-1 px-2 text-xs" disabled={running === t.id} onClick={() => run(t.id)}>
                            {running === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                            Запуск
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && <p className="px-1 py-6 text-center text-xs text-muted-foreground">Пусто</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
