import { useState } from 'react';
import { isPreviewMode, submitLead } from '../lib/api';

/** Demo bajo solicitud (HU-03, nivel 3): 3 campos → acceso temporal de 72 h por email. */
export default function DemoRequestForm({
  projectSlug,
  projectTitle,
}: {
  projectSlug: string;
  projectTitle: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | string>('idle');

  if (status === 'ok') {
    return (
      <div role="status" className="border border-positive-strong bg-raised p-6">
        <p className="font-display text-xl font-semibold">Revisa tu correo</p>
        <p className="mt-2 text-muted">
          Te hemos enviado un acceso a la demo de «{projectTitle}» válido durante 72 horas.
        </p>
        {isPreviewMode && (
          <p className="mt-3 text-sm text-muted">Vista previa: el envío se ha simulado.</p>
        )}
      </div>
    );
  }
  return (
    <form
      className="grid gap-4 rounded-3xl border border-line bg-raised p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!consent) return setStatus('Necesitamos tu consentimiento para enviarte el acceso.');
        setStatus('sending');
        const r = await submitLead({
          type: 'demo',
          projectSlug,
          name,
          email,
          ...(company ? { company } : {}),
          consent: true,
        });
        setStatus(r.ok ? 'ok' : r.message);
      }}
    >
      <p className="etiqueta">Acceso a la demo completa</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1.5 text-sm" htmlFor="dr-name">
          Nombre
          <input
            id="dr-name"
            required
            className="field"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-sm" htmlFor="dr-email">
          Email
          <input
            id="dr-email"
            required
            type="email"
            className="field"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-sm" htmlFor="dr-company">
          Empresa
          <input
            id="dr-company"
            className="field"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm" htmlFor="dr-consent">
        <input
          id="dr-consent"
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[var(--blueprint)]"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        Acepto recibir el acceso y que me contactéis sobre esta demo.{' '}
        <a className="underline" href="/legal/privacidad">
          Privacidad
        </a>
        .
      </label>
      {status !== 'idle' && status !== 'sending' && (
        <p role="alert" className="text-sm text-signal">
          {status}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary justify-self-start"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Enviando…' : 'Recibir acceso (72 h)'}
      </button>
    </form>
  );
}
