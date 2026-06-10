CREATE TABLE public.planner_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  notes text,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  completed boolean NOT NULL DEFAULT false,
  priority text NOT NULL DEFAULT 'medium',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.planner_events TO authenticated;
GRANT ALL ON public.planner_events TO service_role;

ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own planner events"
ON public.planner_events FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX planner_events_user_date_idx ON public.planner_events(user_id, event_date);

CREATE OR REPLACE FUNCTION public.update_planner_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_planner_events_updated_at
BEFORE UPDATE ON public.planner_events
FOR EACH ROW EXECUTE FUNCTION public.update_planner_events_updated_at();