import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { seedCompanyDefaults } from '@/lib/company-setup';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body?.email as string | undefined)?.toLowerCase().trim();
    const password = body?.password as string | undefined;
    const name = (body?.name as string | undefined)?.trim() || null;
    const companyName = (body?.companyName as string | undefined)?.trim() || (name ? `${name}'s company` : 'My company');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, name, passwordHash },
    });

    // Create the user's first company (tenant) and owner membership.
    let slug = slugify(companyName) || 'company';
    if (await prisma.company.findUnique({ where: { slug } })) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;
    }
    const company = await prisma.company.create({
      data: {
        name: companyName,
        slug,
        memberships: { create: { userId: user.id, role: 'OWNER' } },
        subscription: { create: { plan: 'FREE', status: 'TRIALING', monthlyCreditCents: 500 } },
      },
    });

    await seedCompanyDefaults(company.id);

    return NextResponse.json({ ok: true, userId: user.id, companyId: company.id }, { status: 201 });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
