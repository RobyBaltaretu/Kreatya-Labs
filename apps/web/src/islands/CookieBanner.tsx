import { useEffect, useState } from 'react';

type Consent = { necessary: true; media: boolean; decidedAt: string };
const KEY = 'k_consent';

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

/**
 * Banner conforme a la guía de la AEPD: «Rechazar» tan visible como «Aceptar».
 * La web no usa cookies analíticas; solo pide permiso para contenidos de terceros
 * (vídeos de YouTube y agenda de Cal.com).
 */
export default function CookieBanner() {
  // Se renderiza en servidor (se pinta con la página); un script en <head> lo oculta si ya hay consentimiento.
  const [open, setOpen] = useState(true);
  const [settings, setSettings] = useState(false);
  const [media, setMedia] = useState(false);

  useEffect(() => {
    if (readConsent()) setOpen(false);
    const onOpen = (e: Event) => {
      if ((e.target as HTMLElement).closest('[data-open-cookies]')) {
        setMedia(readConsent()?.media ?? false);
        setSettings(true);
        delete document.documentElement.dataset.consent;
        setOpen(true);
      }
    };
    document.addEventListener('click', onOpen);
    return () => document.removeEventListener('click', onOpen);
  }, []);

  const save = (value: boolean) => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ necessary: true, media: value, decidedAt: new Date().toISOString() }),
      );
    } catch {
      /* sin almacenamiento: el banner volverá a mostrarse */
    }
    window.dispatchEvent(new CustomEvent('k:consent', { detail: { media: value } }));
    setOpen(false);
  };

  if (!open) return null;
  return (
    <section
      aria-labelledby="cookies-title"
      className="cookie-banner glass fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[1040px] rounded-[1.75rem] [--glass-tint:var(--glass-tint-strong)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid gap-4 px-5 py-5 sm:px-7 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 id="cookies-title" className="font-display text-lg font-semibold">
            Tu privacidad
          </h2>
          <p className="mt-1 max-w-[70ch] text-sm leading-snug text-muted">
            No usamos cookies de analítica ni publicidad. Solo te pedimos permiso para cargar vídeos
            de YouTube y la agenda de Cal.com, que pueden instalar sus propias cookies.{' '}
            <a className="underline" href="/legal/cookies">
              Política de cookies
            </a>
            .
          </p>
          {settings && (
            <label className="mt-3 flex items-center gap-3 text-sm" htmlFor="consent-media">
              <input
                id="consent-media"
                type="checkbox"
                className="h-5 w-5 accent-[var(--fg)]"
                checked={media}
                onChange={(e) => setMedia(e.target.checked)}
              />
              Contenidos de terceros (vídeos y agenda)
            </label>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3 [&_.btn]:px-3">
          {settings ? (
            <button type="button" className="btn btn-primary" onClick={() => save(media)}>
              Guardar preferencias
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => save(false)}>
                Rechazar
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setSettings(true)}>
                Configurar
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => save(true)}>
                Aceptar
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
