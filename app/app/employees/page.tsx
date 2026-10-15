import { ROLE_PRESETS } from '@/lib/role-presets'
import { EmployeesClient } from '@/components/app/employees-client'

export const dynamic = 'force-dynamic'

export default function EmployeesPage() {
  const presets = ROLE_PRESETS.map((p) => ({
    key: p.key,
    name: p.name,
    title: p.title,
    model: p.model,
    kpi: p.kpi,
    instructions: p.instructions,
  }))
  return <EmployeesClient presets={presets} />
}
