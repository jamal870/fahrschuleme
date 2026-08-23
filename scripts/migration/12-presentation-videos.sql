-- v1.9.5 — Videos pro Folie für Admin-Präsentationen
-- Auf dem VPS ausführen:
--   docker exec -i supabase-db psql -U postgres -d postgres < 12-presentation-videos.sql

ALTER TABLE public.presentations
  ADD COLUMN IF NOT EXISTS videos jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Videos können gross sein: Bucket-Limit auf 500 MB anheben
UPDATE storage.buckets
SET file_size_limit = 524288000
WHERE id = 'presentations';
