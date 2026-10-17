# Diseño — «Líquido»

Sustituye a «A medida» (cinta métrica amarilla) a petición del cliente: quería un estilo líquido,
en la línea de Apple. La idea de marca se lleva al material: **un líquido toma la forma de su
recipiente; nuestro software toma la forma de tu negocio.**

## Modo y escena
- Web pública: **Persuade**. Panel: **Operate** (hereda tokens, sin rediseño).
- Escena: gerente en su despacho, de día → tema claro; el oscuro es un negro casi puro (#0a0a0b).

## Material
- **Ámbar líquido** (`--signal #FFB21A`, degradado `#FFD66B → #FFB21A → #F08A0C`): el único color.
  Vive en el campo WebGL del hero y del cierre (`lib/liquid-field.ts`: metaballs con borde orgánico,
  normales, luz desde arriba a la izquierda, especular y fresnel), en el tubo del método y en el isotipo.
- **Vidrio líquido** solo en la capa de navegación y controles (como en Apple HIG): barra flotante,
  botones `.btn-glass`, marco del dispositivo del hero, banner de cookies. `@kreatya/ui/liquid-glass`
  añade refracción física (Snell sobre un perfil squircle, `feDisplacementMap`) en Chromium; el resto
  de navegadores usa desenfoque + saturación + brillos internos. `prefers-reduced-transparency` → opaco.
- Grises de Apple: `--ink #1D1D1F`, `--paper #F5F5F7`, `--fg-muted #636366`, `--line #D2D2D7`.
  `--mark #B4450A` (ámbar tostado) solo para plazos; `--positive #177540` para métricas.

## Tipografía
- **Funnel Display** (titulares, peso 600–620, tracking −0,035 a −0,045 em) + **Funnel Sans** (texto).
  Autoalojadas con Fontsource; se precarga el latín de Funnel Display.
- Sin antetítulos; sin monoespaciada.

## Forma
- Radios generosos: tarjetas 24–28 px, botones y chips en píldora, dispositivo 32 px.
- Superficies sin bordes duros: anillo de 1 px + sombra larga y suave.

## Firma
- **El titular aparece palabra a palabra** desde un desenfoque (Motion), como algo que se condensa.
- **El dispositivo** del hero tiene marco de vidrio que refracta el ámbar; con el scroll crece levemente.
- **El tubo del método** se llena de ámbar hasta la semana 6 al entrar en pantalla.
- **La película** (`apps/web/video`, 12 s, Motion → MP4/WebM con `node scripts/render-hero-video.mjs`):
  piezas sueltas → el ámbar llena un tubo y las ordena → el líquido toma la forma de la aplicación →
  «Software que toma la forma de tu negocio.»

## Movimiento (Emil Kowalski)
- Curvas `cubic-bezier(0.23, 1, 0.32, 1)` / `(0.77, 0, 0.175, 1)`; nunca rebote.
- Interfaz < 300 ms; pulsación `scale(0.97)`; hover y brillo que sigue al puntero solo con puntero fino.
- El campo WebGL arranca cuando el navegador queda libre, va a media resolución, se pausa fuera de
  pantalla y no se usa con WebGL por software (queda un degradado CSS). Con reduced motion: un fotograma.
- La película se detiene fuera de pantalla, tiene botón de pausa y no se reproduce con reduced motion.
- Todo es visible sin JS: las animaciones parten de un estado legible y tienen un respaldo CSS a los 2,4 s.
