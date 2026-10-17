import { siteConfig } from '@kreatya/shared/site.config';

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Divide un titular en líneas de ~26 caracteres. */
function wrap(text: string, max = 26): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (`${cur} ${w}`.trim().length > max) {
      lines.push(cur.trim());
      cur = w;
    } else cur += ` ${w}`;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines.slice(0, 4);
}

/** Imagen Open Graph 1200×630 generada por página (SVG → PNG con sharp en build). */
export function ogSvg(title: string, eyebrow: string) {
  const lines = wrap(title.replace(` | ${siteConfig.name}`, ''));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="a" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#ffd66b"/><stop offset=".55" stop-color="#ff9d14"/><stop offset="1" stop-color="#b4450a"/></radialGradient>
    <filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
    <linearGradient id="l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd25a"/><stop offset="1" stop-color="#f08a0c"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#1d1d1f"/>
  <g filter="url(#b)" opacity=".9"><circle cx="1060" cy="560" r="230" fill="url(#a)"/><circle cx="860" cy="660" r="140" fill="url(#a)"/><circle cx="1150" cy="170" r="90" fill="url(#a)"/></g>
  <text x="80" y="128" font-family="DejaVu Sans, sans-serif" font-size="26" fill="#ffb35c">${esc(eyebrow)}</text>
  ${lines.map((l, i) => `<text x="80" y="${230 + i * 84}" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="70" letter-spacing="-2" fill="#f5f5f7">${esc(l)}</text>`).join('')}
  <g transform="translate(80 520) scale(1.75)"><rect x="1" y="1" width="30" height="30" rx="9" fill="#2c2c2e"/><path d="M1 19c6-3.2 11.5 2.6 17.5-.4S27 15 31 16.6V22a9 9 0 0 1-9 9H10a9 9 0 0 1-9-9z" fill="url(#l)"/><path d="M11 8.5v15M11 16.5 19.5 8.5M14.2 13.6 21 23.5" fill="none" stroke="#f5f5f7" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>
  <text x="156" y="560" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="30" fill="#f5f5f7">${esc(siteConfig.name)}</text>
  <text x="156" y="590" font-family="DejaVu Sans, sans-serif" font-size="20" fill="#a1a1a6">${esc(siteConfig.domains.web)}</text>
</svg>`;
}
