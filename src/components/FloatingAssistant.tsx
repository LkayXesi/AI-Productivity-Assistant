import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, X, Minus, Maximize2, Send, Sparkles, Trash2 } from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  getOrCreateAssistantThread,
  getThreadMessages,
  clearThread,
} from "@/lib/threads.functions";
import ReactMarkdown from "react-markdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const QUICK_ACTIONS = [
  { label: "Generate Email", to: "/tools/email" },
  { label: "Summarize Notes", to: "/tools/summarizer" },
  { label: "Create Task Plan", to: "/tools/planner" },
  { label: "Research Topic", to: "/tools/research" },
  { label: "Open Dashboard", to: "/dashboard" },
  { label: "Contact Support", to: "/contact" },
];

const WELCOME: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: `👋 **Welcome to Space Hub.**

I'm your AI Guide and Productivity Assistant. I can:
- ✓ Help you navigate the platform
- ✓ Generate professional emails
- ✓ Summarize meetings
- ✓ Plan tasks and schedules
- ✓ Assist with research
- ✓ Answer your questions

How can I help you today?`,
    },
  ],
} as UIMessage;

export function FloatingAssistant() {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigatedFor = useRef<Set<string>>(new Set());

  // hide on auth page
  const hidden = path === "/auth";

  // load thread when user opens and is authed
  useEffect(() => {
    if (!open || !user || threadId) return;
    (async () => {
      try {
        const { id } = await getOrCreateAssistantThread();
        setThreadId(id);
        const msgs = await getThreadMessages({ data: { threadId: id } });
        if (msgs.length > 0) setInitialMessages(msgs as unknown as UIMessage[]);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [open, user, threadId]);

  return (
    <>
      {!hidden && (
        <FloatingButton open={open} onClick={() => setOpen((v) => !v)} />
      )}
      {open && !hidden && (
        <ChatPanel
          threadId={threadId}
          initialMessages={initialMessages}
          minimized={minimized}
          onMinimize={() => setMinimized((v) => !v)}
          onClose={() => setOpen(false)}
          input={input}
          setInput={setInput}
          scrollRef={scrollRef}
          navigate={navigate}
          navigatedFor={navigatedFor}
          path={path}
          user={user}
          onClear={async () => {
            if (!threadId) return;
            await clearThread({ data: { threadId } });
            setInitialMessages([WELCOME]);
            // force remount by changing key — handled by parent re-render via threadId reset
            setThreadId(null);
          }}
        />
      )}
    </>
  );
}

function FloatingButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            aria-label="Open AI Assistant"
            className="fixed bottom-5 left-5 z-50 h-[60px] w-[60px] rounded-full gradient-brand text-white shadow-xl grid place-items-center animate-pulse-ring hover:scale-105 transition-transform"
          >
            {open ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Need Help? Ask AI Assistant</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ChatPanel(props: {
  threadId: string | null;
  initialMessages: UIMessage[];
  minimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  input: string;
  setInput: (v: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  navigate: ReturnType<typeof useNavigate>;
  navigatedFor: React.MutableRefObject<Set<string>>;
  path: string;
  user: ReturnType<typeof useAuth>["user"];
  onClear: () => void;
}) {
  const { threadId, initialMessages, minimized, onMinimize, onClose, input, setInput, scrollRef, navigate, navigatedFor, path, user, onClear } = props;

  return (
    <div
      className={`fixed bottom-[90px] left-5 z-50 w-[95vw] sm:w-[380px] ${
        minimized ? "h-14" : "h-[70vh] sm:h-[550px]"
      } rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden transition-all`}
    >
      <Header onMinimize={onMinimize} onClose={onClose} onClear={onClear} minimized={minimized} />
      {!minimized && (
        user ? (
          <AuthedChat
            key={threadId ?? "loading"}
            threadId={threadId}
            initialMessages={initialMessages}
            input={input}
            setInput={setInput}
            scrollRef={scrollRef}
            navigate={navigate}
            navigatedFor={navigatedFor}
            path={path}
          />
        ) : (
          <div className="flex-1 grid place-items-center p-6 text-center text-sm text-muted-foreground">
            <div>
              <Sparkles className="mx-auto h-8 w-8 text-brand mb-2" />
              <p>Please sign in to chat with the AI Assistant.</p>
              <Button className="mt-3 bg-brand text-brand-foreground" onClick={() => { onClose(); navigate({ to: "/auth", search: { mode: "login" } }); }}>
                Sign in
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function Header({ onMinimize, onClose, onClear, minimized }: { onMinimize: () => void; onClose: () => void; onClear: () => void; minimized: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 border-b bg-primary text-primary-foreground">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md gradient-brand">
          <Bot className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold">🤖 Space Hub Assistant</div>
          <div className="text-[11px] text-primary-foreground/70 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" /> Online
          </div>
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <button onClick={onClear} title="Clear chat" className="p-1.5 rounded hover:bg-white/10"><Trash2 className="h-4 w-4" /></button>
        <button onClick={onMinimize} title={minimized ? "Expand" : "Minimize"} className="p-1.5 rounded hover:bg-white/10">
          {minimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
        </button>
        <button onClick={onClose} title="Close" className="p-1.5 rounded hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function AuthedChat({ threadId, initialMessages, input, setInput, scrollRef, navigate, navigatedFor, path }: {
  threadId: string | null;
  initialMessages: UIMessage[];
  input: string;
  setInput: (v: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  navigate: ReturnType<typeof useNavigate>;
  navigatedFor: React.MutableRefObject<Set<string>>;
  path: string;
}) {
  const { messages, sendMessage, status } = useChat({
    id: threadId ?? "pending",
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (url, init) => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const headers = new Headers(init?.headers);
        if (token) headers.set("Authorization", `Bearer ${token}`);
        // Inject threadId + currentPath into the body
        let body = init?.body;
        if (typeof body === "string") {
          try {
            const parsed = JSON.parse(body);
            parsed.threadId = threadId;
            parsed.currentPath = path;
            body = JSON.stringify(parsed);
          } catch {}
        }
        return fetch(url, { ...init, headers, body });
      },
    }),
  });

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, scrollRef]);

  // Parse [NAVIGATE:/path] tokens from assistant messages
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || status === "streaming") return;
    if (navigatedFor.current.has(last.id)) return;
    const text = last.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
    const match = text.match(/\[NAVIGATE:(\/[\w\-/]*)\]/);
    if (match) {
      navigatedFor.current.add(last.id);
      const to = match[1];
      setTimeout(() => navigate({ to }), 600);
    }
  }, [messages, status, navigate, navigatedFor]);

  const onSend = async (text?: string) => {
    const v = (text ?? input).trim();
    if (!v || !threadId) return;
    setInput("");
    await sendMessage({ text: v });
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-background/50">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isLoading && (
          <div className="text-xs text-muted-foreground px-2">Thinking…</div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((q) => (
            <button
              key={q.label}
              onClick={() => navigate({ to: q.to })}
              className="text-xs px-2.5 py-1 rounded-full border border-border bg-secondary hover:bg-secondary/80"
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); onSend(); }}
        className="border-t p-2 flex items-end gap-2 bg-card"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
          }}
          placeholder="Ask me anything…"
          rows={1}
          className="min-h-9 max-h-32 resize-none text-sm"
          aria-label="Message AI Assistant"
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .replace(/\[NAVIGATE:[^\]]+\]/g, "")
    .trim();
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
          isUser ? "bg-brand text-brand-foreground rounded-br-sm" : "bg-card border text-foreground rounded-bl-sm"
        }`}
      >
        <div className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : ""}`}>
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
