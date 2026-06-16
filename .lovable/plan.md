# Migrationsplan: Fahrschule-App → Kunden-eigenes Supabase

Ziel: Komplette Ablösung der aktuellen Lovable-Cloud-Datenbank durch ein eigenes Supabase-Projekt des Kunden, ohne Datenverlust und ohne Downtime für Buchungen/Zahlungen.

---

## Phase 0 — Vorbereitung (Kunde + du, ~30 Min)

1. **Kunde legt neues Supabase-Projekt an** (Region: Frankfurt empfohlen wegen DSGVO/Latenz).
2. Kunde teilt:
   - Project URL (`https://xxxx.supabase.co`)
   - `anon` public key
   - `service_role` key (geheim)
   - Datenbank-Passwort (für `pg_dump`/`pg_restore`)
3. **Postgres-Tools auf deinem Mac**: `brew install libpq` → `pg_dump`/`psql` verfügbar.
4. **Backup der aktuellen DB** als Sicherheitsnetz (CSV-Export pro Tabelle aus Lovable Cloud).

---

## Phase 1 — Schema übertragen (~20 Min)

Alle bestehenden Tabellen, Funktionen, Policies, Trigger 1:1 ins neue Projekt.

**Betroffene Tabellen** (15 Stück):
`bookings`, `booking_items`, `course_dates`, `course_signatures`, `fahrstunden_packages`, `fahrstunden_services`, `promotions`, `team_members`, `waitlist`, `user_roles`, `email_send_log`, `email_send_state`, `email_settings`, `email_unsubscribe_tokens`, `suppressed_emails`

**Funktionen** (10): `has_role`, `increment_spots`, `decrement_spots`, `auto_decrement_spots`, `get_booking_status`, `update_updated_at_column`, `enqueue_email`, `read_email_batch`, `delete_email`, `move_to_dlq`

**Extensions**: `pgcrypto`, `pgmq`, `pg_cron`, `pg_net`, `vault`

**Vorgehen**: Schema-only-Dump aus alter DB, einspielen in neue DB:
```bash
pg_dump --schema-only --no-owner --no-acl \
  -h <alt> -U postgres -d postgres \
  --schema=public \
  > schema.sql
psql -h <neu> -U postgres -d postgres -f schema.sql
```

---

## Phase 2 — Daten übertragen (~15 Min)

Data-only-Dump in richtiger Reihenfolge (FK-Abhängigkeiten):
```bash
pg_dump --data-only --no-owner --disable-triggers \
  -h <alt> -d postgres --schema=public \
  > data.sql
psql -h <neu> -d postgres -f data.sql
```
Trigger werden während Import deaktiviert, damit `auto_decrement_spots` nicht doppelt feuert.

**Verifikation**: Row-Counts pro Tabelle alt vs. neu vergleichen.

---

## Phase 3 — Storage-Bucket (~5 Min)

`email-assets` Bucket im neuen Projekt anlegen (public). Falls Inhalte vorhanden: Dateien via Supabase CLI rüberkopieren.

---

## Phase 4 — Auth-Konfiguration (~10 Min)

- Site URL, Redirect URLs setzen
- Google-Provider neu konfigurieren (Client ID/Secret übertragen)
- Email-Hook (`auth-email-hook`) später nach Edge-Functions-Deploy aktivieren
- **Bestehende User**: Auth-User aus altem Projekt exportieren und ins neue importieren (Supabase-CLI `auth users`)

---

## Phase 5 — Edge Functions deployen (~15 Min)

Alle Functions aus `supabase/functions/` ins neue Projekt deployen via Supabase CLI:
`create-booking`, `stripe-webhook`, `stripe-checkout`, `send-transactional-email`, `auth-email-hook`, `process-email-queue`, `handle-email-unsubscribe`, `send-course-reminders` etc.

**Secrets im neuen Projekt setzen**:
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LOVABLE_API_KEY` (oder Alternative), `RESEND_API_KEY`/Email-Konfig, `GOOGLE_CALENDAR_API_KEY`, `ELEVENLABS_API_KEY`.

---

## Phase 6 — Email-Infrastruktur (~10 Min)

- Email-Domain im neuen Projekt neu provisionieren (DNS-Records beim Registrar aktualisieren)
- pg_cron-Job `process-email-queue` mit 30s-Intervall einrichten
- `email_send_state`-Konfig übertragen

---

## Phase 7 — Stripe-Webhook umstellen (~5 Min)

1. Im Stripe Dashboard: neuer Webhook-Endpoint auf neue `stripe-webhook`-URL
2. Neues Webhook-Signing-Secret in Edge-Function-Secrets eintragen
3. Alten Webhook deaktivieren (nach Cutover)

---

## Phase 8 — Frontend-Umschaltung (~5 Min)

`src/integrations/supabase/client.ts` und `.env` zeigen aktuell auf Lovable Cloud. Da Kunde sein eigenes Supabase nutzt:
- Neue URL + anon key in Build-Env (Netlify Environment Variables) eintragen
- Code so anpassen, dass Werte aus `import.meta.env` kommen (statt hardcoded Lovable-Cloud-Client)
- Netlify-Deploy triggert automatisch via GitHub-Push

---

## Phase 9 — Cutover & Test (~20 Min)

1. Wartungsfenster ankündigen (15 Min reichen)
2. Finalen Delta-Dump nachziehen (nur neue Rows seit Phase 2)
3. DNS/Frontend umschalten
4. Smoke-Test: Buchung anlegen, Stripe-Zahlung, Email-Versand, Admin-Login, Warteliste

---

## Phase 10 — Übergabe

- GitHub-Repo-Transfer an Kunde (oder Collaborator-Zugriff)
- Netlify-Site-Transfer (optional)
- Du behältst Lovable-Workspace → Weiterentwicklung pusht via GitHub → Netlify deployed automatisch gegen Kunden-Supabase

---

## Risiken & Mitigation

| Risiko | Mitigation |
|---|---|
| Auth-User-Passwörter nicht übertragbar | Password-Reset-Mail an alle User nach Migration |
| pgmq-Queue verliert pending Mails | Vor Cutover Queue leeren lassen |
| Stripe-Webhook-Race während Umschaltung | Beide Endpoints kurz parallel aktiv halten |
| Verbindungsausfall während Dump | Wiederholbar — Dump läuft nicht-destruktiv |

---

## Technische Details (für später)

- `pg_dump`-Flags: `--no-owner --no-acl --disable-triggers` verhindern Berechtigungsfehler
- Reihenfolge Import: `extensions → schema → data → re-enable triggers → cron-jobs`
- Vault-Secrets (`email_queue_service_role_key`) müssen im neuen Projekt **neu** gesetzt werden, nicht migriert
- pg_cron-Jobs werden **nicht** durch `pg_dump` mitgenommen — separat per SQL nachsetzen

---

**Geschätzte Gesamtdauer**: 2–3 Stunden bei sauberem Ablauf, inkl. Tests.

**Nächster Schritt nach Freigabe**: Phase 0 — du installierst `libpq` auf dem Mac, Kunde legt Supabase-Projekt an und teilt Credentials.