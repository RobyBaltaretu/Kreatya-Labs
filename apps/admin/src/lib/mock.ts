/**
 * Modo demostración: sin VITE_API_URL el panel funciona con datos de ejemplo en memoria
 * (contenido semilla + leads y KPIs simulados). Nada se guarda.
 */
import { contentSnapshot as seed } from '@kreatya/db/seed';
import type { DashboardData, LeadStatus, LeadType, ProjectInput } from '@kreatya/shared';
import type { Infra, Lead, LeadDetail, Me, ProjectFull, Redirect, SeoRow, User } from './types';

let seedN = 42;
const rnd = () => {
  seedN = (seedN * 16807) % 2147483647;
  return (seedN - 1) / 2147483646;
};
const pick = <T>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)]!;
const day = (offset: number) => new Date(Date.UTC(2026, 9, 16) - offset * 86_400_000).toISOString();

const projects: ProjectFull[] = seed.projects.map((p) => ({
  id: `prj_${p.slug}`,
  slug: p.slug,
  title: p.title,
  clientName: p.clientName,
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
  featured: p.featured,
  sectors: p.sectors,
  solutions: p.solutions,
  technologies: p.technologies,
  related: p.related,
  seo: p.seo,
  status: 'published',
  publishAt: p.publishedAt,
  updatedAt: p.updatedAt,
}));
projects.push({
  ...projects[0]!,
  id: 'prj_borrador-erp-bodega',
  slug: 'erp-bodega',
  title: 'ERP para una bodega familiar',
  clientName: 'Bodegas Ejemplo',
  status: 'draft',
  featured: false,
  publishAt: null,
  seo: {},
  updatedAt: day(1),
});

const NAMES = [
  'Lucía Martín',
  'Javier Ortega',
  'Elena Sanz',
  'Pablo Ruiz',
  'Carmen Vidal',
  'Andrés Gil',
  'Marta Soler',
  'Raúl Pons',
  'Nuria Gómez',
  'Sergio Lara',
  'Irene Font',
  'David Roca',
];
const COMPANIES = [
  'Talleres Norte',
  'Frutas Ribera',
  'Clínica Alba',
  'Logística Mar',
  'Moda Calle 8',
  'Asesoría Iris',
  'Metalúrgica Sur',
  'Bodegas Mencía',
];
const SOURCES = [null, 'google', 'google', 'linkedin', 'newsletter'];
const STATUSES: LeadStatus[] = ['nuevo', 'nuevo', 'contactado', 'propuesta', 'ganado', 'perdido'];
const leads: LeadDetail[] = Array.from({ length: 46 }, (_, i) => {
  const type: LeadType = pick([
    'diagnostico',
    'diagnostico',
    'diagnostico',
    'demo',
    'calc_ahorro',
    'calc_inversion',
  ] as const);
  const name = pick(NAMES);
  const sector = pick(seed.sectors);
  return {
    id: `lead_${i}`,
    type,
    status: i < 6 ? 'nuevo' : pick(STATUSES),
    name,
    email: `${name.split(' ')[0]!.toLowerCase()}@${pick(COMPANIES).toLowerCase().replaceAll(' ', '')}.es`,
    phone: rnd() > 0.5 ? '+34 600 000 000' : null,
    company: pick(COMPANIES),
    companySize: pick(['pequena', 'mediana', 'micro']),
    sectorId: `sec_${sector.slug}`,
    projectId: type === 'demo' ? `prj_${pick(seed.projects).slug}` : null,
    answers:
      type === 'diagnostico'
        ? {
            sector: sector.slug,
            pain: pick([
              'Excel por todas partes',
              'Programas que no se hablan entre sí',
              'Tareas repetitivas que quitan horas',
            ]),
            currentTools: ['Excel / Google Sheets'],
          }
        : {},
    estimatedValue: rnd() > 0.3 ? Math.round(10 + rnd() * 60) * 1000 : null,
    sourcePath: pick([
      '/diagnostico',
      '/proyectos/albaran-digital-transportes-levante',
      '/precios',
      '/',
    ]),
    utmSource: pick(SOURCES),
    utmMedium: null,
    utmCampaign: null,
    assignedTo: rnd() > 0.5 ? 'usr_admin' : null,
    createdAt: day(Math.floor(i * 0.65 + rnd())),
    notes: [],
  };
});
const redirects: Redirect[] = seed.redirects.map((r, i) => ({
  id: `red_${i}`,
  fromPath: r.from,
  toPath: r.to,
  code: r.code,
  active: true,
}));
const users: User[] = [
  {
    id: 'usr_admin',
    email: 'admin@kreatya.es',
    name: 'Administración',
    role: 'admin',
    active: true,
    lastLoginAt: day(0),
  },
  {
    id: 'usr_mkt',
    email: 'marketing@kreatya.es',
    name: 'Equipo de marketing',
    role: 'marketing',
    active: true,
    lastLoginAt: day(2),
  },
  {
    id: 'usr_com',
    email: 'comercial@kreatya.es',
    name: 'Equipo comercial',
    role: 'comercial',
    active: true,
    lastLoginAt: day(1),
  },
];
let siteConfig: Record<string, unknown> = { ...seed.siteConfig };

