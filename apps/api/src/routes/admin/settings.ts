import { auditLog, deploys, events, leads, siteConfig, users } from '@kreatya/db';
import { userInputSchema } from '@kreatya/shared';
import { count, desc, eq, gte } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../env';
import { audit } from '../../lib/audit';
import { requireRole } from '../../middleware/access';

/** Cuotas diarias del plan gratuito de Cloudflare (comprobadas el 16/10/2026). */
export const FREE_QUOTAS = {
  workersRequests: 100_000,
  d1RowsWritten: 100_000,
  d1RowsRead: 5_000_000,
  aiNeurons: 10_000,
} as const;

export const settingsRoutes = new Hono<AppEnv>()
  .get('/me', (c) => c.json(c.get('user')))
  .get('/site-config', async (c) => {
    const row = await c
      .get('db')
      .query.siteConfig.findFirst({ where: eq(siteConfig.id, 'default') });
    return c.json(row?.data ?? {});
  })
  .put('/site-config', requireRole(), async (c) => {
    const data = z.record(z.string(), z.unknown()).parse(await c.req.json());
    const db = c.get('db');
    await db
      .insert(siteConfig)
      .values({ id: 'default', data })
      .onConflictDoUpdate({ target: siteConfig.id, set: { data } });
    await audit(db, c.get('user').id, 'site_config', 'default', 'update', null, data);
    return c.json({ ok: true });
  })
  .get('/users', requireRole(), async (c) => c.json(await c.get('db').select().from(users)))
  .post('/users', requireRole(), async (c) => {
    const input = userInputSchema.parse(await c.req.json());
    const [row] = await c
      .get('db')
      .insert(users)
      .values({ ...input, email: input.email.toLowerCase() })
      .returning();
    return c.json(row, 201);
  })
  .put('/users/:id', requireRole(), async (c) => {
    const input = userInputSchema.parse(await c.req.json());
    await c
      .get('db')
      .update(users)
      .set(input)
      .where(eq(users.id, c.req.param('id')));
    return c.json({ ok: true });
  })
  .get('/audit', requireRole(), async (c) =>
    c.json(
      await c
        .get('db')
        .select({
          id: auditLog.id,
          entity: auditLog.entity,
          entityId: auditLog.entityId,
          action: auditLog.action,
          createdAt: auditLog.createdAt,
          user: users.name,
        })
        .from(auditLog)
        .leftJoin(users, eq(users.id, auditLog.userId))
        .orderBy(desc(auditLog.createdAt))
        .limit(200),
    ),
  )
  /** Publica: lanza el deploy hook de Pages para regenerar la web estática. */
  .post('/publish', requireRole('marketing'), async (c) => {
    const db = c.get('db');
    const [row] = await db
      .insert(deploys)
      .values({ triggeredBy: c.get('user').id, reason: 'Publicación desde el panel' })
      .returning();
    if (!c.env.DEPLOY_HOOK_URL) {
      await db
        .update(deploys)
        .set({ status: 'failed', finishedAt: new Date().toISOString() })
        .where(eq(deploys.id, row!.id));
      return c.json({ ok: false, message: 'DEPLOY_HOOK_URL no configurado' }, 503);
    }
    const res = await fetch(c.env.DEPLOY_HOOK_URL, { method: 'POST' });
    await db
      .update(deploys)
      .set({ status: res.ok ? 'building' : 'failed' })
      .where(eq(deploys.id, row!.id));
    await audit(db, c.get('user').id, 'site', 'web', 'publish', null, { deployId: row!.id });
    return c.json({ ok: res.ok, deployId: row!.id });
  })
  /** Estado de infraestructura: consumo estimado de cuotas y últimos despliegues. */
  .get('/infra', requireRole(), async (c) => {
    const db = c.get('db');
    const today = `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`;
    const [ev, ld, dep] = await db.batch([
      db.select({ v: count() }).from(events).where(gte(events.createdAt, today)),
      db.select({ v: count() }).from(leads).where(gte(leads.createdAt, today)),
      db.select().from(deploys).orderBy(desc(deploys.startedAt)).limit(10),
    ]);
    const writes = (ev[0]?.v ?? 0) + (ld[0]?.v ?? 0);
    return c.json({
      quotas: [
        {
          key: 'd1RowsWritten',
          label: 'D1 · filas escritas hoy (estimado)',
          used: writes,
          limit: FREE_QUOTAS.d1RowsWritten,
        },
        {
          key: 'workersRequests',
          label: 'Workers · peticiones/día',
          used: null,
          limit: FREE_QUOTAS.workersRequests,
        },
        {
          key: 'aiNeurons',
          label: 'Workers AI · neurons/día',
          used: null,
          limit: FREE_QUOTAS.aiNeurons,
        },
      ],
      alertThreshold: 0.7,
      deploys: dep,
    });
  });
