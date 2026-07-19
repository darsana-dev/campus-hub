import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetail,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Event not found.</div>
  ),
});

function EventDetail() {
  const { eventId } = Route.useParams();
  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, club:clubs(id, name, slug, logo_url)")
        .eq("id", eventId)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (!event) return null;
  const starts = new Date(event.starts_at);
  const ends = event.ends_at ? new Date(event.ends_at) : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Button size="sm" asChild><Link to="/auth">Sign in to register</Link></Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="aspect-[21/9] w-full bg-gradient-to-br from-secondary to-muted">
            {event.cover_url ? (
              <img src={event.cover_url} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="p-6 sm:p-8">
            {event.club ? (
              <Link to="/clubs/$slug" params={{ slug: event.club.slug }}>
                <Badge variant="secondary">{event.club.name}</Badge>
              </Link>
            ) : null}
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{event.title}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {starts.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
                {ends ? ` – ${ends.toLocaleTimeString(undefined, { timeStyle: "short" })}` : ""}
              </span>
              {event.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              ) : null}
            </div>
            {event.description ? (
              <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {event.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}