function dashboard(from: string, to: string): DashboardData {
  const inRange = leads.filter(
    (l) => l.createdAt.slice(0, 10) >= from && l.createdAt.slice(0, 10) <= to,
  );
  const qualified = inRange.filter((l) => l.type === 'diagnostico' || l.type === 'demo');
  const days = Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1;
  const sessions = Math.round(days * 41);
  const byDay = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.parse(from) + i * 86_400_000).toISOString().slice(0, 10);
    return { date: d, value: qualified.filter((l) => l.createdAt.startsWith(d)).length };
  });
  const funnelBase = Math.max(qualified.length * 4, 60);
  return {
    range: { from, to },
    kpis: {
      qualifiedLeads: qualified.length,
      qualifiedLeadsPrev: Math.max(1, qualified.length - 6),
      sessions,
      conversionRate: qualified.length / sessions,
      costPerLead: qualified.length ? 640 / qualified.length : null,
      demoTryRate: 0.18,
      calcRuns: inRange.filter((l) => l.type.startsWith('calc')).length * 5 + 23,
      aiQueries: 312,
    },
    leadsByDay: byDay,
    funnel: ['Sector', 'Dolor principal', 'Herramientas', 'Tamaño', 'Contacto'].map((label, i) => ({
      step: i + 1,
      label,
      value: Math.round(funnelBase * [1, 0.78, 0.66, 0.58, 0.41][i]!),
    })),
    topProjects: seed.projects.slice(0, 5).map((p, i) => ({
      slug: p.slug,
      title: p.title,
      views: 420 - i * 63,
      demoOpens: p.demoType === 'none' ? 0 : 88 - i * 12,
    })),
    pipeline: (['nuevo', 'contactado', 'propuesta', 'ganado', 'perdido'] as const).map((s) => {
      const ls = leads.filter((l) => l.status === s);
      return {
        status: s,
        count: ls.length,
        value: ls.reduce((n, l) => n + (l.estimatedValue ?? 0), 0),
      };
    }),
    bySource: Object.entries(
      inRange.reduce<Record<string, number>>((acc, l) => {
        const k = l.utmSource ?? 'directo';
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
  };
}

function seoAudit(): SeoRow[] {
  const words = (bs: { type: string; text?: string; items?: string[] }[]) =>
    bs.reduce(
      (n, b) => n + (b.text ?? b.items?.join(' ') ?? '').split(/\s+/).filter(Boolean).length,
      0,
    );
  const rows: Omit<SeoRow, 'warnings'>[] = [
    ...projects.map((p) => ({
      entity: 'projects' as const,
      path: `/proyectos/${p.slug}`,
      id: p.id,
      slug: p.slug,
      title: p.title,
      seo: p.seo,
      status: p.status,
      words: null,
    })),
    ...seed.sectors.map((x) => ({
      entity: 'sectors' as const,
      path: `/sectores/${x.slug}`,
      id: `sec_${x.slug}`,
      slug: x.slug,
      title: x.name,
      seo: x.seo,
      status: 'published',
      words: words(x.blocks),
    })),
    ...seed.solutions.map((x) => ({
      entity: 'solutions' as const,
      path: `/soluciones/${x.slug}`,
      id: `sol_${x.slug}`,
      slug: x.slug,
      title: x.name,
      seo: x.seo,
      status: 'published',
      words: words(x.blocks),
    })),
    ...seed.posts.map((x) => ({
      entity: 'posts' as const,
      path: `/${x.kind === 'guia' ? 'guias' : 'blog'}/${x.slug}`,
      id: `pst_${x.slug}`,
      slug: x.slug,
      title: x.title,
      seo: x.seo,
      status: 'published',
      words: null,
    })),
  ];
  return rows.map((r) => ({
    ...r,
    warnings: [
      !r.seo.title && 'Falta title',
      r.seo.title && r.seo.title.length > 60 && 'Title > 60 caracteres',
      !r.seo.description && 'Falta meta description',
      r.seo.description && r.seo.description.length > 155 && 'Description > 155 caracteres',
      r.words !== null && r.words < 800 && `Contenido fino (${r.words} palabras, mínimo 800)`,
    ].filter((w): w is string => Boolean(w)),
  }));
}

const delay = <T>(v: T) => new Promise<T>((r) => setTimeout(() => r(structuredClone(v)), 150));

/** Emula las rutas de la API del panel. */
export async function mockFetch(method: string, path: string, body?: unknown): Promise<unknown> {
  const url = new URL(path, 'http://mock');
  const p = url.pathname.replace(/^\/admin/, '');
  const q = Object.fromEntries(url.searchParams);
  const seg = p.split('/').filter(Boolean);

  if (p === '/me')
    return delay<Me>({
      id: 'usr_admin',
      email: 'admin@kreatya.es',
      name: 'Administración',
      role: 'admin',
    });
  if (p === '/dashboard')
    return delay(dashboard(q.from ?? day(29).slice(0, 10), q.to ?? day(0).slice(0, 10)));
  if (seg[0] === 'projects') {
    if (method === 'GET' && !seg[1])
      return delay(
        projects.map(
          ({
            id,
            slug,
            title,
            clientName,
            confidential,
            status,
            demoType,
            featured,
            publishAt,
            updatedAt,
          }) => ({
            id,
            slug,
            title,
            clientName,
            confidential,
            status,
            demoType,
            featured,
            publishAt,
            updatedAt,
          }),
        ),
      );
    if (method === 'GET') return delay(projects.find((x) => x.id === seg[1]));
    if (method === 'POST') {
      const id = `prj_${(body as ProjectInput).slug}`;
      projects.unshift({ ...(body as ProjectInput), id, updatedAt: new Date().toISOString() });
      return delay({ id });
    }
    if (method === 'PUT') {
      const i = projects.findIndex((x) => x.id === seg[1]);
      projects[i] = { ...(body as ProjectInput), id: seg[1]!, updatedAt: new Date().toISOString() };
      return delay({ id: seg[1] });
    }
    if (method === 'DELETE') {
      projects.splice(
        projects.findIndex((x) => x.id === seg[1]),
        1,
      );
      return delay(null);
    }
  }
  if (seg[0] === 'leads') {
    if (method === 'GET' && !seg[1])
      return delay(
        leads
          .filter((l) => (!q.status || l.status === q.status) && (!q.type || l.type === q.type))
          .map(({ notes: _n, ...l }) => l as Lead),
      );
    const lead = leads.find((l) => l.id === seg[1]);
    if (!lead) throw new Error('Lead no encontrado');
    if (method === 'GET') return delay(lead);
    if (method === 'PATCH') {
      Object.assign(lead, body);
      return delay({ id: lead.id });
    }
    if (method === 'POST' && seg[2] === 'notes') {
      lead.notes.unshift({
        id: `n${Date.now()}`,
        body: (body as { body: string }).body,
        createdAt: new Date().toISOString(),
        author: 'Administración',
      });
      return delay({ ok: true });
    }
  }
  if (p === '/seo/audit') return delay(seoAudit());
  if (p === '/seo/entry') {
    const b = body as { entity: string; id: string; seo: ProjectInput['seo'] };
    const pr = projects.find((x) => x.id === b.id);
    if (pr) pr.seo = b.seo;
    const sx = [
      ...seed.sectors.map((x) => ({ id: `sec_${x.slug}`, x })),
      ...seed.solutions.map((x) => ({ id: `sol_${x.slug}`, x })),
    ].find((e) => e.id === b.id);
    if (sx) sx.x.seo = b.seo;
    return delay({ ok: true });
  }
  if (p === '/seo/redirects' && method === 'GET') return delay(redirects);
  if (p === '/seo/redirects' && method === 'POST') {
    const r = { id: `red_${Date.now()}`, ...(body as Omit<Redirect, 'id'>) };
    redirects.push(r);
    return delay(r);
  }
  if (seg[0] === 'seo' && seg[1] === 'redirects' && method === 'DELETE') {
    redirects.splice(
      redirects.findIndex((r) => r.id === seg[2]),
      1,
    );
    return delay(null);
  }
  if (p === '/site-config') {
    if (method === 'PUT') siteConfig = body as Record<string, unknown>;
    return delay(siteConfig);
  }
  if (p === '/users' && method === 'GET') return delay(users);
  if (p === '/users' && method === 'POST') {
    const u = {
      id: `usr_${Date.now()}`,
      lastLoginAt: null,
      ...(body as Omit<User, 'id' | 'lastLoginAt'>),
    };
    users.push(u);
    return delay(u);
  }
  if (seg[0] === 'users' && method === 'PUT') {
    Object.assign(users.find((u) => u.id === seg[1])!, body);
    return delay({ ok: true });
  }
  if (p === '/infra')
    return delay<Infra>({
      quotas: [
        { key: 'workersRequests', label: 'Workers · peticiones/día', used: 31_240, limit: 100_000 },
        { key: 'd1RowsWritten', label: 'D1 · filas escritas/día', used: 2_180, limit: 100_000 },
        { key: 'd1RowsRead', label: 'D1 · filas leídas/día', used: 412_000, limit: 5_000_000 },
        { key: 'aiNeurons', label: 'Workers AI · neurons/día', used: 7_420, limit: 10_000 },
      ],
      alertThreshold: 0.7,
      deploys: [
        {
          id: 'd3',
          reason: 'Publicación desde el panel',
          status: 'success',
          startedAt: day(0),
          finishedAt: day(0),
        },
        {
          id: 'd2',
          reason: 'Nuevo caso: portal de clientes',
          status: 'success',
          startedAt: day(3),
          finishedAt: day(3),
        },
        {
          id: 'd1',
          reason: 'Cambio de redirecciones',
          status: 'failed',
          startedAt: day(6),
          finishedAt: day(6),
        },
      ],
    });
  if (p === '/publish') return delay({ ok: true, deployId: `d${Date.now()}` });
  if (p === '/audit') return delay([]);
  throw new Error(`Ruta no simulada: ${method} ${path}`);
}

export const leadsCsv = () => {
  const head = 'id,type,status,name,email,company,createdAt';
  return [
    head,
    ...leads.map((l) =>
      [l.id, l.type, l.status, l.name, l.email, l.company ?? '', l.createdAt].join(','),
    ),
  ].join('\n');
};
