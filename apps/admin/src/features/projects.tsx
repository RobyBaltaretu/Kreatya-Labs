import { contentSnapshot as seed } from '@kreatya/db/seed';
import {
  COMPANY_SIZE_LABELS,
  COMPANY_SIZES,
  DEMO_TYPES,
  type ProjectInput,
  projectInputSchema,
} from '@kreatya/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CharCount,
  Empty,
  Field,
  Input,
  Loading,
  Select,
  Textarea,
} from '../components/ui';
import { api, fmt, WEB } from '../lib/api';
import type { ProjectFull, ProjectRow } from '../lib/types';

const STATUS: Record<string, { label: string; v: 'good' | 'neutral' | 'info' }> = {
  published: { label: 'Publicado', v: 'good' },
  draft: { label: 'Borrador', v: 'neutral' },
  scheduled: { label: 'Programado', v: 'info' },
};
const DEMO_LABEL: Record<string, string> = {
  none: 'Sin demo',
  tour: 'Recorrido guiado',
  sandbox: 'Sandbox',
  on_request: 'Bajo solicitud',
};

export function ProjectList() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api<ProjectRow[]>('/projects'),
  });
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Proyectos</h1>
          <p className="text-sm text-muted">Portfolio de casos de éxito</p>
        </div>
        <Link
          to="/proyectos/$id"
          params={{ id: 'nuevo' }}
          className="inline-flex min-h-9 items-center rounded-md bg-signal px-3 text-sm font-semibold text-ink"
        >
          Nuevo proyecto
        </Link>
      </div>
      <Card className="overflow-x-auto">
        {isLoading ? (
          <Loading />
        ) : !data?.length ? (
          <Empty title="Sin proyectos" text="Crea el primer caso de éxito." />
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium">Proyecto</th>
                <th className="px-2 font-medium">Estado</th>
                <th className="px-2 font-medium">Demo</th>
                <th className="px-4 text-right font-medium">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-t border-line hover:bg-bg">
                  <td className="px-4 py-2.5">
                    <Link
                      to="/proyectos/$id"
                      params={{ id: p.id }}
                      className="font-medium hover:text-diagram"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted">
                      {p.confidential ? 'NDA · nombre oculto' : p.clientName} · /proyectos/{p.slug}
                    </p>
                  </td>
                  <td className="px-2">
                    <Badge variant={STATUS[p.status]!.v}>{STATUS[p.status]!.label}</Badge>
                    {p.featured && (
                      <Badge className="ml-1" variant="info">
                        Destacado
                      </Badge>
                    )}
                  </td>
                  <td className="px-2 text-muted">{DEMO_LABEL[p.demoType]}</td>
                  <td className="px-4 text-right tabular-nums text-muted">
                    {fmt.date(p.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

const empty: ProjectInput = {
  slug: '',
  title: '',
  clientName: '',
  confidential: false,
  companySize: 'pequena',
  durationWeeks: 6,
  summary: '',
  challenge: '',
  solution: '',
  aiRole: null,
  processBefore: [],
  processAfter: [],
  metrics: [],
  mainVideo: null,
  cardVideo: null,
  cover: '',
  gallery: [],
  demoType: 'none',
  demoUrl: null,
  demoTour: [],
  testimonialId: null,
  featured: false,
  sectors: [],
  solutions: [],
  technologies: [],
  related: [],
  seo: {},
  status: 'draft',
  publishAt: null,
};

export function ProjectEditor({ id }: { id: string }) {
  const isNew = id === 'nuevo';
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api<ProjectFull>(`/projects/${id}`),
    enabled: !isNew,
  });
  const [f, setF] = useState<ProjectInput>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState('');
  useEffect(() => {
    if (data) {
      const { id: _i, updatedAt: _u, ...rest } = data;
      setF(rest);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (body: ProjectInput) =>
      api<{ id: string }>(isNew ? '/projects' : `/projects/${id}`, {
        method: isNew ? 'POST' : 'PUT',
        body,
      }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', r.id] });
      setSaved(
        `Guardado ${new Date().toLocaleTimeString('es-ES')}. Pulsa «Publicar web» para regenerar la web.`,
      );
      if (isNew) navigate({ to: '/proyectos/$id', params: { id: r.id } });
    },
  });
  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) => {
    setF((x) => ({ ...x, [k]: v }));
    setSaved('');
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = projectInputSchema.safeParse(f);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path.join('.'), i.message])));
      return;
    }
    setErrors({});
    save.mutate(r.data);
  };
  const multi = (
    k: 'sectors' | 'solutions' | 'technologies',
    options: { slug: string; name: string }[],
  ) => (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1 text-sm font-medium">
        {{ sectors: 'Sectores', solutions: 'Soluciones', technologies: 'Tecnologías' }[k]}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = f[k].includes(o.slug);
          return (
            <button
              key={o.slug}
              type="button"
              aria-pressed={on}
              onClick={() => set(k, on ? f[k].filter((x) => x !== o.slug) : [...f[k], o.slug])}
              className={`rounded-full border px-2.5 py-1 text-xs ${on ? 'border-blueprint bg-blueprint/15 font-semibold' : 'border-line text-muted'}`}
            >
              {o.name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
  if (!isNew && !data) return <Loading />;
  const title = f.seo.title ?? '';
  const desc = f.seo.description ?? '';

  return (
    <form className="grid gap-5" onSubmit={submit} noValidate>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/proyectos" className="text-sm text-muted hover:text-fg">
            ← Proyectos
          </Link>
          <h1 className="font-display text-2xl font-semibold">
            {isNew ? 'Nuevo proyecto' : f.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="Estado de publicación"
            className="w-auto"
            value={f.status}
            onChange={(e) => set('status', e.target.value as ProjectInput['status'])}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="scheduled">Programado</option>
          </Select>
          {f.status === 'scheduled' && (
            <Input
              aria-label="Fecha de publicación"
              type="datetime-local"
              className="w-auto"
              value={f.publishAt?.slice(0, 16) ?? ''}
              onChange={(e) =>
                set('publishAt', e.target.value ? new Date(e.target.value).toISOString() : null)
              }
            />
          )}
          {!isNew && f.status === 'published' && (
            <a
              className="text-sm text-diagram underline"
              href={`${WEB}/proyectos/${f.slug}`}
              target="_blank"
              rel="noopener"
            >
              Ver en la web
            </a>
          )}
          <Button type="submit" variant="primary" disabled={save.isPending}>
            {save.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>
      {saved && (
        <p
          role="status"
          className="rounded-md border border-positive/40 bg-success/10 px-3 py-2 text-sm"
        >
          {saved}
        </p>
      )}
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="rounded-md border border-signal px-3 py-2 text-sm">
          Revisa {Object.keys(errors).length} campo(s) marcados.
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="grid content-start gap-5">
          <Card>
            <CardHeader title="Cabecera" />
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Título" htmlFor="p-title" error={errors.title}>
                  <Input
                    id="p-title"
                    value={f.title}
                    onChange={(e) => set('title', e.target.value)}
                  />
                </Field>
              </div>
              <Field
                label="Slug (URL)"
                htmlFor="p-slug"
                error={errors.slug}
                hint={`/proyectos/${f.slug || '…'}`}
              >
                <Input id="p-slug" value={f.slug} onChange={(e) => set('slug', e.target.value)} />
              </Field>
              <Field label="Cliente" htmlFor="p-client">
                <Input
                  id="p-client"
                  value={f.clientName ?? ''}
                  onChange={(e) => set('clientName', e.target.value || null)}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm" htmlFor="p-nda">
                <input
                  id="p-nda"
                  type="checkbox"
                  checked={f.confidential}
                  onChange={(e) => set('confidential', e.target.checked)}
                />{' '}
                Proyecto bajo NDA (oculta nombre y logos)
              </label>
              <label className="flex items-center gap-2 text-sm" htmlFor="p-feat">
                <input
                  id="p-feat"
                  type="checkbox"
                  checked={f.featured}
                  onChange={(e) => set('featured', e.target.checked)}
                />{' '}
                Destacado en la home
              </label>
              <Field label="Tamaño de empresa" htmlFor="p-size">
                <Select
                  id="p-size"
                  value={f.companySize}
                  onChange={(e) =>
                    set('companySize', e.target.value as ProjectInput['companySize'])
                  }
                >
                  {COMPANY_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {COMPANY_SIZE_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Plazo (semanas)" htmlFor="p-weeks">
                <Input
                  id="p-weeks"
                  type="number"
                  min={1}
                  value={f.durationWeeks}
                  onChange={(e) => set('durationWeeks', Number(e.target.value))}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label="Resumen"
                  htmlFor="p-summary"
                  hint={<CharCount value={f.summary} max={300} />}
                >
                  <Textarea
                    id="p-summary"
                    rows={2}
                    value={f.summary}
                    onChange={(e) => set('summary', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Contenido de la ficha" hint="Reto, solución y papel de la IA" />
            <div className="grid gap-4 p-4">
              <Field label="El reto" htmlFor="p-challenge">
                <Textarea
                  id="p-challenge"
                  rows={3}
                  value={f.challenge}
                  onChange={(e) => set('challenge', e.target.value)}
                />
              </Field>
              <Field label="La solución" htmlFor="p-solution">
                <Textarea
                  id="p-solution"
                  rows={3}
                  value={f.solution}
                  onChange={(e) => set('solution', e.target.value)}
                />
              </Field>
              <Field label="Papel de la IA (opcional)" htmlFor="p-ai">
                <Textarea
                  id="p-ai"
                  rows={2}
                  value={f.aiRole ?? ''}
                  onChange={(e) => set('aiRole', e.target.value || null)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Proceso antes (un paso por línea)" htmlFor="p-before">
                  <Textarea
                    id="p-before"
                    rows={4}
                    value={f.processBefore.map((s) => s.label).join('\n')}
                    onChange={(e) =>
                      set(
                        'processBefore',
                        e.target.value
                          .split('\n')
                          .filter(Boolean)
                          .map((label) => ({ label })),
                      )
                    }
                  />
                </Field>
                <Field label="Proceso después" htmlFor="p-after">
                  <Textarea
                    id="p-after"
                    rows={4}
                    value={f.processAfter.map((s) => s.label).join('\n')}
                    onChange={(e) =>
                      set(
                        'processAfter',
                        e.target.value
                          .split('\n')
                          .filter(Boolean)
                          .map((label) => ({ label })),
                      )
                    }
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Métricas"
              hint="Máximo 4. La primera es la métrica destacada de la tarjeta."
              action={
                f.metrics.length < 4 && (
                  <Button
                    onClick={() =>
                      set('metrics', [...f.metrics, { value: 0, unit: '%', description: '' }])
                    }
                  >
                    Añadir
                  </Button>
                )
              }
            />
            <div className="grid gap-2 p-4">
              {f.metrics.map((m, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: filas editables sin id propio; el orden solo cambia al borrar
                  key={i}
                  className="grid grid-cols-[4rem_6rem_5rem_1fr_auto] items-center gap-2"
                >
                  <Input
                    aria-label="Prefijo"
                    placeholder="−/+"
                    value={m.prefix ?? ''}
                    onChange={(e) =>
                      set(
                        'metrics',
                        f.metrics.map((x, j) =>
                          j === i ? { ...x, prefix: e.target.value || undefined } : x,
                        ),
                      )
                    }
                  />
                  <Input
                    aria-label="Valor"
                    type="number"
                    value={m.value}
                    onChange={(e) =>
                      set(
                        'metrics',
                        f.metrics.map((x, j) =>
                          j === i ? { ...x, value: Number(e.target.value) } : x,
                        ),
                      )
                    }
                  />
                  <Input
                    aria-label="Unidad"
                    value={m.unit}
                    onChange={(e) =>
                      set(
                        'metrics',
                        f.metrics.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)),
                      )
                    }
                  />
                  <Input
                    aria-label="Descripción"
                    value={m.description}
                    onChange={(e) =>
                      set(
                        'metrics',
                        f.metrics.map((x, j) =>
                          j === i ? { ...x, description: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    aria-label="Quitar métrica"
                    onClick={() =>
                      set(
                        'metrics',
                        f.metrics.filter((_, j) => j !== i),
                      )
                    }
                  >
                    ✕
                  </Button>
                </div>
              ))}
              {!f.metrics.length && <p className="text-sm text-muted">Sin métricas todavía.</p>}
            </div>
          </Card>

          <Card>
            <CardHeader title="Galería" hint="Texto alternativo obligatorio" />
            <div className="grid gap-2 p-4">
              {f.gallery.map((g, i) => (
                <div key={g.src} className="grid grid-cols-[4rem_1fr_7rem] items-center gap-2">
                  <img
                    src={g.src.startsWith('/') ? `${WEB}${g.src}` : g.src}
                    alt=""
                    className="h-12 w-16 rounded border border-line object-cover"
                  />
                  <Input
                    aria-label="Texto alternativo"
                    value={g.alt}
                    onChange={(e) =>
                      set(
                        'gallery',
                        f.gallery.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)),
                      )
                    }
                  />
                  <Select
                    aria-label="Dispositivo"
                    value={g.device}
                    onChange={(e) =>
                      set(
                        'gallery',
                        f.gallery.map((x, j) =>
                          j === i ? { ...x, device: e.target.value as typeof g.device } : x,
                        ),
                      )
                    }
                  >
                    <option value="desktop">Escritorio</option>
                    <option value="tablet">Tablet</option>
                    <option value="mobile">Móvil</option>
                  </Select>
                </div>
              ))}
              <p className="text-xs text-muted">
                La subida a R2 con recorte y conversión a AVIF/WebP se hace desde la biblioteca de
                medios (fase 1, siguiente iteración).
              </p>
            </div>
          </Card>
        </div>

        <div className="grid content-start gap-5">
          <Card>
            <CardHeader title="Clasificación" />
            <div className="grid gap-4 p-4">
              {multi('sectors', seed.sectors)}
              {multi('solutions', seed.solutions)}
              {multi('technologies', seed.technologies)}
            </div>
          </Card>
          <Card>
            <CardHeader title="Demo" />
            <div className="grid gap-3 p-4">
              <Field label="Tipo de vista previa" htmlFor="p-demo">
                <Select
                  id="p-demo"
                  value={f.demoType}
                  onChange={(e) => set('demoType', e.target.value as ProjectInput['demoType'])}
                >
                  {DEMO_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {DEMO_LABEL[d]}
                    </option>
                  ))}
                </Select>
              </Field>
              {f.demoType === 'sandbox' && (
                <Field
                  label="URL del sandbox"
                  htmlFor="p-demourl"
                  hint="Subdominio demo.kreatya.es"
                  error={errors.demoUrl}
                >
                  <Input
                    id="p-demourl"
                    value={f.demoUrl ?? ''}
                    onChange={(e) => set('demoUrl', e.target.value || null)}
                  />
                </Field>
              )}
              {f.demoType === 'tour' && (
                <p className="text-sm text-muted">{f.demoTour.length} pasos en el recorrido.</p>
              )}
            </div>
          </Card>
          <Card>
            <CardHeader title="SEO" />
            <div className="grid gap-4 p-4">
              <Field
                label="Title"
                htmlFor="p-seo-title"
                hint={<CharCount value={title} max={60} />}
                error={errors['seo.title']}
              >
                <Input
                  id="p-seo-title"
                  value={title}
                  onChange={(e) => set('seo', { ...f.seo, title: e.target.value || undefined })}
                />
              </Field>
              <Field
                label="Meta description"
                htmlFor="p-seo-desc"
                hint={<CharCount value={desc} max={155} />}
                error={errors['seo.description']}
              >
                <Textarea
                  id="p-seo-desc"
                  rows={3}
                  value={desc}
                  onChange={(e) =>
                    set('seo', { ...f.seo, description: e.target.value || undefined })
                  }
                />
              </Field>
              <label className="flex items-center gap-2 text-sm" htmlFor="p-noindex">
                <input
                  id="p-noindex"
                  type="checkbox"
                  checked={!!f.seo.noindex}
                  onChange={(e) => set('seo', { ...f.seo, noindex: e.target.checked || undefined })}
                />{' '}
                noindex
              </label>
              <section
                className="rounded-md border border-line bg-bg p-3"
                aria-label="Vista previa en Google"
              >
                <p className="text-xs text-muted">kreatya.es › proyectos › {f.slug}</p>
                <p className="truncate text-[#1a0dab] dark:text-[#8ab4f8]">
                  {title || f.title || 'Título de la página'}
                </p>
                <p className="line-clamp-2 text-xs text-muted">
                  {desc || f.summary || 'Meta description…'}
                </p>
              </section>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
