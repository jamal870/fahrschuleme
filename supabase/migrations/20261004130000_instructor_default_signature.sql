-- Standard-Unterschrift des Fahrlehrers: gilt für alle Kurse (auch rückwirkend),
-- solange ein Kurstermin keine eigene Unterschrift hat. Nur für Admins.
CREATE TABLE IF NOT EXISTS public.instructor_default_signature (
  id text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  signature_data text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.instructor_default_signature TO authenticated;
GRANT ALL ON public.instructor_default_signature TO service_role;

ALTER TABLE public.instructor_default_signature ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage default instructor signature" ON public.instructor_default_signature;
CREATE POLICY "Admins manage default instructor signature" ON public.instructor_default_signature
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
