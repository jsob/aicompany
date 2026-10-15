import { PlanTier } from '@prisma/client';

export type PlanDef = {
  tier: PlanTier;
  name: string;
  priceCents: number; // monthly price
  monthlyCreditCents: number; // included AI execution budget
  maxEmployees: number; // -1 = unlimited
  seats: number;
  highlights: string[];
};

export const PLANS: Record<PlanTier, PlanDef> = {
  FREE: {
    tier: 'FREE',
    name: 'Free',
    priceCents: 0,
    monthlyCreditCents: 500,
    maxEmployees: 3,
    seats: 1,
    highlights: ['3 цифровых сотрудника', '$5 AI-бюджета в месяц', 'Командный центр и аудит', 'Согласования и артефакты'],
  },
  SOLO: {
    tier: 'SOLO',
    name: 'Solo',
    priceCents: 2900,
    monthlyCreditCents: 1500,
    maxEmployees: 5,
    seats: 1,
    highlights: ['5 цифровых сотрудников', '$15 AI-бюджета в месяц', 'Шаблоны ролей', 'Экспорт артефактов'],
  },
  FOUNDER: {
    tier: 'FOUNDER',
    name: 'Founder',
    priceCents: 9900,
    monthlyCreditCents: 6000,
    maxEmployees: 20,
    seats: 5,
    highlights: ['20 цифровых сотрудников', '$60 AI-бюджета в месяц', 'Аналитика стоимости', 'Интеграции', 'До 5 участников'],
  },
  SCALE: {
    tier: 'SCALE',
    name: 'Scale',
    priceCents: 29900,
    monthlyCreditCents: 20000,
    maxEmployees: -1,
    seats: 20,
    highlights: ['Без лимита сотрудников', '$200 AI-бюджета в месяц', 'Расширенный аудит', 'Приоритетная очередь', 'До 20 участников'],
  },
};

export const PLAN_ORDER: PlanTier[] = ['FREE', 'SOLO', 'FOUNDER', 'SCALE'];

// Internal metering rates (cents per 1K tokens). Abstracts provider cost into a
// transparent credit unit for attribution. Not a billed amount to any provider.
export const INPUT_CENTS_PER_1K = 0.12;
export const OUTPUT_CENTS_PER_1K = 0.45;

export function estimateCostCents(inputTokens: number, outputTokens: number): number {
  const raw = (inputTokens / 1000) * INPUT_CENTS_PER_1K + (outputTokens / 1000) * OUTPUT_CENTS_PER_1K;
  return Math.max(1, Math.round(raw));
}
