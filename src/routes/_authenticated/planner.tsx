import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, Suspense } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Clock, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  listPlannerEvents,
  createPlannerEvent,
  updatePlannerEvent,
  deletePlannerEvent,
} from "@/lib/planner.functions";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({ meta: [{ title: "Daily Planner — Space Hub" }] }),
  component: PlannerPage,
});

type Priority = "low" | "medium" | "high";
type Ev = {
  id: string;
  title: string;
  notes: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  completed: boolean;
  priority: string;
};

function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthRange(d: Date) {
  const from = new Date(d.getFullYear(), d.getMonth(), 1);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { from: fmtDate(from), to: fmtDate(to) };
}

function PlannerPage() {
  return (
    <AppShell title="Daily Planner" subtitle="Plan your day, week, and month at a glance.">
      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <PlannerContent />
      </Suspense>
    </AppShell>
  );
}

function PlannerContent() {
  const [month, setMonth] = useState<Date>(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());
  const range = useMemo(() => monthRange(month), [month]);

  const listFn = useServerFn(listPlannerEvents);
  const qc = useQueryClient();
  const queryKey = ["planner", range.from, range.to];
  const { data: events } = useSuspenseQuery({
    queryKey,
    queryFn: () => listFn({ data: range }),
  });

  const createFn = useServerFn(createPlannerEvent);
  const updateFn = useServerFn(updatePlannerEvent);
  const deleteFn = useServerFn(deletePlannerEvent);

  const [editing, setEditing] = useState<Ev | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const byDate = useMemo(() => {
    const map = new Map<string, Ev[]>();
    for (const e of events as Ev[]) {
      const arr = map.get(e.event_date) ?? [];
      arr.push(e);
      map.set(e.event_date, arr);
    }
    return map;
  }, [events]);

  const selectedKey = fmtDate(selected);
  const dayEvents = byDate.get(selectedKey) ?? [];
  const eventDays = useMemo(
    () => Array.from(byDate.keys()).map((s) => new Date(s + "T00:00:00")),
    [byDate],
  );

  function openCreate() {
    setEditing({
      id: "",
      title: "",
      notes: "",
      event_date: selectedKey,
      start_time: "",
      end_time: "",
      completed: false,
      priority: "medium",
    });
    setDialogOpen(true);
  }

  function openEdit(e: Ev) {
    setEditing({ ...e, start_time: e.start_time ?? "", end_time: e.end_time ?? "", notes: e.notes ?? "" });
    setDialogOpen(true);
  }

  async function save() {
    if (!editing) return;
    if (editing.title.trim().length < 1) return toast.error("Title required");
    const payload = {
      title: editing.title.trim(),
      notes: editing.notes || null,
      event_date: editing.event_date,
      start_time: editing.start_time ? editing.start_time : null,
      end_time: editing.end_time ? editing.end_time : null,
      priority: editing.priority as Priority,
    };
    try {
      if (editing.id) {
        await updateFn({ data: { id: editing.id, ...payload, completed: editing.completed } });
      } else {
        await createFn({ data: payload });
      }
      toast.success(editing.id ? "Event updated" : "Event created");
      setDialogOpen(false);
      await qc.invalidateQueries({ queryKey: ["planner"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function toggle(e: Ev) {
    await updateFn({ data: { id: e.id, completed: !e.completed } });
    await qc.invalidateQueries({ queryKey: ["planner"] });
  }

  async function remove(id: string) {
    await deleteFn({ data: { id } });
    toast.success("Event removed");
    await qc.invalidateQueries({ queryKey: ["planner"] });
  }

  return (
    <div className="grid lg:grid-cols-[auto_1fr] gap-6">
      <Card className="p-4 w-full lg:w-auto">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => d && setSelected(d)}
          month={month}
          onMonthChange={setMonth}
          modifiers={{ hasEvent: eventDays }}
          modifiersClassNames={{
            hasEvent: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-brand",
          }}
          className="pointer-events-auto"
        />
        <div className="mt-4 text-xs text-muted-foreground text-center">
          {(events as Ev[]).length} event{(events as Ev[]).length === 1 ? "" : "s"} this month
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              {selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {dayEvents.length === 0 ? "No events scheduled" : `${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <Button onClick={openCreate} className="bg-brand text-brand-foreground hover:bg-brand/90">
            <Plus className="h-4 w-4 mr-1" /> Add event
          </Button>
        </div>

        {dayEvents.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            Click <span className="font-medium">Add event</span> to plan something for this day.
          </div>
        ) : (
          <ul className="space-y-2">
            {dayEvents.map((e) => (
              <li
                key={e.id}
                className="flex items-start gap-3 rounded-lg border border-border/60 p-3 hover:bg-secondary/40 transition-colors"
              >
                <Checkbox checked={e.completed} onCheckedChange={() => toggle(e)} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium ${e.completed ? "line-through text-muted-foreground" : ""}`}>{e.title}</span>
                    <PriorityPill p={e.priority as Priority} />
                  </div>
                  {(e.start_time || e.end_time) && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {e.start_time?.slice(0, 5) ?? "—"}{e.end_time ? ` – ${e.end_time.slice(0, 5)}` : ""}
                    </div>
                  )}
                  {e.notes && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{e.notes}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(e)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(e.id)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit event" : "New event"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="ev-title">Title</Label>
                <Input id="ev-title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} maxLength={200} />
              </div>
              <div>
                <Label htmlFor="ev-date">Date</Label>
                <Input id="ev-date" type="date" value={editing.event_date} onChange={(e) => setEditing({ ...editing, event_date: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ev-start">Start</Label>
                  <Input id="ev-start" type="time" value={editing.start_time ?? ""} onChange={(e) => setEditing({ ...editing, start_time: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="ev-end">End</Label>
                  <Input id="ev-end" type="time" value={editing.end_time ?? ""} onChange={(e) => setEditing({ ...editing, end_time: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={editing.priority} onValueChange={(v) => setEditing({ ...editing, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ev-notes">Notes</Label>
                <Textarea id="ev-notes" rows={3} value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} maxLength={2000} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-brand text-brand-foreground hover:bg-brand/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PriorityPill({ p }: { p: Priority }) {
  const styles: Record<Priority, string> = {
    low: "bg-secondary text-muted-foreground",
    medium: "bg-brand/10 text-brand",
    high: "bg-destructive/10 text-destructive",
  };
  return <span className={`text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded ${styles[p]}`}>{p}</span>;
}
