import { NextResponse } from 'next/server';
import { getCompanyContext, type CompanyContext } from '@/lib/tenant';

/** Guard for API routes. Returns the company context or a 401 NextResponse. */
export async function withCompany(): Promise<CompanyContext | NextResponse> {
  const ctx = await getCompanyContext();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return ctx;
}

export function isResponse(x: any): x is NextResponse {
  return x instanceof NextResponse;
}
