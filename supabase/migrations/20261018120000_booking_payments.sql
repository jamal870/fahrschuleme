-- Teilzahlungen pro Buchung. bookings.payment_status wird per Trigger aus der
-- Summe der Zahlungen abgeleitet: paid / partial / pending.

CREATE TABLE IF NOT EXISTS public.booking_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  method text NOT NULL,                 -- bar | ueberweisung | twint | stripe | sonstiges
  paid_at date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  stripe_session_id text,               -- gesetzt bei automatischen Stripe-Zahlungen (idempotent)
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS booking_payments_stripe_session_uidx
  ON public.booking_payments (stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS booking_payments_booking_idx ON public.booking_payments (booking_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_payments TO authenticated;
GRANT ALL ON public.booking_payments TO service_role;

ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage booking payments" ON public.booking_payments;
CREATE POLICY "Admins manage booking payments" ON public.booking_payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Zahlungsstatus der Buchung aus den Zahlungen ableiten
CREATE OR REPLACE FUNCTION public.recalc_booking_payment_status(_booking_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _paid numeric;
  _total numeric;
  _status text;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO _paid FROM public.booking_payments WHERE booking_id = _booking_id;
  SELECT total_price INTO _total FROM public.bookings WHERE id = _booking_id;
  IF _total IS NULL THEN RETURN; END IF;
  IF _paid <= 0 THEN _status := 'pending';
  ELSIF _paid + 0.005 >= _total THEN _status := 'paid';
  ELSE _status := 'partial';
  END IF;
  UPDATE public.bookings SET payment_status = _status WHERE id = _booking_id AND payment_status IS DISTINCT FROM _status;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_booking_payments_recalc()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalc_booking_payment_status(OLD.booking_id);
    RETURN OLD;
  END IF;
  PERFORM public.recalc_booking_payment_status(NEW.booking_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_payments_recalc ON public.booking_payments;
CREATE TRIGGER booking_payments_recalc
  AFTER INSERT OR UPDATE OR DELETE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION public.trg_booking_payments_recalc();

-- Bestand: Buchungen, die bereits als "paid" markiert sind, bekommen eine
-- Zahlung über den vollen Betrag, damit Finanzen und Status zusammenpassen.
INSERT INTO public.booking_payments (booking_id, amount, method, paid_at, note)
SELECT b.id, b.total_price,
       CASE
         WHEN lower(b.payment_method) LIKE '%stripe%' OR lower(b.payment_method) LIKE '%karte%' OR lower(b.payment_method) LIKE '%online%' THEN 'stripe'
         WHEN lower(b.payment_method) LIKE '%twint%' THEN 'twint'
         WHEN lower(b.payment_method) LIKE '%bar%' THEN 'bar'
         WHEN lower(b.payment_method) LIKE '%berweis%' OR lower(b.payment_method) LIKE '%bank%' OR lower(b.payment_method) LIKE '%rechnung%' THEN 'ueberweisung'
         ELSE 'sonstiges'
       END,
       COALESCE(b.updated_at::date, b.created_at::date),
       'Bestand: als bezahlt markiert (automatisch übernommen)'
FROM public.bookings b
WHERE b.payment_status = 'paid' AND b.total_price > 0
  AND NOT EXISTS (SELECT 1 FROM public.booking_payments p WHERE p.booking_id = b.id);
