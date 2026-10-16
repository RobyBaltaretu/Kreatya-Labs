import { describe, expect, it } from 'vitest';
import { countWords } from './blocks';
import { calculateSavings, estimateInvestment } from './calc';
import { diagnosticLeadSchema } from './schemas';

describe('calculateSavings', () => {
  it('aplica empleados × horas × semanas × % automatizable', () => {
    const r = calculateSavings({
      employees: 10,
      hoursPerWeek: 5,
      hourlyCost: 25,
      automationRate: 0.6,
    });
    expect(r.hoursPerYear).toBe(2300);
    expect(r.hoursSavedPerYear).toBe(1380);
    expect(r.eurosSavedPerYear).toBe(34500);
    expect(r.hoursSavedPerWeekPerPerson).toBe(3);
  });
});

describe('estimateInvestment', () => {
  it('devuelve un rango ordenado y plazo mínimo de 4 semanas', () => {
    const r = estimateInvestment({ modules: 1, users: 5, integrations: 0, ai: false });
    expect(r.min).toBeLessThan(r.max);
    expect(r.weeksMin).toBeGreaterThanOrEqual(4);
  });
});

describe('countWords', () => {
  it('cuenta palabras de párrafos y listas', () => {
    expect(
      countWords([
        { type: 'p', text: 'uno dos tres' },
        { type: 'list', ordered: false, items: ['a b', 'c'] },
      ]),
    ).toBe(6);
  });
});

describe('diagnosticLeadSchema', () => {
  it('exige consentimiento', () => {
    const r = diagnosticLeadSchema.safeParse({
      type: 'diagnostico',
      name: 'Ana',
      email: 'ana@empresa.es',
      sector: 'logistica',
      pain: 'Excel',
      companySize: 'pequena',
      consent: false,
    });
    expect(r.success).toBe(false);
  });
});
