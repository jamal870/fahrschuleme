ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';

-- Bestehende Daten: alles was online via Stripe/Karte bezahlt wurde → 'paid'
UPDATE public.bookings
SET payment_status = 'paid'
WHERE lower(payment_method) LIKE '%stripe%'
   OR lower(payment_method) LIKE '%karte%'
   OR lower(payment_method) LIKE '%twint%'
   OR lower(payment_method) LIKE '%online%';

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);