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
mkdir -p "$STACK_DIR"/{volumes/db/data,volumes/db/init,volumes/db/wal_archive,volumes/storage,volumes/functions,backups,scripts}

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
docker compose up -d
sleep 15
docker compose ps

echo
echo "Backup-Cron einrichten:"
echo "  (crontab -l 2>/dev/null; echo '0 3 * * * /opt/supabase/scripts/backup.sh >> /var/log/supabase-backup.log 2>&1') | crontab -"
