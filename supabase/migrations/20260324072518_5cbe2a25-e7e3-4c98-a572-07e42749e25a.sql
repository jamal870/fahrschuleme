-- Allow pending booking states needed for online payments
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_status_check
CHECK (
  status = ANY (
    ARRAY[
      'pending'::text,
      'pending_payment'::text,
      'confirmed'::text,
      'cancelled'::text
    ]
  )
);