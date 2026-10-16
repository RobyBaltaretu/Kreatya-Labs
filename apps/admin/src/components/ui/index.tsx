/** Primitivas del panel (estilo shadcn/ui sobre los tokens de @kreatya/ui). */
import { cn } from '@kreatya/ui';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
export function Button({
  variant = 'secondary',
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...p}
      className={cn(
        'inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50',
        variant === 'primary' && 'bg-signal text-ink hover:bg-[#ff8550]',
        variant === 'secondary' && 'border border-line bg-raised hover:border-fg',
        variant === 'ghost' && 'hover:bg-line/50',
        variant === 'danger' && 'border border-signal text-fg hover:bg-signal hover:text-ink',
        className,
      )}
    />
  );
}

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div {...p} className={cn('rounded-lg border border-line bg-raised', className)} />;
}

export function CardHeader({
  title,
  action,
  hint,
}: {
  title: string;
  action?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
      <div>
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

const tone = {
  neutral: 'border-line text-muted',
  info: 'border-blueprint/40 bg-blueprint/10 text-fg',
  good: 'border-positive/40 bg-success/15 text-fg',
  warn: 'border-signal/50 bg-signal/15 text-fg',
} as const;
export function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        tone[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-signal">
          {error}
        </p>
      )}
    </div>
  );
}

const input =
  'w-full rounded-md border border-line bg-bg px-3 py-2 text-sm focus-visible:border-blueprint';
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={cn(input, p.className)} />
);
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={cn(input, p.className)} />
);
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className={cn(input, p.className)} />
);

/** Contador de caracteres para campos SEO (HU-06). */
export function CharCount({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={cn('tabular-nums', over ? 'font-semibold text-signal' : 'text-muted')}>
      {value.length}/{max}
      {over && ' · demasiado largo'}
    </span>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="grid place-items-center gap-1 p-10 text-center">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}

export function Loading() {
  return (
    <p className="p-6 text-sm text-muted" role="status">
      Cargando…
    </p>
  );
}
