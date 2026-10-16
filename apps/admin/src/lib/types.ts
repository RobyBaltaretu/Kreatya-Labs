import type { LeadStatus, LeadType, ProjectInput, Seo, UserRole } from '@kreatya/shared';

export interface Me {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  clientName: string | null;
  confidential: boolean;
  status: 'draft' | 'published' | 'scheduled';
  demoType: string;
  featured: boolean;
  publishAt: string | null;
  updatedAt: string;
}
export type ProjectFull = ProjectInput & { id: string; updatedAt: string };
export interface Lead {
  id: string;
  type: LeadType;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  companySize: string | null;
  sectorId: string | null;
  projectId: string | null;
  answers: Record<string, unknown>;
  estimatedValue: number | null;
  sourcePath: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  assignedTo: string | null;
  createdAt: string;
}
export interface LeadDetail extends Lead {
  notes: { id: string; body: string; createdAt: string; author: string | null }[];
}
export interface SeoRow {
  entity: 'projects' | 'sectors' | 'solutions' | 'posts';
  path: string;
  id: string;
  slug: string;
  title: string;
  seo: Seo;
  status: string;
  words: number | null;
  warnings: string[];
}
export interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  code: 301 | 410;
  active: boolean;
}
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  lastLoginAt: string | null;
}
export interface Infra {
  quotas: { key: string; label: string; used: number | null; limit: number }[];
  alertThreshold: number;
  deploys: {
    id: string;
    reason: string;
    status: string;
    startedAt: string;
    finishedAt: string | null;
  }[];
}
