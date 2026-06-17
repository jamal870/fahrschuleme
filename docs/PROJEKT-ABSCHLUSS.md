# Projekt-Abschluss / Freeze

Stand: 17.06.2026

Dieses Dokument fixiert den aktuellen Stand, damit das Projekt sicher eingefroren und ein neues Projekt gestartet werden kann.

## 1. Was läuft wo?

Siehe Detaildokument: [`BETRIEB.md`](./BETRIEB.md)

Kurzfassung:

| Bereich | System | Status |
| --- | --- | --- |
| Live-Frontend | Netlify (`fahrschuleme.netlify.app`) | ✅ aktiv |
| Code-Quelle | GitHub `jamal870/fahrschuleme`, Branch `main` | ✅ aktiv |
| Deploy | GitHub Action `Deploy to Netlify` (Build: `bun run build`) | ✅ aktiv |
| Editor/Preview | Lovable | ✅ aktiv (nicht Live-Kanal) |
| Backend | Lovable Cloud Projekt `Fahrschule-me-prod` | ✅ aktiv |

## 2. Domains – finaler Status

| Domain | Status |
| --- | --- |
| `fahrschule-me.ch` | ✅ Live (HTTP 200) – Primary |
| `www.fahrschule-me.ch` | ✅ 301 → `fahrschule-me.ch` |
| `www.l-me.ch` | ✅ Live |
| `drive-me.ch` | ⏳ DNS aktiv, SSL-Provisionierung läuft bei Netlify |
| `www.drive-me.ch` | ⏳ DNS aktiv, SSL-Provisionierung läuft bei Netlify |

Redirect-Regel `drive-me.ch/*` → `fahrschule-me.ch/*` ist in `netlify.toml` hinterlegt und greift automatisch, sobald das Let's-Encrypt-Zertifikat ausgestellt ist (üblich 5–30 Min nach DNS-Aktivierung).

Optionale Aufräumarbeit in Plesk: alter A-Record `@` → `80.74.153.240` löschen, um internen DNS-Konflikt aufzulösen. Beeinflusst die öffentliche Auflösung nicht.

## 3. Eingefrorener Zustand

- Code-Stand: aktueller `main` auf GitHub
- Frontend-Deploy: letzter erfolgreicher Netlify-Build
- Backend: keine offenen Migrationen, Tabellen mit RLS + GRANTs versorgt
- Buchungs-Flow: ausschließlich über Edge Function `create-booking`
- Zahlungen: Stripe (Polling + Webhook bestätigt)
- Admin-Setup-Scripts: dauerhaft entfernt (Sicherheits-Hardening)

## 4. Übergabe an ein neues Projekt

Wenn ein neues Lovable-Projekt aufgesetzt wird, folgende Punkte mitnehmen:

1. **Domains bleiben bei Netlify** – nichts an DNS ändern, solange Netlify ausliefert.
2. **GitHub bleibt Single Source of Truth** – neuer Lovable-Workspace sollte gegen ein neues Repo arbeiten, nicht gegen `jamal870/fahrschuleme`, um den Live-Stand nicht zu überschreiben.
3. **Tenant-Konfiguration** liegt in `src/config/tenant.ts` – zentrale Datei für White-Label-Migration.
4. **Backend** (`Fahrschule-me-prod`) nicht an das neue Projekt anhängen, sonst Schreibzugriff aus zwei Projekten. Stattdessen neues Cloud-Backend aufsetzen oder bewusst read-only verbinden.
5. **Secrets** (Stripe, E-Mail, etc.) sind im aktuellen Backend gesetzt – im neuen Projekt neu hinterlegen, nicht aus diesem kopieren.

## 5. Wiederaufnahme dieses Projekts

Falls dieses Projekt später wieder bearbeitet wird:

1. In Lovable öffnen → Preview prüfen.
2. Änderung committen → GitHub Action deployed automatisch nach Netlify.
3. Bei Domain-Themen zuerst Netlify prüfen, dann DNS-Provider, dann `netlify.toml`.

## 6. Kontaktpunkte bei Problemen

- **Frontend offline** → Netlify Deploy-Status + GitHub Actions
- **Buchung schlägt fehl** → Edge Function `create-booking` Logs
- **Zahlung hängt** → Stripe Dashboard + Webhook-Log
- **Domain-/SSL-Themen** → Netlify Domain Management + DNS-Provider
