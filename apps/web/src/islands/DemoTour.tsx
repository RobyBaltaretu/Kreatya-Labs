import { Icon } from '@kreatya/ui';
import { useEffect, useState } from 'react';
import { track } from '../lib/track';

interface Step {
  image: string;
  title: string;
  text: string;
  hotspot: { x: number; y: number };
}
const DEVICES = [
  { key: 'desktop', label: 'Escritorio', width: '100%' },
  { key: 'tablet', label: 'Tablet', width: '820px' },
  { key: 'mobile', label: 'Móvil', width: '390px' },
] as const;

/** Recorrido interactivo guiado (nivel 1): capturas con hotspots y pasos, sin backend. */
export default function DemoTour({ steps, projectSlug }: { steps: Step[]; projectSlug: string }) {
  const [i, setI] = useState(0);
  const [device, setDevice] = useState<(typeof DEVICES)[number]['key']>('desktop');
  const step = steps[i]!;

  useEffect(() => {
    track('demo_open', { level: 'tour' }, projectSlug);
    const start = Date.now();
    return () =>
      track('demo_time', { seconds: Math.round((Date.now() - start) / 1000) }, projectSlug);
  }, [projectSlug]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Dispositivo" className="inline-flex border border-line">
          {DEVICES.map((d) => (
            <button
              key={d.key}
              type="button"
              aria-pressed={device === d.key}
              onClick={() => setDevice(d.key)}
              className={`px-4 py-2 text-sm ${device === d.key ? 'bg-ink text-paper' : 'hover:bg-raised'}`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="etiqueta tabular-nums">
          Paso {i + 1} / {steps.length}
        </p>
      </div>
      <div className="grid place-items-center border border-line p-3 sm:p-8">
        <div
          className="relative w-full overflow-hidden rounded-lg border-[6px] border-ink bg-bg shadow-xl transition-[max-width] duration-300"
          style={{ maxWidth: DEVICES.find((d) => d.key === device)!.width }}
        >
          <img src={step.image} alt={`${step.title}: ${step.text}`} className="block w-full" />
          <button
            type="button"
            onClick={() => setI((i + 1) % steps.length)}
            className="absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-signal font-mono text-sm font-bold text-ink ring-8 ring-signal/30 motion-safe:animate-pulse"
            style={{ left: `${step.hotspot.x}%`, top: `${step.hotspot.y}%` }}
            aria-label={`Siguiente paso: ${steps[(i + 1) % steps.length]!.title}`}
          >
            {i + 1}
          </button>
        </div>
      </div>
      <div
        className="grid gap-3 border border-line bg-raised p-5 sm:grid-cols-[1fr_auto] sm:items-center"
        aria-live="polite"
      >
        <div>
          <p className="font-display text-lg font-semibold">{step.title}</p>
          <p className="text-muted">{step.text}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={i === 0}
            onClick={() => setI(i - 1)}
          >
            <Icon name="arrow-left" />
            Anterior
          </button>
          {i < steps.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setI(i + 1)}>
              Siguiente
              <Icon name="arrow-right" />
            </button>
          ) : (
            <a className="btn btn-primary" href={`/diagnostico?desde=${projectSlug}`}>
              Quiero algo parecido
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
