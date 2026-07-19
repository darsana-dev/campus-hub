import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 font-semibold text-foreground ${className}`}
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-foreground shadow-soft">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3v18" />
          <path d="M6 8h9a5 5 0 0 1 0 10H6" />
        </svg>
      </span>
      <span className="text-base tracking-tight">TurnUp</span>
    </Link>
  );
}