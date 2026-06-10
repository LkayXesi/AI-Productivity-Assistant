import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, AlertTriangle, Eye, Users, Lock } from "lucide-react";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({ meta: [{ title: "Responsible AI — Space Hub" }, { name: "description", content: "Our principles for responsible AI: transparency, human review, privacy, and bias awareness." }] }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold">Responsible AI</h1>
      <p className="mt-3 text-muted-foreground text-lg">We believe AI should augment professionals, not replace human judgment.</p>

      <Alert className="mt-8 border-warning/40 bg-warning/10">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>AI-generated outputs may contain inaccuracies and should be reviewed before professional use.</AlertDescription>
      </Alert>

      <div className="grid gap-5 sm:grid-cols-2 mt-8">
        {[
          { icon: Eye, title: "Transparency", desc: "We disclose where AI is used and clearly label AI-generated outputs." },
          { icon: Users, title: "Human in the Loop", desc: "Always review AI outputs before sharing externally — humans are accountable." },
          { icon: ShieldCheck, title: "Bias Awareness", desc: "Models reflect training data biases. Validate outputs for fairness and inclusivity." },
          { icon: Lock, title: "Data Privacy", desc: "Don't paste secrets, PII, or confidential data into prompts unless your policy allows." },
        ].map((p) => (
          <Card key={p.title} className="p-6">
            <div className="grid h-10 w-10 place-items-center rounded-lg gradient-brand text-white mb-3"><p.icon className="h-5 w-5" /></div>
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6">
        <h2 className="font-semibold text-lg">Ethical Considerations</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>Treat AI as a draft partner — not a decision maker.</li>
          <li>Verify factual claims, statistics, and citations independently.</li>
          <li>Consider impact on stakeholders before acting on AI recommendations.</li>
          <li>Comply with your organization's AI usage and data-handling policies.</li>
        </ul>
      </Card>
    </div>
  );
}
