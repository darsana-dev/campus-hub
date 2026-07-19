import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Award } from "lucide-react";

export const Route = createFileRoute("/_authenticated/certificates")({
  component: Certificates,
});

function Certificates() {
  return (
    <>
      <PageHeader
        title="Certificates"
        description="Certificates issued to you for attending club events."
      />
      <div className="mt-8">
        <EmptyState
          icon={<Award className="h-5 w-5" />}
          title="No certificates yet"
          description="Attend events and complete feedback to earn certificates."
        />
      </div>
    </>
  );
}