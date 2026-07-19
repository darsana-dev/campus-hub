import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Ticket } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-events")({
  component: MyEvents,
});

function MyEvents() {
  return (
    <>
      <PageHeader
        title="My Events"
        description="Events you've registered for, past and upcoming."
      />
      <div className="mt-8">
        <EmptyState
          icon={<Ticket className="h-5 w-5" />}
          title="No registrations yet"
          description="When you register for an event, it will show up here."
        />
      </div>
    </>
  );
}