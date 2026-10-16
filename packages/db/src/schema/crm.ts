import { COMPANY_SIZES, EVENT_NAMES, LEAD_STATUS, LEAD_TYPES, USER_ROLES } from '@kreatya/shared';
import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { bool, id, json, timestamps } from './_helpers';
import { projects, sectors } from './content';

export const users = sqliteTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: USER_ROLES }).notNull().default('lectura'),
  active: bool('active').notNull().default(true),
  lastLoginAt: text('last_login_at'),
  ...timestamps,
});

export const leads = sqliteTable(
  'leads',
  {
    id: id(),
    type: text('type', { enum: LEAD_TYPES }).notNull(),
    status: text('status', { enum: LEAD_STATUS }).notNull().default('nuevo'),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    company: text('company'),
    companySize: text('company_size', { enum: COMPANY_SIZES }),
    sectorId: text('sector_id').references(() => sectors.id, { onDelete: 'set null' }),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    answers: json<Record<string, unknown>>('answers').notNull().default({}),
    estimatedValue: real('estimated_value'),
    sourcePath: text('source_path'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmTerm: text('utm_term'),
    utmContent: text('utm_content'),
    referrer: text('referrer'),
    assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    consentAt: text('consent_at').notNull(),
    ...timestamps,
  },
  (t) => [index('leads_status_idx').on(t.status), index('leads_created_idx').on(t.createdAt)],
);

export const leadNotes = sqliteTable('lead_notes', {
  id: id(),
  leadId: text('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  body: text('body').notNull(),
  ...timestamps,
});

export const demoAccess = sqliteTable(
  'demo_access',
  {
    id: id(),
    leadId: text('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: text('expires_at').notNull(),
    useCount: integer('use_count').notNull().default(0),
    lastUsedAt: text('last_used_at'),
    ...timestamps,
  },
  (t) => [uniqueIndex('demo_access_token_idx').on(t.tokenHash)],
);

/** Eventos de producto propios. Sin datos personales: solo un id de sesión anónimo. */
export const events = sqliteTable(
  'events',
  {
    id: id(),
    name: text('name', { enum: EVENT_NAMES }).notNull(),
    sessionId: text('session_id').notNull(),
    path: text('path').notNull(),
    projectId: text('project_id'),
    props: json<Record<string, string | number | boolean>>('props').notNull().default({}),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [index('events_name_created_idx').on(t.name, t.createdAt)],
);

/** Agregados nocturnos: el dashboard solo lee de aquí para no gastar lecturas de D1. */
export const kpiDaily = sqliteTable(
  'kpi_daily',
  {
    date: text('date').notNull(),
    metric: text('metric').notNull(),
    dimension: text('dimension').notNull().default(''),
    value: real('value').notNull(),
  },
  (t) => [uniqueIndex('kpi_daily_pk').on(t.date, t.metric, t.dimension)],
);

export const adSpend = sqliteTable(
  'ad_spend',
  {
    id: id(),
    month: text('month').notNull(),
    channel: text('channel').notNull(),
    amount: real('amount').notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex('ad_spend_month_channel').on(t.month, t.channel)],
);

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: id(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    action: text('action', {
      enum: ['create', 'update', 'delete', 'publish', 'restore'],
    }).notNull(),
    before: json<unknown>('before'),
    after: json<unknown>('after'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [index('audit_entity_idx').on(t.entity, t.entityId)],
);

export const deploys = sqliteTable('deploys', {
  id: id(),
  triggeredBy: text('triggered_by').references(() => users.id, { onDelete: 'set null' }),
  reason: text('reason').notNull().default(''),
  status: text('status', { enum: ['queued', 'building', 'success', 'failed'] })
    .notNull()
    .default('queued'),
  startedAt: text('started_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  finishedAt: text('finished_at'),
});
