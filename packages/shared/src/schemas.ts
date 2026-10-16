import { z } from 'zod';
import { COMPANY_SIZES, EVENT_NAMES, LEAD_STATUS, LEAD_TYPES, SOLUTION_KINDS } from './enums';

export const seoSchema = z.object({
  title: z.string().max(60).optional(),
  description: z.string().max(155).optional(),
  ogImage: z.string().optional(),
  canonical: z.string().url().optional(),
  noindex: z.boolean().optional(),
});
export type Seo = z.infer<typeof seoSchema>;

export const metricSchema = z.object({
  value: z.number(),
  unit: z.string(),
  description: z.string(),
  /** Prefijo opcional: «−», «+», «x». */
  prefix: z.string().optional(),
});
export type Metric = z.infer<typeof metricSchema>;

const utmSchema = z
  .object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
    term: z.string().max(100).optional(),
    content: z.string().max(100).optional(),
  })
  .partial();

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Indica tu nombre').max(120),
  email: z.string().trim().email('Email no válido').max(200),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(160).optional(),
});

/** Formulario de diagnóstico (5 pasos). */
export const diagnosticLeadSchema = contactSchema.extend({
  type: z.literal('diagnostico'),
  sector: z.string().min(1, 'Elige un sector'),
  solutionKind: z.enum(SOLUTION_KINDS).optional(),
  pain: z.string().min(1, 'Cuéntanos qué te frena').max(2000),
  currentTools: z.array(z.string()).max(20).default([]),
  companySize: z.enum(COMPANY_SIZES),
  consent: z.literal(true, { error: 'Necesitamos tu consentimiento' }),
  sourcePath: z.string().max(300).optional(),
  utm: utmSchema.optional(),
  turnstileToken: z.string().optional(),
});
export type DiagnosticLead = z.infer<typeof diagnosticLeadSchema>;

export const demoRequestSchema = contactSchema
  .pick({ name: true, email: true, company: true })
  .extend({
    type: z.literal('demo'),
    projectSlug: z.string().min(1),
    consent: z.literal(true),
    sourcePath: z.string().max(300).optional(),
    utm: utmSchema.optional(),
    turnstileToken: z.string().optional(),
  });
export type DemoRequest = z.infer<typeof demoRequestSchema>;

export const savingsInputSchema = z.object({
  employees: z.number().int().min(1).max(10000),
  hoursPerWeek: z.number().min(0).max(60),
  hourlyCost: z.number().min(0).max(500),
  automationRate: z.number().min(0).max(1).default(0.6),
});
export type SavingsInput = z.infer<typeof savingsInputSchema>;

export const savingsLeadSchema = contactSchema.pick({ name: true, email: true }).extend({
  type: z.literal('calc_ahorro'),
  input: savingsInputSchema,
  consent: z.literal(true),
  sourcePath: z.string().max(300).optional(),
  utm: utmSchema.optional(),
  turnstileToken: z.string().optional(),
});

export const leadInputSchema = z.discriminatedUnion('type', [
  diagnosticLeadSchema,
  demoRequestSchema,
  savingsLeadSchema,
]);
export type LeadInput = z.infer<typeof leadInputSchema>;

export const eventInputSchema = z.object({
  name: z.enum(EVENT_NAMES),
  sessionId: z.string().min(8).max(64),
  path: z.string().max(300),
  projectSlug: z.string().max(120).optional(),
  props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});
export type EventInput = z.infer<typeof eventInputSchema>;

export const leadStatusSchema = z.enum(LEAD_STATUS);
export const leadTypeSchema = z.enum(LEAD_TYPES);
