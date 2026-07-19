import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <>
      <PageHeader
        title="Admin dashboard"
        description="Manage your club, events, and members from one place."
      />
      <div className="mt-8">
        <EmptyState
          icon={<LayoutDashboard className="h-5 w-5" />}
          title="Your dashboard will live here"
          description="Once features are wired up, this is where you'll see what's happening in your club."
        />
      </div>
    </>
  );
}