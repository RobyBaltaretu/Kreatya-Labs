import { USER_ROLES, type UserRole } from '@kreatya/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardHeader, Field, Input, Loading, Select } from '../components/ui';
import { api, fmt } from '../lib/api';
import type { Infra as InfraT, User } from '../lib/types';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  marketing: 'Marketing',
  comercial: 'Comercial',
  lectura: 'Lectura',
};

export function Settings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['site-config'],
    queryFn: () => api<Record<string, unknown>>('/site-config'),
  });
  const [cfg, setCfg] = useState<Record<string, unknown>>({});
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (data) setCfg(data);
  }, [data]);
  const save = useMutation({
    mutationFn: () => api('/site-config', { method: 'PUT', body: cfg }),
    onSuccess: () => {
      setOk(true);
      qc.invalidateQueries({ queryKey: ['site-config'] });
    },
  });
  if (!data) return <Loading />;
  const contact = (cfg.contact ?? {}) as { email?: string; phone?: string };
  const text = (k: string, label: string) => (
    <Field label={label} htmlFor={`cfg-${k}`}>
      <Input
        id={`cfg-${k}`}
        value={String(cfg[k] ?? '')}
        onChange={(e) => {
          setCfg({ ...cfg, [k]: e.target.value });
          setOk(false);
        }}
      />
    </Field>
  );
  return (
    <div className="grid gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted">Marca, contacto y textos globales (SiteConfig)</p>
      </div>
      <Card>
        <CardHeader title="Marca y contacto" />
        <form
          className="grid gap-4 p-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {text('name', 'Nombre comercial')}
          {text('legalName', 'Razón social')}
          <div className="sm:col-span-2">{text('claim', 'Claim')}</div>
          <div className="sm:col-span-2">
            {text('description', 'Descripción (meta por defecto)')}
          </div>
          <Field label="Email de contacto" htmlFor="cfg-email">
            <Input
              id="cfg-email"
              type="email"
              value={contact.email ?? ''}
              onChange={(e) => setCfg({ ...cfg, contact: { ...contact, email: e.target.value } })}
            />
          </Field>
          <Field label="Teléfono" htmlFor="cfg-phone">
            <Input
              id="cfg-phone"
              value={contact.phone ?? ''}
              onChange={(e) => setCfg({ ...cfg, contact: { ...contact, phone: e.target.value } })}
            />
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" variant="primary" disabled={save.isPending}>
              Guardar configuración
            </Button>
            {ok && (
              <span role="status" className="text-sm text-positive">
                ✓ Guardado
              </span>
            )}
          </div>
        </form>
      </Card>
      <Users />
    </div>
  );
}

function Users() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['users'], queryFn: () => api<User[]>('/users') });
  const [n, setN] = useState({ email: '', name: '', role: 'lectura' as UserRole });
  const add = useMutation({
    mutationFn: () => api('/users', { method: 'POST', body: { ...n, active: true } }),
    onSuccess: () => {
      setN({ email: '', name: '', role: 'lectura' });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
  const upd = useMutation({
    mutationFn: (u: User) =>
      api(`/users/${u.id}`, {
        method: 'PUT',
        body: { email: u.email, name: u.name, role: u.role, active: u.active },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
  return (
    <Card>
      <CardHeader
        title="Usuarios y roles"
        hint="El acceso se autentica con Cloudflare Access (Google Workspace o código por email)"
      />
      <ul className="divide-y divide-line">
        {data?.map((u) => (
          <li
            key={u.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm"
          >
            <span>
              <strong>{u.name}</strong> <span className="text-muted">{u.email}</span>
              {u.lastLoginAt && (
                <span className="block text-xs text-muted">
                  Último acceso {fmt.datetime(u.lastLoginAt)}
                </span>
              )}
            </span>
            <span className="flex items-center gap-2">
              <Select
                aria-label={`Rol de ${u.name}`}
                className="w-auto"
                value={u.role}
                onChange={(e) => upd.mutate({ ...u, role: e.target.value as UserRole })}
              >
                {USER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </Select>
              <Badge variant={u.active ? 'good' : 'neutral'}>
                {u.active ? 'Activo' : 'Inactivo'}
              </Badge>
            </span>
          </li>
        ))}
      </ul>
      <form
        className="grid gap-2 border-t border-line p-4 sm:grid-cols-[1fr_1fr_8rem_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <Input
          aria-label="Email"
          type="email"
          required
          placeholder="persona@kreatya.es"
          value={n.email}
          onChange={(e) => setN({ ...n, email: e.target.value })}
        />
        <Input
          aria-label="Nombre"
          required
          placeholder="Nombre"
          value={n.name}
          onChange={(e) => setN({ ...n, name: e.target.value })}
        />
        <Select
          aria-label="Rol"
          value={n.role}
          onChange={(e) => setN({ ...n, role: e.target.value as UserRole })}
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="primary">
          Dar acceso
        </Button>
      </form>
    </Card>
  );
}

export function Infra() {
  const { data } = useQuery({ queryKey: ['infra'], queryFn: () => api<InfraT>('/infra') });
  if (!data) return <Loading />;
  return (
    <div className="grid gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold">Infraestructura</h1>
        <p className="text-sm text-muted">
          Consumo de las cuotas gratuitas de Cloudflare (se reinician a las 00:00 UTC)
        </p>
      </div>
      <Card>
        <CardHeader
          title="Cuotas diarias"
          hint={`Alerta al ${fmt.pct(data.alertThreshold)} de cada cuota`}
        />
        <ul className="grid gap-4 p-4">
          {data.quotas.map((q) => {
            const ratio = q.used === null ? null : q.used / q.limit;
            const alert = ratio !== null && ratio >= data.alertThreshold;
            return (
              <li key={q.key} className="grid gap-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>{q.label}</span>
                  <span className="flex items-center gap-2 tabular-nums">
                    {q.used === null ? (
                      <span className="text-muted">Sin datos (Cloudflare GraphQL en fase 2)</span>
                    ) : (
                      `${fmt.n(q.used)} / ${fmt.n(q.limit)}`
                    )}
                    {alert && (
                      <Badge variant="warn">! Supera el {fmt.pct(data.alertThreshold)}</Badge>
                    )}
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded bg-line/60"
                  role="meter"
                  aria-label={q.label}
                  aria-valuemin={0}
                  aria-valuemax={q.limit}
                  aria-valuenow={q.used ?? 0}
                >
                  {ratio !== null && (
                    <div
                      className={`h-full rounded ${alert ? 'bg-signal' : 'bg-chart'}`}
                      style={{ width: `${Math.min(100, ratio * 100)}%` }}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
      <Card>
        <CardHeader title="Últimos despliegues" />
        <ul className="divide-y divide-line">
          {data.deploys.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm"
            >
              <span>{d.reason}</span>
              <span className="flex items-center gap-2 text-muted">
                {fmt.datetime(d.startedAt)}
                <Badge
                  variant={
                    d.status === 'success' ? 'good' : d.status === 'failed' ? 'warn' : 'info'
                  }
                >
                  {d.status === 'success'
                    ? '✓ Publicado'
                    : d.status === 'failed'
                      ? '! Fallido'
                      : 'En curso'}
                </Badge>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
