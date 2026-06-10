import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Mail, FileText, ListChecks, Search, MessageSquare, Sparkles, ShieldCheck, Zap, Globe, Users, Target } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Space Hub" },
      { name: "description", content: "Learn more about Space Hub and our mission to boost workplace productivity with AI." },
    ],
  }),
  component: Page,
});

const VALUES = [
  { icon: ShieldCheck, title: "Trust", desc: "Enterprise-grade security and privacy by design." },
  { icon: Zap, title: "Speed", desc: "Instant AI responses that keep up with your workflow." },
  { icon: Target, title: "Focus", desc: "Tools built for real workplace outcomes, not novelty." },
];

function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5 text-brand" /> About Space Hub
        </div>
        <h1 className="mt-5 text-4xl font-extrabold">Built for the modern workplace</h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Space Hub combines powerful AI with a clean, professional interface to help individuals and teams get more done in less time.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {VALUES.map((v) => (
          <Card key={v.title} className="p-6 text-center">
            <div className="grid h-11 w-11 place-items-center rounded-lg gradient-brand text-white mx-auto mb-4">
              <v.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">{v.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold">Our mission</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We believe AI should remove friction from work, not add to it. Space Hub was designed to automate the repetitive
            tasks that slow professionals down — so you can focus on what actually matters.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            From drafting emails and summarizing meetings to planning your week and researching complex topics, every tool
            is tuned for accuracy, clarity, and speed.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5">
            <Globe className="h-5 w-5 text-brand mb-2" />
            <div className="text-2xl font-bold">10+</div>
            <div className="text-xs text-muted-foreground">Countries served</div>
          </Card>
          <Card className="p-5">
            <Users className="h-5 w-5 text-brand mb-2" />
            <div className="text-2xl font-bold">5K+</div>
            <div className="text-xs text-muted-foreground">Professionals using Space Hub</div>
          </Card>
          <Card className="p-5">
            <Mail className="h-5 w-5 text-brand mb-2" />
            <div className="text-2xl font-bold">50K+</div>
            <div className="text-xs text-muted-foreground">Emails generated</div>
          </Card>
          <Card className="p-5">
            <FileText className="h-5 w-5 text-brand mb-2" />
            <div className="text-2xl font-bold">20K+</div>
            <div className="text-xs text-muted-foreground">Meetings summarized</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
