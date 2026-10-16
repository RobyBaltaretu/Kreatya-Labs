interface LogoProps {
  className?: string;
  title?: string;
}

/** Isotipo: una «K» trazada como cota de plano. */
export function Logo({ className, title = 'Kreatya Labs' }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label={title}>
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M10 8v16M10 16l9-8M13 13.5 21 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="9.5" r="2.5" fill="var(--signal)" />
    </svg>
  );
}
