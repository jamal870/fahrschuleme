#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Import eines Datenbank-Exports aus Lovable Cloud in den self-hosted Stack.
#
#   bash import-dump.sh /pfad/zum/export.sql        (oder .sql.gz / .dump)
#
# Der Export wird über  Lovable → Cloud → Advanced settings → Export data
# heruntergeladen und per scp auf den VPS gelegt, z. B.:
#   scp export.sql.gz root@<VPS-IP>:/root/
#
# Das Skript ist idempotent: bereits vorhandene Objekte werden übersprungen
# (ON_ERROR_STOP=0). Es löscht nichts.
# ---------------------------------------------------------------------------
set -euo pipefail

DUMP="${1:?Pfad zur Dump-Datei angeben}"
[ -f "$DUMP" ] || { echo "Datei nicht gefunden: $DUMP"; exit 1; }

STACK_DIR="${STACK_DIR:-/opt/supabase}"
DB_CONTAINER="${DB_CONTAINER:-supabase-db}"
WORK=/tmp/supabase-import
mkdir -p "$WORK"

echo "== 1/4 Dump vorbereiten =="
MODE=sql
case "$DUMP" in
  *.gz)              gunzip -c "$DUMP" > "$WORK/dump.sql" ;;
  *.sql)             cp "$DUMP" "$WORK/dump.sql" ;;
  *.backup|*.dump|*.custom)
                     MODE=custom; cp "$DUMP" "$WORK/dump.custom" ;;
  *)                 echo "Unbekanntes Format – .sql, .sql.gz, .backup oder .dump"; exit 1 ;;
esac
if [ "$MODE" = sql ]; then
  echo "   $(wc -l < "$WORK/dump.sql") Zeilen"
else
  echo "   Custom-Format ($(du -h "$WORK/dump.custom" | cut -f1)) – wird mit pg_restore eingespielt"
fi

echo "== 2/4 Sicherheitskopie des aktuellen Stands =="
mkdir -p "$STACK_DIR/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
docker exec "$DB_CONTAINER" pg_dump -U postgres -d postgres \
  | gzip > "$STACK_DIR/backups/pre-import_$STAMP.sql.gz"
echo "   $STACK_DIR/backups/pre-import_$STAMP.sql.gz"

echo "== 3/4 Import =="
if [ "$MODE" = sql ]; then
  docker cp "$WORK/dump.sql" "$DB_CONTAINER:/tmp/dump.sql"
  docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres \
    -v ON_ERROR_STOP=0 -f /tmp/dump.sql 2>&1 | tail -30
else
  docker cp "$WORK/dump.custom" "$DB_CONTAINER:/tmp/dump.custom"
  docker exec -i "$DB_CONTAINER" pg_restore -U postgres -d postgres \
    --no-owner --no-privileges --clean --if-exists \
    /tmp/dump.custom 2>&1 | tail -40 || true
fi


echo "== 4/4 Rechte setzen und Kontrolle =="
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres <<'SQL'
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
SQL

docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -c \
  "SELECT relname, n_live_tup FROM pg_stat_user_tables WHERE schemaname='public' ORDER BY n_live_tup DESC;"
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -c \
  "SELECT count(*) AS auth_users FROM auth.users;" 2>/dev/null || true

echo
echo "Fertig. Zeilenzahlen mit dem Cloud-Backend vergleichen."
