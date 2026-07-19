import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/members")({
  component: AdminMembers,
});

function AdminMembers() {
  return (
    <>
      <PageHeader
        title="Members"
        description="See who's in your club and manage roles."
      />
      <div className="mt-8">
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="Members will appear here"
          description="Membership management arrives with the next module."
        />
      </div>
    </>
  );
}