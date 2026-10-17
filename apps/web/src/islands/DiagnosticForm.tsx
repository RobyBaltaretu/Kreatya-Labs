import {
  COMPANY_SIZE_LABELS,
  COMPANY_SIZES,
  type CompanySize,
  SOLUTION_KINDS,
  type SolutionKind,
} from '@kreatya/shared/enums';
import { siteConfig } from '@kreatya/shared/site.config';
import { Icon } from '@kreatya/ui';
import { useEffect, useRef, useState } from 'react';
import { isPreviewMode, submitLead } from '../lib/api';
import { track } from '../lib/track';
import { readConsent } from './CookieBanner';

interface Props {
  sectors: { slug: string; name: string }[];
  kindLabels: Record<SolutionKind, string>;
}

const PAINS = [
  'Excel por todas partes',
  'Programas que no se hablan entre sí',
  'Tareas repetitivas que quitan horas',
  'No tengo datos fiables para decidir',
  'Mi software actual no se adapta',
  'Quiero lanzar un producto digital nuevo',
];
const TOOLS = [
  'Excel / Google Sheets',
  'ERP estándar (SAP, Sage, A3, Holded…)',
  'CRM (HubSpot, Salesforce…)',
  'Tienda online',
  'Software a medida antiguo',
  'Papel',
  'Correo y WhatsApp',
];
const STEPS = ['Sector', 'Qué te frena', 'Herramientas', 'Tamaño', 'Contacto'];

type State = {
  sector: string;
  solutionKind: SolutionKind | '';
  pain: string;
  painDetail: string;
  currentTools: string[];
  companySize: CompanySize | '';
  name: string;
  email: string;
  phone: string;
  company: string;
  consent: boolean;
};

