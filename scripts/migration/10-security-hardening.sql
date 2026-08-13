-- Sicherheits-Härtung (Audit 14.08.2026) — auch auf dem VPS-Backend ausführen:
--   psql "$DATABASE_URL" -f scripts/migration/10-security-hardening.sql

-- 1) Interne SECURITY DEFINER Funktionen nur noch serverseitig aufrufbar
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.increment_spots(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.decrement_spots(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.auto_decrement_spots() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM anon, authenticated, public;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_spots(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.decrement_spots(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_decrement_spots() TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_wake() TO service_role;

-- 2) Rollenprüfung nur für angemeldete Nutzer, Buchungsstatus bleibt öffentlich
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_booking_status(uuid) TO anon, authenticated, service_role;

-- 3) Anonyme Schreibrechte entziehen
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES ON ALL TABLES IN SCHEMA public FROM anon;

-- 4) Anonyme Leserechte auf sensible Tabellen entziehen
REVOKE SELECT ON
  public.bookings, public.booking_items, public.course_signatures, public.waitlist,
  public.user_roles, public.email_send_log, public.email_send_state, public.email_settings,
  public.email_unsubscribe_tokens, public.suppressed_emails, public.ai_providers,
  public.ai_assistant_config, public.google_reviews_cache
FROM anon;

-- 5) Interne Tabellen auch für eingeloggte Nutzer sperren
REVOKE SELECT, INSERT, UPDATE, DELETE ON
  public.email_send_log, public.email_send_state, public.email_unsubscribe_tokens,
  public.suppressed_emails, public.ai_providers, public.google_reviews_cache
FROM authenticated;

-- 6) Defaults + Service Role
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

NOTIFY pgrst, 'reload schema';
