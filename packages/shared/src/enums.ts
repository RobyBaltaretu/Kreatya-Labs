export const SOLUTION_KINDS = ['erp', 'crm', 'app', 'portal', 'ia', 'integracion'] as const;
export type SolutionKind = (typeof SOLUTION_KINDS)[number];

export const COMPANY_SIZES = ['micro', 'pequena', 'mediana', 'grande'] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];
export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  micro: '1–9 empleados',
  pequena: '10–49 empleados',
  mediana: '50–250 empleados',
  grande: 'Más de 250',
};

export const DEMO_TYPES = ['none', 'tour', 'sandbox', 'on_request'] as const;
export type DemoType = (typeof DEMO_TYPES)[number];

export const CONTENT_STATUS = ['draft', 'published', 'scheduled'] as const;
export type ContentStatus = (typeof CONTENT_STATUS)[number];

export const LEAD_TYPES = [
  'diagnostico',
  'demo',
  'calc_ahorro',
  'calc_inversion',
  'contacto',
] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_STATUS = ['nuevo', 'contactado', 'propuesta', 'ganado', 'perdido'] as const;
export type LeadStatus = (typeof LEAD_STATUS)[number];

export const USER_ROLES = ['admin', 'marketing', 'comercial', 'lectura'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const FAQ_SCOPES = ['global', 'home', 'solution', 'sector', 'pricing', 'ai'] as const;
export type FaqScope = (typeof FAQ_SCOPES)[number];

export const DEVICES = ['desktop', 'tablet', 'mobile'] as const;
export type Device = (typeof DEVICES)[number];

export const EVENT_NAMES = [
  'page_view',
  'project_view',
  'demo_open',
  'demo_time',
  'diag_step',
  'calc_run',
  'generate_lead',
  'cta_click',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];
