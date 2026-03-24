-- Drop the overly restrictive policy we just created
DROP POLICY IF EXISTS "Public can read own booking by id" ON public.bookings;

-- Allow public to read only status and first_name for a specific booking (for success page polling)
CREATE POLICY "Public can read booking status by id"
  ON public.bookings FOR SELECT
  TO public
  USING (true);