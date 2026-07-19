import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: AdminEvents,
});

function AdminEvents() {
  return (
    <>
      <PageHeader
        title="Events"
        description="Create and manage your club's events."
        actions={<Button disabled><Plus className="mr-1.5 h-4 w-4" /> New event</Button>}
      />
      <div className="mt-8">
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title="No events yet"
          description="Event creation will be available in the next module."
        />
      </div>
    </>
  );
}