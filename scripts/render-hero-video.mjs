#!/usr/bin/env node
/**
 * Renderiza la película del hero (apps/web/video) a vídeo real:
 *   1. Empaqueta composition.ts (Motion) con esbuild y lo incrusta en la plantilla.
 *   2. Abre la página en Chromium y recorre la línea de tiempo con window.__seek(t),
 *      capturando cada fotograma (30 fps, determinista).
 *   3. Codifica con ffmpeg: MP4 H.264 + WebM VP9 + póster AVIF/JPG.
 *
 * Uso: node scripts/render-hero-video.mjs   (FFMPEG=/ruta/ffmpeg opcional)
 * Requiere un ffmpeg con libx264 y libvpx-vp9 (p. ej. `pip install imageio-ffmpeg`).
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { build } from 'esbuild';

const root = new URL('..', import.meta.url).pathname;
const src = join(root, 'apps/web/video');
const out = join(root, 'apps/web/public/video');
const frames = join(root, '.video-frames');
const FPS = 30;

const require = createRequire(import.meta.url);
const ffmpeg =
  process.env.FFMPEG ??
  (() => {
    try {
      return execFileSync('python3', [
        '-c',
        'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())',
      ])
        .toString()
        .trim();
    } catch {
      return 'ffmpeg';
    }
  })();

const bundle = await build({
  entryPoints: [join(src, 'composition.ts')],
  bundle: true,
  write: false,
  format: 'iife',
  minify: true,
  target: 'chrome120',
});
const fuente = (pkg, file) =>
  require.resolve(`@fontsource-variable/${pkg}/files/${file}`, {
    paths: [join(root, 'packages/ui')],
  });
const html = (await readFile(join(src, 'index.html'), 'utf8'))
  .replace(
    '__FONT_DISPLAY__',
    `file://${fuente('funnel-display', 'funnel-display-latin-wght-normal.woff2')}`,
  )
  .replace(
    '__FONT_SANS__',
    `file://${fuente('funnel-sans', 'funnel-sans-latin-wght-normal.woff2')}`,
  )
  .replace('__SCRIPT__', () => bundle.outputFiles[0].text);
await rm(frames, { recursive: true, force: true });
await mkdir(frames, { recursive: true });
const page$ = join(frames, 'film.html');
await writeFile(page$, html);

const browser = await chromium.launch({
  args: ['--no-sandbox', '--font-render-hinting=none', '--disable-lcd-text'],
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
});
page.on('pageerror', (e) => console.error('[página]', e.message));
await page.goto(`file://${page$}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
const duration = await page.evaluate(() => window.__duration);
const total = Math.round(duration * FPS);
for (let f = 0; f < total; f++) {
  await page.evaluate((t) => window.__seek(t), f / FPS);
  await page.screenshot({ path: join(frames, `${String(f).padStart(4, '0')}.png`) });
  if (f % 60 === 0) process.stdout.write(`fotograma ${f}/${total}\n`);
}
// Póster: el instante en que la aplicación ya está completa.
await page.evaluate((t) => window.__seek(t), 8.2);
await page.screenshot({ path: join(frames, 'poster.png') });
await browser.close();

await mkdir(out, { recursive: true });
const run = (args) =>
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
const input = ['-framerate', String(FPS), '-i', join(frames, '%04d.png')];
run([
  ...input,
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  '24',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  '-an',
  join(out, 'a-medida.mp4'),
]);
run([
  ...input,
  '-c:v',
  'libvpx-vp9',
  '-b:v',
  '0',
  '-crf',
  '36',
  '-row-mt',
  '1',
  '-pix_fmt',
  'yuv420p',
  '-an',
  join(out, 'a-medida.webm'),
]);
run(['-i', join(frames, 'poster.png'), '-q:v', '4', join(out, 'a-medida-poster.jpg')]);
run([
  '-i',
  join(frames, 'poster.png'),
  '-c:v',
  'libwebp',
  '-quality',
  '78',
  join(out, 'a-medida-poster.webp'),
]);
await rm(frames, { recursive: true, force: true });
console.log(`Vídeo listo en apps/web/public/video (${total} fotogramas, ${duration} s)`);
