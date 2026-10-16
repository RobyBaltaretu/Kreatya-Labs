import { contentSnapshot as seed } from '@kreatya/db/seed';
import type { ContentSnapshot, Project } from '@kreatya/shared';

let cache: Promise<ContentSnapshot> | undefined;

/**
 * Contenido en build. Con CONTENT_API_URL lee la instantánea publicada de la API (D1);
 * sin ella usa el contenido semilla. Nunca se ejecuta en tiempo de petición.
 */
export function getSnapshot(): Promise<ContentSnapshot> {
  cache ??= (async () => {
    const url = import.meta.env.CONTENT_API_URL;
    if (!url) return seed;
    const res = await fetch(`${url}/internal/snapshot`, {
      headers: { Authorization: `Bearer ${import.meta.env.CONTENT_API_TOKEN ?? ''}` },
    });
    if (!res.ok) throw new Error(`No se pudo leer el contenido de la API (${res.status})`);
    return (await res.json()) as ContentSnapshot;
  })();
  return cache;
}

export const clientLabel = (
  p: Pick<Project, 'clientName' | 'confidential'>,
  sectorName?: string,
) =>
  p.confidential || !p.clientName
    ? `Cliente del sector ${sectorName?.toLowerCase() ?? 'privado'}`
    : p.clientName;

export const headlineMetric = (p: Project) => p.metrics[0];

export const formatMetric = (m: { value: number; unit: string; prefix?: string }) =>
  `${m.prefix ?? ''}${new Intl.NumberFormat('es-ES').format(m.value)}${m.unit === '%' ? ' %' : ` ${m.unit}`}`;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(iso),
  );
