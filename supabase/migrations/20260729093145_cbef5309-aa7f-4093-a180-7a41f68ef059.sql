CREATE POLICY "Public read access to email assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'email-assets');