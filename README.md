# Fahrschule Me – Betriebsdokumentation

Diese Datei hält fest, **wo die App wirklich läuft**, damit keine unnötigen Umwege über falsche Systeme entstehen.

## Kurzfassung

- **Live-Website:** läuft über **Netlify**.
- **Primäre Live-Domain:** `https://www.fahrschule-me.ch`
- **Root-Domain:** `https://fahrschule-me.ch` leitet auf `www.fahrschule-me.ch`.
- **Lovable:** ist aktuell **Editor/Preview/Entwicklungsumgebung**, nicht die primäre Live-Auslieferung der Website.
- **Lovable Preview:** dient nur zum Prüfen während der Bearbeitung.
- **GitHub:** Repository und Deploy-Auslöser für Netlify.
- **Backend:** eigenes Backend-Projekt `Fahrschule-me-prod`; Datenbank/Edge-Funktionen/Secrets laufen dort separat vom Frontend-Hosting.

## Wichtig für künftige Arbeiten

1. **Frontend-Änderungen** landen erst live, wenn sie über GitHub/Netlify deployed wurden.
2. **`netlify.toml` ist relevant**, weil die Live-Seite über Netlify läuft.
3. **301-Weiterleitungen für alte Domains** werden in Netlify/DNS geprüft, nicht nur in Lovable.
4. **Lovable-Publish ist nicht der Haupt-Live-Kanal**, solange `fahrschule-me.ch` in Netlify als Production Domain geführt wird.
5. **Nicht annehmen, dass die App “in Lovable läuft”**, nur weil der Editor/Preview dort offen ist.

## Aktueller Domain-Stand aus den Screenshots

- `fahrschuleme.netlify.app` – Netlify-Subdomain
- `fahrschule-me.ch` – Primary Domain in Netlify
- `www.fahrschule-me.ch` – leitet automatisch auf Primary bzw. ist als Domain eingetragen
- `www.l-me.ch` – Domain Alias
- `drive-me.ch` – Domain Alias, DNS-Verifizierung noch offen
- `www.drive-me.ch` – Domain Alias, DNS-Verifizierung noch offen

## SEO-/Redirect-Ziel

Alte URLs von `drive-me.ch` sollen per **301** auf die neue Domain `www.fahrschule-me.ch` weiterleiten. Dafür müssen `drive-me.ch` und `www.drive-me.ch` DNS-seitig korrekt auf Netlify zeigen und dort verifiziert sein.

Weitere Details: siehe [`docs/BETRIEB.md`](docs/BETRIEB.md).

## Projekt-Status: eingefroren (17.06.2026)

Dieses Projekt ist dokumentiert und für einen geordneten Übergang zu einem neuen Projekt vorbereitet. Übergabe, Domain-Stand und Wiederaufnahme-Anleitung: siehe [`docs/PROJEKT-ABSCHLUSS.md`](docs/PROJEKT-ABSCHLUSS.md).
