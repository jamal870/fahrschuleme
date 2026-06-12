CREATE TABLE public.course_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_date_id text NOT NULL REFERENCES public.course_dates(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  signature_data text,
  present boolean NOT NULL DEFAULT false,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_date_id, booking_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_signatures TO authenticated;
GRANT ALL ON public.course_signatures TO service_role;

ALTER TABLE public.course_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view signatures" ON public.course_signatures
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert signatures" ON public.course_signatures
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update signatures" ON public.course_signatures
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete signatures" ON public.course_signatures
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_course_signatures_updated_at
  BEFORE UPDATE ON public.course_signatures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_course_signatures_course ON public.course_signatures(course_date_id);
CREATE INDEX idx_course_signatures_booking ON public.course_signatures(booking_id);