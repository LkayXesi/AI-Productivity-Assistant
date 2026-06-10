import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { planTasks } from "@/lib/ai.functions";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/tools/planner")({
  head: () => ({ meta: [{ title: "AI Task Planner — Space Hub" }] }),
  component: Page,
});

function Page() {
  const fn = useServerFn(planTasks);
  const [goals, setGoals] = useState("");
  const [horizon, setHorizon] = useState<"daily" | "weekly">("daily");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    if (goals.trim().length < 5) return toast.error("Add some tasks or goals.");
    setLoading(true);
    try {
      const r = await fn({ data: { goals, horizon } });
      setOut(r.text);
      toast.success("Plan created");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell title="AI Task Planner" subtitle="Turn goals into a prioritized daily or weekly schedule.">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <Tabs value={horizon} onValueChange={(v) => setHorizon(v as typeof horizon)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
          </Tabs>
          <Textarea value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="List your tasks and goals, one per line…" rows={14} />
          <Button onClick={run} disabled={loading} className="bg-brand text-brand-foreground hover:bg-brand/90 w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Planning…</> : "Generate Plan"}
          </Button>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Your Plan</h3>
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(out); toast.success("Copied"); }} disabled={!out}><Copy className="h-4 w-4" /></Button>
          </div>
          <div className="prose prose-sm max-w-none min-h-[400px]">
            {out ? <ReactMarkdown>{out}</ReactMarkdown> : <p className="text-muted-foreground">Your task plan will appear here.</p>}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
