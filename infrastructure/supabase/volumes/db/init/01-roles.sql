-- Setzt die Passwörter der Supabase-Systemrollen auf POSTGRES_PASSWORD.
-- Idempotent + fehlertolerant: nur vorhandene Rollen werden angefasst,
-- fehlende Rollen werden angelegt. Kann jederzeit erneut ausgeführt werden.
\set pgpass `echo "$POSTGRES_PASSWORD"`

DO $$
DECLARE
  pw text := :'pgpass';
  r  text;
BEGIN
  FOREACH r IN ARRAY ARRAY[
    'authenticator',
    'pgbouncer',
    'supabase_auth_admin',
    'supabase_functions_admin',
    'supabase_storage_admin',
    'supabase_admin',
    'supabase_read_only_user',
    'dashboard_user'
  ] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('CREATE ROLE %I LOGIN', r);
    END IF;
    EXECUTE format('ALTER ROLE %I WITH LOGIN PASSWORD %L', r, pw);
  END LOOP;
END
$$;
