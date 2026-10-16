import type { SavingsInput } from './schemas';

export const WORK_WEEKS_PER_YEAR = 46;

export interface SavingsResult {
  hoursPerYear: number;
  hoursSavedPerYear: number;
  eurosSavedPerYear: number;
  hoursSavedPerWeekPerPerson: number;
}

/**
 * Ahorro anual estimado = empleados × horas/semana manuales × semanas laborables × % automatizable.
 * La fórmula se muestra tal cual en la web (HU-04).
 */
export function calculateSavings(input: SavingsInput): SavingsResult {
  const rate = input.automationRate ?? 0.6;
  const hoursPerYear = input.employees * input.hoursPerWeek * WORK_WEEKS_PER_YEAR;
  const hoursSavedPerYear = Math.round(hoursPerYear * rate);
  return {
    hoursPerYear: Math.round(hoursPerYear),
    hoursSavedPerYear,
    eurosSavedPerYear: Math.round(hoursSavedPerYear * input.hourlyCost),
    hoursSavedPerWeekPerPerson: Math.round(input.hoursPerWeek * rate * 10) / 10,
  };
}

export interface InvestmentInput {
  modules: number;
  users: number;
  integrations: number;
  ai: boolean;
}

/** Rango orientativo de inversión y plazo (calculadora de /precios). */
export function estimateInvestment(input: InvestmentInput) {
  const base = 6000;
  const perModule = 3500;
  const perIntegration = 2200;
  const usersFactor = input.users > 50 ? 1.25 : input.users > 15 ? 1.1 : 1;
  const aiExtra = input.ai ? 4000 : 0;
  const mid =
    (base + input.modules * perModule + input.integrations * perIntegration + aiExtra) *
    usersFactor;
  const round = (n: number) => Math.round(n / 500) * 500;
  const weeks = Math.max(
    4,
    Math.round(3 + input.modules * 1.5 + input.integrations + (input.ai ? 2 : 0)),
  );
  return { min: round(mid * 0.85), max: round(mid * 1.2), weeksMin: weeks, weeksMax: weeks + 3 };
}

export const formatEuros = (n: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
export const formatNumber = (n: number) => new Intl.NumberFormat('es-ES').format(n);
