import { siteConfig } from '@kreatya/shared/site.config';

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Divide un titular en líneas de ~26 caracteres. */
function wrap(text: string, max = 26): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
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
  <defs><pattern id="g" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#8FB4E0" stroke-opacity=".12"/></pattern>
  <pattern id="G" width="150" height="150" patternUnits="userSpaceOnUse"><path d="M150 0H0V150" fill="none" stroke="#8FB4E0" stroke-opacity=".22"/></pattern></defs>
  <rect width="1200" height="630" fill="#14213D"/><rect width="1200" height="630" fill="url(#g)"/><rect width="1200" height="630" fill="url(#G)"/>
  <path d="M80 70h1040M80 62v16M1120 62v16" stroke="#8FB4E0" stroke-width="2"/>
  <text x="80" y="128" font-family="DejaVu Sans Mono, monospace" font-size="24" letter-spacing="4" fill="#8FB4E0">${esc(eyebrow.toUpperCase())}</text>
  ${lines.map((l, i) => `<text x="80" y="${230 + i * 84}" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="70" fill="#F7F5F0">${esc(l)}</text>`).join('')}
  <rect x="80" y="520" width="56" height="56" rx="10" fill="none" stroke="#F7F5F0" stroke-width="4"/>
  <path d="M98 534v28M98 548l16-14M103 544l14 18" stroke="#F7F5F0" stroke-width="4.5" fill="none" stroke-linecap="round"/><circle cx="120" cy="537" r="5" fill="#FF6B2C"/>
  <text x="156" y="560" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="30" fill="#F7F5F0">${esc(siteConfig.name)}</text>
  <rect x="860" y="520" width="260" height="56" rx="8" fill="#FF6B2C"/><text x="990" y="556" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-weight="700" font-size="22" fill="#14213D">${esc(siteConfig.domains.web)}</text>
</svg>`;
}
