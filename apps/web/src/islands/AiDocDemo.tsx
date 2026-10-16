import { Fragment, useState } from 'react';
import { track } from '../lib/track';

/**
 * Demo de IA documental. Fase 1: documentos de ejemplo con resultados pregrabados
 * (el mismo «fallback» que se usará cuando se agote la cuota de Workers AI).
 * Fase 2: subida propia (PDF/imagen ≤ 5 MB) procesada por Workers AI, sin almacenar ficheros.
 */
const SAMPLES = [
  {
    key: 'factura',
    label: 'Factura',
    doc: [
      'SUMINISTROS LEVANTE S.L. · B12345678',
      'Factura nº F-2026/0412 · 03/10/2026',
      'Tornillería inox M8 ×500 ........ 212,50 €',
      'Brida DN50 ×20 ......................... 318,00 €',
      'Base imponible 530,50 € · IVA 21 % 111,41 €',
      'TOTAL 641,91 € · Vto. 02/11/2026',
    ],
    fields: [
      ['Emisor', 'Suministros Levante S.L.'],
      ['NIF', 'B12345678'],
      ['Nº factura', 'F-2026/0412'],
      ['Fecha', '03/10/2026'],
      ['Base imponible', '530,50 €'],
      ['IVA (21 %)', '111,41 €'],
      ['Total', '641,91 €'],
      ['Vencimiento', '02/11/2026'],
    ],
    note: 'Lista para contabilizar · cuenta 600 sugerida',
  },
  {
    key: 'albaran',
    label: 'Albarán',
    doc: [
      'TRANSPORTES DEL VALLE · Albarán 88213',
      'Origen: Almacén Paterna · Destino: Hnos. Vidal (Gandía)',
      '12 palés · 3.840 kg · Ref. pedido PV-2207',
      'Entregado 14/10/2026 11:42',
      'Firma: J. Vidal · Observ.: 1 palé con film roto',
    ],
    fields: [
      ['Nº albarán', '88213'],
      ['Cliente', 'Hnos. Vidal'],
      ['Pedido', 'PV-2207'],
      ['Bultos', '12 palés · 3.840 kg'],
      ['Entrega', '14/10/2026 11:42'],
      ['Incidencia', '1 palé con film roto'],
    ],
    note: 'Incidencia creada y asignada a calidad',
  },
  {
    key: 'email',
    label: 'Email de cliente',
    doc: [
      'De: compras@talleresnorte.es',
      'Asunto: Urgente pedido semana 43',
      'Hola, necesitamos 200 unidades más de la ref. BR-50 para el jueves.',
      'Si no llegáis, mandad 120 y el resto el lunes.',
      '¿Podéis confirmar precio? Gracias, Marta',
    ],
    fields: [
      ['Intención', 'Nuevo pedido urgente'],
      ['Cliente', 'Talleres Norte'],
      ['Referencia', 'BR-50 × 200 uds'],
      ['Fecha límite', 'Jueves (sem. 43)'],
      ['Alternativa', '120 jueves + 80 lunes'],
      ['Pide', 'Confirmación de precio'],
    ],
    note: 'Borrador de respuesta y pedido preparados para revisar',
  },
] as const;

const MAX_USES = 5;

export default function AiDocDemo() {
  const [sel, setSel] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'reading' | 'done'>('done');
  const [uses, setUses] = useState(0);
  const sample = SAMPLES[sel]!;

  const run = (i: number) => {
    if (uses >= MAX_USES) return;
    setSel(i);
    setPhase('reading');
    setUses((u) => u + 1);
    track('cta_click', { cta: `demo-ia:${SAMPLES[i]!.key}` });
    setTimeout(
      () => setPhase('done'),
      matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1100,
    );
  };

  return (
    <div className="grid gap-5">
      <div role="group" aria-label="Documento de ejemplo" className="flex flex-wrap gap-2">
        {SAMPLES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={sel === i}
            disabled={uses >= MAX_USES}
            onClick={() => run(i)}
            className={`btn ${sel === i ? 'btn-primary' : 'btn-secondary'}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="grid gap-px border border-line bg-line md:grid-cols-2">
        <div className="bg-raised p-5">
          <p className="cota mb-3">Documento</p>
          <div
            className={`grid gap-1.5 font-mono text-[0.8rem] leading-relaxed ${phase === 'reading' ? 'motion-safe:animate-pulse' : ''}`}
          >
            {sample.doc.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
        </div>
        <div className="bg-bg p-5" aria-live="polite">
          <p className="cota mb-3 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" />{' '}
            Copiloto · datos extraídos
          </p>
          {phase === 'reading' ? (
            <p className="text-muted">Leyendo el documento…</p>
          ) : (
            <>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                {sample.fields.map(([k, v]) => (
                  <Fragment key={k}>
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </Fragment>
                ))}
              </dl>
              <p className="mt-4 border-t border-line pt-3 text-sm text-positive">
                ✓ {sample.note}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
        <p>
          Ejemplos con datos ficticios y resultado pregrabado. Pronto podrás subir tu propio PDF o
          imagen (máx. 5 MB): no lo almacenamos.{' '}
          {uses >= MAX_USES && (
            <strong className="text-fg">Has alcanzado el límite de 5 pruebas por sesión.</strong>
          )}
        </p>
        <a href="/diagnostico?tipo=ia" className="btn btn-primary" data-cta="demo-ia">
          Implántalo en tu empresa
        </a>
      </div>
    </div>
  );
}
