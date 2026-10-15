import { redirect } from 'next/navigation'
import { getCompanyContext } from '@/lib/tenant'
import { prisma } from '@/lib/db'
import { ApprovalsClient } from '@/components/app/approvals-client'

export const dynamic = 'force-dynamic'

export default async function ApprovalsPage() {
  const ctx = await getCompanyContext()
  if (!ctx) redirect('/login')

  const approvals = await prisma.approval.findMany({
    where: { companyId: ctx.company.id },
    include: {
      task: { select: { id: true, title: true } },
      artifact: { select: { id: true, title: true } },
      decidedBy: { select: { name: true, email: true } },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 100,
  })

  const data = approvals.map((a) => ({
    id: a.id,
    type: a.type,
    status: a.status,
    title: a.title,
    detail: a.detail,
    decisionNote: a.decisionNote,
    createdAt: a.createdAt.toISOString(),
    decidedAt: a.decidedAt ? a.decidedAt.toISOString() : null,
    task: a.task,
    artifact: a.artifact,
    decidedBy: a.decidedBy ? (a.decidedBy.name ?? a.decidedBy.email) : null,
  }))

  return <ApprovalsClient approvals={data} />
}
