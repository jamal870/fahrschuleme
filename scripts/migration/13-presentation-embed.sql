-- v1.9.5: Google-Slides/Drive-Embed für 1:1-Wiedergabe (Animationen + Videos)
ALTER TABLE public.presentations
  ADD COLUMN IF NOT EXISTS embed_url text;

COMMENT ON COLUMN public.presentations.embed_url IS
  'Google Slides / Google Drive Link. Wird im Admin im Original-Player eingebettet.';
