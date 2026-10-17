/**
 * Liquid Glass con refracción física para la web.
 *
 * Basado en el trabajo MIT de Archis Vaze (github.com/archisvaze/liquid-glass): perfil de
 * refracción por ley de Snell sobre una superficie «squircle» convexa, mapa de
 * desplazamiento y mapa especular generados en canvas, aplicados con
 * backdrop-filter: url(#filtro). Solo Chromium soporta filtros SVG en backdrop-filter;
 * el resto de navegadores conserva el vidrio de base de theme.css (.glass).
 *
 * Uso: <div class="glass" data-glass> y luego initLiquidGlass().
 */

interface Opciones {
  grosor: number; // px de vidrio
  bisel: number; // px de borde curvo
  ior: number; // índice de refracción
  desenfoque: number;
  saturacion: number;
  especular: number; // opacidad del brillo
}

const POR_DEFECTO: Opciones = {
  grosor: 70,
  bisel: 22,
  ior: 1.5,
  desenfoque: 1.2,
  saturacion: 5,
  especular: 0.55,
};
const squircle = (x: number) => (1 - (1 - x) ** 4) ** 0.25;

function perfil(o: Opciones, muestras = 96) {
  const eta = 1 / o.ior;
  const p = new Float64Array(muestras);
  for (let i = 0; i < muestras; i++) {
    const x = i / muestras;
    const y = squircle(x);
    const dx = x < 1 ? 1e-4 : -1e-4;
    const d = (squircle(x + dx) - y) / dx;
    const m = Math.hypot(d, 1);
    const nx = -d / m;
    const ny = -1 / m;
    const k = 1 - eta * eta * (1 - ny * ny);
    if (k < 0) continue;
    const s = Math.sqrt(k);
    const rx = -(eta * ny + s) * nx;
    const ry = eta - (eta * ny + s) * ny;
    p[i] = rx * ((y * o.bisel + o.grosor) / ry);
  }
  return p;
}

/** Recorre el borde redondeado del rectángulo y llama a fn con la geometría de cada píxel. */
function bordes(
  w: number,
  h: number,
  r: number,
  bisel: number,
  fn: (i: number, cos: number, sin: number, desdeBorde: number, op: number) => void,
) {
  const rSq = r * r;
  const r1Sq = (r + 1) ** 2;
  const rBSq = Math.max(r - bisel, 0) ** 2;
  const wB = w - r * 2;
  const hB = h - r * 2;
  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;
      const dist = Math.sqrt(dSq);
      if (dist === 0) continue;
      const op = dSq < rSq ? 1 : 1 - (dist - r) / (Math.sqrt(r1Sq) - r);
      if (op <= 0) continue;
      fn((y1 * w + x1) * 4, x / dist, y / dist, r - dist, op);
    }
  }
}

function mapas(w: number, h: number, r: number, o: Opciones) {
  const bisel = Math.max(1, Math.min(o.bisel, r - 1, Math.min(w, h) / 2 - 1));
  const p = perfil({ ...o, bisel });
  const max = Math.max(...Array.from(p, Math.abs)) || 1;
  const lienzo = (pintar: (d: Uint8ClampedArray) => void) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(w, h);
    pintar(img.data);
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  };
  const desplazamiento = lienzo((d) => {
    for (let i = 0; i < d.length; i += 4) {
      d[i] = 128;
      d[i + 1] = 128;
      d[i + 3] = 255;
    }
    bordes(w, h, r, bisel, (i, cos, sin, desde, op) => {
      const v = p[Math.min(((desde / bisel) * p.length) | 0, p.length - 1)] ?? 0;
      d[i] = (128 + ((-cos * v) / max) * 127 * op + 0.5) | 0;
      d[i + 1] = (128 + ((-sin * v) / max) * 127 * op + 0.5) | 0;
    });
  });
  // Luz desde arriba a la izquierda, como en Apple.
  const luz = [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)];
  const especular = lienzo((d) => {
    bordes(w, h, r, bisel * 2.5, (i, cos, sin, desde, op) => {
      const dot = Math.abs(cos * luz[0]! - sin * luz[1]!);
      const borde = Math.sqrt(Math.max(0, 1 - (1 - desde) ** 2));
      const c = dot * borde;
      const col = (255 * c) | 0;
      d[i] = col;
      d[i + 1] = col;
      d[i + 2] = col;
      d[i + 3] = (col * c * op) | 0;
    });
  });
  return { desplazamiento, especular, escala: max };
}

