import { redirect } from 'next/navigation'
import { getCompanyContext } from '@/lib/tenant'
import { prisma } from '@/lib/db'
import { SafeDate } from '@/components/safe-format'
import { Building2, UserCircle2, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Владелец',
  ADMIN: 'Администратор',
  MEMBER: 'Участник',
}

export default async function SettingsPage() {
  const ctx = await getCompanyContext()
  if (!ctx) redirect('/login')

  const members = await prisma.membership.findMany({
    where: { companyId: ctx.company.id },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground mt-1">Профиль компании, аккаунт и участники.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Building2 className="h-4 w-4" /> Компания
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Название</dt><dd className="font-medium">{ctx.company.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Идентификатор</dt><dd className="font-mono text-xs">{ctx.company.slug}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Создана</dt><dd><SafeDate date={ctx.company.createdAt.toISOString()} options={{ dateStyle: 'long' }} /></dd></div>
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <UserCircle2 className="h-4 w-4" /> Ваш аккаунт
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Имя</dt><dd className="font-medium">{ctx.user.name ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{ctx.user.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Роль</dt><dd className="font-medium">{ROLE_LABEL[ctx.membership.role] ?? ctx.membership.role}</dd></div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="h-4 w-4" /> Участники ({members.length})
        </div>
        <div className="mt-4 divide-y divide-border">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{m.user.name ?? m.user.email}</p>
                <p className="text-xs text-muted-foreground">{m.user.email}</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{ROLE_LABEL[m.role] ?? m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
