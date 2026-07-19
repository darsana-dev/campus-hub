import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type MyRole = {
  role: "student" | "admin";
  adminClubs: { id: string; name: string; slug: string }[];
};

export function useMyRole() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["my-role", user?.id],
    queryFn: async (): Promise<MyRole> => {
      const { data: memberships, error } = await supabase
        .from("club_memberships")
        .select("role, club:clubs(id, name, slug)")
        .eq("user_id", user!.id)
        .eq("role", "admin");
      if (error) throw error;
      const adminClubs = (memberships ?? [])
        .map((m) => m.club)
        .filter((c): c is { id: string; name: string; slug: string } => !!c);
      return {
        role: adminClubs.length > 0 ? "admin" : "student",
        adminClubs,
      };
    },
  });
}