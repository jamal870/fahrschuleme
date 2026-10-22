-- Öffentliche Lesepolicy für team_members ohne has_role().
-- has_role() ist für anon bewusst nicht ausführbar (Security-Hardening); die
-- bisherige Policy rief sie im OR-Zweig auf und lieferte für nicht angemeldete
-- Besucher "permission denied for function has_role" (42501) statt der
-- sichtbaren Mitglieder. Admins sehen weiterhin alle Zeilen über
-- admin_full_access.
DROP POLICY IF EXISTS "Public can view visible team members" ON public.team_members;
CREATE POLICY "Public can view visible team members" ON public.team_members
  FOR SELECT TO anon, authenticated
  USING (is_visible = true);
