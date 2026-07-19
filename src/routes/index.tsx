import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Award, Users, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Feature({ icon: Icon, title, description }: { icon: typeof Users; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-secondary text-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/clubs">Browse clubs</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6">
        <section className="grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Built for student clubs
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              The operating system for campus clubs.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              TurnUp gives your student organization one calm home for recurring events, members,
              feedback, and certificates — so you can focus on what you're actually building.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/auth">
                  Get started <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/clubs">Explore clubs</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-foreground font-semibold">CS</div>
                <div>
                  <div className="text-sm font-semibold">Computer Science Society</div>
                  <div className="text-xs text-muted-foreground">126 members · 12 events this term</div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { title: "Intro to LLM Agents", when: "Thu · 6:00 PM" },
                  { title: "Hack Night: Fall Kickoff", when: "Sat · 4:00 PM" },
                  { title: "Resume Review with Alumni", when: "Next Tue" },
                ].map((e) => (
                  <div key={e.title} className="flex items-center justify-between rounded-xl bg-secondary/60 p-3">
                    <div className="text-sm font-medium text-foreground">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.when}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature icon={Users} title="Persistent clubs" description="Members, admins, and history stay put — not just one-off event pages." />
            <Feature icon={CalendarDays} title="Recurring events" description="Plan a whole semester of events without rebuilding from scratch." />
            <Feature icon={Award} title="Certificates" description="Reward attendance with issued certificates members actually keep." />
            <Feature icon={Sparkles} title="One calm hub" description="No party-app noise. Modern, quiet, and made for academic life." />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TurnUp
      </footer>
    </div>
  );
}
