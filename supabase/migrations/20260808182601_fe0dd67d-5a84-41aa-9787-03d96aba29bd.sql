CREATE TABLE IF NOT EXISTS public.google_reviews_cache (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.google_reviews_cache TO service_role;
ALTER TABLE public.google_reviews_cache ENABLE ROW LEVEL SECURITY;