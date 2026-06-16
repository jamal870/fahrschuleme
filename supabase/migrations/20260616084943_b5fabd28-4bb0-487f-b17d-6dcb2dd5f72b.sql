
CREATE TABLE public.email_settings (
  id INT PRIMARY KEY DEFAULT 1,
  from_name TEXT NOT NULL DEFAULT 'Drive me Fahrschule',
  reply_to_email TEXT NOT NULL DEFAULT 'info@l-me.ch',
  footer_signature TEXT NOT NULL DEFAULT 'Freundliche Grüsse,\nDas Drive me Fahrschule Team',
  bank_info TEXT NOT NULL DEFAULT 'Jamal Ettanaghmalti\nBank: PostFinance\nIBAN: CH5009000000167884324\nBIC: POFICHBEXXX',
  mgk_greeting_extra TEXT NOT NULL DEFAULT 'Danke für deine Bestellung!',
  mgk_meeting_point TEXT NOT NULL DEFAULT 'Für Kurse in Wettingen:\nLandstrasse 99\nCenterpassage\nOttos Rampe\n5430 Wettingen',
  mgk_important_notes TEXT NOT NULL DEFAULT 'Am ersten Kurstag den Personalausweis (ID, Pass) und Lernfahrausweis mitbringen!\nKursgebühren sind am ersten Tag zu bezahlen.\nZahle Bar oder mit Karte vor Ort.',
  mgk_cancellation_policy TEXT NOT NULL DEFAULT 'Diese Anmeldung ist verbindlich: Umbuchungen bzw. Stornierungen sind bis 5 Tage vor Kursbeginn schriftlich an info@l-me.ch möglich, danach wird die volle Kursgebühr in Rechnung gestellt.',
  fahrstunden_greeting_extra TEXT NOT NULL DEFAULT 'Danke für deine Buchung!',
  fahrstunden_meeting_point TEXT NOT NULL DEFAULT 'Bahnhof Wettingen',
  fahrstunden_important_notes TEXT NOT NULL DEFAULT 'Stornierungen oder Umbuchungen sind bis 24 Stunden vor der Fahrstunde schriftlich an info@l-me.ch möglich, danach wird der volle Betrag in Rechnung gestellt.',
  reminder_extra_note TEXT NOT NULL DEFAULT 'Die druckbare Teilnehmerliste kannst du im Admin-Portal unter „Kurstermine" herunterladen.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT email_settings_singleton CHECK (id = 1)
);

GRANT SELECT, INSERT, UPDATE ON public.email_settings TO authenticated;
GRANT ALL ON public.email_settings TO service_role;

ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read email_settings"
  ON public.email_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert email_settings"
  ON public.email_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update email_settings"
  ON public.email_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_email_settings_updated_at
  BEFORE UPDATE ON public.email_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.email_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
