import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <>
      <PageHeader
        title="Club settings"
        description="Update your club's name, description, category, and branding."
      />
      <div className="mt-8">
        <EmptyState
          icon={<Settings className="h-5 w-5" />}
          title="Club settings coming next"
          description="This is where you'll manage your club's identity and preferences."
        />
      </div>
    </>
  );
}