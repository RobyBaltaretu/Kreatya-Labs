import { leadsCsv, mockFetch } from './mock';

const API = import.meta.env.VITE_API_URL as string | undefined;
export const isDemo = !API;
/** URL de la web pública (para enlaces y miniaturas). */
export const WEB = (import.meta.env.VITE_WEB_URL as string | undefined) ?? 'https://kreatya.es';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/**
 * Cliente del panel. En producción la cookie de Cloudflare Access viaja con `credentials: 'include'`
 * y la API valida el JWT. Sin API configurada, usa el modo demostración.
 */
export async function api<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const method = init.method ?? 'GET';
  if (!API) return (await mockFetch(method, `/admin${path}`, init.body)) as T;
  const res = await fetch(`${API}/admin${path}`, {
    method,
    credentials: 'include',
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new ApiError((data as { message?: string }).message ?? `Error ${res.status}`, res.status);
  return data as T;
}

export async function downloadLeadsCsv(query: string) {
  const text = API
    ? await (
        await fetch(`${API}/admin/leads/export.csv?${query}`, { credentials: 'include' })
      ).text()
    : leadsCsv();
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `leads-${new Date().toISOString().slice(0, 10)}.csv`,
  });
  a.click();
  URL.revokeObjectURL(url);
}

export const fmt = {
  n: (v: number) => new Intl.NumberFormat('es-ES').format(v),
  eur: (v: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(v),
  pct: (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1 }).format(v),
  date: (iso: string) =>
    new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(iso)),
  datetime: (iso: string) =>
    new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso),
    ),
};
