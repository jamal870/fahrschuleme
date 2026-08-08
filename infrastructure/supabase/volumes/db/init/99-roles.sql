
-- Basis-Rollen für PostgREST/JWT (ohne Login) + Mitgliedschaften
DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon','authenticated','service_role'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN NOINHERIT', r);
    END IF;
    EXECUTE format('GRANT %I TO authenticator', r);
    EXECUTE format('GRANT %I TO supabase_admin', r);
  END LOOP;
END
$$;

-- Eigene Schemas für auth/storage anlegen und den Admin-Rollen übereignen
CREATE SCHEMA IF NOT EXISTS auth    AUTHORIZATION supabase_auth_admin;
CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION supabase_storage_admin;
ALTER SCHEMA auth    OWNER TO supabase_auth_admin;
ALTER SCHEMA storage OWNER TO supabase_storage_admin;

-- Erweiterte Rechte: die Admin-Rollen führen Migrationen aus und brauchen
-- deshalb CREATEROLE sowie vollen Datenbankzugriff.
ALTER ROLE supabase_auth_admin    WITH CREATEROLE;
ALTER ROLE supabase_storage_admin WITH CREATEROLE;
ALTER ROLE supabase_admin         WITH SUPERUSER CREATEROLE CREATEDB REPLICATION BYPASSRLS;

DO $$
DECLARE db_name text := current_database();
BEGIN
  EXECUTE format('GRANT ALL PRIVILEGES ON DATABASE %I TO supabase_auth_admin', db_name);
  EXECUTE format('GRANT ALL PRIVILEGES ON DATABASE %I TO supabase_storage_admin', db_name);
END
$$;

GRANT ALL ON SCHEMA public TO supabase_auth_admin, supabase_storage_admin, supabase_admin;
GRANT USAGE ON SCHEMA auth    TO supabase_auth_admin, authenticator, service_role;
GRANT USAGE ON SCHEMA storage TO supabase_storage_admin, authenticator, service_role;
ALTER ROLE supabase_auth_admin    SET search_path = auth, public;
ALTER ROLE supabase_storage_admin SET search_path = storage, public;
