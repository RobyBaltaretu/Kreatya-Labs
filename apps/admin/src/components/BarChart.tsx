import { useState } from 'react';

interface Datum {
  label: string;
  value: number;
  detail?: string;
}

/**
 * Barras verticales de una sola serie (un único tono). Barras finas con extremo
 * redondeado anclado a la base, rejilla tenue, etiqueta solo en el máximo y el último,
 * tooltip por barra y tabla accesible.
 */
export function BarChart({
  data,
  height = 160,
  format = String,
  title,
}: {
  data: Datum[];
  height?: number;
  format?: (n: number) => string;
  title: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const pad = { l: 28, r: 8, t: 18, b: 22 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = Math.ceil(max / 2) * 2 || 2;
  const ticks = [0, niceMax / 2, niceMax];
  const bw = (W - pad.l - pad.r) / data.length;
  const y = (v: number) => pad.t + (height - pad.t - pad.b) * (1 - v / niceMax);
  const maxIdx = data.reduce((m, d, i) => (d.value > data[m]!.value ? i : m), 0);
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <figure className="relative">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={title}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="var(--fg-muted)">
              {format(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * bw + bw * 0.2;
          const w = Math.max(2, bw * 0.6);
          const h = Math.max(0, y(0) - y(d.value));
          const r = Math.min(4, w / 2, h);
          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: el grupo es enfocable para mostrar el tooltip; la tabla accesible está debajo
            <g
              key={d.label}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              tabIndex={0}
              aria-label={`${d.label}: ${format(d.value)}`}
            >
              <rect
                x={pad.l + i * bw}
                y={pad.t}
                width={bw}
                height={height - pad.t - pad.b}
                fill="transparent"
              />
              {h > 0 && (
                <path
                  d={`M${x},${y(0)} V${y(d.value) + r} q0,-${r} ${r},-${r} h${w - 2 * r} q${r},0 ${r},${r} V${y(0)} Z`}
                  fill="var(--chart)"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
              {(i === maxIdx || i === data.length - 1) && d.value > 0 && (
                <text
                  x={x + w / 2}
                  y={y(d.value) - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="var(--fg)"
                >
                  {format(d.value)}
                </text>
              )}
              {i % labelEvery === 0 && (
                <text
                  x={x + w / 2}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--fg-muted)"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
        <line
          x1={pad.l}
          x2={W - pad.r}
          y1={y(0)}
          y2={y(0)}
          stroke="var(--fg-muted)"
          strokeWidth={1}
        />
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 rounded-md border border-line bg-bg px-2 py-1 text-xs shadow"
          style={{
            left: `${((pad.l + hover * bw + bw / 2) / W) * 100}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <strong>{data[hover]!.label}</strong> · {format(data[hover]!.value)}
          {data[hover]!.detail && <> · {data[hover]!.detail}</>}
        </div>
      )}
      <details className="mt-1 text-xs text-muted">
        <summary className="cursor-pointer">Ver como tabla</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th className="font-normal">{d.label}</th>
                <td className="text-right">{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Barras horizontales (embudo, fuentes, pipeline): etiqueta y valor en texto, barra en un tono. */
export function HBars({
  data,
  format = String,
}: {
  data: Datum[];
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="grid gap-2.5">
      {data.map((d) => (
        <li
          key={d.label}
          className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm"
          title={d.detail}
        >
          <span className="truncate">{d.label}</span>
          <span className="h-2.5 overflow-hidden rounded-r bg-line/50">
            <span
              className="block h-full rounded-r bg-chart"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </span>
          <span className="tabular-nums text-muted">
            {format(d.value)}
            {d.detail && <span className="ml-1 text-xs">· {d.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
