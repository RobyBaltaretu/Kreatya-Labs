/**
 * Campo de ámbar líquido (WebGL 1, sin dependencias).
 * Gotas metaball con borde orgánico (fbm), normales por diferencias finitas,
 * luz difusa + especular desde arriba a la izquierda y fresnel suave.
 * - Media resolución, pausa fuera de pantalla y en pestañas ocultas.
 * - Con prefers-reduced-motion pinta un único fotograma.
 * - Sin WebGL o con WebGL por software, el canvas queda oculto y se ve el degradado CSS de respaldo.
 * - Arranca cuando el navegador queda libre tras la carga, para no competir con el LCP.
 */
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBg;
uniform vec2 uBias;
uniform float uMask;
uniform float uSize;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
float campo(vec2 p,float t){
  float asp=uRes.x/uRes.y;float f=0.;
  for(int i=0;i<6;i++){float fi=float(i);
    vec2 c=vec2(uBias.x+.17*sin(t*.13*(1.+fi*.17)+fi*1.7),uBias.y+.24*cos(t*.1*(1.+fi*.13)+fi*2.3));
    c.x*=asp;
    float r=(.085+.03*sin(fi*3.1+t*.23))*uSize;
    f+=r*r/(dot(p-c,p-c)+1e-4);
  }
  return f+(fbm(p*2.+vec2(t*.04,-t*.03))-.5)*.3;
}
// Altura del líquido: se aplana por dentro (charco), el relieve vive en el borde.
float alt(float f){return 1.7-log(1.+exp(-(f-1.7)*5.))/5.;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;vec2 p=uv;p.x*=uRes.x/uRes.y;
  float t=uTime;float f=campo(p,t);
  float e=.003;
  float a0=alt(f);float fx=alt(campo(p+vec2(e,0.),t))-a0;float fy=alt(campo(p+vec2(0.,e),t))-a0;
  vec3 n=normalize(vec3(-fx/e*.045,-fy/e*.045,1.));
  float m=smoothstep(.97,1.03,f);
  // El texto vive a la izquierda (y abajo): ahí el ámbar se desvanece.
  float zona=smoothstep(uMask,uMask+.16,uv.x)*smoothstep(.0,.14,uv.y);
  m*=zona;
  vec3 L=normalize(vec3(-.5,.7,.8));
  float dif=clamp(dot(n,L),0.,1.);
  vec3 h=normalize(L+vec3(0.,0.,1.));
  float spe=pow(clamp(dot(n,h),0.,1.),90.);
  float brillo=pow(clamp(dot(n,h),0.,1.),12.)*.22;
  float prof=smoothstep(1.,1.65,a0);
  vec3 c1=vec3(1.,.86,.42),c2=vec3(1.,.68,.14),c3=vec3(.97,.48,.06);
  vec3 col=mix(c1,c2,prof);
  col=mix(col,c3,(1.-n.z)*.5);
  col*=.82+.26*dif;
  col+=spe*1.1+brillo;
  float fr=pow(1.-n.z,1.6);
  col=mix(col,vec3(1.,.95,.82),fr*.35);
  vec3 o=mix(uBg,col,m);
  o=mix(o,mix(uBg,c1,.35),smoothstep(.55,.97,f)*(1.-m)*.45*zona);
  gl_FragColor=vec4(o,1.);
}`;

type Opciones = { bias?: [number, number]; mascara?: number; fondo?: string; tamano?: number };

export function initLiquidField(canvas: HTMLCanvasElement, opts: Opciones = {}) {
  const libre = () =>
    'requestIdleCallback' in window
      ? requestIdleCallback(() => arrancar(canvas, opts), { timeout: 2000 })
      : setTimeout(() => arrancar(canvas, opts), 300);
  if (document.readyState === 'complete') libre();
  else addEventListener('load', libre, { once: true });
}

function arrancar(canvas: HTMLCanvasElement, opts: Opciones) {
  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
  });
  if (!gl) return;
  // Con WebGL por software (sin GPU) cada fotograma bloquea el hilo principal: se queda el respaldo CSS.
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL, no es un hook de React.
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uBg = gl.getUniformLocation(prog, 'uBg');
  const uBias = gl.getUniformLocation(prog, 'uBias');
  gl.uniform2f(uBias, ...(opts.bias ?? [0.7, 0.45]));
  gl.uniform1f(gl.getUniformLocation(prog, 'uMask'), opts.mascara ?? -1);
  gl.uniform1f(gl.getUniformLocation(prog, 'uSize'), opts.tamano ?? 1);

  const fondo = () => {
    const rgb =
      opts.fondo ??
      (getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#f5f5f7');
    const h = rgb.replace('#', '');
    gl.uniform3f(
      uBg,
      Number.parseInt(h.slice(0, 2), 16) / 255,
      Number.parseInt(h.slice(2, 4), 16) / 255,
      Number.parseInt(h.slice(4, 6), 16) / 255,
    );
  };
  const escala = 0.5;
  const medir = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * escala));
    const h = Math.max(1, Math.round(canvas.clientHeight * escala));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
  };
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true;
  let raf = 0;
  const t0 = performance.now() - 18000; // empieza con las gotas ya repartidas
  const pintar = (ahora: number) => {
    medir();
    gl.uniform1f(uTime, (ahora - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    canvas.dataset.listo = '';
    if (!quieto && visible && !document.hidden) raf = requestAnimationFrame(pintar);
  };
  fondo();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    fondo();
    if (quieto) pintar(performance.now());
  });
  new ResizeObserver(() => quieto && pintar(performance.now())).observe(canvas);
  new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) raf = requestAnimationFrame(pintar);
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && visible) raf = requestAnimationFrame(pintar);
  });
  raf = requestAnimationFrame(pintar);
}
