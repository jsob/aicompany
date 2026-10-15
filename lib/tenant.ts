import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import type { Company, Membership, User } from '@prisma/client';

export type CompanyContext = {
  user: Pick<User, 'id' | 'email' | 'name'>;
  company: Company;
  membership: Membership;
};

/** Returns the authenticated user id, or null. */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Resolves the active company context for the signed-in user.
 * MVP: the active company is the user's earliest membership. Returns null when
 * unauthenticated or without a company.
 */
export async function getCompanyContext(): Promise<CompanyContext | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const membership = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: { company: true, user: true },
  });
  if (!membership) return null;

  return {
    user: { id: membership.user.id, email: membership.user.email, name: membership.user.name },
    company: membership.company,
    membership,
  };
}

/** Throws (for API routes) when there is no company context. */
export async function requireCompanyContext(): Promise<CompanyContext> {
  const ctx = await getCompanyContext();
  if (!ctx) {
    const err: any = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
  return ctx;
}

/** Appends an audit event scoped to the company. Never throws. */
export async function logAudit(
  companyId: string,
  params: {
    action: string;
    actorType?: string;
    actorName?: string;
    entityType?: string;
    entityId?: string;
    summary?: string;
    metadata?: any;
  },
): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: {
        companyId,
        action: params.action,
        actorType: params.actorType ?? 'user',
        actorName: params.actorName,
        entityType: params.entityType,
        entityId: params.entityId,
        summary: params.summary,
        metadata: params.metadata ?? undefined,
      },
    });
  } catch (e) {
    console.error('logAudit failed', e);
  }
}
