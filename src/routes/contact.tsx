import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Space Hub" }, { name: "description", content: "Get in touch with the Space Hub team." }] }),
  component: Page,
});

function Page() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error("Please fill all required fields.");
    toast.success("Thanks! We'll be in touch.");
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold">Contact us</h1>
        <p className="mt-3 text-muted-foreground">Questions, feedback, or partnership ideas — we'd love to hear from you.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-10">
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label htmlFor="n">Name *</Label><Input id="n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} /></div>
              <div><Label htmlFor="e">Email *</Label><Input id="e" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} /></div>
            </div>
            <div><Label htmlFor="s">Subject</Label><Input id="s" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={200} /></div>
            <div><Label htmlFor="m">Message *</Label><Textarea id="m" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} /></div>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">Send message</Button>
          </form>
        </Card>
        <Card className="p-6 space-y-4 text-sm">
          <h3 className="font-semibold">Company</h3>
          <div className="flex items-start gap-2 text-muted-foreground"><Mail className="h-4 w-4 mt-0.5" /> hello@spacehub.app</div>
          <div className="flex items-start gap-2 text-muted-foreground"><Phone className="h-4 w-4 mt-0.5" /> +1 (415) 555-0142</div>
          <div className="flex items-start gap-2 text-muted-foreground"><MapPin className="h-4 w-4 mt-0.5" /> Remote-first, Worldwide</div>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Frequently asked questions</h2>
        <Card className="p-2">
          <Accordion type="single" collapsible>
            {[
              { q: "Is my data private?", a: "Your chats and generated content are stored against your account. Don't paste confidential data unless your organization permits it." },
              { q: "Which AI model do you use?", a: "We use the Lovable AI gateway with Google Gemini by default. The architecture is provider-agnostic." },
              { q: "Can I export my content?", a: "Yes. Generated summaries and research can be downloaded as Markdown; everything else can be copied." },
              { q: "Is it free?", a: "Get started for free. Usage may be subject to fair-use limits." },
            ].map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`}>
                <AccordionTrigger className="px-4">{f.q}</AccordionTrigger>
                <AccordionContent className="px-4 text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </div>
  );
}
