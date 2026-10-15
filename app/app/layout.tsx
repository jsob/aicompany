import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCompanyContext } from '@/lib/tenant'
import { AppShell } from '@/components/layouts/app-shell'
import { SidebarNav } from '@/components/app/sidebar-nav'
import { UserMenu } from '@/components/app/user-menu'
import { Logo } from '@/components/brand/logo'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCompanyContext()
  if (!ctx) redirect('/login')

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/app" className="mb-6 px-2">
        <Logo />
      </Link>
      <SidebarNav />
      <div className="mt-auto rounded-lg border border-border bg-background/50 p-3">
        <p className="text-xs text-muted-foreground">Компания</p>
        <p className="truncate text-sm font-medium">{ctx.company.name}</p>
      </div>
    </div>
  )

  const header = (
    <div className="flex flex-1 items-center justify-between">
      <span className="text-sm font-medium text-muted-foreground">{ctx.company.name}</span>
      <UserMenu name={ctx.user.name} email={ctx.user.email} />
    </div>
  )

  return (
    <AppShell sidebar={sidebar} header={header}>
      {children}
    </AppShell>
  )
}
