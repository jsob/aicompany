import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ROLE_PRESETS, INTEGRATION_CATALOG } from '../lib/role-presets';

const prisma = new PrismaClient();

async function ensureCompanyDefaults(companyId: string) {
  const count = await prisma.employee.count({ where: { companyId } });
  if (count === 0) {
    const cos = ROLE_PRESETS.find((p) => p.key === 'chief_of_staff')!;
    const manager = await prisma.employee.create({
      data: {
        companyId, name: cos.name, title: cos.title, roleKey: cos.key,
        instructions: cos.instructions, model: cos.model, kpi: cos.kpi,
      },
    });
    for (const preset of ROLE_PRESETS.filter((p) => p.key !== 'chief_of_staff').slice(0, 3)) {
      await prisma.employee.create({
        data: {
          companyId, name: preset.name, title: preset.title, roleKey: preset.key,
          instructions: preset.instructions, model: preset.model, kpi: preset.kpi, managerId: manager.id,
        },
      });
    }
  }
  for (const integ of INTEGRATION_CATALOG) {
    await prisma.integration.upsert({
      where: { companyId_provider: { companyId, provider: integ.provider } },
      update: {},
      create: { companyId, provider: integ.provider, name: integ.name, category: integ.category, status: 'AVAILABLE' },
    });
  }
}

async function ensureUserWithCompany(opts: {
  email: string; password: string; name: string; companyName: string; slug: string; isSuperAdmin?: boolean;
}) {
  const passwordHash = await bcrypt.hash(opts.password, 10);
  const user = await prisma.user.upsert({
    where: { email: opts.email },
    update: {},
    create: { email: opts.email, name: opts.name, passwordHash, isSuperAdmin: opts.isSuperAdmin ?? false },
  });
  let company = await prisma.company.findUnique({ where: { slug: opts.slug } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: opts.companyName, slug: opts.slug,
        subscription: { create: { plan: 'FREE', status: 'TRIALING', monthlyCreditCents: 500 } },
      },
    });
  }
  await prisma.membership.upsert({
    where: { userId_companyId: { userId: user.id, companyId: company.id } },
    update: {},
    create: { userId: user.id, companyId: company.id, role: 'OWNER' },
  });
  await ensureCompanyDefaults(company.id);
  return { user, company };
}

async function main() {
  // Hidden platform test/admin account (do not surface to end users).
  await ensureUserWithCompany({
    email: 'abacus-3ed6a8b3@example.com',
    password: 'xPE0GC#Lmy',
    name: 'Platform Admin',
    companyName: 'NEXORA Admin',
    slug: 'nexora-admin',
    isSuperAdmin: true,
  });

  // Public demo account for the owner to explore.
  const { company } = await ensureUserWithCompany({
    email: 'demo@nexora.app',
    password: 'demo1234',
    name: 'Demo Founder',
    companyName: 'Northwind Labs',
    slug: 'northwind-labs',
  });

  // Seed one illustrative task + artifact for the demo company if empty.
  const hasTask = await prisma.task.count({ where: { companyId: company.id } });
  if (hasTask === 0) {
    const marketer = await prisma.employee.findFirst({ where: { companyId: company.id, roleKey: 'marketing_lead' } });
    const task = await prisma.task.create({
      data: {
        companyId: company.id,
        title: 'Бриф кампании для запуска продукта',
        description: 'Подготовь бриф маркетинговой кампании для запуска B2B SaaS-продукта для основателей.',
        acceptanceCriteria: 'Есть цель, аудитория, сообщения, каналы и метрики.',
        status: 'BACKLOG',
        priority: 'HIGH',
        employeeId: marketer?.id,
      },
    });
    await prisma.auditEvent.create({
      data: {
        companyId: company.id, action: 'task.created', actorType: 'user', actorName: 'Demo Founder',
        entityType: 'task', entityId: task.id, summary: 'Создана демо-задача.',
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
