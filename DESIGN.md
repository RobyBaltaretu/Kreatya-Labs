# Diseño — «A medida»

Sustituye al mundo «El plano de tu negocio» a petición del cliente (lo veía genérico).
La expresión española «a medida» se toma al pie de la letra: el mundo del sastre y de la cinta métrica.

## Modo y escena
- Web pública: **Persuade**. Panel: **Operate** (hereda tokens, sin rediseño).
- Escena: gerente en su despacho, de día → tema claro; el oscuro es un negro de imprenta con el mismo amarillo.

## Color (estrategia comprometida)
- `--signal #FFCC00` amarillo de cinta métrica: campo a sangre en el hero y en el cierre, cinta del método, CTA.
- `--ink #151515` negro de imprenta (texto, superficies oscuras, CTA sobre amarillo).
- `--mark #C8231B` rojo de las marcas de 10 cm: solo para medidas y plazos.
- `--paper #F2F2EF` papel neutro (no crema) · `--success #0B7A47` métricas de impacto.
- Contextos `.sobre-amarillo` y `.sobre-tinta` reasignan los tokens para mantener el contraste.

## Tipografía
- Una superfamilia: **Archivo** (Omnibus-Type), eje de anchura 62–125 %.
- Titulares a 74 % de anchura, peso 720–760, interlineado 0,86–0,98: la voz condensada de una cinta métrica.
- Texto a 100 %, 17 px, medida 62–70 ch. Datos y plazos con `.medida` (80 %, cifras tabulares).
- Sin antetítulos; sin monoespaciada.

## Firma
- **El titular se entalla**: al cargar, cada línea pasa de 104 % a 74 % de anchura con Motion, como una prenda que se ajusta.
- **La cinta**: se desenrolla bajo el hero y marca «6 semanas · primer módulo en uso»; el método se dibuja sobre otra cinta con sus semanas reales.
- **La película** (`apps/web/video`): 12 s compuestos con Motion y renderizados a MP4/WebM (`node scripts/render-hero-video.mjs`).

## Movimiento (Emil Kowalski)
- Curvas `cubic-bezier(0.23, 1, 0.32, 1)` / `(0.77, 0, 0.175, 1)`; nunca ease-in ni rebote.
- Interfaz < 300 ms; pulsación `scale(0.97)`; hover solo con puntero fino.
- La película se detiene fuera de pantalla, tiene botón de pausa y no se reproduce con reduced motion.
- Todo es visible sin JS: las animaciones parten de un estado legible y tienen un respaldo CSS a los 2,6 s.
