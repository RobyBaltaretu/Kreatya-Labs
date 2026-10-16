import { pages, posts, projects, redirects, sectors, solutions } from '@kreatya/db';
import { redirectInputSchema, seoUpdateSchema } from '@kreatya/shared';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { AppEnv } from '../../env';
import { audit } from '../../lib/audit';
import { requireRole } from '../../middleware/access';

const tables = { projects, sectors, solutions, posts, pages } as const;

export const seoRoutes = new Hono<AppEnv>()
  .use(requireRole('marketing'))
  /** Auditoría: todas las URLs indexables con su SEO y avisos. */
  .get('/audit', async (c) => {
    const db = c.get('db');
    const [prj, sec, sol, pst] = await db.batch([
      db
        .select({
          id: projects.id,
          slug: projects.slug,
          title: projects.title,
          seo: projects.seo,
          status: projects.status,
        })
        .from(projects),
      db
        .select({
          id: sectors.id,
          slug: sectors.slug,
          title: sectors.name,
          seo: sectors.seo,
          status: sectors.status,
          blocks: sectors.blocks,
        })
        .from(sectors),
      db
        .select({
          id: solutions.id,
          slug: solutions.slug,
          title: solutions.name,
          seo: solutions.seo,
          status: solutions.status,
          blocks: solutions.blocks,
        })
        .from(solutions),
      db
        .select({
          id: posts.id,
          slug: posts.slug,
          kind: posts.kind,
          title: posts.title,
          seo: posts.seo,
          status: posts.status,
        })
        .from(posts),
    ]);
    const words = (blocks: { type: string; text?: string; items?: string[] }[]) =>
      blocks.reduce(
        (n, b) => n + (b.text ?? b.items?.join(' ') ?? '').split(/\s+/).filter(Boolean).length,
        0,
      );
    const rows = [
      ...prj.map((r) => ({
        entity: 'projects' as const,
        path: `/proyectos/${r.slug}`,
        ...r,
        words: null as number | null,
      })),
      ...sec.map(({ blocks, ...r }) => ({
        entity: 'sectors' as const,
        path: `/sectores/${r.slug}`,
        ...r,
        words: words(blocks),
      })),
      ...sol.map(({ blocks, ...r }) => ({
        entity: 'solutions' as const,
        path: `/soluciones/${r.slug}`,
        ...r,
        words: words(blocks),
      })),
      ...pst.map(({ kind, ...r }) => ({
        entity: 'posts' as const,
        path: `/${kind === 'guia' ? 'guias' : 'blog'}/${r.slug}`,
        ...r,
        words: null,
      })),
    ];
    return c.json(
      rows.map((r) => ({
        ...r,
        warnings: [
          !r.seo.title && 'Falta title',
          r.seo.title && r.seo.title.length > 60 && 'Title > 60 caracteres',
          !r.seo.description && 'Falta meta description',
          r.seo.description && r.seo.description.length > 155 && 'Description > 155 caracteres',
          r.words !== null && r.words < 800 && `Contenido fino (${r.words} palabras, mínimo 800)`,
        ].filter(Boolean),
      })),
    );
  })
  .put('/entry', async (c) => {
    const { entity, id, seo } = seoUpdateSchema.parse(await c.req.json());
    const table = tables[entity];
    const db = c.get('db');
    await db.update(table).set({ seo }).where(eq(table.id, id));
    await audit(db, c.get('user').id, entity, id, 'update', null, { seo });
    return c.json({ ok: true });
  })
  .get('/redirects', async (c) => c.json(await c.get('db').select().from(redirects)))
  .post('/redirects', async (c) => {
    const input = redirectInputSchema.parse(await c.req.json());
    const [row] = await c.get('db').insert(redirects).values(input).returning();
    return c.json(row, 201);
  })
  .delete('/redirects/:id', async (c) => {
    await c
      .get('db')
      .delete(redirects)
      .where(eq(redirects.id, c.req.param('id')));
    return c.body(null, 204);
  });
