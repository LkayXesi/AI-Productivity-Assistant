import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/responsible-ai", label: "Responsible AI" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg gradient-brand text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline text-base text-foreground">AI Workplace</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => {
            const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">{user.email?.split("@")[0]}</Button>
              </Link>
              <Button size="sm" variant="outline" onClick={signOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "login" }}>
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-8 flex flex-col gap-1">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary">
                  {n.label}
                </Link>
              ))}
              <div className="mt-4 border-t pt-4 flex flex-col gap-2">
                {user ? (
                  <Button onClick={signOut} variant="outline">Sign out</Button>
                ) : (
                  <>
                    <Link to="/auth" search={{ mode: "login" }}><Button variant="outline" className="w-full">Log in</Button></Link>
                    <Link to="/auth" search={{ mode: "signup" }}><Button className="w-full bg-brand text-brand-foreground">Sign up</Button></Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
