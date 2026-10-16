#!/usr/bin/env node
/**
 * Vista previa estática portable (web + panel en /admin) para alojar en cualquier ruta,
 * por ejemplo como artifact de claude.ai o en un servidor de ficheros sin reescrituras:
 *   - la web se compila en «modo vista previa» (sin API: los formularios simulan el envío);
 *   - el panel se compila en modo demostración, con rutas hash y base relativa;
 *   - todas las rutas absolutas («/proyectos») pasan a relativas («../proyectos/index.html»).
 *
 * Uso: node scripts/build-preview.mjs [salida=preview-dist]
 */
import { execSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, process.argv[2] ?? 'preview-dist');
const run = (cmd, env = {}) =>
  execSync(cmd, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });

run('pnpm --filter @kreatya/web build', { PUBLIC_API_URL: '', CONTENT_API_URL: '' });
run('pnpm --filter @kreatya/admin exec vite build', {
  VITE_BASE: './',
  VITE_HASH_ROUTER: '1',
  VITE_API_URL: '',
  VITE_WEB_URL: '..',
});

await rm(out, { recursive: true, force: true });
await cp(join(root, 'apps/web/dist'), out, { recursive: true });
await rm(join(out, 'og'), { recursive: true, force: true }); // imágenes OG: innecesarias en la vista previa
await cp(join(root, 'apps/admin/dist'), join(out, 'admin'), { recursive: true });

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) yield* walk(p);
    else yield p;
  }
}

/** «/proyectos/x?y#z» → «<raíz>proyectos/x/index.html#z» */
function mapPath(rawPath, rootRel) {
  const path = rawPath.replace(/&#38;|&amp;/g, '&');
  const [, pathname = '', , hash = ''] = path.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/) ?? [];
  if (/\.[a-z0-9]+$/i.test(pathname)) return rootRel + pathname.slice(1) + hash;
  const clean = pathname.replace(/^\/|\/$/g, '');
  return `${rootRel}${clean ? `${clean}/` : ''}index.html${hash}`;
}

const isRootPage = (file) => relative(out, file) === 'index.html';

for await (const file of walk(out)) {
  if (file.includes(`${sep}admin${sep}`)) continue;
  if (file.endsWith('.css')) {
    const css = await readFile(file, 'utf8');
    await writeFile(file, css.replace(/url\(\/_astro\//g, 'url(./'));
    continue;
  }
  if (!file.endsWith('.html')) continue;
  const depth = relative(out, dirname(file)).split(sep).filter(Boolean).length;
  const rootRel = depth ? '../'.repeat(depth) : './';
  let html = await readFile(file, 'utf8');

  // Atributos con rutas absolutas internas (excluye «//» de protocolo relativo).
  html = html.replace(
    /(\s(?:href|src|component-url|renderer-url|before-hydration-url))="(\/(?!\/)[^"]*)"/g,
    (_, attr, p) => `${attr}="${mapPath(p, rootRel)}"`,
  );
  // Rutas de medios dentro de las props serializadas de las islas.
  html = html.replace(/(&quot;)\/(media|_astro)\//g, `$1${rootRel}$2/`);
  // Enlaces generados por las islas en tiempo de ejecución.
  html = html.replace(
    '</head>',
    `<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="/"]');if(!a)return;e.preventDefault();var m=a.getAttribute('href').match(/^([^?#]*)(\\?[^#]*)?(#.*)?$/),p=m[1].replace(/^\\/|\\/$/g,'');location.href=${JSON.stringify(rootRel)}+(p?p+'/':'')+'index.html'+(m[3]||'');});</script></head>`,
  );

  // Acceso al panel desde la vista previa.
  html = html.replace(
    /<\/body>/,
    `<a href="${rootRel}admin/index.html" style="position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:45;background:var(--ink);color:var(--paper);border:1px solid var(--line);border-radius:999px;padding:10px 16px;font:600 14px/1 var(--font-sans);box-shadow:0 6px 20px rgb(0 0 0/.18)">Ver panel de gestión →</a></body>`,
  );

  if (isRootPage(file)) {
    // La página principal del artifact se envuelve en su propio esqueleto al publicarse.
    html = html
      .replace(/<!DOCTYPE html>/i, '')
      .replace(/<html[^>]*>/, '')
      .replace('</html>', '')
      .replace(/<\/?head>/g, '')
      .replace(/<body([^>]*)>/, '<div$1>')
      .replace('</body>', '</div>')
      .replace(/<title>[^<]*<\/title>/, '<title>Kreatya Labs</title>');
  }
  await writeFile(file, html);
}

await mkdir(out, { recursive: true });
const count = [];
for await (const f of walk(out)) count.push(f);
console.log(`Vista previa lista en ${relative(root, out)} (${count.length} ficheros)`);
