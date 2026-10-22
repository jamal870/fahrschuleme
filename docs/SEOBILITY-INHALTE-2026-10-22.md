# Inhaltsänderungen nach Seobility-Crawl vom 22.10.2026

Branch: `fix/seobility-content-2026-10-22`
Ausgangspunkt: `main` bei `8e1d9a75194242369b0534368eefdaecfe5db76e`.

## Umgesetzt

- Meta-Descriptions für Impressum (129 Zeichen), Datenschutz (137) und AGB (126), jeweils mit Firmenname und Wettingen. Fallback-Texte in `scripts/seo-routes.mjs` synchronisiert. Zeichenanzahl mit dem vorhandenen Standard-Firmennamen „Fahrschule me“.
- Team-H1: „Unser Team – Fahrlehrer in Wettingen und Baden“. Einleitung entsprechend konkretisiert; drei Kontextlinks zu Kontakt, Fahrstunden und Motorrad. Profildaten, Supabase-Anbindung und Build-Prerendering unverändert.
- VKU: „Pflichtkurs“ im Fliesstext ergänzt, bezogen auf die praktische Führerprüfung. Keine neue Behauptung, dass der VKU vor der Erteilung des Lernfahrausweises erforderlich sei: Das ist durch den bestehenden Seitentext nicht gedeckt.
- Bestehende lange Absätze auf Grundkurs, Motorrad, Preise und Kontakt geteilt. Die vorhandenen Zwischenüberschriften bleiben erhalten.
- Sachliche Ergänzungen auf Grundkurs (Kursteile), Motorrad (Grundkurs gegenüber zusätzlichen Fahrstunden) und Fahrstunden (Einzel-/Doppellektionen und Abos). Keine neuen Preise oder unbestätigten Fristen hinzugefügt.
- Kosten-Ratgeber vollständig unverändert: weder „Überblick“ erzwungen noch H2/H3 verändert.
- Impressum/AGB nur an den Meta-Descriptions geändert; keine Änderung an den Rechtstexten. Kontakt nur Absätze geteilt; Kurstermine unverändert.

## Belege für verwendete Fakten

- `src/config/tenant.ts`: `pricing.auto`, `pricing.autoAbos`, `pricing.motorrad`, `pricing.motorradGrundkurs`.
- `src/pages/Motorrad.tsx`: drei Kursteile, jeweils vier Stunden Praxis, bereits vor dieser Änderung ausgewiesen.
- `src/pages/GrundkursBuchen.tsx`: bestehende Kursteil-Auswahl und Hinweis auf die Reihenfolge. Nur erklärende Inhalte ergänzt; Buchungslogik und Formular unverändert.
- `src/pages/VerkehrskundeWettingen.tsx`: Pflicht/Voraussetzung vor der praktischen Führerprüfung bereits im Intro und Fliesstext vorhanden.

## Offen – nicht als Behauptungen veröffentlicht

- [BITTE PRÜFEN] Welche Ausrüstung und Unterlagen müssen Teilnehmer zum Motorrad-Grundkurs konkret mitbringen? Ohne Bestätigung keine Packliste ergänzen.
- [BITTE PRÜFEN] Unter welchen Bedingungen wird ein eigenes oder gemietetes Motorrad gestellt und welche zusätzlichen Kosten können entstehen? Bestehender Hinweis auf Hilfe bei der Miete reicht nicht für weitergehende Zusagen.
- [BITTE PRÜFEN] Voraussetzungen und Anrechnung vorhandener Führerausweise/A1 im Detail bestätigen, bevor dazu zusätzliche erklärende Regeln veröffentlicht werden.
- [BITTE PRÜFEN] Einheitlicher Leistungsumfang von Motorrad-Einzel- und Doppellektionen: Die Konfiguration nennt 60 Minuten für die Einzellektion, aber 2 × 45 Minuten für die Doppellektion. Diese Werte wurden nicht geändert und nicht neu im Fliesstext wiederholt.

## Prüfung

- `bun run build`: erfolgreich; 31 statische HTML-Dateien mit echtem SSR-Inhalt, 26 Sitemap-URLs. Der integrierte `check-seo` ist erfolgreich.
- `node scripts/seo-check.mjs --dist`: erfolgreich, „OK – keine Probleme“.
- `git diff --check`: erfolgreich.
- Vergleich gegen Ausgangsstand: Rechtstexte unverändert bis auf Meta-Descriptions; Rendering der Teamprofile unverändert; Laufzeit-/Buchungslogik vor dem Seiten-Markup unverändert.
- Lokaler Build ohne Backend-Umgebungsvariablen. Daher keine Live-Teamdaten oder Live-Bewertungen abgefragt; vorhandene Fallbacks wurden genutzt. Kein Deploy durchgeführt.

## Veröffentlichung

Nur eigener lokaler Branch. Kein Push auf `main`, kein Merge und kein Deploy. Eine spätere Veröffentlichung ist nicht Bestandteil dieses Auftrags.

## Nachtrag: Freigabe zur Veröffentlichung

Nach Abschluss der lokalen Prüfung hat der Nutzer ausdrücklich „mergen und deployen“ beauftragt. Vor der Veröffentlichung wurde der inzwischen aktualisierte `main` eingebunden; die H2-Korrektur im Kosten-Ratgeber aus PR #42 bleibt erhalten. Beide vorgeschriebenen Prüfungen werden auf diesem kombinierten Stand erneut ausgeführt.
