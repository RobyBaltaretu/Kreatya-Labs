import type { LeadInput } from '@kreatya/shared';
import { readUtm } from './track';

const API = import.meta.env.PUBLIC_API_URL as string | undefined;

/** True cuando la web corre sin API (vista previa estática): los envíos se simulan. */
export const isPreviewMode = !API;

export type LeadResult = { ok: true; preview?: boolean } | { ok: false; message: string };

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export async function submitLead(
  input: DistributiveOmit<LeadInput, 'sourcePath' | 'utm'>,
): Promise<LeadResult> {
  const payload = { ...input, sourcePath: location.pathname, utm: readUtm() };
  if (!API) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true, preview: true };
  }
  try {
    const res = await fetch(`${API}/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    return {
      ok: false,
      message:
        body.message ??
        'No hemos podido enviar el formulario. Revisa los datos e inténtalo de nuevo.',
    };
  } catch {
    return {
      ok: false,
      message: 'Sin conexión con el servidor. Comprueba tu red e inténtalo de nuevo.',
    };
  }
}
