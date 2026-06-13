ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS discount_price numeric,
  ADD COLUMN IF NOT EXISTS original_price numeric;

ALTER TABLE public.promotions
  DROP CONSTRAINT IF EXISTS promotions_category_check;
ALTER TABLE public.promotions
  ADD CONSTRAINT promotions_category_check
  CHECK (category IS NULL OR category IN ('grundkurs','fahrstunden_auto','fahrstunden_motorrad','mgk'));

CREATE INDEX IF NOT EXISTS promotions_active_category_idx
  ON public.promotions (category, active);