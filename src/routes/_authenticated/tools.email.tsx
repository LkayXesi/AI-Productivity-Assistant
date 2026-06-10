import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";
import { Copy, RotateCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tools/email")({
  head: () => ({ meta: [{ title: "Email Generator — Space Hub" }] }),
  component: Page,
});

function Page() {
  const fn = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("Client");
  const [tone, setTone] = useState<"formal" | "informal" | "persuasive" | "friendly">("formal");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!purpose.trim()) return toast.error("Please describe the email purpose.");
    setLoading(true);
    try {
      const r = await fn({ data: { purpose, audience, tone } });
      setOut(r.text);
      toast.success("Email generated successfully");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell title="Smart Email Generator" subtitle="Draft professional emails by purpose, audience, and tone.">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div><Label>Purpose</Label><Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Follow up after client kickoff and propose next steps" rows={4} maxLength={2000} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Team Member">Team Member</SelectItem>
                  <SelectItem value="Stakeholder">Stakeholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={run} disabled={loading} className="bg-brand text-brand-foreground hover:bg-brand/90 w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</> : "Generate Email"}
          </Button>
          <p className="text-xs text-muted-foreground">⚠️ AI-generated content should be reviewed before use.</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Generated Email</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(out); toast.success("Copied"); }} disabled={!out}><Copy className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={run} disabled={!purpose || loading}><RotateCw className="h-4 w-4" /></Button>
            </div>
          </div>
          <Textarea value={out} onChange={(e) => setOut(e.target.value)} rows={18} placeholder="Your AI-generated email will appear here…" className="font-mono text-sm" />
        </Card>
      </div>
    </AppShell>
  );
}
