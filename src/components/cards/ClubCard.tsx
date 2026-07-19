import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";

export type ClubCardData = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  category?: string | null;
  member_count?: number;
};

export function ClubCard({ club }: { club: ClubCardData }) {
  return (
    <Link
      to="/clubs/$slug"
      params={{ slug: club.slug }}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary text-muted-foreground">
          {club.logo_url ? (
            <img src={club.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-foreground/70">
              {club.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">{club.name}</h3>
          {club.category ? (
            <p className="text-xs text-muted-foreground">{club.category}</p>
          ) : null}
        </div>
      </div>
      {club.description ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">{club.description}</p>
      ) : null}
      {typeof club.member_count === "number" ? (
        <div className="mt-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {club.member_count} members
        </div>
      ) : null}
    </Link>
  );
}