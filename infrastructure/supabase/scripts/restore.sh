#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Wiederherstellung aus einem Backup
#   ./restore.sh /opt/supabase/backups/db_2026-08-09_0300.sql.gz \
#                /opt/supabase/backups/storage_2026-08-09_0300.tar.gz
# ---------------------------------------------------------------------------
set -euo pipefail

DB_DUMP="${1:?Pfad zum db_*.sql.gz Dump fehlt}"
STORAGE_ARCHIVE="${2:-}"
STACK_DIR="${STACK_DIR:-/opt/supabase}"
cd "$STACK_DIR"

echo "ACHTUNG: Die aktuelle Datenbank wird überschrieben."
read -r -p "Weiter? (ja/nein) " ok
[ "$ok" = "ja" ] || exit 1

docker compose stop rest auth storage realtime functions studio meta kong

gunzip -c "$DB_DUMP" | docker exec -i supabase-db psql -U postgres -d postgres

if [ -n "$STORAGE_ARCHIVE" ]; then
  rm -rf "$STACK_DIR/volumes/storage"
  tar -xzf "$STORAGE_ARCHIVE" -C "$STACK_DIR/volumes"
fi

docker compose up -d
echo "Wiederherstellung abgeschlossen."
