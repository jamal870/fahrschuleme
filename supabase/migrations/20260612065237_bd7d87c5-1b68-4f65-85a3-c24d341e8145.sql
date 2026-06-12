
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_date_id TEXT NOT NULL REFERENCES public.course_dates(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','notified','converted','cancelled')),
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_date_id, email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist TO authenticated;
GRANT ALL ON public.waitlist TO service_role;

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admins) can manage all waitlist entries
CREATE POLICY "Authenticated can view waitlist"
  ON public.waitlist FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can update waitlist"
  ON public.waitlist FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete waitlist"
  ON public.waitlist FOR DELETE TO authenticated USING (true);

-- No public insert policy: entries are created via the add-to-waitlist edge function (service role)

CREATE INDEX idx_waitlist_course_date ON public.waitlist(course_date_id);
CREATE INDEX idx_waitlist_status ON public.waitlist(status);

CREATE TRIGGER set_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
