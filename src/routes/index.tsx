import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, FileText, ListChecks, Search, MessageSquare, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Space Hub" },
      { name: "description", content: "Boost workplace productivity with AI — generate emails, summarize meetings, plan tasks, research, and chat with your AI assistant." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Mail, title: "Smart Email Generator", desc: "Professional emails by purpose, audience, and tone.", to: "/tools/email" },
  { icon: FileText, title: "Meeting Notes Summarizer", desc: "Extract key decisions, action items and deadlines.", to: "/tools/summarizer" },
  { icon: ListChecks, title: "AI Task Planner", desc: "Daily & weekly schedules with priority matrix.", to: "/tools/planner" },
  { icon: Search, title: "AI Research Assistant", desc: "Executive summaries, insights and recommendations.", to: "/tools/research" },
  { icon: MessageSquare, title: "AI Chat Assistant", desc: "Multi-turn conversation for any work question.", to: "/tools/chat" },
];

function Landing() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary to-brand opacity-95" />
        <div className="absolute inset-0 -z-10 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white, transparent 40%), radial-gradient(circle at 80% 60%, var(--accent), transparent 50%)" }} />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-primary-foreground">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Powered by Lovable AI
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
              Boost Workplace<br />Productivity with <span className="text-gradient-brand bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/85 max-w-xl">
              Generate emails, summarize meetings, plan tasks, conduct research, and interact with your personal AI assistant — all in one professional workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-white/30 hover:bg-white/10">
                  Explore Features
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Enterprise-grade security</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-accent" /> Instant AI responses</div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-card/95 backdrop-blur p-6 shadow-2xl border border-white/10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className="h-2 w-2 rounded-full bg-destructive" /><span className="h-2 w-2 rounded-full bg-warning" /><span className="h-2 w-2 rounded-full bg-success" />
                <span className="ml-2">Space Hub</span>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border bg-secondary/50 p-3 text-sm">
                  <div className="text-xs text-muted-foreground mb-1">You</div>
                  Draft a follow-up email to a client after a kickoff meeting.
                </div>
                <div className="rounded-lg gradient-brand p-3 text-sm text-white">
                  <div className="text-xs text-white/80 mb-1">AI Assistant</div>
                  <span className="font-medium">Subject:</span> Great to kick off — next steps<br />
                  Hi [Client], thanks for a productive kickoff today. Here's a recap of what we agreed…
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {["Emails", "Summaries", "Plans"].map((t) => (
                    <div key={t} className="rounded-lg border p-3 text-center">
                      <div className="text-lg font-bold text-brand">∞</div>
                      <div className="text-[11px] text-muted-foreground">{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">Everything you need to work smarter</h2>
          <p className="mt-3 text-muted-foreground">Five AI-powered tools designed for modern professionals and teams.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Link key={f.title} to={f.to} className="group">
              <Card className="h-full p-6 hover:shadow-lg hover:border-brand/40 transition-all">
                <div className="grid h-11 w-11 place-items-center rounded-lg gradient-brand text-white mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                <div className="mt-4 text-sm font-medium text-brand inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to 10× your workplace productivity?</h2>
          <p className="mt-3 text-primary-foreground/80">Free to start. Sign up in seconds.</p>
          <div className="mt-6">
            <Link to="/auth" search={{ mode: "signup" }}>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
