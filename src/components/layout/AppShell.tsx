import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { Compass, Ticket, Award, User as UserIcon, LayoutDashboard, CalendarDays, Users, Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth, signOut } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const studentNav = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/my-events", label: "My Events", icon: Ticket },
  { to: "/certificates", label: "Certificates", icon: Award },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/settings", label: "Club Settings", icon: Settings },
] as const;

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = pathname.startsWith("/admin");
  const items = isAdmin ? adminNav : studentNav;

  const email = user?.email ?? "";
  const initials = email ? email.slice(0, 2).toUpperCase() : "TU";

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex">
              {items.map((item) => {
                const active = "exact" in item && item.exact
                  ? pathname === item.to
                  : pathname === item.to || pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-lg border border-border bg-secondary/60 p-0.5 sm:flex">
              <button
                onClick={() => navigate({ to: "/discover" })}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition",
                  !isAdmin ? "bg-background text-foreground shadow-soft" : "text-muted-foreground",
                )}
              >
                Student
              </button>
              <button
                onClick={() => navigate({ to: "/admin" })}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition",
                  isAdmin ? "bg-background text-foreground shadow-soft" : "text-muted-foreground",
                )}
              >
                Admin
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 gap-2 pl-1 pr-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-brand text-brand-foreground text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{email || "Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                  <UserIcon className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/clubs" })}>
                  <Users className="mr-2 h-4 w-4" /> Browse clubs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/auth", replace: true });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          {items.map((item) => {
            const active = "exact" in item && item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        TurnUp — an operating system for campus clubs.
      </footer>
    </div>
  );
}