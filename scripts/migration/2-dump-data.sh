#!/usr/bin/env bash
# Dumpt nur die DATEN aller relevanten Public-Tabellen (in der richtigen FK-Reihenfolge).
set -euo pipefail

: "${OLD_DB_URL:?OLD_DB_URL nicht gesetzt}"

OUT_DIR="$(dirname "$0")/out"
mkdir -p "$OUT_DIR"

TABLES=(
  team_members
  promotions
  fahrstunden_services
  fahrstunden_packages
  course_dates
  bookings
  booking_items
  course_signatures
  waitlist
  email_settings
  email_send_state
  email_send_log
  email_unsubscribe_tokens
  suppressed_emails
  user_roles
)

ARGS=()
for t in "${TABLES[@]}"; do ARGS+=(--table="public.$t"); done

echo ">> Dumpe Daten aus ALTER DB (${#TABLES[@]} Tabellen) ..."
pg_dump "$OLD_DB_URL" \
  --data-only \
  --no-owner \
  --disable-triggers \
  --column-inserts \
  "${ARGS[@]}" \
  > "$OUT_DIR/data.sql"

echo ">> Fertig: $OUT_DIR/data.sql ($(wc -l < "$OUT_DIR/data.sql") Zeilen)"
echo ""
echo "WICHTIG: user_roles.user_id zeigt auf auth.users — die IDs im NEUEN Projekt"
echo "sind anders. Lege deinen Admin-User im neuen Dashboard neu an und führe"
echo "danach das INSERT aus Schritt 5 im README aus. Optional: user_roles aus data.sql"
echo "weglassen, wenn nur der eine Admin existiert."
