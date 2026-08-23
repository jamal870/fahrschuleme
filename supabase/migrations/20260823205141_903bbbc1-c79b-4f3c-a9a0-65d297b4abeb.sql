CREATE TABLE IF NOT EXISTS public.presentations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  pptx_path text,
  pdf_path text,
  slide_count integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.presentations TO authenticated;
GRANT ALL ON public.presentations TO service_role;

ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage presentations" ON public.presentations;
CREATE POLICY "Admins manage presentations"
ON public.presentations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_presentations_updated_at ON public.presentations;
CREATE TRIGGER update_presentations_updated_at
BEFORE UPDATE ON public.presentations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Admins read presentation files" ON storage.objects;
CREATE POLICY "Admins read presentation files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'presentations' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins upload presentation files" ON storage.objects;
CREATE POLICY "Admins upload presentation files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'presentations' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update presentation files" ON storage.objects;
CREATE POLICY "Admins update presentation files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'presentations' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete presentation files" ON storage.objects;
CREATE POLICY "Admins delete presentation files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'presentations' AND public.has_role(auth.uid(), 'admin'));