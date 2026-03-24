-- Fix 3: Remove public SELECT policy that exposes all booking PII
DROP POLICY IF EXISTS "Allow public read bookings by id" ON public.bookings;

-- Fix 1: Remove public UPDATE policy - only webhook (service role) should confirm
DROP POLICY IF EXISTS "Allow public update of pending bookings status" ON public.bookings;