import { demoAccess, events, leads, projects, sectors } from '@kreatya/db';
import {
  calculateSavings,
  eventInputSchema,
  type LeadInput,
  leadInputSchema,
} from '@kreatya/shared';
import { and, eq, gt } from 'drizzle-orm';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from '../env';
import { randomToken, sha256 } from '../lib/crypto';
import { escapeHtml, sendEmail } from '../lib/email';
import { rateLimit } from '../lib/rate-limit';
import { verifyTurnstile } from '../lib/turnstile';

const DEMO_ACCESS_HOURS = 72;

export const publicRoutes = new Hono<AppEnv>()
  /** Alta de lead: diagnóstico, demo bajo solicitud o calculadora (HU-03, HU-04, HU-05). */
  .post('/leads', async (c) => {
    const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
    const rl = await rateLimit(c.env.KV, `lead:${ip}`, 5, 600);
    if (!rl.allowed)
      throw new HTTPException(429, {
        message: 'Demasiadas solicitudes. Inténtalo en unos minutos.',
      });

    const parsed = leadInputSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ ok: false, errors: parsed.error.flatten() }, 400);
    const input: LeadInput = parsed.data;

    if (!(await verifyTurnstile(c.env.TURNSTILE_SECRET, input.turnstileToken, ip))) {
      throw new HTTPException(400, { message: 'No hemos podido verificar que no eres un robot.' });
    }

    const db = c.get('db');
    const now = new Date().toISOString();
    const base = {
      type: input.type,
      name: input.name,
      email: input.email.toLowerCase(),
      sourcePath: input.sourcePath ?? null,
      utmSource: input.utm?.source ?? null,
      utmMedium: input.utm?.medium ?? null,
      utmCampaign: input.utm?.campaign ?? null,
      utmTerm: input.utm?.term ?? null,
      utmContent: input.utm?.content ?? null,
      referrer: c.req.header('Referer') ?? null,
      consentAt: now,
    };

    let leadId: string;
    let projectRow: typeof projects.$inferSelect | undefined;

    if (input.type === 'diagnostico') {
      const sector = await db.query.sectors.findFirst({ where: eq(sectors.slug, input.sector) });
      const [row] = await db
        .insert(leads)
        .values({
          ...base,
          phone: input.phone ?? null,
          company: input.company ?? null,
          companySize: input.companySize,
          sectorId: sector?.id ?? null,
          answers: {
            sector: input.sector,
            solutionKind: input.solutionKind,
            pain: input.pain,
            currentTools: input.currentTools,
          },
        })
        .returning({ id: leads.id });
      leadId = row!.id;
    } else if (input.type === 'demo') {
      projectRow = await db.query.projects.findFirst({
        where: eq(projects.slug, input.projectSlug),
      });
      if (!projectRow) throw new HTTPException(404, { message: 'Proyecto no encontrado' });
      const [row] = await db
        .insert(leads)
        .values({
          ...base,
          company: input.company ?? null,
          projectId: projectRow.id,
          answers: { projectSlug: input.projectSlug },
        })
        .returning({ id: leads.id });
      leadId = row!.id;
    } else {
      const result = calculateSavings(input.input);
      const [row] = await db
        .insert(leads)
        .values({
          ...base,
          answers: { input: input.input, result },
          estimatedValue: result.eurosSavedPerYear,
        })
        .returning({ id: leads.id });
      leadId = row!.id;
    }

    // Acceso temporal a la demo completa (72 h).
    let demoLink: string | undefined;
    if (input.type === 'demo' && projectRow) {
      const token = randomToken();
      await db.insert(demoAccess).values({
        leadId,
        projectId: projectRow.id,
        tokenHash: await sha256(token),
        expiresAt: new Date(Date.now() + DEMO_ACCESS_HOURS * 3600_000).toISOString(),
      });
      demoLink = `${new URL(c.req.url).origin}/v1/demo-access/${token}`;
      c.executionCtx.waitUntil(
        sendEmail(c.env, {
          to: input.email,
          subject: `Tu acceso a la demo: ${projectRow.title}`,
          html: `<p>Hola ${escapeHtml(input.name)},</p><p>Aquí tienes tu acceso a la demo (válido ${DEMO_ACCESS_HOURS} h):</p><p><a href="${demoLink}">Abrir la demo</a></p><p>— Equipo Kreatya Labs</p>`,
        }),
      );
    }

    c.executionCtx.waitUntil(
      Promise.all([
        db.insert(events).values({
          name: 'generate_lead',
          sessionId: 'server',
          path: input.sourcePath ?? '/',
          props: { type: input.type },
        }),
        sendEmail(c.env, {
          to: c.env.LEAD_NOTIFY_EMAIL,
          subject: `Nuevo lead (${input.type}): ${input.name}`,
          html: `<p><strong>${escapeHtml(input.name)}</strong> &lt;${escapeHtml(input.email)}&gt;</p><p>Tipo: ${input.type}<br>Origen: ${escapeHtml(input.sourcePath ?? '-')}</p>`,
        }),
      ]),
    );

    return c.json({ ok: true, id: leadId }, 201);
  })

  /** Eventos de producto anónimos (embudo, vistas de ficha, demos). */
  .post('/events', async (c) => {
    const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
    const rl = await rateLimit(c.env.KV, `evt:${ip}`, 120, 60);
    if (!rl.allowed) return c.body(null, 204);
    const parsed = eventInputSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ ok: false }, 400);
    const e = parsed.data;
    let projectId: string | null = null;
    if (e.projectSlug) {
      const p = await c.get('db').query.projects.findFirst({
        where: eq(projects.slug, e.projectSlug),
        columns: { id: true },
      });
      projectId = p?.id ?? null;
    }
    await c
      .get('db')
      .insert(events)
      .values({
        name: e.name,
        sessionId: e.sessionId,
        path: e.path,
        projectId,
        props: e.props ?? {},
      });
    return c.body(null, 204);
  })

  /** Canje del enlace temporal de demo. */
  .get('/demo-access/:token', async (c) => {
    const db = c.get('db');
    const hash = await sha256(c.req.param('token'));
    const access = await db.query.demoAccess.findFirst({
      where: and(
        eq(demoAccess.tokenHash, hash),
        gt(demoAccess.expiresAt, new Date().toISOString()),
      ),
    });
    if (!access)
      return c.text(
        'El enlace ha caducado o no es válido. Solicita uno nuevo desde la ficha del proyecto.',
        410,
      );
    const project = await db.query.projects.findFirst({ where: eq(projects.id, access.projectId) });
    await db
      .update(demoAccess)
      .set({ useCount: access.useCount + 1, lastUsedAt: new Date().toISOString() })
      .where(eq(demoAccess.id, access.id));
    return c.redirect(project?.demoUrl ?? `${c.env.DEMO_BASE_URL}/${project?.slug ?? ''}`, 302);
  });
