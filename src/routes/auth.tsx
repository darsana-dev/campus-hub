import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/brand/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — TurnUp" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/discover", replace: true });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created", { description: "You're signed in." });
        navigate({ to: "/discover", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/discover", replace: true });
      }
    } catch (err) {
      toast.error("Authentication failed", { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed", { description: result.error.message });
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/discover", replace: true });
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand p-10 text-brand-foreground lg:flex">
        <Logo className="!text-brand-foreground [&>span:last-child]:!text-brand-foreground [&_svg]:!text-brand" />
        <div className="max-w-md">
          <blockquote className="text-2xl font-medium leading-tight tracking-tight">
            "TurnUp made running our society feel less like a spreadsheet and more like a community."
          </blockquote>
          <p className="mt-4 text-sm opacity-80">— Priya, President, Design Collective</p>
        </div>
        <div className="text-xs opacity-70">© TurnUp</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to your TurnUp account to continue."
              : "Join TurnUp to discover and run campus clubs."}
          </p>

          <Button variant="outline" className="mt-6 w-full" onClick={handleGoogle} disabled={loading}>
            <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden>
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.5 12 2.5 6.9 2.5 2.8 6.6 2.8 11.7S6.9 20.9 12 20.9c6.9 0 9.5-4.8 9.5-8.3 0-.6 0-1-.1-1.5H12z" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>Sign in</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input id="signup-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>Create account</Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to TurnUp's Terms.{" "}
            <Link to="/" className="underline underline-offset-2">Back home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}