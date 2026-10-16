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
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [media, setMedia] = useState(false);

  useEffect(() => {
    if (!readConsent()) setOpen(true);
    const onOpen = (e: Event) => {
      if ((e.target as HTMLElement).closest('[data-open-cookies]')) {
        setMedia(readConsent()?.media ?? false);
        setSettings(true);
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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-raised shadow-[0_-8px_30px_rgb(0_0_0/0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="wrap grid gap-4 py-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 id="cookies-title" className="font-display text-lg font-semibold">
            Tu privacidad
          </h2>
          <p className="mt-1 max-w-[70ch] text-sm text-muted">
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
                className="h-5 w-5 accent-[var(--blueprint)]"
                checked={media}
                onChange={(e) => setMedia(e.target.checked)}
              />
              Contenidos de terceros (vídeos y agenda)
            </label>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
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
