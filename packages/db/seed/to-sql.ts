/**
 * Genera `seed.sql` a partir del contenido semilla para poblar D1:
 *   pnpm --filter @kreatya/db seed:sql
 *   wrangler d1 execute kreatya-db --local --file=packages/db/seed/seed.sql
 */
import { contentSnapshot as s } from './content.ts';

const q = (v: unknown): string => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? '1' : '0';
  const str = typeof v === 'string' ? v : JSON.stringify(v);
  return `'${str.replaceAll("'", "''")}'`;
};
const insert = (table: string, row: Record<string, unknown>) =>
  `INSERT OR REPLACE INTO ${table} (${Object.keys(row)
    .map((k) => `"${k}"`)
    .join(', ')}) VALUES (${Object.values(row).map(q).join(', ')});`;

const out: string[] = ['PRAGMA defer_foreign_keys = true;'];
out.push(insert('site_config', { id: 'default', data: s.siteConfig }));
s.sectors.forEach((x, i) =>
  out.push(
    insert('sectors', {
      id: `sec_${x.slug}`,
      slug: x.slug,
      name: x.name,
      tagline: x.tagline,
      pain: x.pain,
      modules: x.modules,
      integrations: x.integrations,
      blocks: x.blocks,
      seo: x.seo,
      status: 'published',
      order: i,
    }),
  ),
);
s.solutions.forEach((x, i) =>
  out.push(
    insert('solutions', {
      id: `sol_${x.slug}`,
      slug: x.slug,
      name: x.name,
      kind: x.kind,
      tagline: x.tagline,
      modules: x.modules,
      integrations: x.integrations,
      blocks: x.blocks,
      seo: x.seo,
      status: 'published',
      order: i,
    }),
  ),
);
s.technologies.forEach((x) =>
  out.push(insert('technologies', { id: `tec_${x.slug}`, slug: x.slug, name: x.name })),
);
s.testimonials.forEach((x) =>
  out.push(
    insert('testimonials', {
      id: x.id,
      name: x.name,
      role: x.role,
      company: x.company,
      quote: x.quote,
      rating: x.rating,
      video: null,
      consent: true,
    }),
  ),
);
for (const x of s.projects) {
  out.push(
    insert('projects', {
      id: `prj_${x.slug}`,
      slug: x.slug,
      title: x.title,
      client_name: x.clientName,
      confidential: x.confidential,
      company_size: x.companySize,
      duration_weeks: x.durationWeeks,
      summary: x.summary,
      challenge: x.challenge,
      solution: x.solution,
      ai_role: x.aiRole,
      process_before: x.processBefore,
      process_after: x.processAfter,
      metrics: x.metrics,
      main_video: x.mainVideo,
      card_video: x.cardVideo,
      cover: x.cover,
      gallery: x.gallery,
      demo_type: x.demoType,
      demo_url: x.demoUrl,
      demo_tour: x.demoTour,
      testimonial_id: x.testimonialId,
      featured: x.featured,
      seo: x.seo,
      status: 'published',
      publish_at: x.publishedAt,
      created_at: x.publishedAt,
      updated_at: x.updatedAt,
    }),
  );
  x.sectors.forEach((sl) =>
    out.push(insert('project_sectors', { project_id: `prj_${x.slug}`, sector_id: `sec_${sl}` })),
  );
  x.solutions.forEach((sl) =>
    out.push(
      insert('project_solutions', { project_id: `prj_${x.slug}`, solution_id: `sol_${sl}` }),
    ),
  );
  x.technologies.forEach((sl) =>
    out.push(
      insert('project_technologies', { project_id: `prj_${x.slug}`, technology_id: `tec_${sl}` }),
    ),
  );
  x.related.forEach((sl, i) =>
    out.push(
      insert('project_related', { project_id: `prj_${x.slug}`, related_id: `prj_${sl}`, order: i }),
    ),
  );
}
s.aiUseCases.forEach((x, i) =>
  out.push(
    insert('ai_use_cases', {
      id: `ai_${x.slug}`,
      slug: x.slug,
      department: x.department,
      title: x.title,
      description: x.description,
      hours_saved: x.hoursSaved,
      demo_key: x.demoKey ?? null,
      order: i,
    }),
  ),
);
s.authors.forEach((x) =>
  out.push(
    insert('authors', {
      id: `aut_${x.slug}`,
      slug: x.slug,
      name: x.name,
      role: x.role,
      bio: x.bio,
      credentials: x.credentials,
      links: x.links,
    }),
  ),
);
s.posts.forEach((x) =>
  out.push(
    insert('posts', {
      id: `pst_${x.slug}`,
      kind: x.kind,
      slug: x.slug,
      title: x.title,
      excerpt: x.excerpt,
      blocks: x.blocks,
      author_id: `aut_${x.authorSlug}`,
      pillar: x.pillar,
      solution_id: x.solutionSlug ? `sol_${x.solutionSlug}` : null,
      sector_id: x.sectorSlug ? `sec_${x.sectorSlug}` : null,
      project_id: x.projectSlug ? `prj_${x.projectSlug}` : null,
      seo: x.seo,
      status: 'published',
      publish_at: x.publishedAt,
    }),
  ),
);
s.faqs.forEach((x, i) =>
  out.push(
    insert('faqs', {
      id: `faq_${i}`,
      question: x.question,
      answer: x.answer,
      scope: x.scope,
      scope_id: x.scopeSlug ?? null,
      order: i,
    }),
  ),
);
s.pricingTiers.forEach((x, i) =>
  out.push(
    insert('pricing_tiers', {
      id: `prc_${x.slug}`,
      slug: x.slug,
      name: x.name,
      price_from: x.priceFrom,
      price_to: x.priceTo,
      unit: x.unit,
      description: x.description,
      includes: x.includes,
      order: i,
    }),
  ),
);
s.redirects.forEach((x, i) =>
  out.push(
    insert('redirects', {
      id: `red_${i}`,
      from_path: x.from,
      to_path: x.to,
      code: x.code,
      active: true,
    }),
  ),
);
out.push(
  insert('users', {
    id: 'usr_admin',
    email: 'admin@kreatya.es',
    name: 'Administración',
    role: 'admin',
    active: true,
  }),
);
console.log(out.join('\n'));
