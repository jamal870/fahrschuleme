#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Erstinstallation des self-hosted Supabase-Stacks auf dem VPS
#   sudo bash setup.sh
# ---------------------------------------------------------------------------
set -euo pipefail

STACK_DIR=/opt/supabase
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "== 1/6 Docker prüfen =="
command -v docker >/dev/null || { echo "Docker fehlt"; exit 1; }
docker network inspect web >/dev/null 2>&1 || docker network create web

echo "== 2/6 Verzeichnisse anlegen =="
mkdir -p "$STACK_DIR"/{volumes/db/data,volumes/db/init,volumes/db/wal_archive,volumes/storage,volumes/functions,volumes/traefik,backups,scripts}
touch "$STACK_DIR/volumes/traefik/acme.json"
chmod 600 "$STACK_DIR/volumes/traefik/acme.json"

# Basic-Auth-Datei fuer Studio aus .env erzeugen (Hash enthaelt $-Zeichen,
# die Docker Compose in Labels als Variablen interpretieren wuerde).
if [ -f "$STACK_DIR/.env" ]; then
  SBA="$(grep -E '^STUDIO_BASIC_AUTH=' "$STACK_DIR/.env" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
  if [ -n "$SBA" ] && [ "${SBA#*CHANGE_ME}" = "$SBA" ]; then
    # In .env sind $-Zeichen ggf. als $$ escaped (Compose-Substitution);
    # die htpasswd-Datei braucht einfache $.
    SBA="$(printf '%s' "$SBA" | sed -e 's/\$\$/$/g')"
    printf '%s\n' "$SBA" > "$STACK_DIR/volumes/traefik/studio.htpasswd"
    chmod 600 "$STACK_DIR/volumes/traefik/studio.htpasswd"
  fi
fi

echo "== 3/6 Dateien kopieren =="
cp -r "$REPO_DIR/docker-compose.yml" "$STACK_DIR/"
cp -r "$REPO_DIR/volumes/api" "$STACK_DIR/volumes/"
cp -r "$REPO_DIR/volumes/db/init/." "$STACK_DIR/volumes/db/init/"
cp -r "$REPO_DIR/scripts/." "$STACK_DIR/scripts/"
chmod +x "$STACK_DIR"/scripts/*.sh
[ -f "$STACK_DIR/.env" ] || cp "$REPO_DIR/.env.example" "$STACK_DIR/.env"

echo "== 4/6 Schlüssel erzeugen =="
if grep -q CHANGE_ME "$STACK_DIR/.env"; then
  echo "--- Diese Werte in $STACK_DIR/.env eintragen: ---"
  node "$STACK_DIR/scripts/generate-keys.mjs"
  echo "-------------------------------------------------"
  echo "Danach setup.sh erneut ausführen."
  exit 0
fi

echo "== 5/6 Edge Functions bereitstellen =="
bash "$REPO_DIR/scripts/deploy-functions.sh"

echo "== 6/6 Stack starten =="
cd "$STACK_DIR"
docker compose pull
# Der frühere Appwrite-Proxy nutzt Docker API 1.24, filtert Supabase-Labels
# heraus und belegt Port 80/443. Nur diesen Proxy entfernen; keine Volumes.
docker rm -f appwrite-traefik traefik >/dev/null 2>&1 || true
docker compose up -d traefik
docker compose up -d db
echo "Warte auf Datenbank ..."
for i in $(seq 1 60); do
  docker compose exec -T db pg_isready -U supabase_admin -h localhost >/dev/null 2>&1 && break
  sleep 2
done

# Systemrollen-Passwörter setzen (idempotent, unabhängig von initdb)
echo "Systemrollen-Passwörter setzen ..."
# .env NICHT sourcen (Werte koennen Leerzeichen enthalten) - gezielt auslesen
PG_PW="$(grep -E '^POSTGRES_PASSWORD=' "$STACK_DIR/.env" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
PG_DB="$(grep -E '^POSTGRES_DB=' "$STACK_DIR/.env" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
PG_DB="${PG_DB:-postgres}"
docker compose exec -T -e POSTGRES_PASSWORD="$PG_PW" db \
  psql -U supabase_admin -d "$PG_DB" -v ON_ERROR_STOP=1 \
  -f /docker-entrypoint-initdb.d/99-roles.sql
docker compose exec -T db psql -U supabase_admin -d "$PG_DB" \
  -f /docker-entrypoint-initdb.d/99-realtime.sql || true

docker compose up -d
docker compose restart auth storage
sleep 20
docker compose ps

echo
echo "Backup-Cron einrichten:"
echo "  (crontab -l 2>/dev/null; echo '0 3 * * * /opt/supabase/scripts/backup.sh >> /var/log/supabase-backup.log 2>&1') | crontab -"
