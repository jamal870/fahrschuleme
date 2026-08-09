-- Reparatur der Admin-Rollen-Abfrage auf dem selbst gehosteten Backend (VPS)
-- Ausführen als Superuser/postgres:
--   psql "$DATABASE_URL" -v admin_email='info@l-me.ch' -f 5-fix-user-roles.sql

-- 1) Enum + Tabelle sicherstellen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 2) GRANTs (ohne diese liefert PostgREST "permission denied for table user_roles")
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL    ON public.user_roles TO service_role;

-- 3) RLS + Policy: jeder darf nur die eigenen Rollen lesen
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4) has_role() (SECURITY DEFINER, kein RLS-Rekursionsproblem)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 5) Admin-Rolle für den Login-Benutzer setzen (idempotent)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = :'admin_email'
ON CONFLICT (user_id, role) DO NOTHING;

-- 6) Kontrolle
SELECT u.email, r.role
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id
ORDER BY u.email;
