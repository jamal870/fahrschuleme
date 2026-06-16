# Migration: Lovable Cloud → eigenes Supabase-Projekt (Fahrschule-me-prod)

Diese Scripts unterstützen den Umzug der Datenbank vom aktuellen Lovable-Cloud-Projekt
auf dein eigenes Supabase-Projekt `Fahrschule-me-prod` (jamal870's Org).

Reihenfolge der Schritte siehe `.lovable/plan.md`.

---

## Voraussetzungen (lokal auf deinem Mac)

- Postgres-Client (`psql`, `pg_dump`) — z. B. `brew install libpq && brew link --force libpq`
- Supabase CLI — `brew install supabase/tap/supabase`
- Stripe CLI (optional, fürs Webhook-Re-Routing) — `brew install stripe/stripe-cli/stripe`

## Verbindungsdaten

Lege dir lokal eine `.env.migration` an (NICHT committen):

```bash
# --- ALT: Lovable Cloud ---
OLD_DB_URL="postgres://postgres.<old-ref>:<old-db-pw>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
OLD_PROJECT_REF="dspspshgnointeqxgnrw"

# --- NEU: dein eigenes Projekt ---
NEW_DB_URL="postgres://postgres.<new-ref>:<new-db-pw>@aws-0-eu-central-2.pooler.supabase.com:5432/postgres"
NEW_PROJECT_REF="<neuer-ref>"
NEW_ANON_KEY="<neuer-anon-key>"
NEW_SERVICE_ROLE_KEY="<neuer-service-role-key>"
```

Die Passwörter & service_role siehst du **nur** im Supabase-Dashboard
(Project Settings → Database / API). Lovable kann da nicht ran.

---

## Schritt-für-Schritt

### 1. Schema dumpen (Struktur, keine Daten)

```bash
source .env.migration
bash scripts/migration/1-dump-schema.sh
```
Ergebnis: `scripts/migration/out/schema.sql`

### 2. Daten dumpen (nur Inhalt der Public-Tabellen)

```bash
bash scripts/migration/2-dump-data.sh
```
Ergebnis: `scripts/migration/out/data.sql`

### 3. Schema ins neue Projekt einspielen

```bash
bash scripts/migration/3-restore-schema.sh
```

### 4. Daten ins neue Projekt einspielen

```bash
bash scripts/migration/4-restore-data.sh
```

### 5. Admin-User im neuen Projekt anlegen

Im neuen Supabase-Dashboard unter Authentication → Users → "Add user"
deinen Admin-Account anlegen (Email + Passwort).

Danach im SQL Editor des **neuen** Projekts:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = 'DEINE-ADMIN-EMAIL@example.com';
```

### 6. Storage-Bucket `email-assets` neu anlegen

Im neuen Projekt unter Storage → "New bucket": `email-assets`, **public**.
Logo-Dateien aus dem alten Bucket runter- und neu hochladen.

### 7. Edge Functions deployen

```bash
supabase link --project-ref "$NEW_PROJECT_REF"
supabase functions deploy --no-verify-jwt \
  add-to-waitlist create-booking create-course-payment handle-email-suppression \
  handle-email-unsubscribe ical-feed send-course-reminders stripe-webhook

supabase functions deploy \
  move-booking-participant parse-course-photo preview-transactional-email \
  process-email-queue send-transactional-email sync-course-to-gcal
```

### 8. Secrets im neuen Projekt setzen

```bash
supabase secrets set --project-ref "$NEW_PROJECT_REF" \
  STRIPE_SECRET_KEY="sk_live_..." \
  STRIPE_WEBHOOK_SECRET="whsec_..." \
  LOVABLE_API_KEY="..." \
  RESEND_API_KEY="..."
```

### 9. Stripe Webhook umhängen

Stripe-Dashboard → Developers → Webhooks → bestehenden Endpoint editieren:
neue URL = `https://<NEW_PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`
Signing-Secret kopieren → Schritt 8 erneut mit neuem `STRIPE_WEBHOOK_SECRET`.

### 10. Frontend umschalten

Im Netlify-Dashboard (Site → Settings → Environment) diese drei Variablen ändern:
- `VITE_SUPABASE_URL` = `https://<NEW_PROJECT_REF>.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = neuer anon key
- `VITE_SUPABASE_PROJECT_ID` = neuer ref

Danach Redeploy auslösen.

### 11. Smoke-Test

Siehe `scripts/migration/smoke-test.md`.

---

## Rollback

Wenn etwas schiefgeht: in Netlify die alten drei Env-Werte
(`dspspshgnointeqxgnrw` …) wieder eintragen und Redeploy.
Die alte Cloud-DB bleibt mindestens 7 Tage unverändert.
