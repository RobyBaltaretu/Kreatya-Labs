import type { DashboardData } from '@kreatya/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { BarChart, HBars } from '../components/BarChart';
import { Badge, Card, CardHeader, Loading, Select } from '../components/ui';
import { api, fmt } from '../lib/api';

const RANGES = { '7': 'Últimos 7 días', '30': 'Últimos 30 días', '90': 'Últimos 90 días' } as const;
const STATUS_LABEL: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  propuesta: 'Propuesta',
  ganado: 'Ganado',
  perdido: 'Perdido',
};
const TODAY = '2026-10-16';

export function Dashboard() {
  const [range, setRange] = useState<keyof typeof RANGES>('30');
  const from = new Date(Date.parse(TODAY) - (Number(range) - 1) * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', range],
    queryFn: () => api<DashboardData>(`/dashboard?from=${from}&to=${TODAY}`),
  });

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Resumen</h1>
          <p className="text-sm text-muted">Negocio digital · datos agregados cada noche</p>
        </div>
        <label className="flex items-center gap-2 text-sm" htmlFor="range">
          Periodo
          <Select
            id="range"
            className="w-auto"
            value={range}
            onChange={(e) => setRange(e.target.value as keyof typeof RANGES)}
          >
            {Object.entries(RANGES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </label>
      </div>
      {isLoading || !data ? <Loading /> : <DashboardBody d={data} />}
    </div>
  );
}

function Delta({ now, prev }: { now: number; prev: number }) {
  if (!prev) return null;
  const d = (now - prev) / prev;
  return (
    <Badge variant={d >= 0 ? 'good' : 'warn'}>
      {d >= 0 ? '▲' : '▼'} {fmt.pct(Math.abs(d))} vs periodo anterior
    </Badge>
  );
}

function DashboardBody({ d }: { d: DashboardData }) {
  const k = d.kpis;
  const target = 0.03;
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="grid gap-1 p-4">
          <p className="text-xs font-semibold text-muted">Leads cualificados</p>
          <p className="font-display text-3xl font-semibold tabular-nums">
            {fmt.n(k.qualifiedLeads)}
          </p>
          <Delta now={k.qualifiedLeads} prev={k.qualifiedLeadsPrev} />
        </Card>
        <Card className="grid gap-1 p-4">
          <p className="text-xs font-semibold text-muted">Conversión</p>
          <p className="font-display text-3xl font-semibold tabular-nums">
            {fmt.pct(k.conversionRate)}
          </p>
          <Badge variant={k.conversionRate >= target ? 'good' : 'warn'}>
            {k.conversionRate >= target ? '✓ Sobre' : '! Bajo'} objetivo 3 %
          </Badge>
        </Card>
        <Card className="grid gap-1 p-4">
          <p className="text-xs font-semibold text-muted">Coste por lead</p>
          <p className="font-display text-3xl font-semibold tabular-nums">
            {k.costPerLead === null ? '—' : fmt.eur(k.costPerLead)}
          </p>
          <p className="text-xs text-muted">{fmt.n(k.sessions)} sesiones</p>
        </Card>
        <Card className="grid gap-1 p-4">
          <p className="text-xs font-semibold text-muted">Prueban una demo</p>
          <p className="font-display text-3xl font-semibold tabular-nums">
            {fmt.pct(k.demoTryRate)}
          </p>
          <Badge variant={k.demoTryRate >= 0.15 ? 'good' : 'warn'}>Objetivo ≥ 15 % de fichas</Badge>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader title="Leads cualificados por día" hint="Diagnósticos + demos solicitadas" />
          <div className="p-4">
            <BarChart
              title="Leads cualificados por día"
              data={d.leadsByDay.map((x) => ({ label: fmt.date(x.date), value: x.value }))}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Embudo de diagnóstico" hint="Sesiones que alcanzan cada paso" />
          <div className="p-4">
            <HBars
              data={d.funnel.map((f, i) => ({
                label: `${f.step}. ${f.label}`,
                value: f.value,
                detail:
                  i > 0 && d.funnel[0]!.value
                    ? `(${fmt.pct(f.value / d.funnel[0]!.value)})`
                    : undefined,
              }))}
              format={fmt.n}
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Pipeline comercial" />
          <div className="p-4">
            <HBars
              data={d.pipeline.map((p) => ({
                label: STATUS_LABEL[p.status] ?? p.status,
                value: p.count,
                detail: p.value ? fmt.eur(p.value) : undefined,
              }))}
              format={fmt.n}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Proyectos más vistos" />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium">Ficha</th>
                <th className="px-2 py-2 text-right font-medium">Vistas</th>
                <th className="px-4 py-2 text-right font-medium">Demos</th>
              </tr>
            </thead>
            <tbody>
              {d.topProjects.map((p) => (
                <tr key={p.slug} className="border-t border-line">
                  <td className="max-w-0 truncate px-4 py-2">{p.title}</td>
                  <td className="px-2 text-right tabular-nums">{fmt.n(p.views)}</td>
                  <td className="px-4 text-right tabular-nums">{fmt.n(p.demoOpens)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <CardHeader title="Leads por fuente" hint="UTM source" />
          <div className="p-4">
            <HBars
              data={d.bySource.map((s) => ({ label: s.source, value: s.count }))}
              format={fmt.n}
            />
          </div>
        </Card>
      </div>
      <p className="text-xs text-muted">
        Uso de calculadoras: {fmt.n(k.calcRuns)} simulaciones · Consultas de IA:{' '}
        {fmt.n(k.aiQueries)} · SEO (Search Console) y Core Web Vitals se sincronizan en la fase 2.
      </p>
    </>
  );
}
