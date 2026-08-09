-- Reparatur der fehlenden Tabellen-Rechte (GRANTs) auf dem selbst gehosteten Backend (VPS)
--
-- Symptom: "permission denied for table site_content" (o. a. Tabellen) im Admin-Bereich,
-- obwohl RLS-Policies existieren. Ursache: beim Schema-Import wurden die GRANTs nicht
-- mitübernommen. RLS allein genügt nicht – PostgREST braucht zusätzlich GRANTs.
--
-- Ausführen als Superuser/postgres:
--   psql "$DATABASE_URL" -f 6-fix-grants.sql

-- 1) Schema-Zugriff
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2) Lesezugriff für alle (RLS filtert weiterhin, was sichtbar ist)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- 3) Schreibzugriff für eingeloggte Nutzer (RLS entscheidet, was erlaubt ist)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- 4) Voller Zugriff für Edge Functions / Admin-Code
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 5) Sequenzen (für Tabellen mit serial/identity-Spalten)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 6) Funktionen (z. B. has_role, get_booking_status)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- 7) Defaults für künftig angelegte Objekte
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- 8) Kontrolle: Rechte pro Tabelle anzeigen
SELECT table_name, grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;
