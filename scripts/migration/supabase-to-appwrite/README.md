# Supabase → Appwrite Migrationsskripte

Dieses Verzeichnis enthält Hilfsmittel für die Migration vom aktuellen Supabase-Backend zu Appwrite.

## Inhalt

- `export-supabase-schema.sql` – Schema-Export als SQL (manuell aus Supabase ausführen oder `pg_dump` verwenden).
- `export-supabase-data.js` – Node.js-Skript zum Export aller Tabellendaten aus Supabase als JSON.
- `import-to-appwrite.js` – Node.js-Skript zum Import der JSON-Daten in Appwrite Collections.
- `schema-mapping.md` – Mapping Supabase-Tabelle → Appwrite-Collection mit Attributen und Beziehungen.
- `function-checklist.md` – Checkliste für das Umschreiben der Edge Functions.

## Ablauf

1. **Schema exportieren**
   ```bash
   pg_dump --schema-only --no-owner --no-privileges \
     "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
     > schema.sql
   ```

2. **Daten exportieren**
   ```bash
   node export-supabase-data.js
   ```
   Erzeugt `data/` mit JSON-Dateien pro Tabelle.

3. **Appwrite Collections anlegen**
   Entweder manuell über die Console oder per Appwrite CLI/SDK.

4. **Daten importieren**
   ```bash
   node import-to-appwrite.js
   ```

5. **Functions deployen**
   Siehe `function-checklist.md`.

## Hinweise

- Passwort-Hashes können nicht von Supabase Auth nach Appwrite Auth übernommen werden. Admin-Benutzer müssen Passwort zurücksetzen.
- Beziehungen werden in Appwrite als Document-IDs in String-Attributen abgebildet.
- Die E-Mail-Queue muss neu implementiert werden (Appwrite hat kein PGMQ).