/** Diagnóstico gratuito en 5 pasos (HU-05): barra de progreso, validación en línea y agenda al final. */
export default function DiagnosticForm({ sectors, kindLabels }: Props) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<State>({
    sector: '',
    solutionKind: '',
    pain: '',
    painDetail: '',
    currentTools: [],
    companySize: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [serverError, setServerError] = useState('');
  const [mediaOk, setMediaOk] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const sector = p.get('sector') ?? '';
    const tipo = p.get('tipo') ?? '';
    setS((x) => ({
      ...x,
      sector: sectors.some((o) => o.slug === sector) ? sector : x.sector,
      solutionKind: (SOLUTION_KINDS as readonly string[]).includes(tipo)
        ? (tipo as SolutionKind)
        : x.solutionKind,
    }));
    setMediaOk(readConsent()?.media ?? false);
    const onConsent = (e: Event) => setMediaOk((e as CustomEvent<{ media: boolean }>).detail.media);
    addEventListener('k:consent', onConsent);
    return () => removeEventListener('k:consent', onConsent);
  }, [sectors]);

  useEffect(() => {
    track('diag_step', { step: step + 1 });
  }, [step]);

  const set = <K extends keyof State>(k: K, v: State[K]) => {
    setS((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = (i: number): boolean => {
    const e: Record<string, string> = {};
    if (i === 0 && !s.sector) e.sector = 'Elige el sector que más se parece al tuyo.';
    if (i === 1 && !s.pain) e.pain = 'Elige al menos una opción.';
    if (i === 3 && !s.companySize) e.companySize = 'Elige el tamaño de tu empresa.';
    if (i === 4) {
      if (s.name.trim().length < 2) e.name = 'Indica tu nombre.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email))
        e.email = 'Revisa el email: falta la @ o el dominio.';
      if (!s.consent) e.consent = 'Necesitamos tu consentimiento para contactarte.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const go = (i: number) => {
    setStep(i);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(step)) return;
    if (step < STEPS.length - 1) return go(step + 1);

    const payload = {
      type: 'diagnostico' as const,
      sector: s.sector,
      ...(s.solutionKind ? { solutionKind: s.solutionKind } : {}),
      pain: [s.pain, s.painDetail].filter(Boolean).join(' — '),
      currentTools: s.currentTools,
      companySize: s.companySize as CompanySize,
      name: s.name,
      email: s.email,
      ...(s.phone ? { phone: s.phone } : {}),
      ...(s.company ? { company: s.company } : {}),
      consent: true as const,
    };
    setStatus('sending');
    setServerError('');
    const res = await submitLead(payload);
    if (res.ok) {
      setStatus('done');
      requestAnimationFrame(() => headingRef.current?.focus());
    } else {
      setStatus('idle');
      setServerError(res.message);
    }
  };

  const sectorName = sectors.find((x) => x.slug === s.sector)?.name ?? 'tu sector';

  if (status === 'done') {
    const calUrl = `https://cal.com/${siteConfig.calLink}?name=${encodeURIComponent(s.name)}&email=${encodeURIComponent(s.email)}`;
    return (
      <div className="grid gap-6 rounded-3xl border border-line bg-raised p-6 sm:p-10">
        <p className="etiqueta">Paso final · reserva tu cita</p>
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-3xl font-semibold">
          Gracias, {s.name.split(' ')[0]}. Ya tenemos tu diagnóstico.
        </h2>
        {isPreviewMode && (
          <p className="border border-dashed border-line p-3 text-sm text-muted">
            Vista previa: el envío se ha simulado y no se ha guardado ningún dato.
          </p>
        )}
        <ol className="grid gap-3 text-muted">
          <li>
            <strong className="text-fg">1. Reserva 45 minutos</strong> con un arquitecto para
            revisar tu proceso.
          </li>
          <li>
            <strong className="text-fg">2. Te enviamos un plano</strong> con módulos, plazo y precio
            orientativo en 48 h.
          </li>
          <li>
            <strong className="text-fg">3. Decides</strong> sin compromiso.
          </li>
        </ol>
        {mediaOk ? (
          <iframe
            title="Agenda de Kreatya Labs"
            src={`${calUrl}&embed=true`}
            className="h-[560px] w-full rounded-3xl border border-line bg-bg"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-wrap gap-3">
            <a className="btn btn-primary" href={calUrl} target="_blank" rel="noopener">
              Elegir día y hora
            </a>
            <button type="button" className="btn btn-secondary" data-open-cookies>
              Mostrar la agenda aquí
            </button>
          </div>
        )}
        <a
          className="text-diagram underline underline-offset-4"
          href={`/guias/cuanto-cuesta-un-software-a-medida`}
        >
          Mientras tanto: guía de precios de software a medida para {sectorName.toLowerCase()}
        </a>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`err-${k}`} role="alert" className="mt-2 text-sm font-medium text-signal">
        {errors[k]}
      </p>
    ) : null;
  const choice = (
    name: string,
    value: string,
    label: string,
    checked: boolean,
    onChange: () => void,
    type: 'radio' | 'checkbox' = 'radio',
  ) => (
    <label
      key={value}
      className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${checked ? 'border-blueprint bg-bg font-semibold' : 'border-line hover:border-diagram'}`}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[var(--blueprint)]"
      />
      {label}
    </label>
  );

  return (
    <form
      className="grid gap-6 rounded-3xl border border-line bg-raised p-5 sm:p-8"
      onSubmit={next}
      noValidate
    >
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <p className="etiqueta">
            Paso {step + 1} de {STEPS.length} · {STEPS[step]}
          </p>
          <p className="font-mono text-xs text-muted">
            ≈ {Math.max(1, 2 - Math.floor(step / 2))} min
          </p>
        </div>
        <div
          className="mt-3 h-1.5 w-full bg-line"
          role="progressbar"
          aria-label="Progreso del diagnóstico"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
        >
          <div
            className="h-full bg-signal transition-[width] duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <fieldset
        className="grid gap-4"
        aria-describedby={
          Object.keys(errors)
            .filter((k) => errors[k])
            .map((k) => `err-${k}`)
            .join(' ') || undefined
        }
      >
        <legend className="sr-only">{STEPS[step]}</legend>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl font-semibold outline-none"
        >
          {
            [
              '¿A qué se dedica tu empresa?',
              '¿Qué es lo que más te frena hoy?',
              '¿Qué herramientas usáis ahora?',
              '¿Cuántas personas sois?',
              '¿Dónde te enviamos el diagnóstico?',
            ][step]
          }
        </h2>

        {step === 0 && (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {sectors.map((o) =>
                choice('sector', o.slug, o.name, s.sector === o.slug, () => set('sector', o.slug)),
              )}
            </div>
            {err('sector')}
            <label className="grid gap-1.5 text-sm" htmlFor="d-kind">
              ¿Tienes ya en mente un tipo de solución? (opcional)
              <select
                id="d-kind"
                className="field"
                value={s.solutionKind}
                onChange={(e) => set('solutionKind', e.target.value as SolutionKind | '')}
              >
                <option value="">Aún no lo sé</option>
                {SOLUTION_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {kindLabels[k]}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {PAINS.map((p) => choice('pain', p, p, s.pain === p, () => set('pain', p)))}
            </div>
            {err('pain')}
            <label className="grid gap-1.5 text-sm" htmlFor="d-detail">
              Cuéntanos algo más (opcional)
              <textarea
                id="d-detail"
                rows={3}
                className="field"
                maxLength={1500}
                value={s.painDetail}
                onChange={(e) => set('painDetail', e.target.value)}
                placeholder="Ej.: preparamos los pedidos copiando del correo a un Excel compartido…"
              />
            </label>
          </>
        )}

        {step === 2 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {TOOLS.map((t) =>
              choice(
                'tools',
                t,
                t,
                s.currentTools.includes(t),
                () =>
                  set(
                    'currentTools',
                    s.currentTools.includes(t)
                      ? s.currentTools.filter((x) => x !== t)
                      : [...s.currentTools, t],
                  ),
                'checkbox',
              ),
            )}
          </div>
        )}

        {step === 3 && (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {COMPANY_SIZES.map((k) =>
                choice('size', k, COMPANY_SIZE_LABELS[k], s.companySize === k, () =>
                  set('companySize', k),
                ),
              )}
            </div>
            {err('companySize')}
          </>
        )}

        {step === 4 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm" htmlFor="d-name">
              Nombre *
              <input
                id="d-name"
                className="field"
                autoComplete="name"
                value={s.name}
                onChange={(e) => set('name', e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'err-name' : undefined}
              />
              {err('name')}
            </label>
            <label className="grid gap-1.5 text-sm" htmlFor="d-email">
              Email de trabajo *
              <input
                id="d-email"
                type="email"
                className="field"
                autoComplete="email"
                value={s.email}
                onChange={(e) => set('email', e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'err-email' : undefined}
              />
              {err('email')}
            </label>
            <label className="grid gap-1.5 text-sm" htmlFor="d-company">
              Empresa
              <input
                id="d-company"
                className="field"
                autoComplete="organization"
                value={s.company}
                onChange={(e) => set('company', e.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm" htmlFor="d-phone">
              Teléfono
              <input
                id="d-phone"
                type="tel"
                className="field"
                autoComplete="tel"
                value={s.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </label>
            <label className="flex items-start gap-3 text-sm sm:col-span-2" htmlFor="d-consent">
              <input
                id="d-consent"
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--blueprint)]"
                checked={s.consent}
                onChange={(e) => set('consent', e.target.checked)}
                aria-invalid={!!errors.consent}
              />
              <span>
                Acepto que {siteConfig.name} trate mis datos para preparar el diagnóstico y
                contactarme.{' '}
                <a className="underline" href="/legal/privacidad">
                  Política de privacidad
                </a>
                .
              </span>
            </label>
            <div className="sm:col-span-2">{err('consent')}</div>
          </div>
        )}
      </fieldset>

      {serverError && (
        <p role="alert" className="border border-signal p-3 text-sm">
          {serverError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => go(step - 1)}
          disabled={step === 0}
          hidden={step === 0}
        >
          <Icon name="arrow-left" />
          Atrás
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-draw ml-auto"
          disabled={status === 'sending'}
        >
          {step < STEPS.length - 1 ? (
            <>
              Siguiente
              <Icon name="arrow-right" />
            </>
          ) : status === 'sending' ? (
            'Enviando…'
          ) : (
            'Enviar y reservar cita'
          )}
        </button>
      </div>
    </form>
  );
}
