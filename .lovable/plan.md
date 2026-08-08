# Migrationsplan: Supabase → Appwrite auf Hostinger VPS

## Ziel
Das Live-Backend `fahrschule-me-prod` von Supabase auf eine selbst gehostete Appwrite-Instanz auf einem Hostinger VPS umziehen. Frontend (Netlify) bleibt bestehen und spricht danach Appwrite an.

## Ausgangslage (Supabase)
- **Datenbank:** PostgreSQL mit Tabellen für Buchungen, Kurstermine, Team, Promotionen, E-Mail-Einstellungen, Warteliste, Unterschriften etc.
- **Auth:** Supabase Auth mit Admin-Rollen (`user_roles`, `has_role()`).
- **RLS:** Feingranulare Zugriffsrichtlinien auf allen Benutzer-Tabellen.
- **Edge Functions:** ~15 Deno-Functions (Buchungen, Zahlungen, E-Mail-Versand, Kalender-Sync, Waitlist, Admin-Aktionen).
- **Storage:** Öffentlicher Bucket `email-assets`.
- **Cron/Queue:** PGMQ-E-Mail-Warteschlange mit `process-email-queue` und Datenbank-Triggern.
- **Secrets:** Stripe, Resend, Google APIs, Supabase-interne Keys.

## Migrations-Schritte

### Phase 1 – Infrastruktur & Setup
1. Hostinger VPS bestellen (Empfehlung: mindestens 4 GB RAM, 2 vCPU, 80 GB SSD).
2. Domain/Subdomain festlegen, z. B. `api.fahrschule-me.ch`.
3. DNS-Einträge bei Hostinger/Tajo setzen:
   - A-Record `api.fahrschule-me.ch` → VPS-IP
   - CAA/SSL wie benötigt
4. VPS härten: Firewall (Ports 80/443/22), Docker + Docker Compose installieren, Reverse Proxy (Traefik oder Nginx) mit Let's Encrypt.
5. Appwrite via offiziellem Docker-Compose deployen.
6. Appwrite-Projekt `fahrschule-me-prod` anlegen.

### Phase 2 – Datenbank-Migration
1. Schema aus Supabase exportieren (`pg_dump --schema-only`).
2. Tabellen in Appwrite-Datenbank anlegen:
   - Collections statt Tabellen
   - Attribute statt Spalten
   - Beziehungen (Document-Referenzen) statt Foreign Keys
   - Indizes für häufige Abfragen
3. Enum `app_role` als String-Attribut mit Validierung abbilden.
4. Daten exportieren (`pg_dump --data-only` als JSON/CSV) und in Appwrite importieren.
5. Migrationsskripte schreiben für komplexe Beziehungen (Buchungen → Buchungs-Items → Kurstermine).

### Phase 3 – Auth & Rollen
1. Appwrite Auth aktivieren (E-Mail/Passwort).
2. Bestehende Supabase-Auth-Benutzer exportieren und in Appwrite importieren (Passwort-Hashes können nicht übernommen werden → Passwort-Reset erforderlich).
3. `user_roles`-Collection anlegen.
4. Appwrite-Funktion oder Middleware für Rollen-Check bauen (Ersatz für `has_role()`).

### Phase 4 – Functions (Edge Functions → Appwrite Functions)
Bestehende Deno-Functions in Appwrite Functions (Node.js oder Python) umschreiben:
- `create-booking`
- `create-course-payment`
- `stripe-webhook`
- `send-transactional-email`
- `process-email-queue`
- `send-course-reminders`
- `sync-course-to-gcal`
- `ical-feed`
- `get-google-reviews`
- `add-to-waitlist`
- Admin-Functions (`admin-cancel-booking`, `admin-add-participant`, `move-booking-participant`, `parse-course-photo`)

Anpassungen:
- Supabase-Client durch Appwrite-SDK ersetzen.
- Secrets in Appwrite-Function-Variablen hinterlegen.
- Cron-Jobs über Appwrite-Cron oder externen Scheduler (z. B. `ofelia`) abbilden.

### Phase 5 – Storage
1. Appwrite Storage Bucket `email-assets` anlegen.
2. Dateien aus Supabase Storage exportieren und in Appwrite Storage importieren.
3. Öffentliche Lese-Rechte konfigurieren.

### Phase 6 – Frontend-Anpassungen
1. Supabase-Client in `src/integrations/supabase/client.ts` durch Appwrite-SDK ersetzen oder parallelfähig machen.
2. Auth-Login (`AdminLogin.tsx`) auf Appwrite Auth umstellen.
3. Datenbankabfragen (`supabase.from(...)`) durch Appwrite-Database-Queries ersetzen.
4. Storage-URLs anpassen.
5. Edge-Function-Aufrufe (`supabase.functions.invoke`) durch HTTP-Calls auf Appwrite Functions ersetzen.

### Phase 7 – Testing & Cutover
1. Parallele Testumgebung auf Appwrite aufbauen.
2. Smoke-Tests durchführen:
   - Kursübersicht laden
   - Buchung inkl. Stripe-Zahlung
   - Bestätigungs-Mail
   - Admin-Login und Buchungsverwaltung
   - Kalender-Sync
3. DNS-Cutover planen (TTL vorher senken).
4. Wartungsfenster definieren, Daten final synchronisieren, DNS auf Appwrite umstellen.
5. Supabase-Projekt nach erfolgreichem Cutover pausieren/löschen.

## Geschätzter Aufwand
| Phase | Geschätzter Aufwand |
|-------|---------------------|
| 1 – Infrastruktur | 1–2 Tage |
| 2 – Datenbank-Migration | 2–3 Tage |
| 3 – Auth & Rollen | 1 Tag |
| 4 – Functions | 4–6 Tage |
| 5 – Storage | 0,5 Tage |
| 6 – Frontend | 2–3 Tage |
| 7 – Testing & Cutover | 2–3 Tage |
| **Gesamt** | **~12–18 Tage** |

## Risiken & Empfehlungen
- **Passwort-Reset:** Bestehende Admin-Benutzer müssen Passwort neu setzen.
- **Echtzeit:** Appwrite Realtime ersetzt Supabase-Subscriptions, falls genutzt.
- **E-Mail-Queue:** PGMQ gibt es bei Appwrite nicht → eigene Queue in Appwrite-Datenbank oder externer Worker.
- **Rollback:** Supabase-Projekt erst löschen, nachdem Appwrite 1–2 Wochen stabil läuft.
- **Kosten:** Hostinger VPS + Domain + Backups vs. Supabase Pro-Plan genau gegenrechnen.

## Nächster Schritt
Soll ich mit Phase 1 beginnen (Hostinger VPS bestellen und Appwrite installieren), oder willst du zuerst einen detaillierteren Plan für eine einzelne Phase?
