import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/ai-prompts";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);

        const body = (await request.json()) as {
          messages: UIMessage[];
          threadId: string;
          currentPath?: string;
        };
        if (!Array.isArray(body.messages) || !body.threadId) {
          return new Response("Bad request", { status: 400 });
        }

        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          },
        );
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway(DEFAULT_MODEL);

        const system = `${ASSISTANT_SYSTEM_PROMPT}\n\nCurrent page the user is viewing: ${body.currentPath ?? "/"}`;

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(body.messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages,
          onFinish: async ({ messages }) => {
            try {
              // persist the latest user message and the assistant reply
              const last = messages.slice(-2);
              if (last.length > 0) {
                await supabase.from("chat_messages").insert(
                  last.map((m) => ({
                    thread_id: body.threadId,
                    user_id: userId,
                    role: m.role,
                    message: m as unknown as Record<string, unknown>,
                  })),
                );
                await supabase
                  .from("chat_threads")
                  .update({ updated_at: new Date().toISOString() })
                  .eq("id", body.threadId);
              }
            } catch (e) {
              console.error("Failed to persist chat messages", e);
            }
          },
        });
      },
    },
  },
});