let defs: SVGDefsElement | null = null;
let contador = 0;

function contenedor() {
  if (defs) return defs;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  svg.appendChild(defs);
  document.body.appendChild(svg);
  return defs;
}

function aplicar(el: HTMLElement, o: Opciones) {
  const w = Math.round(el.offsetWidth);
  const h = Math.round(el.offsetHeight);
  if (w < 8 || h < 8) return;
  const r = Math.floor(
    Math.min(Number.parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2),
  );
  const id = el.dataset.glassId ?? `lg-${++contador}`;
  el.dataset.glassId = id;
  const m = mapas(w, h, Math.max(r, 2), o);
  const marcado = `<filter id="${id}" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation="${o.desenfoque}" result="b"/>
    <feImage href="${m.desplazamiento}" x="0" y="0" width="${w}" height="${h}" result="d"/>
    <feDisplacementMap in="b" in2="d" scale="${m.escala}" xChannelSelector="R" yChannelSelector="G" result="r"/>
    <feColorMatrix in="r" type="saturate" values="${o.saturacion}" result="rs"/>
    <feImage href="${m.especular}" x="0" y="0" width="${w}" height="${h}" result="e"/>
    <feComposite in="rs" in2="e" operator="in" result="em"/>
    <feComponentTransfer in="e" result="ef"><feFuncA type="linear" slope="${o.especular}"/></feComponentTransfer>
    <feBlend in="em" in2="r" mode="normal" result="m"/>
    <feBlend in="ef" in2="m" mode="normal"/>
  </filter>`;
  const viejo = contenedor().querySelector(`#${id}`);
  if (viejo) viejo.outerHTML = marcado;
  else contenedor().insertAdjacentHTML('beforeend', marcado);
  el.style.setProperty('--glass-filter', `url(#${id}) blur(${o.desenfoque * 2}px) saturate(160%)`);
  el.setAttribute('data-refraccion', '');
}

/** True en navegadores que aplican filtros SVG dentro de backdrop-filter (Chromium). */
export function soportaRefraccion() {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } })
    .userAgentData?.brands;
  return !!brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand));
}

export function initLiquidGlass(raiz: ParentNode = document, opciones: Partial<Opciones> = {}) {
  if (!soportaRefraccion() || matchMedia('(prefers-reduced-transparency: reduce)').matches) return;
  const o = { ...POR_DEFECTO, ...opciones };
  const els = [...raiz.querySelectorAll<HTMLElement>('[data-glass]:not([data-glass-listo])')];
  const pendientes = new Map<HTMLElement, number>();
  const ro = new ResizeObserver((entradas) => {
    for (const e of entradas) {
      const el = e.target as HTMLElement;
      clearTimeout(pendientes.get(el));
      pendientes.set(
        el,
        window.setTimeout(() => aplicar(el, { ...o, ...leer(el) }), 120),
      );
    }
  });
  for (const el of els) {
    el.dataset.glassListo = '';
    ro.observe(el);
  }
}

function leer(el: HTMLElement): Partial<Opciones> {
  const n = (k: string) => (el.dataset[k] ? Number(el.dataset[k]) : undefined);
  return Object.fromEntries(
    Object.entries({
      grosor: n('glassGrosor'),
      bisel: n('glassBisel'),
      ior: n('glassIor'),
      especular: n('glassEspecular'),
    }).filter(([, v]) => v !== undefined),
  );
}

/** Brillo especular que sigue al puntero en los elementos .glass-luz (solo puntero fino). */
let luz = false;
export function initLuzGlass() {
  if (luz || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  luz = true;
  document.addEventListener(
    'pointermove',
    (e) => {
      const el = (e.target as Element).closest?.<HTMLElement>('.glass-luz');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    },
    { passive: true },
  );
}
