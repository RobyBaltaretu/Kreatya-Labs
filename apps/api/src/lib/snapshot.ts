import type { Db } from '@kreatya/db';
import * as t from '@kreatya/db/schema';
import type { ContentSnapshot } from '@kreatya/shared';
import { asc, desc, eq } from 'drizzle-orm';

type Rows = {
  siteConfig: (typeof t.siteConfig.$inferSelect)[];
  sectors: (typeof t.sectors.$inferSelect)[];
  solutions: (typeof t.solutions.$inferSelect)[];
  technologies: (typeof t.technologies.$inferSelect)[];
  projects: (typeof t.projects.$inferSelect)[];
  projectSectors: (typeof t.projectSectors.$inferSelect)[];
  projectSolutions: (typeof t.projectSolutions.$inferSelect)[];
  projectTechnologies: (typeof t.projectTechnologies.$inferSelect)[];
  projectRelated: (typeof t.projectRelated.$inferSelect)[];
  testimonials: (typeof t.testimonials.$inferSelect)[];
  faqs: (typeof t.faqs.$inferSelect)[];
  aiUseCases: (typeof t.aiUseCases.$inferSelect)[];
  authors: (typeof t.authors.$inferSelect)[];
  posts: (typeof t.posts.$inferSelect)[];
  pricingTiers: (typeof t.pricingTiers.$inferSelect)[];
  redirects: (typeof t.redirects.$inferSelect)[];
};

const isLive = (status: string, publishAt: string | null, now: string) =>
  status === 'published' || (status === 'scheduled' && publishAt !== null && publishAt <= now);

/** Transforma filas de D1 en la instantánea pública (función pura, testeable). */
export function buildSnapshot(r: Rows, now = new Date().toISOString()): ContentSnapshot {
  const slugOf = <T extends { id: string; slug: string }>(rows: T[]) =>
    new Map(rows.map((x) => [x.id, x.slug]));
  const sectorSlug = slugOf(r.sectors);
  const solutionSlug = slugOf(r.solutions);
  const techSlug = slugOf(r.technologies);
  const projectSlug = slugOf(r.projects);
  const authorSlug = slugOf(r.authors);
  const live = r.projects.filter((p) => isLive(p.status, p.publishAt, now));
  const liveIds = new Set(live.map((p) => p.id));
  const by = <T extends { projectId: string }>(rows: T[], id: string) =>
    rows.filter((x) => x.projectId === id);

  return {
    generatedAt: now,
    siteConfig: r.siteConfig[0]?.data ?? {},
    sectors: r.sectors
      .filter((s) => s.status === 'published')
      .map((s) => ({
        slug: s.slug,
        name: s.name,
        tagline: s.tagline,
        pain: s.pain,
        modules: s.modules,
        integrations: s.integrations,
        blocks: s.blocks,
        seo: s.seo,
      })),
    solutions: r.solutions
      .filter((s) => s.status === 'published')
      .map((s) => ({
        slug: s.slug,
        name: s.name,
        kind: s.kind,
        tagline: s.tagline,
        modules: s.modules,
        integrations: s.integrations,
        blocks: s.blocks,
        seo: s.seo,
      })),
    technologies: r.technologies.map(({ slug, name }) => ({ slug, name })),
    projects: live.map((p) => ({
      slug: p.slug,
      title: p.title,
      clientName: p.confidential ? null : p.clientName,
      confidential: p.confidential,
      companySize: p.companySize,
      durationWeeks: p.durationWeeks,
      summary: p.summary,
      challenge: p.challenge,
      solution: p.solution,
      aiRole: p.aiRole,
      processBefore: p.processBefore,
      processAfter: p.processAfter,
      metrics: p.metrics,
      mainVideo: p.mainVideo,
      cardVideo: p.cardVideo,
      cover: p.cover,
      gallery: p.gallery,
      demoType: p.demoType,
      demoUrl: p.demoUrl,
      demoTour: p.demoTour,
      testimonialId: p.testimonialId,
      sectors: by(r.projectSectors, p.id)
        .map((x) => sectorSlug.get(x.sectorId)!)
        .filter(Boolean),
      solutions: by(r.projectSolutions, p.id)
        .map((x) => solutionSlug.get(x.solutionId)!)
        .filter(Boolean),
      technologies: by(r.projectTechnologies, p.id)
        .map((x) => techSlug.get(x.technologyId)!)
        .filter(Boolean),
      related: by(r.projectRelated, p.id)
        .filter((x) => liveIds.has(x.relatedId))
        .sort((a, b) => a.order - b.order)
        .map((x) => projectSlug.get(x.relatedId)!),
      featured: p.featured,
      publishedAt: p.publishAt ?? p.createdAt,
      updatedAt: p.updatedAt,
      seo: p.seo,
    })),
    testimonials: r.testimonials
      .filter((x) => x.consent)
      .map((x) => ({
        id: x.id,
        name: x.name,
        role: x.role,
        company: x.company,
        quote: x.quote,
        rating: x.rating,
        ...(x.video ? { videoUrl: x.video.url, poster: x.video.poster } : {}),
      })),
    faqs: r.faqs.map((f) => ({
      question: f.question,
      answer: f.answer,
      scope: f.scope,
      ...(f.scopeId ? { scopeSlug: f.scopeId } : {}),
    })),
    aiUseCases: r.aiUseCases.map((u) => ({
      slug: u.slug,
      department: u.department,
      title: u.title,
      description: u.description,
      hoursSaved: u.hoursSaved,
      ...(u.demoKey ? { demoKey: u.demoKey } : {}),
    })),
    authors: r.authors.map((a) => ({
      slug: a.slug,
      name: a.name,
      role: a.role,
      bio: a.bio,
      credentials: a.credentials,
      links: a.links,
    })),
    posts: r.posts
      .filter((p) => isLive(p.status, p.publishAt, now))
      .map((p) => ({
        kind: p.kind,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        blocks: p.blocks,
        authorSlug: authorSlug.get(p.authorId) ?? '',
        pillar: p.pillar,
        ...(p.solutionId ? { solutionSlug: solutionSlug.get(p.solutionId) } : {}),
        ...(p.sectorId ? { sectorSlug: sectorSlug.get(p.sectorId) } : {}),
        ...(p.projectId ? { projectSlug: projectSlug.get(p.projectId) } : {}),
        publishedAt: p.publishAt ?? p.createdAt,
        updatedAt: p.updatedAt,
        seo: p.seo,
      })),
    pricingTiers: r.pricingTiers.map((x) => ({
      slug: x.slug,
      name: x.name,
      priceFrom: x.priceFrom,
      priceTo: x.priceTo,
      unit: x.unit,
      description: x.description,
      includes: x.includes,
    })),
    redirects: r.redirects
      .filter((x) => x.active)
      .map((x) => ({ from: x.fromPath, to: x.toPath, code: x.code })),
    stats: {
      projectsDelivered: live.length,
      averageRating: r.testimonials.length
        ? Math.round(
            (r.testimonials.reduce((s, x) => s + x.rating, 0) / r.testimonials.length) * 10,
          ) / 10
        : 0,
      reviews: r.testimonials.length,
      yearsActive: 0,
    },
  };
}

