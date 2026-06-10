import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { UIMessage } from "ai";

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ kind: z.enum(["assistant", "chat"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("chat_threads")
      .select("id,title,kind,updated_at,created_at")
      .eq("user_id", context.userId)
      .eq("kind", data.kind)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getOrCreateAssistantThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing } = await context.supabase
      .from("chat_threads")
      .select("id")
      .eq("user_id", context.userId)
      .eq("kind", "assistant")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) return { id: existing.id as string };
    const { data: created, error } = await context.supabase
      .from("chat_threads")
      .insert({ user_id: context.userId, kind: "assistant", title: "AI Assistant" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id as string };
  });

export const createChatThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ title: z.string().min(1).max(120).default("New chat") }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: created, error } = await context.supabase
      .from("chat_threads")
      .insert({ user_id: context.userId, kind: "chat", title: data.title })
      .select("id,title,kind,updated_at,created_at")
      .single();
    if (error) throw new Error(error.message);
    return created;
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("chat_threads")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("chat_messages")
      .select("message,created_at")
      .eq("thread_id", data.threadId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => r.message as unknown as UIMessage);
  });

export const clearThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("chat_messages")
      .delete()
      .eq("thread_id", data.threadId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: rows, error } = await context.supabase
      .from("activities")
      .select("kind")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const counts: Record<string, number> = { email: 0, summary: 0, plan: 0, research: 0, chat: 0 };
    for (const r of rows ?? []) counts[r.kind] = (counts[r.kind] ?? 0) + 1;

    const { data: recent } = await context.supabase
      .from("activities")
      .select("id,kind,title,created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(10);

    // chat count from threads
    const { count: chatThreads } = await context.supabase
      .from("chat_threads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .eq("kind", "chat");
    counts.chat = chatThreads ?? 0;

    return { counts, recent: recent ?? [] };
  });
