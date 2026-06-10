import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, FileText, ListChecks, Search, MessageSquare, Plus, CalendarDays, User } from "lucide-react";
import { Suspense } from "react";
import { getDashboardStats } from "@/lib/threads.functions";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Space Hub" }] }),
  component: Dashboard,
});

const CARDS = [
  { kind: "email", label: "Emails Generated", icon: Mail, color: "text-brand" },
  { kind: "summary", label: "Summaries Created", icon: FileText, color: "text-accent" },
  { kind: "plan", label: "Tasks Planned", icon: ListChecks, color: "text-warning" },
  { kind: "research", label: "Research Requests", icon: Search, color: "text-success" },
  { kind: "chat", label: "AI Chats", icon: MessageSquare, color: "text-brand" },
] as const;

const QUICK = [
  { to: "/tools/email", label: "New Email", icon: Mail },
  { to: "/tools/summarizer", label: "New Summary", icon: FileText },
  { to: "/tools/planner", label: "New Plan", icon: ListChecks },
  { to: "/tools/research", label: "New Research", icon: Search },
  { to: "/tools/chat", label: "Open AI Chat", icon: MessageSquare },
] as const;

function Dashboard() {
  return (
    <AppShell title="Dashboard" subtitle="Your productivity at a glance." crumbs={[{ label: "Dashboard" }]}>
      <Suspense fallback={<DashSkeleton />}>
        <DashContent />
      </Suspense>
    </AppShell>
  );
}

function DashSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

function DashContent() {
  const fn = useServerFn(getDashboardStats);
  const { data } = useSuspenseQuery({ queryKey: ["dash"], queryFn: () => fn() });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {CARDS.map((c) => (
          <Card key={c.kind} className="p-5">
            <div className="flex items-center justify-between">
              <c.icon className={`h-5 w-5 ${c.color}`} />
              <span className="text-3xl font-bold">{data.counts[c.kind] ?? 0}</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{c.label}</div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <Link key={q.to} to={q.to}>
              <Button variant="outline" className="gap-2"><q.icon className="h-4 w-4" />{q.label}</Button>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link to="/tools/email"><Button size="sm" variant="ghost"><Plus className="h-4 w-4 mr-1" /> New</Button></Link>
        </div>
        <Card className="divide-y">
          {data.recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No activity yet — try a tool to get started.</div>
          ) : data.recent.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground capitalize">{r.kind} · {new Date(r.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
