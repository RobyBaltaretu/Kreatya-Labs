# Diseño — «El plano de tu negocio»

Mundo fijado por la hipótesis de solución (sección 4). Este documento recoge cómo se ejecuta.

## Modo y escena
- Web pública: **Persuade**. Panel: **Operate**.
- Escena: gerente en su despacho, de día → tema claro por defecto. El modo oscuro reproduce la cianotipia (fondo azul tinta, líneas claras), no una inversión mecánica.

## Color (estrategia: comprometida en el plano, contenida en la lectura)
- `--ink #14213D` texto y líneas · `--paper #F7F5F0` papel · `--signal #FF6B2C` solo acción · `--blueprint #3A6EA5` retícula y diagramas · `--success #2E9E6A` métricas de impacto.
- El azul tinta es material, no acento: el hero es una lámina de cianotipia a sangre y el cierre vuelve a ella.
- La retícula solo aparece donde hay un plano debajo (hero y lámina del diagnóstico). Nunca como textura de sección.
- El naranja señal se reserva al CTA principal y al foco del plano; nunca decora.

## Tipografía
- Titulares: Space Grotesk (fijada por el brief; General Sans es la alternativa aprobada si se dispone de los ficheros). Peso 600, tracking −0,03 em, escala fluida con `clamp()`, máximo 6 rem.
- Texto: Inter, 17 px, medida 62–70 ch.
- Datos y cotas: JetBrains Mono, solo para medidas, plazos, cifras tabulares y el cajetín. Nunca como «disfraz técnico» de etiquetas.
- Sin antetítulos sobre los encabezados: el titular se sostiene solo.

## Composición
- Más espacio sobre un encabezado que debajo. Escala de espaciado base 4.
- Sin rejillas de tarjetas idénticas: los pilares son filas editoriales; los dolores, un selector; los testimonios, una cita protagonista.
- Las tarjetas-ficha imitan una ficha de obra con cajetín (sector, plazo, empresa). Elevación declarada una sola vez: borde, y sombra suave solo en hover.
- Iconos dibujados en SVG con un solo trazo de 1,5 px (componente `Icon`); nunca glifos Unicode.

## Movimiento (principios de Emil Kowalski)
- Momento de autor único: el plano del proceso se traza y se convierte en la interfaz terminada (≈ 1,8 s, una vez).
- Curvas: `--ease-out cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out cubic-bezier(0.77, 0, 0.175, 1)`. Nunca `ease-in` ni rebotes.
- Interfaz < 300 ms; salidas más rápidas que entradas; pulsación `scale(0.97)` en 120 ms.
- Hover solo con `(hover: hover) and (pointer: fine)`. Transiciones en vez de keyframes en lo interactivo. Nada animado en acciones de teclado ni en filtros.
- `prefers-reduced-motion`: sin desplazamientos; se conservan opacidad y color.

## Superficies del navegador
Selección en naranja señal, cursor de texto en azul plano, scrollbars y `accent-color` de la paleta, cifras tabulares en datos, subrayado con `text-underline-offset`.
