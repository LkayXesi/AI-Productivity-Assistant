import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeStr = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable().optional();

export const listPlannerEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ from: dateStr, to: dateStr }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("planner_events")
      .select("id,title,notes,event_date,start_time,end_time,completed,priority")
      .eq("user_id", context.userId)
      .gte("event_date", data.from)
      .lte("event_date", data.to)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true, nullsFirst: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createPlannerEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      title: z.string().min(1).max(200),
      notes: z.string().max(2000).nullable().optional(),
      event_date: dateStr,
      start_time: timeStr,
      end_time: timeStr,
      priority: z.enum(["low", "medium", "high"]).default("medium"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("planner_events")
      .insert({ ...data, user_id: context.userId })
      .select("id,title,notes,event_date,start_time,end_time,completed,priority")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updatePlannerEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(200).optional(),
      notes: z.string().max(2000).nullable().optional(),
      event_date: dateStr.optional(),
      start_time: timeStr,
      end_time: timeStr,
      completed: z.boolean().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase
      .from("planner_events")
      .update(patch)
      .eq("id", id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePlannerEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("planner_events")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
