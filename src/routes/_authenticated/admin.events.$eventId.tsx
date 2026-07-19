import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, MapPin, Users, Tag, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventFormDialog, type EventRow } from "@/components/admin/EventFormDialog";

export const Route = createFileRoute("/_authenticated/admin/events/$eventId")({
  component: AdminEventDetail,
});

function AdminEventDetail() {
  const { eventId } = Route.useParams();
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-event", eventId],
    queryFn: async () => {
      const { data: event, error } = await supabase
        .from("events")
        .select(
          "id, club_id, title, short_description, description, starts_at, ends_at, location, capacity, category, status",
        )
        .eq("id", eventId)
        .maybeSingle();
      if (error) throw error;
      if (!event) return null;
      const { count, error: cErr } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);
      if (cErr) throw cErr;
      return { event: event as EventRow, registrationCount: count ?? 0 };
    },
  });

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl border border-border bg-secondary/60" />;
  }

  if (!data) {
    return (
      <>
        <PageHeader title="Event not found" />
        <div className="mt-6">
          <Button variant="ghost" asChild>
            <Link to="/admin/events">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to events
            </Link>
          </Button>
        </div>
      </>
    );
  }

  const { event, registrationCount } = data;
  const capacityLabel = event.capacity ? `${registrationCount} / ${event.capacity}` : `${registrationCount}`;

  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/events">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> All events
          </Link>
        </Button>
      </div>

      <PageHeader
        title={event.title}
        description={event.short_description ?? undefined}
        actions={
          <>
            <Badge variant={event.status === "published" ? "default" : "secondary"}>
              {event.status === "published" ? "Published" : "Draft"}
            </Badge>
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1.5 h-4 w-4" /> Edit
            </Button>
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<Calendar className="h-4 w-4" />}
          label="Starts"
          value={new Date(event.starts_at).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
          sub={
            event.ends_at
              ? `Ends ${new Date(event.ends_at).toLocaleTimeString(undefined, { timeStyle: "short" })}`
              : undefined
          }
        />
        <InfoCard
          icon={<MapPin className="h-4 w-4" />}
          label="Venue"
          value={event.location ?? "—"}
        />
        <InfoCard
          icon={<Users className="h-4 w-4" />}
          label="Registrations"
          value={capacityLabel}
          sub={event.capacity ? "of capacity" : "no capacity limit"}
        />
        <InfoCard
          icon={<Tag className="h-4 w-4" />}
          label="Category"
          value={event.category ?? "—"}
        />
      </div>

      <EventFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        clubId={event.club_id}
        event={event}
      />
    </>
  );
}

function InfoCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-foreground">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}