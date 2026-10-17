import { estimateInvestment, formatEuros } from '@kreatya/shared/calc';
import { useState } from 'react';
import { submitLead } from '../lib/api';

/** Calculadora orientativa de inversión y plazo (/precios). */
export default function InvestmentCalculator() {
  const [modules, setModules] = useState(3);
  const [users, setUsers] = useState(15);
  const [integrations, setIntegrations] = useState(1);
  const [ai, setAi] = useState(true);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const r = estimateInvestment({ modules, users, integrations, ai });

  const stepper = (
    id: string,
    label: string,
    value: number,
    set: (n: number) => void,
    min: number,
    max: number,
  ) => (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn btn-secondary h-11 w-11 p-0"
          aria-label={`Menos ${label.toLowerCase()}`}
          onClick={() => set(Math.max(min, value - 1))}
        >
          −
        </button>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => set(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
          className="field w-16 text-center tabular-nums"
        />
        <button
          type="button"
          className="btn btn-secondary h-11 w-11 p-0"
          aria-label={`Más ${label.toLowerCase()}`}
          onClick={() => set(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid gap-8 rounded-3xl border border-line bg-raised p-5 sm:p-8 lg:grid-cols-2">
      <div>
        {stepper('inv-mod', 'Módulos principales', modules, setModules, 1, 12)}
        {stepper('inv-users', 'Usuarios', users, setUsers, 1, 500)}
        {stepper(
          'inv-int',
          'Integraciones con otros sistemas',
          integrations,
          setIntegrations,
          0,
          10,
        )}
        <label
          className="flex items-center justify-between gap-4 py-3 text-sm font-medium"
          htmlFor="inv-ai"
        >
          IA aplicada (lectura de documentos, asistentes…)
          <input
            id="inv-ai"
            type="checkbox"
            className="h-5 w-5 accent-[var(--blueprint)]"
            checked={ai}
            onChange={(e) => setAi(e.target.checked)}
          />
        </label>
      </div>
      <div className="grid content-start gap-4">
        <div className="rounded-xl sobre-tinta bg-tinta p-6">
          <p className="etiqueta">Inversión orientativa</p>
          <p
            className="mt-1 font-display text-4xl font-semibold tracking-tight tabular-nums"
            aria-live="polite"
          >
            {formatEuros(r.min)} – {formatEuros(r.max)}
          </p>
          <p className="mt-2 text-muted tabular-nums">
            Plazo estimado: {r.weeksMin}–{r.weeksMax} semanas · primer módulo en uso en 4–6
          </p>
        </div>
        <p className="text-sm text-muted">
          Rango orientativo sin IVA. El presupuesto cerrado se da por fase tras el diagnóstico.
        </p>
        {status === 'ok' ? (
          <p role="status" className="border border-positive-strong p-4 text-sm">
            Te hemos enviado la estimación a {email}.
          </p>
        ) : (
          <form
            className="flex flex-wrap gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setStatus('sending');
              const res = await submitLead({
                type: 'calc_inversion',
                name: 'Calculadora de inversión',
                email,
                consent: true,
                input: { modules, users, integrations, ai },
              });
              setStatus(res.ok ? 'ok' : 'error');
            }}
          >
            <label htmlFor="inv-email" className="sr-only">
              Email
            </label>
            <input
              id="inv-email"
              type="email"
              required
              placeholder="tu@empresa.es"
              className="field min-w-0 flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              Recibe la estimación por email
            </button>
            {status === 'error' && (
              <p role="alert" className="w-full text-sm text-signal">
                No hemos podido enviarla. Inténtalo de nuevo.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
