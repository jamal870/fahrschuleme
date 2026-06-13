
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price text,
  badge text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promotions TO anon;
GRANT SELECT ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active promotions"
ON public.promotions FOR SELECT
USING (active = true);

CREATE POLICY "Admins can view all promotions"
ON public.promotions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert promotions"
ON public.promotions FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update promotions"
ON public.promotions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete promotions"
ON public.promotions FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
