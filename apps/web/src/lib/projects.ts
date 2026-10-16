import type { ContentSnapshot, Project, SolutionKind } from '@kreatya/shared';

export const KIND_LABELS: Record<SolutionKind, string> = {
  erp: 'ERP',
  crm: 'CRM',
  app: 'App móvil',
  portal: 'Portal / web app',
  ia: 'IA',
  integracion: 'Integración',
};

/** Tipos de solución de un proyecto (para filtros): los de sus soluciones + IA si la usa. */
export function projectKinds(p: Project, s: ContentSnapshot): SolutionKind[] {
  const kinds = new Set<SolutionKind>();
  for (const slug of p.solutions) {
    const sol = s.solutions.find((x) => x.slug === slug);
    if (sol) kinds.add(sol.kind);
  }
  if (p.solutions.includes('apps-moviles')) kinds.add('app');
  if (p.aiRole) kinds.add('ia');
  return [...kinds];
}

export const sectorName = (s: ContentSnapshot, slug: string | undefined) =>
  s.sectors.find((x) => x.slug === slug)?.name ?? '';
