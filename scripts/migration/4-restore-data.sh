#!/usr/bin/env bash
# Spielt data.sql ins NEUE Projekt ein.
set -euo pipefail

: "${NEW_DB_URL:?NEW_DB_URL nicht gesetzt}"

DATA="$(dirname "$0")/out/data.sql"
[[ -f "$DATA" ]] || { echo "Fehlt: $DATA (erst Schritt 2 ausführen)"; exit 1; }

echo ">> Spiele Daten ins NEUE Projekt ein ..."
psql "$NEW_DB_URL" -v ON_ERROR_STOP=1 -f "$DATA"
echo ">> OK. Vergiss Schritt 5 (Admin-User + user_roles) nicht."
