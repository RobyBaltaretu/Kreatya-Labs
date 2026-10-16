import { leadNotes, leads, users } from '@kreatya/db';
import { LEAD_STATUS, LEAD_TYPES, leadUpdateSchema } from '@kreatya/shared';
import { and, desc, eq, gte, lte, type SQL } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import type { AppEnv } from '../../env';
import { audit } from '../../lib/audit';
import { toCsv } from '../../lib/csv';
import { requireRole } from '../../middleware/access';

const filterSchema = z.object({
  status: z.enum(LEAD_STATUS).optional(),
  type: z.enum(LEAD_TYPES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

function where(q: z.infer<typeof filterSchema>) {
  const conds: SQL[] = [];
  if (q.status) conds.push(eq(leads.status, q.status));
  if (q.type) conds.push(eq(leads.type, q.type));
  if (q.from) conds.push(gte(leads.createdAt, q.from));
  if (q.to) conds.push(lte(leads.createdAt, q.to));
  return conds.length ? and(...conds) : undefined;
}

export const leadRoutes = new Hono<AppEnv>()
  .use(requireRole('comercial'))
  .get('/', async (c) => {
    const q = filterSchema.parse(c.req.query());
    const rows = await c
      .get('db')
      .select()
      .from(leads)
      .where(where(q))
      .orderBy(desc(leads.createdAt))
      .limit(500);
    return c.json(rows);
  })
  .get('/export.csv', async (c) => {
    const q = filterSchema.parse(c.req.query());
    const rows = await c
      .get('db')
      .select()
      .from(leads)
      .where(where(q))
      .orderBy(desc(leads.createdAt));
    return c.body(toCsv(rows), 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    });
  })
  .get('/:id', async (c) => {
    const db = c.get('db');
    const lead = await db.query.leads.findFirst({ where: eq(leads.id, c.req.param('id')) });
    if (!lead) throw new HTTPException(404, { message: 'Lead no encontrado' });
    const notes = await db
      .select({
        id: leadNotes.id,
        body: leadNotes.body,
        createdAt: leadNotes.createdAt,
        author: users.name,
      })
      .from(leadNotes)
      .leftJoin(users, eq(users.id, leadNotes.userId))
      .where(eq(leadNotes.leadId, lead.id))
      .orderBy(desc(leadNotes.createdAt));
    return c.json({ ...lead, notes });
  })
  .patch('/:id', async (c) => {
    const id = c.req.param('id');
    const patch = leadUpdateSchema.parse(await c.req.json());
    const db = c.get('db');
    const before = await db.query.leads.findFirst({ where: eq(leads.id, id) });
    if (!before) throw new HTTPException(404, { message: 'Lead no encontrado' });
    await db.update(leads).set(patch).where(eq(leads.id, id));
    await audit(
      db,
      c.get('user').id,
      'leads',
      id,
      'update',
      { status: before.status, assignedTo: before.assignedTo },
      patch,
    );
    return c.json({ id });
  })
  .post('/:id/notes', async (c) => {
    const { body } = z.object({ body: z.string().min(1).max(5000) }).parse(await c.req.json());
    await c
      .get('db')
      .insert(leadNotes)
      .values({ leadId: c.req.param('id'), userId: c.get('user').id, body });
    return c.json({ ok: true }, 201);
  });
