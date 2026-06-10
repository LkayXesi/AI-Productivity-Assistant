import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, FileText, ListChecks, Search, MessageSquare, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({ meta: [{ title: "Features — AI Workplace" }, { name: "description", content: "Five AI tools for modern professionals: email generation, meeting summarizer, task planner, research assistant, and AI chat." }] }),
  component: Page,
});

const F = [
  { icon: Mail, title: "Smart Email Generator", desc: "Pick a purpose, audience, and tone (formal, informal, persuasive, friendly). Get an editable email ready to copy or regenerate.", to: "/tools/email" },
  { icon: FileText, title: "Meeting Notes Summarizer", desc: "Paste raw notes. Receive a summary with key decisions, action items, responsibilities and deadlines.", to: "/tools/summarizer" },
  { icon: ListChecks, title: "AI Task Planner", desc: "Convert goals into a daily or weekly schedule with a priority matrix and productivity tips.", to: "/tools/planner" },
  { icon: Search, title: "AI Research Assistant", desc: "Get an executive summary, key insights, recommendations, and a plain-English explanation.", to: "/tools/research" },
  { icon: MessageSquare, title: "AI Chat Assistant", desc: "Threaded multi-turn chat with memory. Drafts, plans, summaries, prioritization — on demand.", to: "/tools/chat" },
];

function Page() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold">Features</h1>
        <p className="mt-3 text-muted-foreground text-lg">Everything you need to automate repetitive workplace tasks and ship faster.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
        {F.map((f) => (
          <Card key={f.title} className="p-6">
            <div className="grid h-11 w-11 place-items-center rounded-lg gradient-brand text-white mb-4"><f.icon className="h-5 w-5" /></div>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            <Link to={f.to}><Button variant="ghost" className="mt-4 px-0 text-brand hover:bg-transparent hover:text-brand/80">Try it <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
