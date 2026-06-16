#!/usr/bin/env bash
# Dumpt das komplette Schema (Tabellen, Functions, Triggers, RLS, GRANTs, Enums)
# aus der ALTEN Lovable-Cloud-DB nach scripts/migration/out/schema.sql
set -euo pipefail

: "${OLD_DB_URL:?OLD_DB_URL nicht gesetzt (siehe scripts/migration/README.md)}"

OUT_DIR="$(dirname "$0")/out"
mkdir -p "$OUT_DIR"

echo ">> Dumpe Schema aus ALTER DB ..."
pg_dump "$OLD_DB_URL" \
  --schema-only \
  --no-owner \
  --no-privileges=false \
  --schema=public \
  --exclude-table='public.schema_migrations' \
  > "$OUT_DIR/schema.sql"

echo ">> Fertig: $OUT_DIR/schema.sql ($(wc -l < "$OUT_DIR/schema.sql") Zeilen)"
echo ">> Prüfe die Datei kurz manuell, bevor du Schritt 3 ausführst."
