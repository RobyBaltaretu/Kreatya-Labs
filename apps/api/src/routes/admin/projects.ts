import {
  projectRelated,
  projectSectors,
  projectSolutions,
  projects,
  projectTechnologies,
  sectors,
  solutions,
  technologies,
} from '@kreatya/db';
import { newId } from '@kreatya/db/schema';
import { type ProjectInput, projectInputSchema } from '@kreatya/shared';
import { desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from '../../env';
import { audit } from '../../lib/audit';
import { requireRole } from '../../middleware/access';

async function loadFull(db: AppEnv['Variables']['db'], id: string) {
  const p = await db.query.projects.findFirst({ where: eq(projects.id, id) });
  if (!p) return null;
  const [sec, sol, tec, rel] = await db.batch([
    db
      .select({ slug: sectors.slug })
      .from(projectSectors)
      .innerJoin(sectors, eq(sectors.id, projectSectors.sectorId))
      .where(eq(projectSectors.projectId, id)),
    db
      .select({ slug: solutions.slug })
      .from(projectSolutions)
      .innerJoin(solutions, eq(solutions.id, projectSolutions.solutionId))
      .where(eq(projectSolutions.projectId, id)),
    db
      .select({ slug: technologies.slug })
      .from(projectTechnologies)
      .innerJoin(technologies, eq(technologies.id, projectTechnologies.technologyId))
      .where(eq(projectTechnologies.projectId, id)),
    db
      .select({ slug: projects.slug })
      .from(projectRelated)
      .innerJoin(projects, eq(projects.id, projectRelated.relatedId))
      .where(eq(projectRelated.projectId, id)),
  ]);
  return {
    ...p,
    sectors: sec.map((x) => x.slug),
    solutions: sol.map((x) => x.slug),
    technologies: tec.map((x) => x.slug),
    related: rel.map((x) => x.slug),
  };
}

async function writeRelations(db: AppEnv['Variables']['db'], id: string, input: ProjectInput) {
  const idsBySlug = async <
    T extends typeof sectors | typeof solutions | typeof technologies | typeof projects,
  >(
    table: T,
    slugs: string[],
  ) =>
    slugs.length
      ? (await db.select({ id: table.id }).from(table).where(inArray(table.slug, slugs))).map(
          (r) => r.id,
        )
      : [];
  const [sec, sol, tec, rel] = await Promise.all([
    idsBySlug(sectors, input.sectors),
    idsBySlug(solutions, input.solutions),
    idsBySlug(technologies, input.technologies),
    idsBySlug(projects, input.related),
  ]);
  await db.batch([
    db.delete(projectSectors).where(eq(projectSectors.projectId, id)),
    db.delete(projectSolutions).where(eq(projectSolutions.projectId, id)),
    db.delete(projectTechnologies).where(eq(projectTechnologies.projectId, id)),
    db.delete(projectRelated).where(eq(projectRelated.projectId, id)),
    ...sec.map((sectorId) => db.insert(projectSectors).values({ projectId: id, sectorId })),
    ...sol.map((solutionId) => db.insert(projectSolutions).values({ projectId: id, solutionId })),
    ...tec.map((technologyId) =>
      db.insert(projectTechnologies).values({ projectId: id, technologyId }),
    ),
    ...rel
      .filter((r) => r !== id)
      .map((relatedId, order) =>
        db.insert(projectRelated).values({ projectId: id, relatedId, order }),
      ),
  ] as unknown as Parameters<typeof db.batch>[0]);
}

const columns = (i: ProjectInput) => {
  const { sectors: _s, solutions: _so, technologies: _t, related: _r, ...rest } = i;
  return rest;
};

export const projectRoutes = new Hono<AppEnv>()
  .get('/', async (c) => {
    const rows = await c
      .get('db')
      .select({
        id: projects.id,
        slug: projects.slug,
        title: projects.title,
        clientName: projects.clientName,
        confidential: projects.confidential,
        status: projects.status,
        demoType: projects.demoType,
        featured: projects.featured,
        publishAt: projects.publishAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .orderBy(desc(projects.updatedAt));
    return c.json(rows);
  })
  .get('/:id', async (c) => {
    const p = await loadFull(c.get('db'), c.req.param('id'));
    if (!p) throw new HTTPException(404, { message: 'Proyecto no encontrado' });
    return c.json(p);
  })
  .post('/', requireRole('marketing'), async (c) => {
    const input = projectInputSchema.parse(await c.req.json());
    const db = c.get('db');
    const id = newId();
    await db.insert(projects).values({ id, ...columns(input) });
    await writeRelations(db, id, input);
    await audit(db, c.get('user').id, 'projects', id, 'create', null, input);
    return c.json({ id }, 201);
  })
  .put('/:id', requireRole('marketing'), async (c) => {
    const id = c.req.param('id');
    const input = projectInputSchema.parse(await c.req.json());
    const db = c.get('db');
    const before = await loadFull(db, id);
    if (!before) throw new HTTPException(404, { message: 'Proyecto no encontrado' });
    await db.update(projects).set(columns(input)).where(eq(projects.id, id));
    await writeRelations(db, id, input);
    await audit(db, c.get('user').id, 'projects', id, 'update', before, input);
    return c.json({ id });
  })
  .delete('/:id', requireRole('marketing'), async (c) => {
    const id = c.req.param('id');
    const db = c.get('db');
    const before = await loadFull(db, id);
    await db.delete(projects).where(eq(projects.id, id));
    await audit(db, c.get('user').id, 'projects', id, 'delete', before, null);
    return c.body(null, 204);
  });
