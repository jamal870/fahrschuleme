# Version 1.4.0 — Stable Production Release

**Freeze-Datum:** 2026-06-19  
**Status:** 🔒 EINGEFROREN — keine Änderungen ohne ausdrückliche Freigabe.

## Live-Umgebung

| Komponente | Wert |
|---|---|
| Produktion (Custom Domain) | https://www.fahrschule-me.ch |
| Lovable Preview | https://fahrschuleme.lovable.app |
| Hosting | Netlify (Deploy via GitHub Actions) |
| Backend | Lovable Cloud (Supabase) |
| Supabase Project-Ref | `dspspshgnointeqxgnrw` |
| Supabase URL | `https://dspspshgnointeqxgnrw.supabase.co` |

## Erforderliche GitHub Actions Repository-Secrets

> ⚠️ Müssen unter **GitHub → Settings → Secrets and variables → Actions → Repository secrets** liegen (nicht Environment secrets).

| Secret | Wert |
|---|---|
| `VITE_SUPABASE_URL` | `https://dspspshgnointeqxgnrw.supabase.co` |
| `VITE_SUPABASE_PROJECT_ID` | `dspspshgnointeqxgnrw` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcHNwc2hnbm9pbnRlcXhnbnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjYwOTgsImV4cCI6MjA4OTg0MjA5OH0.74LOXsjm7jbY7-XncA0u_Zr7nevlX9l1OplD7eV0zjU` |
| `NETLIFY_AUTH_TOKEN` | Persönlicher Token aus Netlify → User Settings → Applications |
| `NETLIFY_SITE_ID` | Site-ID aus Netlify → Site Settings → General |

## Stabile Architektur-Entscheidungen (nicht ändern)

- **HashRouter** für iframe-Stabilität auf der Hauptdomain
- **Tenant-Daten** ausschließlich in `src/config/tenant.ts`
- **Buchungen** ausschließlich über `create-booking` Edge Function (keine direkten Public-DB-Inserts)
- **Stripe** mit Blank-Tab + DB-Polling + Webhook-Bestätigung
- **Branding:** Akzent `#e8501a`, Rajdhani (Headings) + DM Sans (Body), 3px Border-Radius

## Verifizierte Funktionen

- ✅ Buchung Grundkurse (Auto + Motorrad)
- ✅ Fahrstunden-Buchung mit Stripe-Zahlung
- ✅ Admin-Panel mit Auth + Rollen
- ✅ E-Mail-Versand (Bestätigung, Erinnerung, Warteliste)
- ✅ PDF-Dokumentengenerierung (Rechnungen, Bestätigungen)
- ✅ iCal-Feed
- ✅ Chatbot
- ✅ Warteliste
- ✅ 301-Redirects `l-me.ch` → `www.fahrschule-me.ch`

## Rollback

Diese Version kann jederzeit über **Lovable → History** wiederhergestellt werden (Eintrag vom 2026-06-15).  
Zusätzlich empfohlen: in GitHub einen Release-Tag `v1.0.0` auf Commit `b1108e6` setzen.

## Freeze-Regel

Ab dieser Version: **keine Änderungen** außer:
1. Sicherheits-Hotfixes
2. Vom Betreiber ausdrücklich freigegebene Inhaltsänderungen (Preise, Kurstermine etc. über Admin-Panel)

Jede Code-Änderung → Versions-Bump (1.0.x für Fixes, 1.x.0 für Features) + Eintrag in dieser Datei.

---

## Changelog

### v1.3.0 — 2026-06-19 (Teilnehmer im Google Kalender)

**Google-Kalender-Sync:**
- `sync-course-to-gcal`: lädt jetzt alle bestätigten Teilnehmer (`booking_items` → `bookings.status = 'confirmed'`) eines Kurses und schreibt sie in die Event-Beschreibung (Nummer, Name, Telefon, E-Mail). Titel zeigt zusätzlich die Anzahl: `MGK Teil X (Instructor) – N TN`.
- `create-booking`: triggert nach erfolgreicher Bestätigung (Bar/Überweisung) automatisch den Kalender-Sync für jeden betroffenen Kursteil.
- `stripe-webhook`: triggert nach Zahlungs-Bestätigung automatisch den Kalender-Sync.
- Admin kann weiterhin manuell über „Sync"-Button in `AdminCourseDates` re-synchronisieren.

**Freeze-Status:** v1.3.0 ist die neue stabile Produktions-Version.

---

### v1.2.0 — 2026-06-18 (App-Seite, Fahrlehrer-Trial, SEO)

**Neue Seiten / Features:**
- `FuerFahrlehrer.tsx`: Sektion mit App-Store-/Play-Store-Links zur Fahrschule-me-App ergänzt.
- `FahrlehrerTrialDialog.tsx`: Kontaktformular für „30 Tage gratis testen" (Fahrschule, Adresse, Telefon, E-Mail). Sendet Bestätigung an Interessent (mit Download-Links zur App) sowie Benachrichtigung an Admin.
- E-Mail-Templates: `fahrlehrer-trial-confirmation.tsx` + `fahrlehrer-trial-admin.tsx` in der Registry registriert.
- `PromotionsSection.tsx`: Aktions-Karten auf grossen Displays grösser dargestellt (1 Karte: max-w-2xl + p-7/p-10; 2 Karten: max-w-5xl).

**SEO:**
- Google Search Console: Property `sc-domain:fahrschule-me.ch` verifiziert.
- Sitemap `https://fahrschule-me.ch/sitemap.xml` (16 URLs) eingereicht — 0 Fehler/Warnungen.

**Freeze-Status:** v1.2.0 ist die neue stabile Produktions-Version. Gleiche Regeln wie v1.0.0/v1.1.0 — keine Änderungen ohne ausdrückliche Freigabe.

---

### v1.1.0 — 2026-06-15 (Adresse + Aktionen)

**Buchungs-Adressen:**
- `bookings`-Tabelle um `postal_code` und `city` erweitert (Migration).
- Buchungsformular (`GrundkursBuchen.tsx`): Adresse aufgeteilt in 3 Felder (Strasse & Nr., PLZ, Stadt) mit Zod-Validierung.
- Edge Function `create-booking`: speichert `postal_code` / `city`.
- Admin-Panel (`AdminBookings.tsx`): zeigt vollständige Adresse `Strasse, PLZ Stadt`, lädt zugehörige Kursdaten via `course_date_id`, Edit-Dialog mit PLZ/Stadt.

**Aktionen / Promotions:**
- `PromotionsSection.tsx`: Aktionen werden auf der Website immer angezeigt, solange `active = true` — unabhängig vom Startdatum. Rabatt greift bei Buchungen weiterhin nur im gültigen Zeitraum (Logik in `create-booking`).
- Gültigkeitszeitraum (`starts_at` / `ends_at`) wird auf der Aktions-Karte sichtbar gemacht („Bald verfügbar – Gültig ab …" bzw. „Gültig … – …").
