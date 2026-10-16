import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { ogSvg } from '../../lib/og';
import { getSnapshot } from '../../lib/snapshot';

/** Una imagen OG por página indexable. El slug es la ruta con «/» sustituida por «--». */
export const getStaticPaths = (async () => {
  const s = await getSnapshot();
  const pages: { slug: string; title: string; eyebrow: string }[] = [
    {
      slug: 'home',
      title: 'Software a medida que entiende tu negocio',
      eyebrow: 'Software a medida + IA',
    },
    { slug: 'proyectos', title: 'Proyectos que puedes probar', eyebrow: 'Portfolio' },
    { slug: 'soluciones', title: 'Sistemas completos para tu empresa', eyebrow: 'Soluciones' },
    { slug: 'sectores', title: 'Software para cada sector', eyebrow: 'Sectores' },
    {
      slug: 'ia-para-empresas',
      title: 'Inteligencia artificial para empresas',
      eyebrow: 'IA aplicada',
    },
    { slug: 'precios', title: '¿Cuánto cuesta un software a medida?', eyebrow: 'Precios' },
    { slug: 'metodo', title: 'Lo usarás en semanas, no en años', eyebrow: 'Método' },
    { slug: 'empresa', title: 'Negocio antes que código', eyebrow: 'Empresa' },
    { slug: 'diagnostico', title: 'Diagnóstico gratuito en 2 minutos', eyebrow: 'Diagnóstico' },
    { slug: 'blog', title: 'Blog y guías', eyebrow: 'Recursos' },
    ...s.projects.map((p) => ({
      slug: `proyectos--${p.slug}`,
      title: p.title,
      eyebrow: 'Caso de éxito',
    })),
    ...s.solutions.map((x) => ({
      slug: `soluciones--${x.slug}`,
      title: x.name,
      eyebrow: 'Solución',
    })),
    ...s.sectors.map((x) => ({
      slug: `sectores--${x.slug}`,
      title: `Software para ${x.name.toLowerCase()}`,
      eyebrow: 'Sector',
    })),
    ...s.posts.map((x) => ({
      slug: `${x.kind === 'guia' ? 'guias' : 'blog'}--${x.slug}`,
      title: x.title,
      eyebrow: x.kind === 'guia' ? 'Guía' : 'Blog',
    })),
  ];
  return pages.map((p) => ({ params: { slug: p.slug }, props: p }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await sharp(Buffer.from(ogSvg(props.title, props.eyebrow)))
    .png({ compressionLevel: 9 })
    .toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
