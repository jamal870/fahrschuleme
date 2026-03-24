-- Remove public INSERT policies on bookings and booking_items
-- These will now only be insertable via the create-booking edge function (service_role)

DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create booking items" ON public.booking_items;

-- Add service_role-only INSERT policies
CREATE POLICY "Service role can create bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can create booking items"
ON public.booking_items
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');