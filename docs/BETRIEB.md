# Betrieb: Wo läuft die App?

Stand: 17.06.2026

## 1. Verantwortlichkeiten der Systeme

| Bereich | System | Zweck |
| --- | --- | --- |
| Live-Frontend | Netlify | Öffentliche Website unter `fahrschule-me.ch` / `www.fahrschule-me.ch` |
| Code-Quelle | GitHub | Repository `jamal870/fahrschuleme`, GitHub Actions starten Deploys |
| Editor/Preview | Lovable | Entwicklung, Vorschau, Chat-Änderungen, nicht primärer Live-Kanal |
| Backend | Eigenes Backend-Projekt `Fahrschule-me-prod` | Datenbank, Auth, Edge Functions, Storage, Secrets |

## 2. Live-Seite

Die produktive Website läuft über **Netlify**.

Aktive bzw. relevante Domains laut Netlify-Screenshot:

- `fahrschuleme.netlify.app`
- `fahrschule-me.ch` – Primary Domain
- `www.fahrschule-me.ch`
- `www.l-me.ch`
- `drive-me.ch` – DNS-Verifizierung offen
- `www.drive-me.ch` – DNS-Verifizierung offen

## 3. Lovable-Rolle

Lovable ist in diesem Projekt aktuell vor allem:

- Editor
- Preview
- Entwicklungsumgebung
- Hilfstool für Codeänderungen

Lovable ist **nicht** der Ort, an dem die öffentliche Hauptdomain aktuell primär ausgeliefert wird. Deshalb sind Hosting- und Domain-Fragen zuerst in Netlify/GitHub zu prüfen.

## 4. Deployment-Kette

Aktuelle Kette für Frontend-Änderungen:

1. Änderung im Code
2. Push/Commit nach GitHub `main`
3. GitHub Action `Deploy to Netlify`
4. Build mit `bun run build`
5. Deploy nach Netlify `dist`
6. Live auf `www.fahrschule-me.ch`

Relevante Datei:

- `.github/workflows/deploy-netlify.yml`
- `netlify.toml`

## 5. Backend-Kette

Backend-Deploys laufen separat über GitHub Action:

- `.github/workflows/supabase-deploy.yml`

Das Backend ist nicht dasselbe wie Netlify-Hosting. Netlify liefert die React-App aus; das Backend liefert Datenbank, Auth, Edge Functions und Secrets.

## 6. Redirects / SEO

Die alten Domains und alten Pfade sollen dauerhaft mit **301** weiterleiten.

Wichtige Regeln:

- `drive-me.ch/*` → `https://www.fahrschule-me.ch/:splat`
- `www.drive-me.ch/*` → `https://www.fahrschule-me.ch/:splat`
- alte `/redesign/...` URLs → passende neue Seiten
- `l-me.ch/*` und `www.l-me.ch/*` → `https://www.fahrschule-me.ch/:splat`

Die Redirect-Regeln liegen in:

- `netlify.toml`

Wichtig: Redirects funktionieren nur, wenn die alte Domain DNS-seitig wirklich bei Netlify ankommt und dort verifiziert ist.

## 7. Checkliste bei Problemen

Wenn etwas “nicht läuft”, immer zuerst trennen:

### A) Problem in Lovable Preview?

- Betrifft nur Vorschau im Editor.
- Live-Seite kann trotzdem funktionieren.

### B) Problem auf `www.fahrschule-me.ch`?

- Netlify Deploys prüfen.
- GitHub Actions prüfen.
- `netlify.toml` prüfen.

### C) Problem mit Buchung/Login/Daten?

- Backend-Projekt `Fahrschule-me-prod` prüfen.
- Edge Functions, Datenbank, Secrets und Auth prüfen.

### D) Problem mit alter Domain / Google-Ranking?

- Netlify Domain Management prüfen.
- DNS für `drive-me.ch` und `www.drive-me.ch` prüfen.
- 301-Status testen.

## 8. Merksatz

**Frontend live = Netlify. Entwicklung/Preview = Lovable. Backend = separates Backend-Projekt. Redirects/Domains = Netlify + DNS.**