import { Link } from "@tanstack/react-router";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type EventCardData = {
  id: string;
  title: string;
  starts_at: string;
  location?: string | null;
  cover_url?: string | null;
  club_name?: string | null;
};

export function EventCard({ event }: { event: EventCardData }) {
  const date = new Date(event.starts_at);
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
        {event.cover_url ? (
          <img src={event.cover_url} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-secondary to-muted text-muted-foreground">
            <Calendar className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {event.club_name ? (
          <Badge variant="secondary" className="w-fit">{event.club_name}</Badge>
        ) : null}
        <h3 className="line-clamp-2 text-base font-semibold text-foreground">{event.title}</h3>
        <div className="mt-auto flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </span>
          {event.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}