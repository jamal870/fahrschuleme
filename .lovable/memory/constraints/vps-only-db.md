---
name: VPS-only production database
description: Live-Seite darf ausschliesslich die VPS-Supabase nutzen, nie die Lovable-Cloud-DB
type: constraint
---
Die Produktiv-Seite (Netlify) darf NUR mit der selbst gehosteten Supabase auf dem Hostinger-VPS laufen. DB-Änderungen/Migrationen und Daten-Fixes müssen auf dem VPS ausgeführt werden, nicht in der Lovable Cloud. Warum: Nutzer hat festgestellt, dass Cloud-DB-Fixes (z.B. Wochentag-Korrektur) live nicht wirken. How to apply: SQL-Fixes als Befehle für das VPS-Terminal liefern oder VPS-Zugang nutzen; keine stillschweigenden Cloud-Migrationen als „Fix" verkaufen.
