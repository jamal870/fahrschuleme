#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Migration: Lovable Cloud (Supabase) -> self-hosted Supabase auf dem VPS
#
#   export SOURCE_DB_URL="postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres"
#   bash migrate-from-cloud.sh
#
# Überträgt Schema + Daten inkl. auth.users und storage-Metadaten.
# Die Quelle wird nur gelesen – die Live-Umgebung bleibt unverändert.
# ---------------------------------------------------------------------------
set -euo pipefail

: "${SOURCE_DB_URL:?SOURCE_DB_URL nicht gesetzt}"
STACK_DIR="${STACK_DIR:-/opt/supabase}"
WORK="${WORK:-/tmp/supabase-migration}"
mkdir -p "$WORK"
cd "$STACK_DIR"
# shellcheck disable=SC1091
set -a; source .env; set +a

echo "== 1/5 Rollen & Schema exportieren =="
docker run --rm supabase/postgres:15.8.1.020 \
  pg_dumpall --roles-only --no-role-passwords -d "$SOURCE_DB_URL" > "$WORK/roles.sql" || true

docker run --rm supabase/postgres:15.8.1.020 pg_dump \
  --schema-only --no-owner --no-privileges \
  --schema=public --schema=auth --schema=storage \
  "$SOURCE_DB_URL" > "$WORK/schema.sql"

echo "== 2/5 Daten exportieren =="
docker run --rm supabase/postgres:15.8.1.020 pg_dump \
  --data-only --no-owner --no-privileges --disable-triggers \
  --schema=public --schema=auth --schema=storage \
  --exclude-table='storage.migrations' \
  --exclude-table='auth.schema_migrations' \
  "$SOURCE_DB_URL" > "$WORK/data.sql"

echo "   Schema: $(wc -l < "$WORK/schema.sql") Zeilen, Daten: $(wc -l < "$WORK/data.sql") Zeilen"

echo "== 3/5 Import in den lokalen Stack =="
docker cp "$WORK/schema.sql" supabase-db:/tmp/schema.sql
docker cp "$WORK/data.sql"   supabase-db:/tmp/data.sql
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=0 -f /tmp/schema.sql
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=0 -f /tmp/data.sql

echo "== 4/5 Berechtigungen neu setzen =="
docker exec -i supabase-db psql -U postgres -d postgres <<'SQL'
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
SQL

echo "== 5/5 Kontrolle =="
docker exec -i supabase-db psql -U postgres -d postgres -c \
  "SELECT relname, n_live_tup FROM pg_stat_user_tables WHERE schemaname='public' ORDER BY n_live_tup DESC;"
docker exec -i supabase-db psql -U postgres -d postgres -c \
  "SELECT count(*) AS auth_users FROM auth.users;"

echo
echo "Storage-Dateien separat übertragen (siehe deploy.md, Schritt 6)."
