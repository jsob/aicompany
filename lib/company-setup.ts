import { prisma } from '@/lib/db';
import { ROLE_PRESETS, INTEGRATION_CATALOG } from '@/lib/role-presets';

/**
 * Seeds a newly created company with a default org of digital employees and the
 * integration catalog (all AVAILABLE, none connected). Idempotent.
 */
export async function seedCompanyDefaults(companyId: string): Promise<void> {
  const existing = await prisma.employee.count({ where: { companyId } });
  if (existing === 0) {
    // Create the Chief of Staff first so others can report to it.
    const cos = ROLE_PRESETS.find((p) => p.key === 'chief_of_staff')!;
    const manager = await prisma.employee.create({
      data: {
        companyId,
        name: cos.name,
        title: cos.title,
        roleKey: cos.key,
        instructions: cos.instructions,
        model: cos.model,
        kpi: cos.kpi,
      },
    });

    for (const preset of ROLE_PRESETS.filter((p) => p.key !== 'chief_of_staff').slice(0, 3)) {
      await prisma.employee.create({
        data: {
          companyId,
          name: preset.name,
          title: preset.title,
          roleKey: preset.key,
          instructions: preset.instructions,
          model: preset.model,
          kpi: preset.kpi,
          managerId: manager.id,
        },
      });
    }
  }

  for (const integ of INTEGRATION_CATALOG) {
    await prisma.integration.upsert({
      where: { companyId_provider: { companyId, provider: integ.provider } },
      update: {},
      create: {
        companyId,
        provider: integ.provider,
        name: integ.name,
        category: integ.category,
        status: 'AVAILABLE',
      },
    });
  }
}
