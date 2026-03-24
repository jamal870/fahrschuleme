CREATE POLICY "Allow public read bookings by id" ON public.bookings FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Bookings readable by service role only" ON public.bookings;