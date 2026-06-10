import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { summarizeMeeting } from "@/lib/ai.functions";
import { Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/tools/summarizer")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — AI Workplace" }] }),
  component: Page,
});

function Page() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    if (notes.trim().length < 10) return toast.error("Please provide more notes.");
    setLoading(true);
    try {
      const r = await fn({ data: { notes } });
      setOut(r.text);
      toast.success("Summary ready");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  function download() {
    const blob = new Blob([out], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "meeting-summary.md"; a.click();
  }

  return (
    <AppShell title="Meeting Notes Summarizer" subtitle="Extract key decisions, action items, responsibilities, and deadlines.">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste your meeting notes here…" rows={18} />
          <Button onClick={run} disabled={loading} className="bg-brand text-brand-foreground hover:bg-brand/90 w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Summarizing…</> : "Generate Summary"}
          </Button>
          <p className="text-xs text-muted-foreground">⚠️ Review AI-generated content before sharing.</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Summary</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(out); toast.success("Copied"); }} disabled={!out}><Copy className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={download} disabled={!out}><Download className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none min-h-[400px]">
            {out ? <ReactMarkdown>{out}</ReactMarkdown> : <p className="text-muted-foreground">Your summary will appear here.</p>}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
