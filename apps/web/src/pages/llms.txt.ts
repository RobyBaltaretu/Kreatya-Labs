import { formatEuros } from '@kreatya/shared';
import { siteConfig } from '@kreatya/shared/site.config';
import type { APIRoute } from 'astro';
import { formatMetric, getSnapshot } from '../lib/snapshot';

/** Resumen para buscadores con IA (GEO): empresa, servicios, precios y enlaces clave. */
export const GET: APIRoute = async ({ site }) => {
  const s = await getSnapshot();
  const u = (p: string) => new URL(p, site).toString();
  const body = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.name} desarrolla software a medida (ERP, CRM, apps móviles, portales e integraciones) con inteligencia artificial aplicada para pymes de 10 a 250 empleados en España. Primer módulo en uso en 4–6 semanas, presupuesto cerrado por fase, sin coste por usuario y el código es del cliente.

## Precios orientativos
${s.pricingTiers.map((t) => `- ${t.name}: ${t.priceTo ? `${formatEuros(t.priceFrom)}–${formatEuros(t.priceTo)}` : `desde ${formatEuros(t.priceFrom)}`}${t.unit === 'EUR/mes' ? '/mes' : ''}. ${t.description}`).join('\n')}

## Soluciones
${s.solutions.map((x) => `- [${x.name}](${u(`/soluciones/${x.slug}`)}): ${x.tagline}`).join('\n')}

## Sectores
${s.sectors.map((x) => `- [${x.name}](${u(`/sectores/${x.slug}`)}): ${x.tagline}`).join('\n')}

## Casos de éxito
${s.projects.map((p) => `- [${p.title}](${u(`/proyectos/${p.slug}`)}): ${p.metrics.map((m) => `${formatMetric(m)} ${m.description}`).join('; ')}`).join('\n')}

## Enlaces clave
- [IA para empresas](${u('/ia-para-empresas')})
- [Precios](${u('/precios')})
- [Método](${u('/metodo')})
- [Diagnóstico gratuito](${u('/diagnostico')})

## Contacto
${siteConfig.contact.email} · ${siteConfig.contact.phone} · ${siteConfig.contact.address.city}, España
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
