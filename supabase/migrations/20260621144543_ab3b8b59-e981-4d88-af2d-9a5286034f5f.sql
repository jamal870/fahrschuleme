
-- Site content table: editable site-wide settings (key/value JSONB)
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_content_public_read"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "site_content_admin_insert"
  ON public.site_content FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "site_content_admin_update"
  ON public.site_content FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "site_content_admin_delete"
  ON public.site_content FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial values (mirrors src/config/tenant.ts so admin forms show current values)
INSERT INTO public.site_content (key, value) VALUES
  ('brand', '{"name":"Fahrschule me","tagline":"Erfahrene Instruktoren · Kleine Gruppen","logoText":{"main":"Fahrschule","accent":"me","sub":""}}'::jsonb),
  ('contact', '{"phone":"076 779 03 83","email":"info@l-me.ch","whatsappUrl":"https://wa.me/41767790383","address":{"street":"Fahrschule me","detail":"Bahnhofstrasse 56","city":"5430 Wettingen"},"openingHours":"Mo–Sa 08:00–22:00"}'::jsonb),
  ('legal', '{"ownerName":"Jimmy Ettanaghmalti","jurisdiction":"Wettingen, Kanton Aargau","standDate":"Juni 2026","processingFeeChf":"30.–","latePaymentInterestPct":"5","cancellationNoticeHours":"24","medicalCertificateDays":"5"}'::jsonb),
  ('bank', '{"accountHolder":"Jamal Ettanaghmalti","bank":"PostFinance","iban":"CH5009000000167884324","bic":"POFICHBEXXX"}'::jsonb),
  ('pricing_auto', '[{"name":"Admin Beitrag einmalig","price":"130.-","note":"Beinhaltet Administrationsgebühren und Vollkaskoversicherung"},{"name":"Einzellektion (45min)","price":"95.-"},{"name":"Doppellektion (2x45Min)","price":"190.-"},{"name":"Auf Rechnung (45min)","price":"95.-"}]'::jsonb),
  ('pricing_auto_abos', '[{"name":"10er Abo","price":"900.-","note":"Kaufe 10 Fahrstunden und spare 50.- auf den Gesamtpreis"},{"name":"20er Abo","price":"1760.-","note":"Kaufe 20 Fahrstunden und spare 150.- auf den Gesamtpreis"}]'::jsonb),
  ('pricing_motorrad', '[{"name":"Einzellektion (60Min)","price":"130.-"},{"name":"Doppellektion (2x45Min)","price":"180.-"},{"name":"Motorrad Vorschulung Doppellektion","price":"180.-"},{"name":"Vor-Prüfungsfahrt inkl. Prüfung (120min)","price":"180.-"}]'::jsonb),
  ('pricing_motorrad_grundkurs', '[{"name":"M1 (4h)","price":"160.-"},{"name":"M2 (4h)","price":"160.-"},{"name":"M3 (4h)","price":"160.-"},{"name":"Motorrad Tageskurs (4h)","price":"200.-"}]'::jsonb),
  ('pricing_extras', '[{"title":"Verkehrskunde","name":"Verkehrskunde","price":"130.-","note":"Inkl. der obligatorischen VKU-Unterlagen"},{"title":"Nothelfer","name":"Nothelfer","price":"130.-","note":"Inkl. Kursdokumentation und Nothelferausweis (6 Jahre gültig)"}]'::jsonb),
  ('chatbot', '{"welcomeMessage":"Hoi! 👋 Willkommen bei **Fahrschule me** in Wettingen.\nWie kann ich dir helfen?","grundkursIntro":"Super! Der Motorrad-Grundkurs bei Fahrschule me dauert 12 Stunden (3 Teile). Er ist gesetzlich vorgeschrieben für alle Kategorien.\n\nWelche Kategorie interessiert dich?","fahrstundenIntro":"Fahrstunden bei Fahrschule me – flexibel Mo–Sa von 08–22 Uhr.\n\nWas möchtest du buchen?"}'::jsonb),
  ('footer', '{"copyright":"© 2026 Fahrschule me. Alle Rechte vorbehalten."}'::jsonb)
ON CONFLICT (key) DO NOTHING;
