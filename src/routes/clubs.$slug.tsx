import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/layout/EmptyState";
import { EventCard } from "@/components/cards/EventCard";

export const Route = createFileRoute("/clubs/$slug")({
  component: ClubDetail,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Club not found.</div>
  ),
});

function ClubDetail() {
  const { slug } = Route.useParams();

  const { data: club } = useQuery({
    queryKey: ["club", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["club-events", club?.id],
    enabled: !!club?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, starts_at, location, cover_url")
        .eq("club_id", club!.id)
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!club) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Button size="sm" asChild><Link to="/auth">Sign in</Link></Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex items-start gap-5 border-b border-border pb-8">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-secondary text-foreground/70">
            {club.logo_url ? (
              <img src={club.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-semibold">{club.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1">
            {club.category ? <Badge variant="secondary">{club.category}</Badge> : null}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{club.name}</h1>
            {club.description ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{club.description}</p>
            ) : null}
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold">Upcoming events</h2>
        <div className="mt-4">
          {events && events.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.id} event={{ ...e, club_name: club.name }} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No events yet"
              description="This club hasn't scheduled any events."
            />
          )}
        </div>
      </div>
    </div>
  );
}