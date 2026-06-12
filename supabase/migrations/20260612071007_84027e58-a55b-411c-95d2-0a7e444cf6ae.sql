
-- Tighten course_dates writes to admins only (reads stay public)
DROP POLICY IF EXISTS "Authenticated users can insert course_dates" ON public.course_dates;
DROP POLICY IF EXISTS "Authenticated users can update course_dates" ON public.course_dates;
DROP POLICY IF EXISTS "Authenticated users can delete course_dates" ON public.course_dates;

CREATE POLICY "Admins can insert course_dates" ON public.course_dates
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update course_dates" ON public.course_dates
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete course_dates" ON public.course_dates
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Tighten waitlist read/write to admins only (inserts go via add-to-waitlist edge function with service role)
DROP POLICY IF EXISTS "Authenticated can view waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated can update waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated can delete waitlist" ON public.waitlist;

CREATE POLICY "Admins can view waitlist" ON public.waitlist
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update waitlist" ON public.waitlist
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete waitlist" ON public.waitlist
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Prevent privilege escalation: only admins (or service role) can modify user_roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
