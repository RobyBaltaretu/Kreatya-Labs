import {
  calculateSavings,
  formatEuros,
  formatNumber,
  WORK_WEEKS_PER_YEAR,
} from '@kreatya/shared/calc';
import { useId, useState } from 'react';
import { submitLead } from '../lib/api';
import { track } from '../lib/track';

/** Calculadora de ahorro (HU-04). Fórmula visible y supuestos explicados. */
export default function SavingsCalculator({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [employees, setEmployees] = useState(12);
  const [hours, setHours] = useState(6);
  const [cost, setCost] = useState(24);
  const [rate, setRate] = useState(0.6);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sent, setSent] = useState<'idle' | 'sending' | 'ok' | string>('idle');
  const r = calculateSavings({
    employees,
    hoursPerWeek: hours,
    hourlyCost: cost,
    automationRate: rate,
  });
  const touched = () => track('calc_run', { employees, hours, cost });

  const slider = (
    key: string,
    label: string,
    value: number,
    set: (n: number) => void,
    min: number,
    max: number,
    step: number,
    suffix: string,
  ) => (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={`${id}-${key}`} className="text-sm font-medium">
          {label}
        </label>
        <output htmlFor={`${id}-${key}`} className="font-mono text-sm tabular-nums">
          {formatNumber(value)} {suffix}
        </output>
      </div>
      <input
        id={`${id}-${key}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        onPointerUp={touched}
        onKeyUp={touched}
        className="w-full accent-[var(--signal)]"
      />
    </div>
  );

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSent('sending');
    const res = await submitLead({
      type: 'calc_ahorro',
      name,
      email,
      consent: true,
      input: { employees, hoursPerWeek: hours, hourlyCost: cost, automationRate: rate },
    });
    setSent(res.ok ? 'ok' : res.message);
  };

  return (
    <div
      className={`grid gap-8 rounded-xl border border-line bg-raised p-5 sm:p-8 ${compact ? '' : 'lg:grid-cols-2'}`}
    >
      <div className="grid content-start gap-6">
        {slider(
          'emp',
          'Personas que hacen tareas manuales',
          employees,
          setEmployees,
          1,
          200,
          1,
          'personas',
        )}
        {slider(
          'hrs',
          'Horas por persona y semana en esas tareas',
          hours,
          setHours,
          1,
          30,
          0.5,
          'h',
        )}
        {slider('cost', 'Coste por hora (salario + SS)', cost, setCost, 12, 80, 1, '€')}
        {slider(
          'rate',
          'Parte automatizable',
          Math.round(rate * 100),
          (n) => setRate(n / 100),
          20,
          90,
          5,
          '%',
        )}
      </div>
      <div className="grid content-start gap-5">
        <div className="grid gap-1 rounded-xl sobre-tinta bg-tinta p-6">
          <p className="etiqueta">Ahorro anual estimado</p>
          <p
            className="font-display text-5xl font-semibold tracking-tight text-positive-strong tabular-nums"
            aria-live="polite"
          >
            {formatEuros(r.eurosSavedPerYear)}
          </p>
          <p className="text-muted tabular-nums">
            {formatNumber(r.hoursSavedPerYear)} horas al año ·{' '}
            {formatNumber(r.hoursSavedPerWeekPerPerson)} h/semana por persona
          </p>
        </div>
        <details className="text-sm text-muted">
          <summary className="cursor-pointer font-medium text-fg">Cómo lo calculamos</summary>
          <p className="mt-2 font-mono text-xs leading-6">
            {employees} personas × {hours} h/semana × {WORK_WEEKS_PER_YEAR} semanas ×{' '}
            {Math.round(rate * 100)} % × {cost} €/h
          </p>
          <p className="mt-2">
            Suponemos {WORK_WEEKS_PER_YEAR} semanas laborables al año (descontando vacaciones y
            festivos) y que la automatización cubre el porcentaje indicado; el resto sigue
            requiriendo revisión humana. Es una estimación orientativa, no una oferta.
          </p>
        </details>
        {sent === 'ok' ? (
          <p className="border border-positive-strong p-4 text-sm" role="status">
            Listo. Te enviaremos el informe con estos datos a <strong>{email}</strong>.
          </p>
        ) : (
          <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={send}>
            <label className="grid gap-1 text-sm" htmlFor={`${id}-name`}>
              Nombre
              <input
                id={`${id}-name`}
                required
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="grid gap-1 text-sm" htmlFor={`${id}-email`}>
              Email
              <input
                id={`${id}-email`}
                required
                type="email"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={sent === 'sending'}>
              {sent === 'sending' ? 'Enviando…' : 'Recibir informe'}
            </button>
            <p className="text-xs text-muted sm:col-span-3">
              Al enviar aceptas que te contactemos sobre esta estimación.{' '}
              <a className="underline" href="/legal/privacidad">
                Privacidad
              </a>
              .
            </p>
            {sent !== 'idle' && sent !== 'sending' && (
              <p role="alert" className="text-sm text-signal sm:col-span-3">
                {sent}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
