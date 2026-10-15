'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  ListChecks,
  FileText,
  ShieldCheck,
  Plug,
  ScrollText,
  CreditCard,
  Settings,
} from 'lucide-react'

const items = [
  { href: '/app', label: 'Командный центр', icon: LayoutDashboard, exact: true },
  { href: '/app/employees', label: 'Сотрудники', icon: Users },
  { href: '/app/tasks', label: 'Задачи', icon: ListChecks },
  { href: '/app/artifacts', label: 'Артефакты', icon: FileText },
  { href: '/app/approvals', label: 'Согласования', icon: ShieldCheck },
  { href: '/app/integrations', label: 'Интеграции', icon: Plug },
  { href: '/app/audit', label: 'Аудит', icon: ScrollText },
  { href: '/app/billing', label: 'Биллинг', icon: CreditCard },
  { href: '/app/settings', label: 'Настройки', icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {items.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href)
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-primary/15 text-foreground'
                : 'text-muted-foreground hover:bg-card hover:text-foreground',
            )}
          >
            <it.icon className={cn('h-4 w-4', active && 'text-accent')} />
            {it.label}
          </Link>
        )
      })}
    </nav>
  )
}
