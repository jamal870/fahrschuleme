-- Repariert Admin-Schreibzugriffe auf dem selbst gehosteten Backend.
-- Ausführen als postgres/Superuser:
--   cd /pfad/zum/repository
--   psql "$DATABASE_URL" -f scripts/migration/7-fix-admin-write-policies.sql

BEGIN;

GRANT USAGE ON SCHEMA public TO authenticated;

-- Nur Tabellen freigeben, die der Admin-Bereich tatsächlich verwaltet.
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.bookings,
  public.booking_items,
  public.course_dates,
  public.course_signatures,
  public.waitlist,
  public.team_members,
  public.promotions,
  public.email_settings,
  public.site_content
TO authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Eine zusätzliche permissive Admin-Policy ergänzt eventuell unvollständig
-- importierte Einzel-Policies. has_role() ist SECURITY DEFINER und vermeidet
-- eine RLS-Rekursion über user_roles.
DO $policy$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'bookings',
    'booking_items',
    'course_dates',
    'course_signatures',
    'waitlist',
    'team_members',
    'promotions',
    'email_settings',
    'site_content'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS admin_full_access ON public.%I', table_name);
    EXECUTE format(
      'CREATE POLICY admin_full_access ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::public.app_role))',
      table_name
    );
  END LOOP;
END
$policy$;

-- PostgREST auf dem VPS veranlassen, Schema und Policies sofort neu einzulesen.
NOTIFY pgrst, 'reload schema';

COMMIT;

-- Kontrolle: Für jede Tabelle muss admin_full_access erscheinen.
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname = 'admin_full_access'
ORDER BY tablename;