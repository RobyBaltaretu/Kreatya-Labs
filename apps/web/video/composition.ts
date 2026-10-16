/**
 * «A medida» — película del hero (12 s, 1280×720) compuesta con Motion.
 * La línea de tiempo se crea en pausa y el renderizador la recorre con window.__seek(t)
 * para capturar cada fotograma de forma determinista (scripts/render-hero-video.mjs).
 *
 * Guion
 *  0.0–3.2  El caos: Excel, correos y WhatsApp sueltos; cuentan las horas perdidas.
 *  3.2–5.0  La cinta métrica cruza la escena y alinea las piezas: medimos el proceso real.
 *  5.0–8.6  Las piezas se convierten en una aplicación a medida; el copiloto trabaja.
 *  8.6–12   Cierre de marca: «Hecho a tu medida.»
 */
import { animate, stagger } from 'motion';

const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector(s) as unknown as T;
const $$ = (s: string) => [...document.querySelectorAll<HTMLElement>(s)];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];
export const DURATION = 12;

const cards = $$('.pieza');
const rows = $$('.fila');
const sidebar = $$('.lateral li');

// Posiciones del caos (px desde el centro) y rotaciones.
const caos = [
  [-420, -150, -7],
  [-40, -200, 4],
  [360, -130, -3],
  [-360, 90, 5],
  [60, 40, -5],
  [400, 120, 6],
  [-110, 220, 3],
];
// Posiciones alineadas sobre la cinta.
const alineado = cards.map((_, i) => [-525 + i * 175, -40, 0]);

const seq: Parameters<typeof animate>[0] = [
  // 1 · El caos
  [$('.reloj'), { opacity: [0, 1] }, { at: 0, duration: 0.4 }],
  ...(cards.map((c, i) => [
    c,
    {
      opacity: [0, 1],
      x: [caos[i]![0], caos[i]![0]],
      y: [caos[i]![1]! + 24, caos[i]![1]],
      rotate: [caos[i]![2]! * 2, caos[i]![2]],
      scale: [0.94, 1],
    },
    { at: 0.3 + i * 0.22, duration: 0.55, ease: EASE_OUT },
  ]) as never[]),
  [$('.contador'), { opacity: [0, 1], y: [10, 0] }, { at: 0.6, duration: 0.5, ease: EASE_OUT }],
  // temblor del caos
  ...(cards.map((c, i) => [
    c,
    { x: caos[i]![0]! + (i % 2 ? 7 : -7), rotate: caos[i]![2]! * -0.6 },
    { at: 2.2, duration: 0.6, ease: 'easeInOut' },
  ]) as never[]),

  // 2 · La cinta mide
  [
    $('.cinta'),
    { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] },
    { at: 3.1, duration: 0.9, ease: EASE_OUT },
  ],
  ...(cards.map((c, i) => [
    c,
    { x: alineado[i]![0], y: -100, rotate: 0, scale: 0.66 },
    { at: 3.5 + i * 0.05, duration: 0.8, ease: EASE_IN_OUT },
  ]) as never[]),
  [
    $('.rotulo-medida'),
    { opacity: [0, 1], y: [12, 0] },
    { at: 3.9, duration: 0.5, ease: EASE_OUT },
  ],
  [$('.contador'), { opacity: 0 }, { at: 4.4, duration: 0.3 }],
  [$('.reloj'), { opacity: 0 }, { at: 4.4, duration: 0.3 }],

  // 3 · La aplicación a medida
  [
    cards,
    { opacity: 0, y: -40, scale: 0.8 },
    { at: 5.0, duration: 0.45, ease: EASE_OUT, delay: stagger(0.03) },
  ],
  [$('.rotulo-medida'), { opacity: 0 }, { at: 5.0, duration: 0.3 }],
  [$('.cinta'), { y: [0, 322] }, { at: 5.0, duration: 0.8, ease: EASE_IN_OUT }],
  [
    $('.app'),
    { clipPath: ['inset(100% 0 0 0 round 18px)', 'inset(0% 0 0 0 round 18px)'] },
    { at: 5.15, duration: 0.85, ease: EASE_IN_OUT },
  ],
  [
    sidebar,
    { opacity: [0, 1], x: [-10, 0] },
    { at: 5.8, duration: 0.35, ease: EASE_OUT, delay: stagger(0.06) },
  ],
  [
    $$('.kpi'),
    { opacity: [0, 1], y: [14, 0] },
    { at: 6.0, duration: 0.45, ease: EASE_OUT, delay: stagger(0.08) },
  ],
  [
    rows,
    { opacity: [0, 1], y: [10, 0] },
    { at: 6.4, duration: 0.4, ease: EASE_OUT, delay: stagger(0.09) },
  ],
  [
    $$('.estado'),
    { backgroundColor: ['#E9E9E4', '#DDF3E6'], color: ['#55554F', '#0B7A47'] },
    { at: 7.2, duration: 0.3, delay: stagger(0.18) },
  ],
  [
    $('.copiloto'),
    { opacity: [0, 1], y: [12, 0], scale: [0.96, 1] },
    { at: 7.4, duration: 0.45, ease: EASE_OUT },
  ],

  // 4 · Cierre
  [
    $('.cierre'),
    { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] },
    { at: 8.7, duration: 0.75, ease: EASE_IN_OUT },
  ],
  [
    $$('.cierre-linea'),
    { y: ['110%', '0%'] },
    { at: 9.05, duration: 0.7, ease: EASE_OUT, delay: stagger(0.09) },
  ],
  [$('.cierre-pie'), { opacity: [0, 1] }, { at: 9.8, duration: 0.5 }],
  [$('.cierre-cinta'), { scaleX: [0, 1] }, { at: 9.5, duration: 1.1, ease: EASE_OUT }],
];

const controls = animate(seq as never, { defaultTransition: { ease: EASE_OUT } });
controls.pause();

const contador = $('.contador-valor');
const kpiValor = $('.kpi-valor');
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutExpo = (k: number) => (k === 1 ? 1 : 1 - 2 ** (-10 * k));

/** Lleva la película al instante t (segundos). Los contadores se calculan de forma determinista. */
function seek(t: number) {
  controls.time = Math.min(t, controls.duration);
  contador.textContent = String(Math.round(14 * easeOutExpo(clamp01((t - 0.7) / 2.2))));
  kpiValor.textContent = `−${Math.round(70 * easeOutExpo(clamp01((t - 6.1) / 1.1)))} %`;
}

declare global {
  interface Window {
    __seek: (t: number) => void;
    __ready: boolean;
    __duration: number;
  }
}
window.__seek = seek;
window.__duration = DURATION;
document.fonts.ready.then(() => {
  seek(0);
  window.__ready = true;
});
