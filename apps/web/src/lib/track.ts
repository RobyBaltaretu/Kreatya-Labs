import type { EventName } from '@kreatya/shared';

const API = import.meta.env.PUBLIC_API_URL as string | undefined;

function sessionId(): string {
  try {
    let id = sessionStorage.getItem('k_sid');
    if (!id) {
      id = crypto.randomUUID().replaceAll('-', '').slice(0, 20);
      sessionStorage.setItem('k_sid', id);
    }
    return id;
  } catch {
    return 'anon-session';
  }
}

/** Eventos propios anónimos (sin cookies). Si no hay API, no hace nada. */
export function track(
  name: EventName,
  props?: Record<string, string | number | boolean>,
  projectSlug?: string,
) {
  if (!API) return;
  const body = JSON.stringify({
    name,
    sessionId: sessionId(),
    path: location.pathname,
    projectSlug,
    props,
  });
  try {
    navigator.sendBeacon?.(`${API}/v1/events`, new Blob([body], { type: 'application/json' })) ||
      fetch(`${API}/v1/events`, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      });
  } catch {
    /* la analítica nunca debe romper la página */
  }
}

const UTM_KEYS = ['source', 'medium', 'campaign', 'term', 'content'] as const;

export function readUtm(): Record<string, string> | undefined {
  try {
    const params = new URLSearchParams(location.search);
    const fresh = Object.fromEntries(
      UTM_KEYS.flatMap((k) => (params.get(`utm_${k}`) ? [[k, params.get(`utm_${k}`)!]] : [])),
    );
    if (Object.keys(fresh).length) {
      sessionStorage.setItem('k_utm', JSON.stringify(fresh));
      return fresh;
    }
    const stored = sessionStorage.getItem('k_utm');
    return stored ? JSON.parse(stored) : undefined;
  } catch {
    return undefined;
  }
}
