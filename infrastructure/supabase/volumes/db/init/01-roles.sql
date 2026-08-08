-- Setzt die Passwörter der Supabase-Systemrollen auf POSTGRES_PASSWORD.
-- Läuft nur beim allerersten Start (leeres Datenverzeichnis).
\set pgpass `echo "$POSTGRES_PASSWORD"`

ALTER USER authenticator            WITH PASSWORD :'pgpass';
ALTER USER pgbouncer                WITH PASSWORD :'pgpass';
ALTER USER supabase_auth_admin      WITH PASSWORD :'pgpass';
ALTER USER supabase_functions_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_storage_admin   WITH PASSWORD :'pgpass';
ALTER USER supabase_admin           WITH PASSWORD :'pgpass';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_read_only_user') THEN
    CREATE ROLE supabase_read_only_user LOGIN BYPASSRLS;
  END IF;
END
$$;
ALTER USER supabase_read_only_user WITH PASSWORD :'pgpass';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'dashboard_user') THEN
    CREATE ROLE dashboard_user NOINHERIT CREATEROLE CREATEDB REPLICATION BYPASSRLS;
  END IF;
END
$$;
