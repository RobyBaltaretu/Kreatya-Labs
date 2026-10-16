import { contentSnapshot } from '@kreatya/db/seed';
import { describe, expect, it } from 'vitest';
import { safeEqual } from './crypto';
import { toCsv } from './csv';
import { rateLimit } from './rate-limit';
import { buildSnapshot } from './snapshot';

class MemoryKV {
  store = new Map<string, string>();
  async get(k: string) {
    return this.store.get(k) ?? null;
  }
  async put(k: string, v: string) {
    this.store.set(k, v);
  }
}

describe('rateLimit', () => {
  it('bloquea al superar el límite dentro de la ventana', async () => {
    const kv = new MemoryKV() as unknown as KVNamespace;
    const now = 1_700_000_000_000;
    for (let i = 0; i < 3; i++) expect((await rateLimit(kv, 'ip', 3, 60, now)).allowed).toBe(true);
    expect((await rateLimit(kv, 'ip', 3, 60, now)).allowed).toBe(false);
    expect((await rateLimit(kv, 'ip', 3, 60, now + 61_000)).allowed).toBe(true);
  });
});

describe('toCsv', () => {
  it('escapa comillas y neutraliza fórmulas', () => {
    const csv = toCsv([{ a: 'hola "x"', b: '=SUM(A1)' }]);
    expect(csv).toBe('a,b\n"hola ""x""",\'=SUM(A1)');
  });
});

describe('safeEqual', () => {
  it('compara tokens', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
  });
});

describe('buildSnapshot', () => {
  const s = contentSnapshot;
  const project = s.projects[0]!;
  const base = {
    id: 'p1',
    slug: project.slug,
    title: project.title,
    clientName: 'Secreto S.L.',
    confidential: true,
    companySize: project.companySize,
    durationWeeks: 6,
    summary: '',
    challenge: '',
    solution: '',
    aiRole: null,
    processBefore: [],
    processAfter: [],
    metrics: [],
    mainVideo: null,
    cardVideo: null,
    cover: '',
    gallery: [],
    demoType: 'none' as const,
    demoUrl: null,
    demoTour: [],
    testimonialId: null,
    featured: false,
    seo: {},
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };
  const empty = {
    siteConfig: [],
    sectors: [],
    solutions: [],
    technologies: [],
    projectSectors: [],
    projectSolutions: [],
    projectTechnologies: [],
    projectRelated: [],
    testimonials: [],
    faqs: [],
    aiUseCases: [],
    authors: [],
    posts: [],
    pricingTiers: [],
    redirects: [],
  };

  it('oculta el nombre del cliente en proyectos con NDA', () => {
    const snap = buildSnapshot({
      ...empty,
      projects: [{ ...base, status: 'published', publishAt: null }],
    });
    expect(snap.projects[0]!.clientName).toBeNull();
  });

  it('excluye borradores y programados futuros', () => {
    const snap = buildSnapshot(
      {
        ...empty,
        projects: [
          { ...base, id: 'a', status: 'draft', publishAt: null },
          { ...base, id: 'b', status: 'scheduled', publishAt: '2099-01-01' },
          { ...base, id: 'c', status: 'scheduled', publishAt: '2020-01-01' },
        ],
      },
      '2026-10-16T00:00:00Z',
    );
    expect(snap.projects).toHaveLength(1);
  });
});
