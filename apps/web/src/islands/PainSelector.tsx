import { Icon } from '@kreatya/ui';
import { useState } from 'react';

export interface PainOption {
  label: string;
  detail: string;
  project: {
    href: string;
    title: string;
    client: string;
    metric: string;
    metricLabel: string;
    cover: string;
  };
  solution: { href: string; name: string };
}

/**
 * «¿Qué te frena hoy?»: el visitante elige su dolor y ve el caso que lo resolvió.
 * Sin JS se muestra el primero y la lista funciona como enlaces a cada caso.
 */
export default function PainSelector({ options }: { options: PainOption[] }) {
  const [i, setI] = useState(0);
  const o = options[i]!;
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
      <div
        role="radiogroup"
        aria-label="Qué te frena hoy"
        className="grid content-start border-t border-line"
      >
        {options.map((opt, k) => (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={k === i}
            onClick={() => setI(k)}
            className="dolor group flex items-center justify-between gap-4 border-b border-line py-4 text-left"
          >
            <span className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              {opt.label}
            </span>
            <span className="dolor-marca grid h-8 w-8 shrink-0 place-items-center rounded-full">
              <Icon name="arrow-right" size={18} />
            </span>
          </button>
        ))}
      </div>
      <div
        key={i}
        className="dolor-panel grid content-start gap-5 rounded-xl sobre-tinta bg-tinta p-5 sm:p-7"
        aria-live="polite"
      >
        <p className="text-lead" style={{ color: '#c9d3e4' }}>
          {o.detail}
        </p>
        <a
          href={o.project.href}
          className="group grid gap-4 rounded-lg bg-tinta-2 p-4 sm:grid-cols-[10rem_1fr] sm:items-center"
        >
          <img
            src={o.project.cover}
            alt=""
            width={320}
            height={200}
            loading="lazy"
            className="aspect-[16/10] w-full rounded-md object-cover"
          />
          <span className="grid gap-1">
            <span className="text-sm" style={{ color: '#c9d3e4' }}>
              {o.project.client}
            </span>
            <span className="font-display text-lg font-semibold leading-snug">
              {o.project.title}
            </span>
            <span className="mt-1">
              <strong className="font-display text-2xl font-semibold" style={{ color: '#5fd39b' }}>
                {o.project.metric}
              </strong>{' '}
              <span className="text-sm" style={{ color: '#c9d3e4' }}>
                {o.project.metricLabel}
              </span>
            </span>
          </span>
        </a>
        <div className="flex flex-wrap gap-3">
          <a href={o.project.href} className="btn btn-primary">
            Ver el caso
            <Icon name="arrow-right" />
          </a>
          <a href={o.solution.href} className="btn btn-secondary">
            {o.solution.name}
          </a>
        </div>
      </div>
    </div>
  );
}
