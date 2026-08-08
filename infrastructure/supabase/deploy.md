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
- Traefik wird durch `setup.sh` aktuell und passend zum Stack gestartet
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

Für Let's Encrypt zusätzlich eine erreichbare E-Mail-Adresse setzen:

```bash
ACME_EMAIL=info@fahrschule-me.ch
```

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

Auf Lovable Cloud ist das Datenbank-Passwort bewusst nicht zugänglich, ein
direkter `pg_dump` von aussen ist deshalb nicht möglich. Der offizielle Weg:

1. In Lovable: **Cloud → Advanced settings → Export data** — Export erzeugen
   und herunterladen.
2. Datei auf den VPS kopieren:

```bash
scp ~/Downloads/export.sql.gz root@186.240.156.89:/root/
```

3. Auf dem VPS einspielen:

```bash
bash /opt/fahrschule-me/infrastructure/supabase/scripts/import-dump.sh /root/export.sql.gz
```

Das Skript legt vorher automatisch eine Sicherheitskopie des aktuellen Stands
unter `/opt/supabase/backups/pre-import_<stamp>.sql.gz` an und löscht nichts.
Am Ende werden Zeilenzahlen pro Tabelle und die Anzahl `auth.users` ausgegeben;
diese mit dem Cloud-Backend vergleichen.

Alternative (falls ein direkter Verbindungs-String vorliegt, z. B. bei einem
eigenen Supabase-Projekt): `scripts/migrate-from-cloud.sh` mit `SOURCE_DB_URL`.


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

---

## 9. Point-in-Time-Recovery (optional, empfohlen)

Der Cron-Dump aus Schritt 8 stellt den Stand von 03:00 Uhr wieder her — bei
einem Ausfall um 17:00 Uhr gingen also bis zu 14 Stunden Buchungen verloren.
Mit WAL-Archivierung ist eine Wiederherstellung auf die Sekunde genau möglich.

```bash
docker exec -i supabase-db psql -U postgres -d postgres <<'SQL'
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET archive_mode = 'on';
ALTER SYSTEM SET archive_command = 'test ! -f /var/lib/postgresql/wal_archive/%f && cp %p /var/lib/postgresql/wal_archive/%f';
ALTER SYSTEM SET archive_timeout = '300s';
SQL
mkdir -p /opt/supabase/volumes/db/wal_archive
cd /opt/supabase && docker compose restart db
```

Dazu in `docker-compose.yml` beim Service `db` das Volume ergänzen:
`- ./volumes/db/wal_archive:/var/lib/postgresql/wal_archive`

Wöchentlich ein Basis-Backup (`pg_basebackup`) plus die WAL-Dateien seit
dem letzten Basis-Backup ergeben den PITR-Satz. Aufbewahrung im
`backup.sh`-Retention-Fenster mitführen.

**Ehrlich eingeordnet:** Für dieses Buchungsvolumen reicht der tägliche Dump
in aller Regel. PITR lohnt sich, sobald an einem Tag mehrere Kursbuchungen
mit Zahlung eingehen — dann ist ein Datenverlust nicht nur ärgerlich,
sondern buchhalterisch relevant.

---

## 10. Monitoring

Was tatsächlich überwacht werden muss:

| Prüfung | Wie |
|---|---|
| API erreichbar | Uptime-Check auf `https://db.fahrschule-me.ch/auth/v1/health` (z. B. UptimeRobot, 5 Min.) |
| Container laufen | `docker compose ps` per Cron, Alarm bei Status ≠ running |
| Speicherplatz | `df -h /` — Alarm ab 80 % |
| Backup erfolgreich | Alarm, wenn `/opt/supabase/backups` heute keine neue Datei hat |
| SSL-Ablauf | Traefik erneuert automatisch; Uptime-Check meldet Zertifikatsfehler |

Minimal-Variante ohne Zusatzsoftware:

```bash
cat > /opt/supabase/scripts/healthcheck.sh <<'SH'
#!/usr/bin/env bash
set -uo pipefail
FAIL=""
curl -fsS -m 10 https://db.fahrschule-me.ch/auth/v1/health >/dev/null || FAIL+="API nicht erreichbar\n"
[ "$(docker compose -f /opt/supabase/docker-compose.yml ps --status running -q | wc -l)" -ge 9 ] || FAIL+="Container fehlen\n"
[ "$(df --output=pcent / | tail -1 | tr -dc 0-9)" -lt 80 ] || FAIL+="Speicher > 80%\n"
[ -n "$(find /opt/supabase/backups -name 'db_*.sql.gz' -mtime -1)" ] || FAIL+="Kein Backup in 24h\n"
[ -z "$FAIL" ] || echo -e "$FAIL" | mail -s "[fahrschule-me] VPS-Warnung" info@drive-me.ch
SH
chmod +x /opt/supabase/scripts/healthcheck.sh
(crontab -l 2>/dev/null; echo '*/15 * * * * /opt/supabase/scripts/healthcheck.sh') | crontab -
```

---

## Bekannte Einschränkungen gegenüber der Managed-Version

| Thema | Managed | Self-hosted |
|---|---|---|
| Edge Functions | stabil | edge-runtime ist offiziell noch Beta — funktioniert, aber Updates genau lesen |
| PITR | eingebaut | manuell (Schritt 9) |
| Auth-Einstellungen | Dashboard | Umgebungsvariablen in `.env`, Neustart nötig |
| Storage-Dateien | inklusive | separater Transfer (Schritt 6) |
| Updates / CVEs | automatisch | eigenverantwortlich, 2–3x pro Jahr einplanen |
| Support | Supabase | keiner |

Das ist der Preis für volle Datenhoheit — bewusst so gewählt und mit den
Schritten 8–10 auf ein handhabbares Mass gebracht.

---


## Checkliste Go-Live

- [ ] DNS-Records gesetzt, SSL-Zertifikate ausgestellt
- [ ] Stack läuft, alle Container `healthy`
- [ ] Daten migriert, Zeilenzahlen stimmen mit der Cloud überein
- [ ] Admin-Login funktioniert (Auth-Migration erfolgreich)
- [ ] Alle Functions antworten
- [ ] Stripe-Testzahlung durchgelaufen, Buchung angelegt, E-Mail versendet
- [ ] Backup-Cron aktiv, ein Restore auf einer Testkopie geprüft
- [ ] Healthcheck-Cron aktiv, Testalarm empfangen
- [ ] Storage-Dateien übertragen und im Frontend sichtbar
- [ ] Google-OAuth-Redirect-URI ergänzt, Login getestet
- [ ] Cloud-Backend als Fallback noch aktiv (mind. 4 Wochen)
- [ ] Netlify umgeschaltet, Live-Buchung getestet
