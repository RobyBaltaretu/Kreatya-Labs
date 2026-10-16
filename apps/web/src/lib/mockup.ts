/**
 * Genera capturas ilustrativas (SVG) de cada solución mientras no haya capturas reales.
 * Estilo «plano»: misma paleta que la web. Determinista a partir del nombre del fichero.
 */
type Kind = 'desktop' | 'tablet' | 'mobile' | 'cover';

const hash = (s: string) =>
  [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7) >>> 0;
const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function mockupSvg(opts: {
  kind: Kind;
  title: string;
  screen: string;
  metric?: string;
  seed: string;
}) {
  const { kind, title, screen, metric, seed } = opts;
  const h = hash(seed);
  const [W, H] =
    kind === 'mobile'
      ? [390, 844]
      : kind === 'tablet'
        ? [1024, 768]
        : kind === 'cover'
          ? [1280, 720]
          : [1440, 900];
  const ink = '#151515',
    paper = '#F2F2EF',
    blue = '#55554F',
    signal = '#FFCC00',
    green = '#0B7A47',
    line = '#D4D4CD';
  const grid = `<defs><pattern id="g${h}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${ink}" stroke-opacity=".05"/></pattern></defs>`;

  if (kind === 'mobile') {
    const rows = Array.from({ length: 6 }, (_, i) => {
      const y = 250 + i * 86;
      const done = (h >>> i) & 1;
      return `<rect x="24" y="${y}" width="342" height="72" rx="10" fill="#fff" stroke="${line}"/><rect x="40" y="${y + 18}" width="${120 + ((h >>> (i + 2)) % 90)}" height="12" rx="6" fill="${ink}" fill-opacity=".8"/><rect x="40" y="${y + 42}" width="140" height="9" rx="4.5" fill="${ink}" fill-opacity=".3"/><rect x="${done ? 268 : 280}" y="${y + 24}" width="${done ? 82 : 70}" height="24" rx="12" fill="${done ? green : signal}" fill-opacity=".2"/><text x="${done ? 309 : 315}" y="${y + 40}" font-family="sans-serif" font-size="12" text-anchor="middle" fill="${ink}">${done ? 'Hecho' : 'Pendiente'}</text>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${grid}<rect width="${W}" height="${H}" fill="${paper}"/><rect width="${W}" height="${H}" fill="url(#g${h})"/><rect width="${W}" height="120" fill="${ink}"/><text x="24" y="70" font-family="sans-serif" font-size="15" fill="${paper}" fill-opacity=".7">${esc(screen)}</text><text x="24" y="98" font-family="sans-serif" font-weight="700" font-size="22" fill="${paper}">${esc(title.slice(0, 26))}</text><rect x="24" y="144" width="342" height="84" rx="12" fill="#fff" stroke="${line}"/><text x="40" y="176" font-family="monospace" font-size="12" fill="${blue}" letter-spacing="1">HOY</text><text x="40" y="210" font-family="sans-serif" font-weight="700" font-size="26" fill="${green}">${esc(metric ?? '8 de 12')}</text>${rows}<rect x="24" y="772" width="342" height="52" rx="12" fill="${signal}"/><text x="195" y="804" font-family="sans-serif" font-weight="700" font-size="17" text-anchor="middle" fill="${ink}">Firmar y cerrar</text></svg>`;
  }

  const side = kind === 'tablet' ? 0 : 220;
  const top = 64;
  const kpiW = (W - side - 48 - 32) / 3;
  const kpis = [0, 1, 2]
    .map((i) => {
      const x = side + 24 + i * (kpiW + 16);
      const v = i === 0 && metric ? metric : `${((h >>> (i * 3)) % 90) + 10}${i === 1 ? ' h' : ''}`;
      return `<rect x="${x}" y="${top + 72}" width="${kpiW}" height="110" rx="8" fill="#fff" stroke="${line}"/><text x="${x + 20}" y="${top + 104}" font-family="monospace" font-size="13" letter-spacing="1.5" fill="${blue}">${['IMPACTO', 'AHORRO/SEM', 'ACTIVOS'][i]}</text><text x="${x + 20}" y="${top + 152}" font-family="sans-serif" font-weight="700" font-size="36" fill="${i === 0 ? green : ink}">${esc(v)}</text>`;
    })
    .join('');
  const chartY = top + 206;
  const chartH = H - chartY - 260 > 120 ? H - chartY - 260 : 160;
  const cw = (W - side - 48) * 0.58;
  const bars = Array.from({ length: 12 }, (_, i) => {
    const bh = 20 + ((h >>> (i % 16)) % (chartH - 50));
    const bw = cw / 12 - 10;
    return `<rect x="${side + 44 + i * (cw / 12)}" y="${chartY + chartH - 16 - bh}" width="${bw}" height="${bh}" rx="3" fill="${i === 11 ? signal : blue}" fill-opacity="${i === 11 ? 1 : 0.55}"/>`;
  }).join('');
  const listX = side + 24 + cw + 16;
  const listW = W - listX - 24;
  const list = Array.from(
    { length: 5 },
    (_, i) =>
      `<rect x="${listX + 16}" y="${chartY + 52 + i * 36}" width="${listW - 120}" height="10" rx="5" fill="${ink}" fill-opacity="${0.75 - i * 0.1}"/><circle cx="${listX + listW - 32}" cy="${chartY + 57 + i * 36}" r="7" fill="${(h >>> i) & 1 ? green : signal}"/>`,
  ).join('');
  const tableY = chartY + chartH + 16;
  const table = Array.from(
    { length: Math.max(3, Math.floor((H - tableY - 40) / 44)) },
    (_, i) =>
      `<rect x="${side + 24}" y="${tableY + 44 + i * 44}" width="${W - side - 48}" height="44" fill="${i % 2 ? paper : '#fff'}"/><rect x="${side + 44}" y="${tableY + 61 + i * 44}" width="70" height="10" rx="5" fill="${ink}" fill-opacity=".6"/><rect x="${side + 160}" y="${tableY + 61 + i * 44}" width="${160 + ((h >>> i) % 120)}" height="10" rx="5" fill="${ink}" fill-opacity=".35"/><rect x="${W - 200}" y="${tableY + 56 + i * 44}" width="96" height="20" rx="10" fill="${(h >>> (i + 3)) & 1 ? green : signal}" fill-opacity=".2"/>`,
  ).join('');
  const sidebar = side
    ? `<rect x="0" y="${top}" width="${side}" height="${H - top}" fill="${paper}" stroke="${line}"/>${['Panel', 'Pedidos', 'Clientes', 'Documentos', 'Informes', 'Ajustes'].map((t, i) => `${i === 1 ? `<rect x="16" y="${top + 20 + i * 48}" width="${side - 32}" height="38" rx="6" fill="${signal}"/>` : ''}<text x="32" y="${top + 45 + i * 48}" font-family="sans-serif" font-size="16" font-weight="${i === 1 ? 700 : 400}" fill="${ink}" fill-opacity="${i === 1 ? 1 : 0.7}">${t}</text>`).join('')}`
    : '';
  const copilot =
    kind === 'cover'
      ? `<g transform="translate(${W - 420} ${H - 118})"><rect width="380" height="78" rx="12" fill="${ink}"/><circle cx="34" cy="39" r="13" fill="${signal}"/><text x="62" y="34" font-family="sans-serif" font-weight="700" font-size="17" fill="${paper}">Copiloto</text><text x="62" y="58" font-family="sans-serif" font-size="15" fill="#C9D3E4">Tarea repetitiva resuelta · revisa y confirma</text></g>`
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${grid}<rect width="${W}" height="${H}" fill="${paper}"/><rect width="${W}" height="${H}" fill="url(#g${h})"/><rect width="${W}" height="${top}" fill="${ink}"/><circle cx="28" cy="32" r="7" fill="${signal}"/><circle cx="50" cy="32" r="7" fill="${paper}" fill-opacity=".4"/><circle cx="72" cy="32" r="7" fill="${paper}" fill-opacity=".4"/><text x="${W / 2}" y="38" text-anchor="middle" font-family="monospace" font-size="15" fill="${paper}" fill-opacity=".85">${esc(screen)}</text>${sidebar}<text x="${side + 24}" y="${top + 48}" font-family="sans-serif" font-weight="700" font-size="26" fill="${ink}">${esc(title.slice(0, 60))}</text>${kpis}<rect x="${side + 24}" y="${chartY}" width="${cw}" height="${chartH}" rx="8" fill="#fff" stroke="${line}"/>${bars}<rect x="${listX}" y="${chartY}" width="${listW}" height="${chartH}" rx="8" fill="#fff" stroke="${line}"/><text x="${listX + 16}" y="${chartY + 30}" font-family="monospace" font-size="13" letter-spacing="1.5" fill="${blue}">ACTIVIDAD</text>${list}<rect x="${side + 24}" y="${tableY}" width="${W - side - 48}" height="44" fill="${ink}" fill-opacity=".06"/>${table}${copilot}</svg>`;
}
