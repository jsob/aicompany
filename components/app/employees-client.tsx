'use client'

import { useEffect, useState } from 'react'
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
import { EMPLOYEE_STATUS_LABEL } from '@/lib/ui-maps'
import { toast } from 'sonner'
import { Plus, Loader2, Archive, Bot, Trash2 } from 'lucide-react'

type Preset = { key: string; name: string; title: string; model: string; kpi: string; instructions: string }
type Employee = {
  id: string; name: string; title: string; roleKey: string; model: string; status: string
  budgetCents: number; spentCents: number; kpi: string | null
  manager: { id: string; name: string } | null
  _count: { tasks: number; artifacts: number }
}

export function EmployeesClient({ presets }: { presets: Preset[] }) {
  const [employees, setEmployees] = useState<Employee[] | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [presetKey, setPresetKey] = useState<string>(presets[0]?.key ?? 'custom')
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [model, setModel] = useState('gpt-5.4-mini')
  const [kpi, setKpi] = useState('')
  const [instructions, setInstructions] = useState('')
  const [budget, setBudget] = useState('50')

  async function load() {
    const res = await fetch('/api/employees')
    if (res.ok) {
      const data = await res.json()
      setEmployees(data.employees)
    }
  }
  useEffect(() => { load() }, [])

  function applyPreset(key: string) {
    setPresetKey(key)
    const p = presets.find((x) => x.key === key)
    if (p) {
      setName(p.name); setTitle(p.title); setModel(p.model); setKpi(p.kpi); setInstructions(p.instructions)
    }
  }

  function openDialog() {
    applyPreset(presets[0]?.key ?? 'custom')
    setBudget('50')
    setOpen(true)
  }

  async function create() {
    if (!name || !title || !instructions) { toast.error('Заполните имя, должность и инструкции') ; return }
    setSaving(true)
    const res = await fetch('/api/employees', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, title, roleKey: presetKey, model, kpi, instructions,
        budgetCents: Math.round(parseFloat(budget || '0') * 100),
      }),
    })
    setSaving(false)
    if (!res.ok) { const d = await res.json(); toast.error(d?.error ?? 'Ошибка'); return }
    toast.success('Сотрудник добавлен')
    setOpen(false)
    load()
  }

  async function archive(id: string) {
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Сотрудник архивирован'); load() }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Цифровые сотрудники</h1>
          <p className="text-sm text-muted-foreground">Роли, инструкции и бюджеты вашей команды</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openDialog}><Plus className="h-4 w-4" /> Добавить</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>Новый цифровой сотрудник</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Шаблон роли</Label>
                <Select value={presetKey} onValueChange={applyPreset}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {presets.map((p) => <SelectItem key={p.key} value={p.key}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Имя</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Должность</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Модель</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-5.4-mini">gpt-5.4-mini (быстрая)</SelectItem>
                      <SelectItem value="gpt-5.4">gpt-5.4 (точная)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Бюджет, $</Label><Input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>KPI</Label><Input value={kpi} onChange={(e) => setKpi(e.target.value)} /></div>
              <div className="space-y-2"><Label>Системные инструкции</Label><Textarea rows={6} value={instructions} onChange={(e) => setInstructions(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
              <Button onClick={create} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Создать</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {employees === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-muted-foreground">
          <Bot className="h-8 w-8" />
          <p>Пока нет сотрудников</p>
          <Button onClick={openDialog} className="gap-2"><Plus className="h-4 w-4" /> Добавить первого</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees.filter((e) => e.status !== 'ARCHIVED').map((e) => {
            const pct = e.budgetCents > 0 ? Math.min(100, Math.round((e.spentCents / e.budgetCents) * 100)) : 0
            return (
              <div key={e.id} className="flex flex-col rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-medium">
                      {e.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-medium leading-tight">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.title}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">{EMPLOYEE_STATUS_LABEL[e.status as keyof typeof EMPLOYEE_STATUS_LABEL]}</span>
                </div>
                {e.kpi && <p className="mt-3 text-xs text-muted-foreground">KPI: {e.kpi}</p>}
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span>{e._count.tasks} задач</span>
                  <span>{e._count.artifacts} артефактов</span>
                  <span className="font-mono">{e.model}</span>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Бюджет</span>
                    <span>{formatCents(e.spentCents)} / {formatCents(e.budgetCents)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={'h-full rounded-full ' + (pct >= 90 ? 'bg-destructive' : 'bg-accent')} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => archive(e.id)}>
                    <Archive className="h-3.5 w-3.5" /> Архив
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
