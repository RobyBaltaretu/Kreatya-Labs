import type { APIRoute, GetStaticPaths } from 'astro';
import { mockupSvg } from '../../../../lib/mockup';
import { formatMetric, getSnapshot } from '../../../../lib/snapshot';

const SCREENS: Record<string, string> = {
  cover: 'Panel principal',
  panel: 'Panel de tráfico',
  app: 'App de conductor',
  facturas: 'Facturación',
  ordenes: 'Órdenes de fabricación',
  parte: 'Parte de trabajo',
  reserva: 'Reserva de cita',
  agenda: 'Agenda semanal',
  cuaderno: 'Cuaderno de campo',
  traza: 'Trazabilidad',
  stock: 'Stock por tienda',
  portal: 'Portal de cliente',
  revision: 'Revisión con IA',
  seguimiento: 'Seguimiento de envío',
};

export const getStaticPaths = (async () => {
  const s = await getSnapshot();
  return s.projects.flatMap((p) => {
    const files = new Map<string, 'cover' | 'desktop' | 'tablet' | 'mobile'>();
    const own = (src: string) =>
      src.startsWith(`/media/proyectos/${p.slug}/`) && src.endsWith('.svg');
    if (own(p.cover)) files.set(p.cover, 'cover');
    for (const g of p.gallery) if (own(g.src)) files.set(g.src, g.device);
    for (const t of p.demoTour)
      if (own(t.image) && !files.has(t.image)) files.set(t.image, 'desktop');
    return [...files].map(([src, kind]) => {
      const file = src.split('/').pop()!;
      const key = file.replace('.svg', '');
      return {
        params: { slug: p.slug, file },
        props: {
          kind,
          title: p.title,
          screen: SCREENS[key] ?? 'Aplicación',
          metric: p.metrics[0] ? formatMetric(p.metrics[0]) : undefined,
          seed: src,
        },
      };
    });
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(mockupSvg(props as Parameters<typeof mockupSvg>[0]), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
