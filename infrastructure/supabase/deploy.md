# Self-hosted Supabase — Einrichtung & Migration

Ziel: Datenbank, Auth, Storage und alle Edge Functions laufen auf dem
Hostinger-VPS des Kunden. Frontend bleibt auf Netlify. **Kein Code-Umbau** —
umgeschaltet wird ausschliesslich über zwei Umgebungsvariablen.

```
Besucher → Netlify (www.fahrschule-me.ch)
                └── VITE_SUPABASE_URL → https://db.fahrschule-me.ch
                                            │  Traefik + Let's Encrypt
                                            └── Kong → Auth / REST / Storage
                                                       Realtime / Functions
                                                       └── Postgres 15
```

---

## 0. Voraussetzungen

- VPS mit Docker + Compose (bereits vorhanden vom Appwrite-Versuch)
- Traefik läuft im Docker-Netzwerk `web` mit certresolver `letsencrypt`
- DNS bei tajo.host.ch, zwei neue A-Records auf die VPS-IP:
  - `db.fahrschule-me.ch`
  - `studio.fahrschule-me.ch`
- Mindestens 4 GB RAM, 40 GB Disk

Der Appwrite-Stack kann vorher entfernt werden:
`cd /opt/appwrite && docker compose down -v`

---

## 1. Repo holen und Stack installieren

```bash
cd /opt/fahrschule-me && git pull
cd infrastructure/supabase
sudo bash setup.sh
```

Der erste Lauf erzeugt Schlüssel und bricht ab. Die ausgegebenen Werte
(`JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`, `SECRET_KEY_BASE`,
`POSTGRES_PASSWORD`) in `/opt/supabase/.env` eintragen, ebenso alle
App-Secrets (Stripe, Resend, Google). Studio-Passwort:

```bash
htpasswd -nbB admin 'DEIN_PASSWORT' | sed 's/\$/\$\$/g'   # → STUDIO_BASIC_AUTH
```

Danach nochmals `sudo bash setup.sh` — jetzt startet der Stack.

Kontrolle:

```bash
cd /opt/supabase && docker compose ps
curl -s https://db.fahrschule-me.ch/rest/v1/ -H "apikey: $ANON_KEY" | head
```

---

## 2. Daten aus Lovable Cloud übernehmen

Der Verbindungs-String der Quelle steht im Projekt als `SUPABASE_DB_URL`.

```bash
export SOURCE_DB_URL='postgresql://postgres:...@...supabase.co:5432/postgres'
bash /opt/fahrschule-me/infrastructure/supabase/scripts/migrate-from-cloud.sh
```

Das Skript liest die Quelle **nur** — die Live-Umgebung bleibt unberührt.
Am Ende werden Zeilenzahlen pro Tabelle und die Anzahl `auth.users` ausgegeben;
diese mit dem Cloud-Backend vergleichen.

---

## 3. Edge Functions

```bash
bash /opt/fahrschule-me/infrastructure/supabase/scripts/deploy-functions.sh
cd /opt/supabase && docker compose restart functions
curl -s https://db.fahrschule-me.ch/functions/v1/get-google-reviews \
  -H "apikey: $ANON_KEY"
```

Alle 17 Functions laufen unverändert; der `main`-Router bildet die Pfade
`/functions/v1/<name>` ab, genau wie in der Cloud.

Was auf dem eigenen Server **nicht** automatisch mitkommt:
- **pg_cron / pgmq E-Mail-Queue** — die Extensions sind im Image enthalten,
  der Cron-Job muss einmalig neu geplant werden (siehe Schritt 5).
- **Lovable AI Gateway** (`LOVABLE_API_KEY`) — funktioniert weiter, solange
  der Key gültig ist; alternativ auf einen direkten Gemini-Key umstellen.

---

## 4. Externe Dienste umhängen

| Dienst | Was ändern |
|---|---|
| Stripe | Webhook-URL → `https://db.fahrschule-me.ch/functions/v1/stripe-webhook`, neues Signing Secret in `.env` |
| Resend | Webhook-URL → `https://db.fahrschule-me.ch/functions/v1/handle-email-suppression` |
| Google OAuth | Redirect-URI `https://db.fahrschule-me.ch/auth/v1/callback` in der Google Cloud Console ergänzen |
| Google Calendar | unverändert (Refresh-Token in `.env`) |

---

## 5. E-Mail-Queue reaktivieren

```bash
docker exec -i supabase-db psql -U postgres -d postgres <<'SQL'
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pgmq;
SELECT cron.schedule('process-email-queue', '5 seconds',
  $$ SELECT public.email_queue_dispatch(); $$);
SQL
```

Die URL in `email_queue_dispatch()` muss auf den neuen Host zeigen —
Funktion einmalig mit `db.fahrschule-me.ch` neu anlegen.

---

## 6. Storage-Dateien kopieren

Nur ein Bucket (`email-assets`), wenige Dateien:

```bash
# Dateien aus der Cloud herunterladen und in den lokalen Bucket legen
mkdir -p /opt/supabase/volumes/storage/stub/stub/email-assets
# ... Dateien per Studio hochladen oder direkt kopieren
chown -R 1000:1000 /opt/supabase/volumes/storage
docker compose restart storage
```

---

## 7. Umschalten (der eigentliche Go-Live)

In Netlify → Site settings → Environment variables:

```
VITE_SUPABASE_URL             = https://db.fahrschule-me.ch
VITE_SUPABASE_PUBLISHABLE_KEY = <ANON_KEY aus .env>
```

Danach „Clear cache and deploy site". **Mehr ist nicht nötig** — der Code in
`src/integrations/supabase/client.ts` liest diese beiden Variablen.

Rollback: die alten Werte wieder eintragen und neu deployen. Die Cloud bleibt
in den ersten Wochen als Fallback bestehen.

---

## 8. Betrieb

```bash
# Backup-Cron
(crontab -l 2>/dev/null; echo '0 3 * * * /opt/supabase/scripts/backup.sh >> /var/log/supabase-backup.log 2>&1') | crontab -

# Wiederherstellung
/opt/supabase/scripts/restore.sh /opt/supabase/backups/db_<stamp>.sql.gz \
                                 /opt/supabase/backups/storage_<stamp>.tar.gz

# Updates (2–3x pro Jahr)
cd /opt/supabase && docker compose pull && docker compose up -d
```

Offsite-Kopie: `OFFSITE_REMOTE` in `.env` auf ein rclone-Remote setzen
(z. B. Hostinger Object Storage oder Google Drive) — dann sichert der
Cron-Job automatisch zusätzlich extern.

**Monitoring-Minimum:** `docker compose ps` per Uptime-Check auf
`https://db.fahrschule-me.ch/auth/v1/health`.

---

## Checkliste Go-Live

- [ ] DNS-Records gesetzt, SSL-Zertifikate ausgestellt
- [ ] Stack läuft, alle Container `healthy`
- [ ] Daten migriert, Zeilenzahlen stimmen mit der Cloud überein
- [ ] Admin-Login funktioniert (Auth-Migration erfolgreich)
- [ ] Alle Functions antworten
- [ ] Stripe-Testzahlung durchgelaufen, Buchung angelegt, E-Mail versendet
- [ ] Backup-Cron aktiv, ein Restore auf einer Testkopie geprüft
- [ ] Netlify umgeschaltet, Live-Buchung getestet
