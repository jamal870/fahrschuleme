-- Repariert/initialisiert alle von Auth, Storage und PostgREST benötigten
-- Systemrollen, Passwörter, Mitgliedschaften, Schemas und Rechte.
-- Idempotent: wird sowohl bei initdb als auch nach jedem Stack-Start ausgeführt.
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

-- JWT-/PostgREST-Rollen fehlen bei teilweise initialisierten Datenverzeichnissen
-- gelegentlich vollständig. Sie dürfen sich nicht direkt anmelden.
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN NOINHERIT', r);
    END IF;
    EXECUTE format('GRANT %I TO authenticator', r);
    EXECUTE format('GRANT %I TO supabase_admin', r);
  END LOOP;
END
$$;

-- Auth und Storage legen ihre Tabellen bei ihrem ersten Start selbst an.
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;
CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION supabase_storage_admin;
ALTER SCHEMA auth OWNER TO supabase_auth_admin;
ALTER SCHEMA storage OWNER TO supabase_storage_admin;

ALTER ROLE supabase_admin WITH SUPERUSER CREATEROLE CREATEDB REPLICATION BYPASSRLS;
ALTER ROLE supabase_auth_admin WITH LOGIN CREATEROLE;
ALTER ROLE supabase_storage_admin WITH LOGIN CREATEROLE;

DO $$
DECLARE db_name text := current_database();
BEGIN
  EXECUTE format('GRANT ALL PRIVILEGES ON DATABASE %I TO supabase_auth_admin', db_name);
  EXECUTE format('GRANT ALL PRIVILEGES ON DATABASE %I TO supabase_storage_admin', db_name);
END
$$;

GRANT ALL ON SCHEMA public TO supabase_auth_admin, supabase_storage_admin, supabase_admin;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT USAGE ON SCHEMA auth TO authenticator, service_role;
GRANT USAGE ON SCHEMA storage TO authenticator, service_role;

ALTER ROLE supabase_auth_admin SET search_path = auth, public;
ALTER ROLE supabase_storage_admin SET search_path = storage, public;
