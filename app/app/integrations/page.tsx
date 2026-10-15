import { redirect } from 'next/navigation'
import { getCompanyContext } from '@/lib/tenant'
import { prisma } from '@/lib/db'
import { IntegrationsClient } from '@/components/app/integrations-client'

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  const ctx = await getCompanyContext()
  if (!ctx) redirect('/login')

  const integrations = await prisma.integration.findMany({
    where: { companyId: ctx.company.id },
    orderBy: { name: 'asc' },
  })

  const data = integrations.map((i) => ({
    id: i.id,
    provider: i.provider,
    name: i.name,
    category: i.category,
    status: i.status,
  }))

  return <IntegrationsClient integrations={data} />
}
