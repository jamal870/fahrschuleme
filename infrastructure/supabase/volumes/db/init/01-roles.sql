-- Setzt die Passwörter der Supabase-Systemrollen auf POSTGRES_PASSWORD.
-- Idempotent + fehlertolerant; kann jederzeit erneut ausgeführt werden.
\set pgpass `echo "$POSTGRES_PASSWORD"`
\o /dev/null
SELECT set_config('supabase.setup_pw', :'pgpass', false);
\o

DO $$
DECLARE
  pw text := current_setting('supabase.setup_pw');
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

-- Auth und Storage führen beim ersten Start eigene Migrationen aus. Dafür
-- benötigen ihre Admin-Rollen CREATE auf der Datenbank sowie CREATE/USAGE im
-- public-Schema (u. a. für schema_migrations und das storage-Schema).
DO $$
DECLARE
  db_name text := current_database();
  r       text;
BEGIN
  FOREACH r IN ARRAY ARRAY['supabase_auth_admin', 'supabase_storage_admin'] LOOP
    EXECUTE format('GRANT CONNECT, CREATE, TEMPORARY ON DATABASE %I TO %I', db_name, r);
    EXECUTE format('GRANT USAGE, CREATE ON SCHEMA public TO %I', r);
  END LOOP;
END
$$;
