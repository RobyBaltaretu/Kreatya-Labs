export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]!);
  const cell = (v: unknown) => {
    const s =
      v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
    // Evita inyección de fórmulas al abrir en Excel.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n;]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => cell(r[h])).join(','))].join(
    '\n',
  );
}
