import { LEAD_STATUS, LEAD_TYPES, type LeadStatus } from '@kreatya/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Fragment, useState } from 'react';
import { Badge, Button, Card, Empty, Loading, Select, Textarea } from '../components/ui';
import { api, downloadLeadsCsv, fmt } from '../lib/api';
import type { Lead, LeadDetail } from '../lib/types';

const TYPE_LABEL: Record<string, string> = {
  diagnostico: 'Diagnóstico',
  demo: 'Demo',
  calc_ahorro: 'Calc. ahorro',
  calc_inversion: 'Calc. inversión',
  contacto: 'Contacto',
};
const STATUS_VARIANT: Record<LeadStatus, 'info' | 'neutral' | 'good' | 'warn'> = {
  nuevo: 'warn',
  contactado: 'info',
  propuesta: 'info',
  ganado: 'good',
  perdido: 'neutral',
};

export function Leads() {
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const qs = new URLSearchParams({ ...(status && { status }), ...(type && { type }) }).toString();
  const { data, isLoading } = useQuery({
    queryKey: ['leads', qs],
    queryFn: () => api<Lead[]>(`/leads?${qs}`),
  });

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Leads</h1>
          <p className="text-sm text-muted">Diagnósticos, solicitudes de demo y calculadoras</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="Estado"
            className="w-auto"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {LEAD_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Tipo"
            className="w-auto"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {LEAD_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
          <Button onClick={() => downloadLeadsCsv(qs)}>Exportar CSV</Button>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <Card className="overflow-x-auto">
          {isLoading ? (
            <Loading />
          ) : !data?.length ? (
            <Empty title="Sin leads" text="No hay leads con estos filtros." />
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="px-4 py-2 font-medium">Contacto</th>
                  <th className="px-2 font-medium">Tipo</th>
                  <th className="px-2 font-medium">Estado</th>
                  <th className="px-2 font-medium">Origen</th>
                  <th className="px-4 text-right font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.map((l) => (
                  <tr
                    key={l.id}
                    className={`cursor-pointer border-t border-line hover:bg-bg ${open === l.id ? 'bg-bg' : ''}`}
                    onClick={() => setOpen(l.id)}
                  >
                    <td className="px-4 py-2.5">
                      <button type="button" className="text-left" onClick={() => setOpen(l.id)}>
                        <span className="block font-medium">{l.name}</span>
                        <span className="text-xs text-muted">{l.company ?? l.email}</span>
                      </button>
                    </td>
                    <td className="px-2">{TYPE_LABEL[l.type]}</td>
                    <td className="px-2">
                      <Badge variant={STATUS_VARIANT[l.status]}>{l.status}</Badge>
                    </td>
                    <td className="px-2 text-xs text-muted">
                      {l.utmSource ?? 'directo'} · {l.sourcePath}
                    </td>
                    <td className="px-4 text-right tabular-nums text-muted">
                      {fmt.date(l.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        {open ? (
          <LeadPanel id={open} onClose={() => setOpen(null)} />
        ) : (
          <Card>
            <Empty
              title="Selecciona un lead"
              text="Verás sus respuestas, notas y podrás cambiar su estado."
            />
          </Card>
        )}
      </div>
    </div>
  );
}

function LeadPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: l } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => api<LeadDetail>(`/leads/${id}`),
  });
  const [note, setNote] = useState('');
  const update = useMutation({
    mutationFn: (patch: Partial<Lead>) => api(`/leads/${id}`, { method: 'PATCH', body: patch }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
  const addNote = useMutation({
    mutationFn: () => api(`/leads/${id}/notes`, { method: 'POST', body: { body: note } }),
    onSuccess: () => {
      setNote('');
      qc.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
  if (!l)
    return (
      <Card>
        <Loading />
      </Card>
    );
  return (
    <Card className="grid content-start gap-4 p-4 lg:sticky lg:top-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">{l.name}</h2>
          <p className="text-sm text-muted">
            {l.company} · {l.email}
            {l.phone && ` · ${l.phone}`}
          </p>
        </div>
        <Button variant="ghost" onClick={onClose} aria-label="Cerrar detalle">
          ✕
        </Button>
      </div>
      <label className="grid gap-1 text-sm" htmlFor="lead-status">
        Estado
        <Select
          id="lead-status"
          value={l.status}
          onChange={(e) => update.mutate({ status: e.target.value as LeadStatus })}
        >
          {LEAD_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </label>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-muted">Tipo</dt>
        <dd>{TYPE_LABEL[l.type]}</dd>
        <dt className="text-muted">Recibido</dt>
        <dd>{fmt.datetime(l.createdAt)}</dd>
        <dt className="text-muted">Página</dt>
        <dd className="break-all">{l.sourcePath ?? '—'}</dd>
        <dt className="text-muted">UTM</dt>
        <dd>
          {[l.utmSource, l.utmMedium, l.utmCampaign].filter(Boolean).join(' / ') || 'directo'}
        </dd>
        <dt className="text-muted">Valor est.</dt>
        <dd className="tabular-nums">{l.estimatedValue ? fmt.eur(l.estimatedValue) : '—'}</dd>
        {Object.entries(l.answers).map(([k, v]) => (
          <Fragment key={k}>
            <dt className="text-muted capitalize">{k}</dt>
            <dd>
              {Array.isArray(v)
                ? v.join(', ')
                : typeof v === 'object'
                  ? JSON.stringify(v)
                  : String(v)}
            </dd>
          </Fragment>
        ))}
      </dl>
      <div className="grid gap-2 border-t border-line pt-3">
        <h3 className="text-sm font-semibold">Notas</h3>
        <Textarea
          aria-label="Nueva nota"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Llamada hecha, interesado en módulo de almacén…"
        />
        <Button
          variant="primary"
          className="justify-self-start"
          disabled={!note.trim() || addNote.isPending}
          onClick={() => addNote.mutate()}
        >
          Añadir nota
        </Button>
        <ul className="grid gap-2">
          {l.notes.map((n) => (
            <li key={n.id} className="rounded-md bg-bg p-2 text-sm">
              <p>{n.body}</p>
              <p className="mt-1 text-xs text-muted">
                {n.author} · {fmt.datetime(n.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
