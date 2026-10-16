import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CharCount,
  Input,
  Loading,
  Select,
} from '../components/ui';
import { api } from '../lib/api';
import type { Redirect, SeoRow } from '../lib/types';

const ENTITY: Record<string, string> = {
  projects: 'Proyecto',
  sectors: 'Sector',
  solutions: 'Solución',
  posts: 'Artículo',
};

export function Seo() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['seo'],
    queryFn: () => api<SeoRow[]>('/seo/audit'),
  });
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [edit, setEdit] = useState<SeoRow | null>(null);
  const save = useMutation({
    mutationFn: (r: SeoRow) =>
      api('/seo/entry', { method: 'PUT', body: { entity: r.entity, id: r.id, seo: r.seo } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seo'] });
      setEdit(null);
    },
  });
  const rows = (data ?? []).filter((r) => !onlyIssues || r.warnings.length);
  const issues = (data ?? []).filter((r) => r.warnings.length).length;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">SEO</h1>
          <p className="text-sm text-muted">Auditoría de páginas, metadatos y redirecciones</p>
        </div>
        <label className="flex items-center gap-2 text-sm" htmlFor="only-issues">
          <input
            id="only-issues"
            type="checkbox"
            checked={onlyIssues}
            onChange={(e) => setOnlyIssues(e.target.checked)}
          />{' '}
          Solo páginas con avisos ({issues})
        </label>
      </div>
      <Card className="overflow-x-auto">
        {isLoading ? (
          <Loading />
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium">Página</th>
                <th className="px-2 font-medium">Title</th>
                <th className="px-2 font-medium">Avisos</th>
                <th className="px-4" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line align-top">
                  <td className="px-4 py-2.5">
                    <span className="block font-medium">{r.title}</span>
                    <span className="text-xs text-muted">
                      {ENTITY[r.entity]} · {r.path}
                    </span>
                  </td>
                  <td className="max-w-xs px-2 py-2.5">
                    <span className="block truncate">{r.seo.title ?? '—'}</span>
                    <span className="text-xs">
                      <CharCount value={r.seo.title ?? ''} max={60} />
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    {r.warnings.length ? (
                      <div className="flex flex-wrap gap-1">
                        {r.warnings.map((w) => (
                          <Badge key={w} variant="warn">
                            ! {w}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="good">✓ Correcto</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button onClick={() => setEdit(structuredClone(r))}>Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {edit && (
        <Card className="grid gap-3 p-4">
          <h2 className="font-display font-semibold">{edit.title}</h2>
          <label className="grid gap-1 text-sm" htmlFor="seo-t">
            Title <CharCount value={edit.seo.title ?? ''} max={60} />
            <Input
              id="seo-t"
              value={edit.seo.title ?? ''}
              onChange={(e) => setEdit({ ...edit, seo: { ...edit.seo, title: e.target.value } })}
            />
          </label>
          <label className="grid gap-1 text-sm" htmlFor="seo-d">
            Meta description <CharCount value={edit.seo.description ?? ''} max={155} />
            <Input
              id="seo-d"
              value={edit.seo.description ?? ''}
              onChange={(e) =>
                setEdit({ ...edit, seo: { ...edit.seo, description: e.target.value } })
              }
            />
          </label>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => save.mutate(edit)} disabled={save.isPending}>
              Guardar
            </Button>
            <Button onClick={() => setEdit(null)}>Cancelar</Button>
          </div>
        </Card>
      )}
      <Redirects />
    </div>
  );
}

function Redirects() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['redirects'],
    queryFn: () => api<Redirect[]>('/seo/redirects'),
  });
  const [r, setR] = useState({ fromPath: '', toPath: '', code: 301 as 301 | 410 });
  const add = useMutation({
    mutationFn: () => api('/seo/redirects', { method: 'POST', body: { ...r, active: true } }),
    onSuccess: () => {
      setR({ fromPath: '', toPath: '', code: 301 });
      qc.invalidateQueries({ queryKey: ['redirects'] });
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => api(`/seo/redirects/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['redirects'] }),
  });
  return (
    <Card>
      <CardHeader
        title="Redirecciones"
        hint="Se aplican en el siguiente despliegue (_redirects de Cloudflare Pages)"
      />
      <ul className="divide-y divide-line">
        {data?.map((x) => (
          <li
            key={x.id}
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm"
          >
            <span className="font-mono">
              {x.fromPath} → {x.code === 410 ? '410 Gone' : x.toPath} <Badge>{x.code}</Badge>
            </span>
            <Button variant="danger" onClick={() => del.mutate(x.id)}>
              Eliminar
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="grid gap-2 border-t border-line p-4 sm:grid-cols-[1fr_1fr_6rem_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (r.fromPath.startsWith('/')) add.mutate();
        }}
      >
        <Input
          aria-label="Ruta de origen"
          placeholder="/ruta-antigua"
          value={r.fromPath}
          onChange={(e) => setR({ ...r, fromPath: e.target.value })}
          required
        />
        <Input
          aria-label="Ruta de destino"
          placeholder="/ruta-nueva"
          value={r.toPath}
          onChange={(e) => setR({ ...r, toPath: e.target.value })}
          disabled={r.code === 410}
        />
        <Select
          aria-label="Código"
          value={r.code}
          onChange={(e) => setR({ ...r, code: Number(e.target.value) as 301 | 410 })}
        >
          <option value={301}>301</option>
          <option value={410}>410</option>
        </Select>
        <Button type="submit" variant="primary">
          Añadir
        </Button>
      </form>
    </Card>
  );
}
