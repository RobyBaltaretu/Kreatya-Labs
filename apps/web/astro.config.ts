import { writeFile } from 'node:fs/promises';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { contentSnapshot as seed } from '@kreatya/db/seed';
import type { ContentSnapshot } from '@kreatya/shared';
import { siteConfig } from '@kreatya/shared/site.config';
import tailwindcss from '@tailwindcss/vite';
import type { AstroIntegration } from 'astro';
import { defineConfig } from 'astro/config';

/** Genera `_redirects` de Cloudflare Pages con las redirecciones 301/410 gestionadas desde el panel. */
const redirectsFile = (): AstroIntegration => ({
  name: 'kreatya-redirects',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      let redirects: ContentSnapshot['redirects'];
      if (process.env.CONTENT_API_URL) {
        const res = await fetch(`${process.env.CONTENT_API_URL}/internal/snapshot`, {
          headers: { Authorization: `Bearer ${process.env.CONTENT_API_TOKEN ?? ''}` },
        });
        redirects = ((await res.json()) as ContentSnapshot).redirects;
      } else {
        redirects = seed.redirects;
      }
      const lines = redirects.map((r) =>
        r.code === 410 ? `${r.from} /404 410` : `${r.from} ${r.to} 301`,
      );
      await writeFile(new URL('_redirects', dir), `${lines.join('\n')}\n`);
    },
  },
});

// La web es 100 % estática (SSG): nunca lee D1 en tiempo de petición.
export default defineConfig({
  site: process.env.SITE_URL ?? siteConfig.url,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  integrations: [
    react(),
    redirectsFile(),
    sitemap({
      filter: (page) => !page.includes('/demo') && !page.includes('/404'),
      serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }),
    }),
  ],
  // Tailwind v4 trae su propia versión de Vite en los tipos; en ejecución es compatible.
  vite: { plugins: [tailwindcss() as never] },
});
