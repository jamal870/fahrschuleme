# Appwrite auf Hostinger VPS deployen

## Voraussetzungen
- VPS läuft mit Ubuntu 24.04 LTS
- SSH-Zugang als `root` (oder ein Benutzer mit `sudo`)
- DNS-A-Record für `api.fahrschule-me.ch` → `186.240.156.89` gesetzt

## 1. DNS prüfen
Lokal am eigenen Rechner:
```bash
nslookup api.fahrschule-me.ch
```
Sollte `186.240.156.89` auflösen. Falls nicht, DNS-Propagation abwarten (bis zu 24 Stunden).

## 2. Auf den VPS verbinden
```bash
ssh root@186.240.156.89
```

## 3. Projektdateien auf den VPS bringen
Option A – Git:
```bash
apt-get update && apt-get install -y git
mkdir -p /opt/fahrschule-me
 cd /opt/fahrschule-me
git clone https://github.com/jamal870/fahrschuleme.git .
```

Option B – Nur Appwrite-Ordner hochladen (von lokalem Rechner):
```bash
scp -r infrastructure/appwrite root@186.240.156.89:/opt/fahrschule-me/
```

## 4. Setup-Skript ausführen
```bash
cd /opt/fahrschule-me/infrastructure/appwrite
chmod +x setup.sh
./setup.sh
```

Das Skript:
- aktualisiert das System
- installiert Docker & Docker Compose
- legt das Verzeichnis `~/appwrite` an
- kopiert `.env.example` nach `.env` und generiert sichere Zufallswerte
- startet Appwrite

## 5. .env anpassen
Nach dem ersten Setup-Lauf unbedingt `.env` prüfen und folgende Werte setzen:

```bash
nano ~/appwrite/.env
```

Wichtige Variablen:
- `_APP_CONSOLE_WHITELIST_EMAILS` – deine Admin-E-Mail
- `_APP_SYSTEM_EMAIL_ADDRESS` – z. B. `noreply@fahrschule-me.ch`
- `_APP_SMTP_PASSWORD` – dein Resend-SMTP-Key oder Hostinger-SMTP-Passwort
- `_APP_DOMAIN` sollte bereits `api.fahrschule-me.ch` sein

Danach neu starten:
```bash
cd ~/appwrite
docker-compose down
docker-compose up -d
```

## 6. Erreichbarkeit prüfen
```bash
watch docker ps
```
Warten, bis alle Container `healthy` oder zumindest `up` sind (1–2 Minuten).

Danach im Browser öffnen:
```
https://api.fahrschule-me.ch
```

## 7. Appwrite-Projekt anlegen
1. In der Appwrite-Console registrieren / anmelden.
2. Neues Projekt mit der ID `fahrschule-me-prod` anlegen.
3. API-Key für das Frontend erzeugen und notieren.
4. Erste Datenbank anlegen (z. B. `fahrschule-me-db`).

## 8. Firewall-Status prüfen
```bash
ufw status
```
Erlaubt sein sollten:
- 22/tcp (SSH)
- 80/tcp (HTTP)
- 443/tcp (HTTPS)

Falls nicht:
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## 9. Backup einrichten (empfohlen)
```bash
# Täglicher Cron-Job für Docker-Volumes
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/fahrschule-me/infrastructure/appwrite/backup.sh >> /var/log/appwrite-backup.log 2>&1") | crontab -
```

## Troubleshooting
- **Container starten nicht:** `docker-compose logs -f appwrite`
- **SSL-Zertifikat fehlt:** Appwrite erzeugt Let's Encrypt-Zertifikate automatisch, wenn `_APP_DOMAIN` korrekt ist und Port 443 erreichbar ist.
- **Console nicht erreichbar:** Firewall und DNS-Propagation prüfen.
