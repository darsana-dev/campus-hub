import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Plus, Pencil, Trash2, Eye, EyeOff, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRole } from "@/hooks/use-my-role";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EventFormDialog, type EventRow } from "@/components/admin/EventFormDialog";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: AdminEvents,
});

type EventListRow = EventRow & { registration_count: number };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AdminEvents() {
  const { data: myRole, isLoading: roleLoading } = useMyRole();
  const clubId = myRole?.adminClubs[0]?.id;
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [deleting, setDeleting] = useState<EventRow | null>(null);

  const { data, isLoading } = useQuery({
    enabled: !!clubId,
    queryKey: ["admin-events", clubId],
    queryFn: async (): Promise<EventListRow[]> => {
      const { data: events, error } = await supabase
        .from("events")
        .select(
          "id, club_id, title, short_description, description, starts_at, ends_at, location, capacity, category, status",
        )
        .eq("club_id", clubId!)
        .order("starts_at", { ascending: false });
      if (error) throw error;
      const ids = (events ?? []).map((e) => e.id);
      let counts: Record<string, number> = {};
      if (ids.length > 0) {
        const { data: regs, error: rErr } = await supabase
          .from("registrations")
          .select("event_id")
          .in("event_id", ids);
        if (rErr) throw rErr;
        counts = (regs ?? []).reduce<Record<string, number>>((acc, r) => {
          acc[r.event_id] = (acc[r.event_id] ?? 0) + 1;
          return acc;
        }, {});
      }
      return (events ?? []).map((e) => ({
        ...(e as EventRow),
        registration_count: counts[e.id] ?? 0,
      }));
    },
  });

  const togglePublish = useMutation({
    mutationFn: async (ev: EventRow) => {
      const next = ev.status === "published" ? "draft" : "published";
      const { error } = await supabase
        .from("events")
        .update({ status: next })
        .eq("id", ev.id);
      if (error) throw error;
      return next;
    },
    onSuccess: (next) => {
      toast.success(next === "published" ? "Event published" : "Event unpublished");
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event deleted");
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!roleLoading && !clubId) {
    return (
      <>
        <PageHeader
          title="Events"
          description="Create and manage your club's events."
        />
        <div className="mt-8">
          <EmptyState
            icon={<CalendarDays className="h-5 w-5" />}
            title="No club to manage"
            description="You need to be an admin of a club to create events."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Events"
        description="Create, publish, and manage your club's events."
        actions={
          <Button onClick={() => setCreateOpen(true)} disabled={!clubId}>
            <Plus className="mr-1.5 h-4 w-4" /> New event
          </Button>
        }
      />

      <div className="mt-8">
        {isLoading || roleLoading ? (
          <div className="h-64 animate-pulse rounded-2xl border border-border bg-secondary/60" />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-5 w-5" />}
            title="No events yet"
            description="Create your first event to see it here."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> New event
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-medium">
                      <Link
                        to="/admin/events/$eventId"
                        params={{ eventId: ev.id }}
                        className="hover:underline"
                      >
                        {ev.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(ev.starts_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ev.registration_count}
                      {ev.capacity ? ` / ${ev.capacity}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={ev.status === "published" ? "default" : "secondary"}
                      >
                        {ev.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setEditing(ev)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePublish.mutate(ev)}
                            disabled={togglePublish.isPending}
                          >
                            {ev.status === "published" ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" /> Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" /> Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleting(ev)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {clubId ? (
        <>
          <EventFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            clubId={clubId}
          />
          <EventFormDialog
            open={!!editing}
            onOpenChange={(v) => !v && setEditing(null)}
            clubId={clubId}
            event={editing}
          />
        </>
      ) : null}

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes “{deleting?.title}” and its registrations.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteEvent.mutate(deleting.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}