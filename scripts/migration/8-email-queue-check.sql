-- Diagnose: Warum kommen keine Bestätigungs-E-Mails an? (self-hosted Stack)
-- Ausführen auf dem VPS:
--   docker exec -i supabase-db psql -U postgres -d postgres -f - < 8-email-queue-check.sql

\echo '--- Letzte Buchungen ---'
SELECT id, first_name, last_name, email, status, payment_status, created_at
FROM public.bookings ORDER BY created_at DESC LIMIT 5;

\echo '--- Letzte E-Mail-Logs (letzte 20) ---'
SELECT created_at, template_name, recipient_email, status, left(coalesce(error_message,''), 120) AS fehler
FROM public.email_send_log ORDER BY created_at DESC LIMIT 20;

\echo '--- Warteschlange: unversendete Mails ---'
SELECT count(*) AS transactional_wartend FROM pgmq.q_transactional_emails;
SELECT count(*) AS auth_wartend FROM pgmq.q_auth_emails;

\echo '--- Dead-Letter-Queue ---'
SELECT count(*) AS dlq FROM pgmq.q_transactional_emails_dlq;

\echo '--- Backoff-Status ---'
SELECT * FROM public.email_send_state;

\echo '--- Cron-Jobs (falls pg_cron vorhanden) ---'
SELECT jobname, schedule, active FROM cron.job;

\echo '--- Unterdrueckte Empfaenger ---'
SELECT email, reason, created_at FROM public.suppressed_emails ORDER BY created_at DESC LIMIT 10;
