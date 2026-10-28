import Link from "next/link";

/** Reed pen (qalam) over an ink drop — DiwanUz mark. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M6 26c4-1 8-4 12-9l8-10-2-2-10 8c-5 4-8 8-9 12z" fill="var(--navy)" />
      <path d="M24 5l3 3" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="7" cy="27" r="2.2" fill="var(--gold)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="DiwanUz bosh sahifa">
      <LogoMark />
      <span className="font-serif text-[1.45rem] italic text-navy leading-none">
        Diwan<span className="not-italic font-semibold">Uz</span>
      </span>
    </Link>
  );
}
