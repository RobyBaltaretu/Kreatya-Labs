import { Icon } from '@kreatya/ui';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Item {
  src: string;
  alt: string;
  device: string;
  width: number;
  height: number;
}
const DEVICE_LABEL: Record<string, string> = {
  desktop: 'Escritorio',
  tablet: 'Tablet',
  mobile: 'Móvil',
};

/** Galería con lightbox accesible: teclado (←/→/Esc), gestos táctiles y foco atrapado. */
export default function Gallery({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  const move = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open !== null && !dlg.open) dlg.showModal();
    if (open === null && dlg.open) dlg.close();
  }, [open]);

  const current = open !== null ? items[open] : null;
  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.src}>
            <button
              type="button"
              className="group block w-full rounded-3xl border border-line bg-raised text-left"
              onClick={() => setOpen(i)}
            >
              <img
                src={it.src}
                alt={it.alt}
                width={it.width}
                height={it.height}
                loading="lazy"
                className="aspect-[4/3] w-full object-contain p-3 transition-transform group-hover:scale-[1.02]"
              />
              <span className="flex items-center justify-between border-t border-line px-3 py-2 text-xs">
                <span className="etiqueta">{DEVICE_LABEL[it.device]}</span>
                <span className="text-muted">Ampliar</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        aria-label="Galería ampliada"
        className="lightbox m-auto max-h-[92vh] w-[min(96vw,1200px)] max-w-none rounded-xl bg-bg p-0 text-fg"
        onClose={() => setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') move(1);
          if (e.key === 'ArrowLeft') move(-1);
        }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          const end = e.changedTouches[0]?.clientX;
          if (start !== null && end !== undefined && Math.abs(end - start) > 40)
            move(end < start ? 1 : -1);
          touchX.current = null;
        }}
      >
        {current && (
          <figure className="grid gap-3 p-4">
            <img
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              className="max-h-[72vh] w-full object-contain"
            />
            <figcaption className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span>
                {current.alt}{' '}
                <span className="tabular-nums text-muted">
                  · {open! + 1}/{items.length}
                </span>
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => move(-1)}
                  aria-label="Imagen anterior"
                >
                  <Icon name="arrow-left" />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => move(1)}
                  aria-label="Imagen siguiente"
                >
                  <Icon name="arrow-right" />
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setOpen(null)}>
                  Cerrar
                </button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
