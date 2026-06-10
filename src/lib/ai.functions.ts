import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";
import { EMAIL_PROMPT, SUMMARIZE_PROMPT, PLAN_PROMPT, RESEARCH_PROMPT } from "./ai-prompts";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(DEFAULT_MODEL);
}

async function runAi(prompt: string) {
  const { text } = await generateText({ model: getModel(), prompt });
  return text;
}

// ---------- Email ----------
const EmailInput = z.object({
  purpose: z.string().min(1).max(2000),
  audience: z.string().min(1).max(200),
  tone: z.enum(["formal", "informal", "persuasive", "friendly"]),
});
export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data, context }) => {
    const text = await runAi(EMAIL_PROMPT(data.purpose, data.audience, data.tone));
    await context.supabase.from("activities").insert({
      user_id: context.userId,
      kind: "email",
      title: data.purpose.slice(0, 80),
      input: data,
      output: text,
    });
    return { text };
  });

// ---------- Summarizer ----------
const SummarizeInput = z.object({ notes: z.string().min(10).max(20000) });
export const summarizeMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SummarizeInput.parse(d))
  .handler(async ({ data, context }) => {
    const text = await runAi(SUMMARIZE_PROMPT(data.notes));
    await context.supabase.from("activities").insert({
      user_id: context.userId,
      kind: "summary",
      title: data.notes.slice(0, 80).replace(/\s+/g, " "),
      input: { notes: data.notes.slice(0, 1000) },
      output: text,
    });
    return { text };
  });

// ---------- Planner ----------
const PlanInput = z.object({
  goals: z.string().min(5).max(5000),
  horizon: z.enum(["daily", "weekly"]),
});
export const planTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PlanInput.parse(d))
  .handler(async ({ data, context }) => {
    const text = await runAi(PLAN_PROMPT(data.goals, data.horizon));
    await context.supabase.from("activities").insert({
      user_id: context.userId,
      kind: "plan",
      title: `${data.horizon} plan: ${data.goals.slice(0, 60)}`,
      input: data,
      output: text,
    });
    return { text };
  });

// ---------- Research ----------
const ResearchInput = z.object({ topic: z.string().min(3).max(5000) });
export const researchTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data, context }) => {
    const text = await runAi(RESEARCH_PROMPT(data.topic));
    await context.supabase.from("activities").insert({
      user_id: context.userId,
      kind: "research",
      title: data.topic.slice(0, 80),
      input: data,
      output: text,
    });
    return { text };
  });
