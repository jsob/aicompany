import { redirect } from 'next/navigation'
import { getCompanyContext } from '@/lib/tenant'
import { prisma } from '@/lib/db'
import { ArtifactsClient } from '@/components/app/artifacts-client'

export const dynamic = 'force-dynamic'

export default async function ArtifactsPage() {
  const ctx = await getCompanyContext()
  if (!ctx) redirect('/login')

  const artifacts = await prisma.artifact.findMany({
    where: { companyId: ctx.company.id },
    include: {
      task: { select: { id: true, title: true } },
      employee: { select: { id: true, name: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const data = artifacts.map((a) => ({
    id: a.id,
    title: a.title,
    type: a.type,
    content: a.content,
    reviewStatus: a.reviewStatus,
    version: a.version,
    sources: a.sources,
    createdAt: a.createdAt.toISOString(),
    task: a.task,
    employee: a.employee,
  }))

  return <ArtifactsClient artifacts={data} />
}
