# Umzug auf dein eigenes Supabase-Projekt

Ziel: Die App nutzt nicht mehr die Lovable-Cloud-Datenbank, sondern dein eigenes Supabase-Projekt `Fahrschule-me-prod` (jamal870's Org, AWS eu-central-2). Saubere, reversible Schritte, ohne Datenverlust und ohne Downtime für Kunden.

---

## Phase 1 — Vorbereitung im neuen Supabase-Projekt

1. In `Fahrschule-me-prod` notieren:
   - Project URL (`https://<ref>.supabase.co`)
   - `anon` public key
   - `service_role` key (geheim)
   - DB-Passwort
2. Auth-Provider konfigurieren (identisch zu heute):
   - Email/Passwort an
   - Google Provider (Client ID + Secret aus bestehender Google-Cloud-Console)
   - Site URL: `https://www.fahrschule-me.ch`
   - Redirect URLs: `https://www.fahrschule-me.ch/**`, `https://fahrschuleme.lovable.app/**`
3. Storage-Bucket `email-assets` (public) anlegen.

## Phase 2 — Schema & Daten migrieren

1. **Schema-Dump** aus aktueller Cloud-DB ziehen (alle Tabellen, Functions, Triggers, RLS-Policies, Enums wie `app_role`, `GRANT`s).
2. **Daten-Dump** aller relevanten Tabellen als CSV/SQL:
   `bookings, booking_items, course_dates, course_signatures, email_*, fahrstunden_*, promotions, suppressed_emails, team_members, user_roles, waitlist`
3. Im neuen Projekt: erst Schema einspielen, dann Daten.
4. Admin-User im neuen Projekt neu anlegen (Auth-User-IDs ändern sich!) und Eintrag in `user_roles` mit Rolle `admin` setzen.
5. Sequenzen / Storage-Inhalte (Logo etc.) übernehmen.

## Phase 3 — Secrets im neuen Projekt setzen

Edge Functions brauchen die gleichen Secrets wie heute:
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `LOVABLE_API_KEY` (für AI-Features) — oder durch eigenen Anbieter ersetzen
- `ELEVENLABS_API_KEY`, `GOOGLE_CALENDAR_API_KEY` (sofern weiter genutzt)
- `RESEND_API_KEY` / SMTP-Daten (E-Mail-Versand)

## Phase 4 — Edge Functions deployen

Alle 15 Functions aus `supabase/functions/` ins neue Projekt deployen (Supabase CLI: `supabase functions deploy --project-ref <neuer-ref>`). `config.toml` `verify_jwt`-Settings übernehmen.

## Phase 5 — Stripe Webhook umhängen

Im Stripe-Dashboard die Webhook-URL auf
`https://<neuer-ref>.supabase.co/functions/v1/stripe-webhook`
ändern, neues Signing-Secret kopieren und als `STRIPE_WEBHOOK_SECRET` im neuen Projekt setzen.

## Phase 6 — Frontend umschalten

Nur diese Werte im Hosting (Netlify) ändern:
- `VITE_SUPABASE_URL` → neue URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` → neuer anon key
- `VITE_SUPABASE_PROJECT_ID` → neuer ref

`src/integrations/supabase/client.ts` bleibt unverändert. `supabase/config.toml` `project_id` auf neuen ref setzen, damit Edge-Function-Deploys richtig laufen.

## Phase 7 — Test (Staging-Run vor DNS-Switch)

Auf der Lovable-Preview-URL mit neuen Env-Vars:
1. Admin-Login + Rollenprüfung
2. Kurs anlegen → in `course_dates` sichtbar
3. Buchung via `create-booking` → Stripe-Flow bis Webhook
4. E-Mail-Versand (Buchungsbestätigung + Admin-Notification)
5. Waitlist, Team, Promotions, iCal-Feed
6. PDF-Generierung

## Phase 8 — Go-Live

1. Netlify-Env-Vars produktiv setzen → Redeploy
2. Alte Cloud-DB 7 Tage als Backup behalten
3. Danach Lovable Cloud im Projekt deaktivieren

---

## Technische Details

- **HashRouter** bleibt — keine Routing-Änderung nötig.
- `tenant.ts` muss nicht angefasst werden (rein Branding).
- DB-Passwort & service_role gehören **nie** ins Repo — nur Supabase-Secrets / Netlify-Env.
- Auth-User-IDs sind nach Migration **neu**; alte `user_id`-Referenzen in `user_roles`, `bookings.user_id` etc. müssen beim Daten-Import gemappt werden (Mapping-Tabelle alte→neue UUID).
- Risiko: laufende Stripe-Checkout-Sessions zum Zeitpunkt des Switches → Cutover am besten nachts, kurze Wartung ankündigen.

## Was ich für dich übernehmen kann

- Schema- & Daten-Dump-Scripts schreiben
- Mapping-Script alte↔neue Auth-User-IDs
- `config.toml` + Env-Variablen-Vorlage anpassen
- Smoke-Test-Checkliste als Playwright-Script

## Was du selber machen musst (Lovable hat keinen Zugriff)

- Im neuen Supabase-Dashboard: Auth-Provider konfigurieren, Secrets eintragen, DB-Passwort vergeben
- Stripe Webhook-URL ändern
- Netlify Env-Vars aktualisieren

Sag mir, ob ich mit **Phase 2** (Dump-Scripts) starten soll, oder ob du vorher noch etwas am Plan ändern willst.
