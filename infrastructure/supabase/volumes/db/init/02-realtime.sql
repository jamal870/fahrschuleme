-- Realtime benötigt ein eigenes Schema für seine Ecto-Migrationen.
CREATE SCHEMA IF NOT EXISTS _realtime;
ALTER SCHEMA _realtime OWNER TO supabase_admin;
GRANT ALL ON SCHEMA _realtime TO supabase_admin;
