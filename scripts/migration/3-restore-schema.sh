#!/usr/bin/env bash
# Spielt schema.sql ins NEUE Projekt ein.
set -euo pipefail

: "${NEW_DB_URL:?NEW_DB_URL nicht gesetzt}"

SCHEMA="$(dirname "$0")/out/schema.sql"
[[ -f "$SCHEMA" ]] || { echo "Fehlt: $SCHEMA (erst Schritt 1 ausführen)"; exit 1; }

echo ">> Spiele Schema ins NEUE Projekt ein ..."
psql "$NEW_DB_URL" -v ON_ERROR_STOP=1 -f "$SCHEMA"
echo ">> OK."
