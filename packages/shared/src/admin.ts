import { z } from 'zod';
import {
  COMPANY_SIZES,
  CONTENT_STATUS,
  DEMO_TYPES,
  DEVICES,
  LEAD_STATUS,
  USER_ROLES,
} from './enums';
import { metricSchema, seoSchema } from './schemas';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones');

/** Alta/edición de proyecto desde el panel. */
export const projectInputSchema = z.object({
  slug,
  title: z.string().min(3).max(140),
  clientName: z.string().max(120).nullable(),
  confidential: z.boolean(),
  companySize: z.enum(COMPANY_SIZES),
  durationWeeks: z.number().int().min(1).max(104),
  summary: z.string().max(300),
  challenge: z.string(),
  solution: z.string(),
  aiRole: z.string().nullable(),
  processBefore: z.array(z.object({ label: z.string(), detail: z.string().optional() })),
  processAfter: z.array(z.object({ label: z.string(), detail: z.string().optional() })),
  metrics: z.array(metricSchema).max(4),
  mainVideo: z
    .object({
      provider: z.enum(['youtube', 'r2']),
      ref: z.string(),
      poster: z.string(),
      durationSeconds: z.number(),
      transcript: z.string().optional(),
    })
    .nullable(),
  cardVideo: z.string().nullable(),
  cover: z.string(),
  gallery: z.array(
    z.object({
      src: z.string(),
      alt: z.string().min(1, 'Texto alternativo obligatorio'),
      device: z.enum(DEVICES),
      width: z.number(),
      height: z.number(),
    }),
  ),
  demoType: z.enum(DEMO_TYPES),
  demoUrl: z.string().url().nullable(),
  demoTour: z.array(
    z.object({
      image: z.string(),
      title: z.string(),
      text: z.string(),
      hotspot: z.object({ x: z.number(), y: z.number() }),
    }),
  ),
  testimonialId: z.string().nullable(),
  featured: z.boolean(),
  sectors: z.array(z.string()),
  solutions: z.array(z.string()),
  technologies: z.array(z.string()),
  related: z.array(z.string()).max(6),
  seo: seoSchema,
  status: z.enum(CONTENT_STATUS),
  publishAt: z.string().nullable(),
});
export type ProjectInput = z.infer<typeof projectInputSchema>;

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUS).optional(),
  assignedTo: z.string().nullable().optional(),
  estimatedValue: z.number().nullable().optional(),
});

export const redirectInputSchema = z.object({
  fromPath: z.string().startsWith('/'),
  toPath: z.string(),
  code: z.union([z.literal(301), z.literal(410)]),
  active: z.boolean().default(true),
});

export const userInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(USER_ROLES),
  active: z.boolean().default(true),
});

export const seoUpdateSchema = z.object({
  entity: z.enum(['projects', 'sectors', 'solutions', 'posts', 'pages']),
  id: z.string(),
  seo: seoSchema,
});

/** Datos que devuelve el dashboard de KPIs. */
export interface DashboardData {
  range: { from: string; to: string };
  kpis: {
    qualifiedLeads: number;
    qualifiedLeadsPrev: number;
    sessions: number;
    conversionRate: number;
    costPerLead: number | null;
    demoTryRate: number;
    calcRuns: number;
    aiQueries: number;
  };
  leadsByDay: { date: string; value: number }[];
  funnel: { step: number; label: string; value: number }[];
  topProjects: { slug: string; title: string; views: number; demoOpens: number }[];
  pipeline: { status: string; count: number; value: number }[];
  bySource: { source: string; count: number }[];
}
