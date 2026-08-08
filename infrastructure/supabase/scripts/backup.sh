#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Tägliches Backup des self-hosted Supabase-Stacks
# Cron:  0 3 * * *  /opt/supabase/scripts/backup.sh >> /var/log/supabase-backup.log 2>&1
# ---------------------------------------------------------------------------
set -euo pipefail

STACK_DIR="${STACK_DIR:-/opt/supabase}"
cd "$STACK_DIR"
# shellcheck disable=SC1091
set -a; source .env; set +a

BACKUP_DIR="${BACKUP_DIR:-$STACK_DIR/backups}"
RETENTION="${BACKUP_RETENTION_DAYS:-30}"
STAMP="$(date +%Y-%m-%d_%H%M)"
mkdir -p "$BACKUP_DIR"

echo "[$(date -Is)] Backup startet ($STAMP)"

# 1) Datenbank (komplett, inkl. auth/storage Schemata)
docker exec supabase-db pg_dumpall -U postgres \
  | gzip -9 > "$BACKUP_DIR/db_$STAMP.sql.gz"
echo "  -> DB: $(du -h "$BACKUP_DIR/db_$STAMP.sql.gz" | cut -f1)"

# 2) Storage-Dateien
tar -czf "$BACKUP_DIR/storage_$STAMP.tar.gz" -C "$STACK_DIR/volumes" storage
echo "  -> Storage: $(du -h "$BACKUP_DIR/storage_$STAMP.tar.gz" | cut -f1)"

# 3) Konfiguration (ohne Datenverzeichnisse)
tar -czf "$BACKUP_DIR/config_$STAMP.tar.gz" \
  -C "$STACK_DIR" .env docker-compose.yml volumes/api volumes/functions

# 4) Alte Backups aufräumen
find "$BACKUP_DIR" -name '*.gz' -mtime "+$RETENTION" -delete

# 5) Optional: Offsite-Kopie (rclone-Remote in .env als OFFSITE_REMOTE setzen)
if [ -n "${OFFSITE_REMOTE:-}" ] && command -v rclone >/dev/null 2>&1; then
  rclone copy "$BACKUP_DIR" "$OFFSITE_REMOTE" --max-age 25h
  echo "  -> Offsite-Kopie nach $OFFSITE_REMOTE"
fi

echo "[$(date -Is)] Backup fertig"
