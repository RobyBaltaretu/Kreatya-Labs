import { useEffect, useMemo, useState } from 'react';
import { track } from '../lib/track';

interface Option {
  value: string;
  label: string;
}
interface Props {
  sectors: Option[];
  kinds: Option[];
  technologies: Option[];
  sizes: Option[];
  suggestions: { href: string; title: string }[];
}

type Filters = { sector: string; tipo: string; tec: string; size: string; q: string };
const KEYS = ['sector', 'tipo', 'tec', 'size', 'q'] as const;

const readUrl = (): Filters => {
  const p = new URLSearchParams(location.search);
  return {
    sector: p.get('sector') ?? '',
    tipo: p.get('tipo') ?? '',
    tec: p.get('tec') ?? '',
    size: p.get('size') ?? '',
    q: p.get('q') ?? '',
  };
};

/**
 * Mejora progresiva del portfolio (HU-01): el listado completo viene en el HTML;
 * esta isla oculta/muestra tarjetas y refleja los filtros en la URL.
 */
export default function ProjectFilters({
  sectors,
  kinds,
  technologies,
  sizes,
  suggestions,
}: Props) {
  const [f, setF] = useState<Filters>({ sector: '', tipo: '', tec: '', size: '', q: '' });
  const [visible, setVisible] = useState<number | null>(null);

  useEffect(() => {
    setF(readUrl());
    const onPop = () => setF(readUrl());
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const cards = [...document.querySelectorAll<HTMLElement>('[data-project]')];
    const q = f.q.trim().toLowerCase();
    let shown = 0;
    for (const card of cards) {
      const has = (attr: string, v: string) =>
        !v || (card.dataset[attr] ?? '').split(' ').includes(v);
      const ok =
        has('sector', f.sector) &&
        has('tipo', f.tipo) &&
        has('tec', f.tec) &&
        has('size', f.size) &&
        (!q || (card.dataset.text ?? '').includes(q));
      card.hidden = !ok;
      if (ok) shown++;
    }
    setVisible(shown);
  }, [f]);

  const update = (key: keyof Filters, value: string) => {
    const next = { ...f, [key]: value };
    setF(next);
    const params = new URLSearchParams();
    for (const k of KEYS) if (next[k]) params.set(k, next[k]);
    const qs = params.toString();
    history.pushState(null, '', qs ? `?${qs}` : location.pathname);
    if (key !== 'q') track('cta_click', { cta: `filtro:${key}:${value || 'todos'}` });
  };

  const active = useMemo(() => KEYS.some((k) => f[k]), [f]);
  const select = (key: keyof Filters, label: string, options: Option[]) => (
    <label className="grid gap-1.5 text-sm" htmlFor={`f-${key}`}>
      <span className="etiqueta">{label}</span>
      <select
        id={`f-${key}`}
        className="field"
        value={f[key]}
        onChange={(e) => update(key, e.target.value)}
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <label className="grid gap-1.5 text-sm" htmlFor="f-q">
          <span className="etiqueta">Buscar</span>
          <input
            id="f-q"
            type="search"
            className="field"
            placeholder="Albaranes, clínica, stock…"
            value={f.q}
            onChange={(e) => update('q', e.target.value)}
          />
        </label>
        {select('sector', 'Sector', sectors)}
        {select('tipo', 'Tipo de solución', kinds)}
        {select('tec', 'Tecnología', technologies)}
        {select('size', 'Tamaño de empresa', sizes)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm" aria-live="polite">
        <p className="text-muted tabular-nums">
          {visible === null ? '' : `${visible} ${visible === 1 ? 'proyecto' : 'proyectos'}`}
        </p>
        {active && (
          <button
            type="button"
            className="underline underline-offset-4 hover:text-diagram"
            onClick={() => {
              setF({ sector: '', tipo: '', tec: '', size: '', q: '' });
              history.pushState(null, '', location.pathname);
            }}
          >
            Quitar filtros
          </button>
        )}
      </div>
      {visible === 0 && (
        <div className="border border-dashed border-line p-8">
          <p className="font-display text-xl font-semibold">
            Aún no tenemos un caso publicado con esa combinación.
          </p>
          <p className="mt-2 text-muted">
            Muchos proyectos están bajo NDA. Estos casos se parecen bastante:
          </p>
          <ul className="mt-4 grid gap-2">
            {suggestions.map((s) => (
              <li key={s.href}>
                <a className="text-diagram underline underline-offset-4" href={s.href}>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={`/diagnostico${f.sector ? `?sector=${f.sector}` : ''}${f.tipo ? `${f.sector ? '&' : '?'}tipo=${f.tipo}` : ''}`}
            className="btn btn-primary mt-6"
          >
            Cuéntanos tu caso
          </a>
        </div>
      )}
    </div>
  );
}