export async function loadSnapshot(db: Db): Promise<ContentSnapshot> {
  const [
    siteConfig,
    sectors,
    solutions,
    technologies,
    projects,
    projectSectors,
    projectSolutions,
    projectTechnologies,
    projectRelated,
    testimonials,
    faqs,
    aiUseCases,
    authors,
    posts,
    pricingTiers,
    redirects,
  ] = await db.batch([
    db.select().from(t.siteConfig).where(eq(t.siteConfig.id, 'default')),
    db.select().from(t.sectors).orderBy(asc(t.sectors.order)),
    db.select().from(t.solutions).orderBy(asc(t.solutions.order)),
    db.select().from(t.technologies),
    db.select().from(t.projects).orderBy(desc(t.projects.publishAt)),
    db.select().from(t.projectSectors),
    db.select().from(t.projectSolutions),
    db.select().from(t.projectTechnologies),
    db.select().from(t.projectRelated),
    db.select().from(t.testimonials),
    db.select().from(t.faqs).orderBy(asc(t.faqs.order)),
    db.select().from(t.aiUseCases).orderBy(asc(t.aiUseCases.order)),
    db.select().from(t.authors),
    db.select().from(t.posts).orderBy(desc(t.posts.publishAt)),
    db.select().from(t.pricingTiers).orderBy(asc(t.pricingTiers.order)),
    db.select().from(t.redirects),
  ]);
  return buildSnapshot({
    siteConfig,
    sectors,
    solutions,
    technologies,
    projects,
    projectSectors,
    projectSolutions,
    projectTechnologies,
    projectRelated,
    testimonials,
    faqs,
    aiUseCases,
    authors,
    posts,
    pricingTiers,
    redirects,
  });
}
