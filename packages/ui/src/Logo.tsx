import { useId } from 'react';

interface LogoProps {
  className?: string;
  title?: string;
}

/** Isotipo: una «K» sobre un recipiente que el ámbar líquido llena hasta adoptar su forma. */
export function Logo({ className, title = 'Kreatya Labs' }: LogoProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd25a" />
          <stop offset="1" stopColor="#f08a0c" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#1d1d1f" />
      <path
        d="M1 19c6-3.2 11.5 2.6 17.5-.4S27 15 31 16.6V22a9 9 0 0 1-9 9H10a9 9 0 0 1-9-9z"
        fill={`url(#${id})`}
      />
      <path
        d="M11 8.5v15M11 16.5 19.5 8.5M14.2 13.6 21 23.5"
        fill="none"
        stroke="#f5f5f7"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
