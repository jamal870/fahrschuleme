#!/usr/bin/env bash
# Startet die Appwrite-Migrationsskripte mit gespeicherten Zugangsdaten.
#
#   ./run-migration.sh finish       -> Schema fertigstellen (empfohlen)
#   ./run-migration.sh collections  -> nur Collections/Attribute anlegen
#
# Der API-Key wird einmalig abgefragt und in ~/.appwrite-migration.env
# gespeichert (Rechte 600), damit er nach einem SSH-Neustart nicht fehlt.

set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE="$HOME/.appwrite-migration.env"

export APPWRITE_ENDPOINT="${APPWRITE_ENDPOINT:-https://api.fahrschule-me.ch/v1}"
export APPWRITE_PROJECT="${APPWRITE_PROJECT:-6a773fb100114c0e82c8}"
export APPWRITE_DB="${APPWRITE_DB:-fahrschule-me-db}"

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  . "$ENV_FILE"
fi

if [ -z "${APPWRITE_API_KEY:-}" ]; then
  echo "Appwrite API-Key einfuegen und Enter druecken (Eingabe bleibt unsichtbar):"
  read -r -s APPWRITE_API_KEY
  echo
  if [ ${#APPWRITE_API_KEY} -lt 50 ]; then
    echo "Abbruch: Key sieht zu kurz aus (${#APPWRITE_API_KEY} Zeichen)."
    exit 1
  fi
  printf 'export APPWRITE_API_KEY=%q\n' "$APPWRITE_API_KEY" > "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "Key gespeichert in $ENV_FILE (nur fuer diesen Benutzer lesbar)."
fi
export APPWRITE_API_KEY

# Verbindung testen, bevor ein langes Skript startet.
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' \
  -H "X-Appwrite-Project: $APPWRITE_PROJECT" \
  -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
  "$APPWRITE_ENDPOINT/databases")

if [ "$HTTP_CODE" != "200" ]; then
  echo "Abbruch: Appwrite antwortet mit HTTP $HTTP_CODE (Key oder Endpoint pruefen)."
  echo "Key neu setzen: rm $ENV_FILE && ./run-migration.sh ${1:-finish}"
  exit 1
fi

[ -d node_modules ] || npm install --silent

case "${1:-finish}" in
  finish)      node finish-setup.js ;;
  collections) node create-collections.js ;;
  *)           echo "Unbekannt: $1 (finish | collections)"; exit 1 ;;
esac
