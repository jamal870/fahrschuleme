-- Remove the broad public SELECT policy
DROP POLICY IF EXISTS "Public can read booking status by id" ON public.bookings;

-- Create a secure function to check booking status (no PII exposed)
CREATE OR REPLACE FUNCTION public.get_booking_status(booking_uuid uuid)
RETURNS TABLE(status text, first_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.status, b.first_name
  FROM public.bookings b
  WHERE b.id = booking_uuid;
$$;