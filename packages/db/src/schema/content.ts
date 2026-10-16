import type { Block, GalleryItem, Metric, ProcessStep, Project } from '@kreatya/shared';
import {
  COMPANY_SIZES,
  CONTENT_STATUS,
  DEMO_TYPES,
  FAQ_SCOPES,
  SOLUTION_KINDS,
} from '@kreatya/shared';
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { bool, id, json, seo, timestamps } from './_helpers';

export const siteConfig = sqliteTable('site_config', {
  id: text('id').primaryKey().default('default'),
  data: json<Record<string, unknown>>('data').notNull().default({}),
  ...timestamps,
});

export const pages = sqliteTable('pages', {
  id: id(),
  key: text('key').notNull().unique(),
  title: text('title').notNull(),
  blocks: json<Block[]>('blocks').notNull().default([]),
  seo: seo(),
  status: text('status', { enum: CONTENT_STATUS }).notNull().default('draft'),
  ...timestamps,
});

export const media = sqliteTable('media', {
  id: id(),
  r2Key: text('r2_key').notNull().unique(),
  mime: text('mime').notNull(),
  width: integer('width'),
  height: integer('height'),
  alt: text('alt').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  variants: json<{ format: 'avif' | 'webp'; width: number; r2Key: string }[]>('variants')
    .notNull()
    .default([]),
  ...timestamps,
});

export const sectors = sqliteTable('sectors', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  tagline: text('tagline').notNull().default(''),
  pain: text('pain').notNull().default(''),
  modules: json<string[]>('modules').notNull().default([]),
  integrations: json<string[]>('integrations').notNull().default([]),
  blocks: json<Block[]>('blocks').notNull().default([]),
  seo: seo(),
  status: text('status', { enum: CONTENT_STATUS }).notNull().default('draft'),
  order: integer('order').notNull().default(0),
  ...timestamps,
});

export const solutions = sqliteTable('solutions', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  kind: text('kind', { enum: SOLUTION_KINDS }).notNull(),
  tagline: text('tagline').notNull().default(''),
  modules: json<string[]>('modules').notNull().default([]),
  integrations: json<string[]>('integrations').notNull().default([]),
  blocks: json<Block[]>('blocks').notNull().default([]),
  seo: seo(),
  status: text('status', { enum: CONTENT_STATUS }).notNull().default('draft'),
  order: integer('order').notNull().default(0),
  ...timestamps,
});

export const technologies = sqliteTable('technologies', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
});

export const testimonials = sqliteTable('testimonials', {
  id: id(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  company: text('company').notNull(),
  quote: text('quote').notNull(),
  rating: integer('rating').notNull().default(5),
  video: json<{ url: string; poster: string } | null>('video'),
  consent: bool('consent').notNull().default(false),
  ...timestamps,
});

export const projects = sqliteTable(
  'projects',
  {
    id: id(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    clientName: text('client_name'),
    confidential: bool('confidential').notNull().default(false),
    companySize: text('company_size', { enum: COMPANY_SIZES }).notNull(),
    durationWeeks: integer('duration_weeks').notNull(),
    summary: text('summary').notNull().default(''),
    challenge: text('challenge').notNull().default(''),
    solution: text('solution').notNull().default(''),
    aiRole: text('ai_role'),
    processBefore: json<ProcessStep[]>('process_before').notNull().default([]),
    processAfter: json<ProcessStep[]>('process_after').notNull().default([]),
    metrics: json<Metric[]>('metrics').notNull().default([]),
    mainVideo: json<Project['mainVideo']>('main_video'),
    cardVideo: text('card_video'),
    cover: text('cover').notNull().default(''),
    gallery: json<GalleryItem[]>('gallery').notNull().default([]),
    demoType: text('demo_type', { enum: DEMO_TYPES }).notNull().default('none'),
    demoUrl: text('demo_url'),
    demoTour: json<Project['demoTour']>('demo_tour').notNull().default([]),
    testimonialId: text('testimonial_id').references(() => testimonials.id, {
      onDelete: 'set null',
    }),
    featured: bool('featured').notNull().default(false),
    seo: seo(),
    status: text('status', { enum: CONTENT_STATUS }).notNull().default('draft'),
    publishAt: text('publish_at'),
    ...timestamps,
  },
  (t) => [index('projects_status_idx').on(t.status, t.publishAt)],
);

export const projectSectors = sqliteTable(
  'project_sectors',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    sectorId: text('sector_id')
      .notNull()
      .references(() => sectors.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.sectorId] })],
);

export const projectSolutions = sqliteTable(
  'project_solutions',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    solutionId: text('solution_id')
      .notNull()
      .references(() => solutions.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.solutionId] })],
);

export const projectTechnologies = sqliteTable(
  'project_technologies',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    technologyId: text('technology_id')
      .notNull()
      .references(() => technologies.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.technologyId] })],
);

export const projectRelated = sqliteTable(
  'project_related',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    relatedId: text('related_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    order: integer('order').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.relatedId] })],
);

export const aiUseCases = sqliteTable('ai_use_cases', {
  id: id(),
  slug: text('slug').notNull().unique(),
  department: text('department').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  hoursSaved: real('hours_saved').notNull().default(0),
  demoKey: text('demo_key'),
  order: integer('order').notNull().default(0),
  ...timestamps,
});

export const authors = sqliteTable('authors', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default(''),
  bio: text('bio').notNull().default(''),
  credentials: json<string[]>('credentials').notNull().default([]),
  avatarMediaId: text('avatar_media_id').references(() => media.id, { onDelete: 'set null' }),
  links: json<string[]>('links').notNull().default([]),
  ...timestamps,
});

export const posts = sqliteTable(
  'posts',
  {
    id: id(),
    kind: text('kind', { enum: ['blog', 'guia'] }).notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    excerpt: text('excerpt').notNull().default(''),
    blocks: json<Block[]>('blocks').notNull().default([]),
    authorId: text('author_id')
      .notNull()
      .references(() => authors.id),
    coverMediaId: text('cover_media_id').references(() => media.id, { onDelete: 'set null' }),
    pillar: text('pillar', {
      enum: ['software-a-medida', 'ia-para-empresas', 'software-por-sector'],
    }).notNull(),
    solutionId: text('solution_id').references(() => solutions.id, { onDelete: 'set null' }),
    sectorId: text('sector_id').references(() => sectors.id, { onDelete: 'set null' }),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    seo: seo(),
    status: text('status', { enum: CONTENT_STATUS }).notNull().default('draft'),
    publishAt: text('publish_at'),
    ...timestamps,
  },
  (t) => [uniqueIndex('posts_kind_slug_idx').on(t.kind, t.slug)],
);

export const faqs = sqliteTable(
  'faqs',
  {
    id: id(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    scope: text('scope', { enum: FAQ_SCOPES }).notNull().default('global'),
    scopeId: text('scope_id'),
    order: integer('order').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('faqs_scope_idx').on(t.scope, t.scopeId)],
);

export const pricingTiers = sqliteTable('pricing_tiers', {
  id: id(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  priceFrom: integer('price_from').notNull(),
  priceTo: integer('price_to'),
  unit: text('unit').notNull().default('EUR'),
  description: text('description').notNull().default(''),
  includes: json<string[]>('includes').notNull().default([]),
  order: integer('order').notNull().default(0),
  ...timestamps,
});

export const redirects = sqliteTable('redirects', {
  id: id(),
  fromPath: text('from_path').notNull().unique(),
  toPath: text('to_path').notNull().default(''),
  code: integer('code').$type<301 | 410>().notNull().default(301),
  active: bool('active').notNull().default(true),
  ...timestamps,
});
