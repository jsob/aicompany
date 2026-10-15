import { redirect } from 'next/navigation'
import { getCompanyContext } from '@/lib/tenant'
import { prisma } from '@/lib/db'
import { SafeDate } from '@/components/safe-format'
import { ScrollText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AuditPage() {
  const ctx = await getCompanyContext()
  if (!ctx) redirect('/login')

  const events = await prisma.auditEvent.findMany({
    where: { companyId: ctx.company.id },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Журнал аудита</h1>
        <p className="text-muted-foreground mt-1">Полная хронология действий людей и цифровых сотрудников.</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <ScrollText className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">Событий пока нет.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {events.map((e) => (
              <div key={e.id} className="flex items-start gap-4 p-4">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{e.actorName ?? 'Система'}</span>
                    <span className="text-muted-foreground"> — {e.summary ?? e.action}</span>
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    <code className="font-mono">{e.action}</code>
                    {e.entityType && <span>{e.entityType}</span>}
                    <span className="ml-auto"><SafeDate date={e.createdAt.toISOString()} options={{ dateStyle: 'medium', timeStyle: 'short' }} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
