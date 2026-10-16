interface LogoProps {
  className?: string;
  title?: string;
}

/** Isotipo: la lengüeta de una cinta métrica con la «K». */
export function Logo({ className, title = 'Kreatya Labs' }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label={title}>
      <rect x="1" y="1" width="30" height="30" rx="7" fill="#FFCC00" />
      <path
        d="M10.5 8v16M10.5 16.5 19 8M13.6 13.4 21 24"
        fill="none"
        stroke="#151515"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M25 6v20" stroke="#151515" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
