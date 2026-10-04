-- Fahrlehrer-Unterschrift pro Kurstermin (nur für Admins lesbar/schreibbar)
CREATE TABLE IF NOT EXISTS public.course_instructor_signatures (
  course_date_id text PRIMARY KEY REFERENCES public.course_dates(id) ON DELETE CASCADE,
  signature_data text,
  signed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_instructor_signatures TO authenticated;
GRANT ALL ON public.course_instructor_signatures TO service_role;

ALTER TABLE public.course_instructor_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage instructor signatures" ON public.course_instructor_signatures;
CREATE POLICY "Admins manage instructor signatures" ON public.course_instructor_signatures
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
