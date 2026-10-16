import { type Db, events, kpiDaily, leads } from '@kreatya/db';
import { and, count, countDistinct, eq, gte, lt, sql } from 'drizzle-orm';

/**
 * Agrega los eventos y leads de un día en `kpi_daily`.
 * Se ejecuta cada noche para que el dashboard no consuma lecturas de D1 por visita.
 */
export async function aggregateDay(db: Db, date: string) {
  const start = `${date}T00:00:00.000Z`;
  const end = new Date(new Date(start).getTime() + 86_400_000).toISOString();
  const inDay = (col: typeof events.createdAt | typeof leads.createdAt) =>
    and(gte(col, start), lt(col, end));

  const [sessions, byEvent, byProject, diagSteps, leadsByType, leadsBySource] = await db.batch([
    db
      .select({ v: countDistinct(events.sessionId) })
      .from(events)
      .where(and(inDay(events.createdAt), eq(events.name, 'page_view'))),
    db
      .select({ name: events.name, v: count() })
      .from(events)
      .where(inDay(events.createdAt))
      .groupBy(events.name),
    db
      .select({ name: events.name, projectId: events.projectId, v: count() })
      .from(events)
      .where(and(inDay(events.createdAt), sql`${events.projectId} is not null`))
      .groupBy(events.name, events.projectId),
    db
      .select({
        step: sql<string>`json_extract(${events.props}, '$.step')`,
        v: countDistinct(events.sessionId),
      })
      .from(events)
      .where(and(inDay(events.createdAt), eq(events.name, 'diag_step')))
      .groupBy(sql`json_extract(${events.props}, '$.step')`),
    db
      .select({ type: leads.type, v: count() })
      .from(leads)
      .where(inDay(leads.createdAt))
      .groupBy(leads.type),
    db
      .select({ source: sql<string>`coalesce(${leads.utmSource}, 'directo')`, v: count() })
      .from(leads)
      .where(inDay(leads.createdAt))
      .groupBy(sql`coalesce(${leads.utmSource}, 'directo')`),
  ]);

  const rows: (typeof kpiDaily.$inferInsert)[] = [
    { date, metric: 'sessions', dimension: '', value: sessions[0]?.v ?? 0 },
  ];
  for (const e of byEvent)
    rows.push({ date, metric: `event:${e.name}`, dimension: '', value: e.v });
  for (const e of byProject)
    rows.push({ date, metric: `event:${e.name}`, dimension: e.projectId ?? '', value: e.v });
  for (const s of diagSteps)
    rows.push({ date, metric: 'diag_step', dimension: String(s.step ?? ''), value: s.v });
  for (const l of leadsByType) rows.push({ date, metric: 'leads', dimension: l.type, value: l.v });
  for (const l of leadsBySource)
    rows.push({ date, metric: 'leads_source', dimension: l.source, value: l.v });

  for (const r of rows) {
    await db
      .insert(kpiDaily)
      .values(r)
      .onConflictDoUpdate({
        target: [kpiDaily.date, kpiDaily.metric, kpiDaily.dimension],
        set: { value: r.value },
      });
  }
  return rows.length;
}
