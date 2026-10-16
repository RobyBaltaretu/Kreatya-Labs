import { adSpend, kpiDaily, leads, projects } from '@kreatya/db';
import type { DashboardData } from '@kreatya/shared';
import { and, count, gte, inArray, lte, sql, sum } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../../env';

const QUALIFIED = ['diagnostico', 'demo'] as const;
const DIAG_LABELS = ['Sector', 'Dolor principal', 'Herramientas', 'Tamaño', 'Contacto'];

const day = (d: Date) => d.toISOString().slice(0, 10);

export const dashboardRoutes = new Hono<AppEnv>().get('/', async (c) => {
  const q = z
    .object({ from: z.string().optional(), to: z.string().optional() })
    .parse(c.req.query());
  const to = q.to ?? day(new Date());
  const from = q.from ?? day(new Date(Date.now() - 29 * 86_400_000));
  const spanDays = Math.max(1, Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1);
  const prevTo = day(new Date(Date.parse(from) - 86_400_000));
  const prevFrom = day(new Date(Date.parse(from) - spanDays * 86_400_000));
  const db = c.get('db');
  const inRange = (a: string, b: string) => and(gte(kpiDaily.date, a), lte(kpiDaily.date, b));

  const [kpis, prevLeads, leadsDaily, pipeline, spend, projectRows] = await db.batch([
    db
      .select({
        metric: kpiDaily.metric,
        dimension: kpiDaily.dimension,
        value: sum(kpiDaily.value).mapWith(Number),
      })
      .from(kpiDaily)
      .where(inRange(from, to))
      .groupBy(kpiDaily.metric, kpiDaily.dimension),
    db
      .select({ value: sum(kpiDaily.value).mapWith(Number) })
      .from(kpiDaily)
      .where(
        and(
          inRange(prevFrom, prevTo),
          sql`${kpiDaily.metric} = 'leads'`,
          inArray(kpiDaily.dimension, [...QUALIFIED]),
        ),
      ),
    db
      .select({ date: kpiDaily.date, value: sum(kpiDaily.value).mapWith(Number) })
      .from(kpiDaily)
      .where(
        and(
          inRange(from, to),
          sql`${kpiDaily.metric} = 'leads'`,
          inArray(kpiDaily.dimension, [...QUALIFIED]),
        ),
      )
      .groupBy(kpiDaily.date)
      .orderBy(kpiDaily.date),
    db
      .select({
        status: leads.status,
        count: count(),
        value: sum(leads.estimatedValue).mapWith(Number),
      })
      .from(leads)
      .groupBy(leads.status),
    db
      .select({ total: sum(adSpend.amount).mapWith(Number) })
      .from(adSpend)
      .where(and(gte(adSpend.month, from.slice(0, 7)), lte(adSpend.month, to.slice(0, 7)))),
    db.select({ id: projects.id, slug: projects.slug, title: projects.title }).from(projects),
  ]);

  const get = (metric: string, dimension = '') =>
    kpis
      .filter((k) => k.metric === metric && k.dimension === dimension)
      .reduce((s, k) => s + k.value, 0);
  const qualified = QUALIFIED.reduce((s, t) => s + get('leads', t), 0);
  const sessions = get('sessions');
  const projectViews = get('event:project_view');
  const demoOpens = get('event:demo_open');

  const data: DashboardData = {
    range: { from, to },
    kpis: {
      qualifiedLeads: qualified,
      qualifiedLeadsPrev: prevLeads[0]?.value ?? 0,
      sessions,
      conversionRate: sessions ? qualified / sessions : 0,
      costPerLead: spend[0]?.total && qualified ? spend[0].total / qualified : null,
      demoTryRate: projectViews ? demoOpens / projectViews : 0,
      calcRuns: get('event:calc_run'),
      aiQueries: get('event:ai_query'),
    },
    leadsByDay: leadsDaily,
    funnel: DIAG_LABELS.map((label, i) => ({
      step: i + 1,
      label,
      value: get('diag_step', String(i + 1)),
    })),
    topProjects: projectRows
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        views: get('event:project_view', p.id),
        demoOpens: get('event:demo_open', p.id),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5),
    pipeline: pipeline.map((p) => ({ status: p.status, count: p.count, value: p.value ?? 0 })),
    bySource: kpis
      .filter((k) => k.metric === 'leads_source')
      .map((k) => ({ source: k.dimension, count: k.value }))
      .sort((a, b) => b.count - a.count),
  };
  return c.json(data);
});
