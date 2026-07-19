import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { EventCard } from "@/components/cards/EventCard";
import { Compass } from "lucide-react";

export const Route = createFileRoute("/_authenticated/discover")({
  component: Discover,
});

function Discover() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["discover-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, starts_at, location, cover_url, club:clubs(name)")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(24);
      if (error) throw error;
      return (data ?? []).map((e) => ({ ...e, club_name: e.club?.name ?? null }));
    },
  });

  return (
    <>
      <PageHeader
        title="Discover"
        description="Upcoming events from clubs on campus."
      />
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-secondary/60" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Compass className="h-5 w-5" />}
            title="Nothing on the calendar yet"
            description="Once clubs publish events, they'll appear here."
          />
        )}
      </div>
    </>
  );
}