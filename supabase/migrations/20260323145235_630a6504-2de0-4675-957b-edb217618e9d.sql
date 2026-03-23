
-- Allow authenticated users to INSERT course_dates
CREATE POLICY "Authenticated users can insert course_dates"
ON public.course_dates
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to UPDATE course_dates
CREATE POLICY "Authenticated users can update course_dates"
ON public.course_dates
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to DELETE course_dates
CREATE POLICY "Authenticated users can delete course_dates"
ON public.course_dates
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to SELECT bookings
CREATE POLICY "Authenticated users can read bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to SELECT booking_items
CREATE POLICY "Authenticated users can read booking_items"
ON public.booking_items
FOR SELECT
TO authenticated
USING (true);
