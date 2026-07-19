import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClubCard, type ClubCardData } from "@/components/cards/ClubCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const Route = createFileRoute("/clubs")({
  head: () => ({ meta: [{ title: "Browse clubs — TurnUp" }] }),
  component: ClubsPage,
});

function ClubsPage() {
  const { data: clubs, isLoading } = useQuery({
    queryKey: ["clubs", "all"],
    queryFn: async (): Promise<ClubCardData[]> => {
      const { data, error } = await supabase
        .from("clubs")
        .select("id, slug, name, description, logo_url, category")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" asChild><Link to="/">Home</Link></Button>
            <Button size="sm" asChild><Link to="/auth">Sign in</Link></Button>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <PageHeader
          title="Clubs"
          description="Find and follow campus clubs. Sign in to join, register for events, and earn certificates."
        />
        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-secondary/60" />
              ))}
            </div>
          ) : clubs && clubs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.map((c) => (
                <ClubCard key={c.id} club={c} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No clubs yet"
              description="Once clubs are created, they'll show up here."
            />
          )}
        </div>
      </div>
    </div>
  );
}