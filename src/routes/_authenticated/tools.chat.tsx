import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { listThreads, createChatThread, deleteThread, getThreadMessages } from "@/lib/threads.functions";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/tools/chat")({
  head: () => ({ meta: [{ title: "AI Chat — Space Hub" }] }),
  component: Page,
});

type Thread = { id: string; title: string; updated_at: string };

function Page() {
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createChatThread);
  const delFn = useServerFn(deleteThread);
  const msgsFn = useServerFn(getThreadMessages);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [initialMsgs, setInitialMsgs] = useState<UIMessage[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function refresh() {
    const t = (await listFn({ data: { kind: "chat" } })) as Thread[];
    setThreads(t);
    if (t.length === 0) {
      const created = await createFn({ data: { title: "New chat" } });
      setThreads([created as Thread]);
      setActiveId((created as Thread).id);
      setInitialMsgs([]);
    } else if (!activeId) {
      setActiveId(t[0].id);
    }
  }

  useEffect(() => { refresh().catch(console.error); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    if (!activeId) return;
    setLoaded(false);
    msgsFn({ data: { threadId: activeId } }).then((m) => {
      setInitialMsgs(m as unknown as UIMessage[]);
      setLoaded(true);
    });
  }, [activeId, msgsFn]);

  async function newThread() {
    const created = await createFn({ data: { title: "New chat" } });
    setThreads((p) => [created as Thread, ...p]);
    setActiveId((created as Thread).id);
  }

  async function remove(id: string) {
    await delFn({ data: { id } });
    const left = threads.filter((t) => t.id !== id);
    setThreads(left);
    if (activeId === id) setActiveId(left[0]?.id ?? null);
    toast.success("Conversation deleted");
  }

  return (
    <AppShell title="AI Chat" subtitle="Multi-turn conversations with your AI productivity assistant.">
      <div className="grid lg:grid-cols-[260px_1fr] gap-4 min-h-[70vh]">
        <Card className="p-3 h-fit">
          <Button onClick={newThread} className="w-full bg-brand text-brand-foreground hover:bg-brand/90 mb-3"><Plus className="h-4 w-4 mr-1" /> New chat</Button>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {threads.map((t) => (
              <div key={t.id} className={`flex items-center group rounded-md ${activeId === t.id ? "bg-secondary" : "hover:bg-secondary/60"}`}>
                <button onClick={() => setActiveId(t.id)} className="flex-1 text-left px-2 py-2 text-sm truncate flex items-center gap-2 min-w-0">
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{t.title}</span>
                </button>
                <button onClick={() => remove(t.id)} className="p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0 flex flex-col overflow-hidden">
          {activeId && loaded ? (
            <ChatView threadId={activeId} initial={initialMsgs} />
          ) : (
            <div className="flex-1 grid place-items-center text-sm text-muted-foreground">Loading…</div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function ChatView({ threadId, initial }: { threadId: string; initial: UIMessage[] }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initial,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (url, init) => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const headers = new Headers(init?.headers);
        if (token) headers.set("Authorization", `Bearer ${token}`);
        let body = init?.body;
        if (typeof body === "string") {
          const p = JSON.parse(body); p.threadId = threadId; body = JSON.stringify(p);
        }
        return fetch(url, { ...init, headers, body });
      },
    }),
  });
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const loading = status === "submitted" || status === "streaming";

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-16">
            Start a conversation. Try: <em>"Draft a client email"</em>, <em>"Create a meeting agenda"</em>, or <em>"Prioritize my tasks"</em>.
          </div>
        )}
        {messages.map((m) => {
          const text = m.parts.map((p) => p.type === "text" ? p.text : "").join("").replace(/\[NAVIGATE:[^\]]+\]/g, "").trim();
          const user = m.role === "user";
          return (
            <div key={m.id} className={`flex ${user ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${user ? "bg-brand text-brand-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"}`}>
                <div className={`prose prose-sm max-w-none ${user ? "prose-invert" : ""}`}><ReactMarkdown>{text}</ReactMarkdown></div>
              </div>
            </div>
          );
        })}
        {loading && <div className="text-xs text-muted-foreground">Thinking…</div>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { sendMessage({ text: input.trim() }); setInput(""); } }}
        className="border-t p-3 flex gap-2 items-end">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim()) { sendMessage({ text: input.trim() }); setInput(""); } } }}
          rows={1} placeholder="Type a message…" className="min-h-10 max-h-40 resize-none" />
        <Button type="submit" disabled={loading || !input.trim()} className="bg-brand text-brand-foreground hover:bg-brand/90"><Send className="h-4 w-4" /></Button>
      </form>
    </>
  );
}
