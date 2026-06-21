# Version 1.7.0 — SEO: Lokale Leistungsseiten

**Release-Datum:** 2026-06-21  
**Status:** 🔒 EINGEFROREN — keine Änderungen ohne ausdrückliche Freigabe.

## v1.7.0 – Neuerungen (Phase 2 SEO)

- 3 neue lokale Leistungsseiten mit eigenem H1, Meta-Description, FAQ und JSON-LD:
  - `/motorrad-grundkurs-wettingen` (MotorcycleSchool + FAQPage Schema)
  - `/fahrschule-wettingen` (DrivingSchool + FAQPage Schema)
  - `/fahrschule-baden` (DrivingSchool + FAQPage Schema, Treffpunkt Bahnhof Baden)
- Neue wiederverwendbare Komponente `src/components/LocalLandingPage.tsx` (Hero · Treffpunkt-Bar · Benefits · Long-Form Text · FAQ · Final CTA)
- Header: Dropdown "Standorte" + MGK-Link unter "Motorrad", Mobile-Nav ergänzt
- Sitemap: 3 neue URLs (priority 0.9)
- VKU/Nothelfer-Seiten bewusst ausgelassen (werden nicht selbst angeboten)
- Bestehende Route `/motorrad-fuehrerschein-wettingen` bleibt unverändert

## v1.6.1 – Neuerungen (Phase 1 SEO)

- Neue Seite `/angebote` (Alias `/aktionen`) mit eigenem `<h1>`, Meta-Description und JSON-LD `Offer`-Schema pro aktiver Aktion
- Inhalte werden live aus Tabelle `promotions` geladen (nur `active=true`)
- CTA "Alle Angebote ansehen" am Ende der Aktions-Sektion auf der Startseite
- Footer-Link "Angebote" ergänzt
- `public/sitemap.xml`: Eintrag `/angebote` hinzugefügt (priority 0.9)
- Lokale Keywords im Fliesstext: Wettingen, Baden (Bahnhof), Neuenhof, Würenlos, Spreitenbach, Aargau, MGK, A1/A2/A
- Bestehende Route `/motorrad-fuehrerschein-wettingen` bleibt unverändert erhalten

## v1.6.0 – Neuerungen

- Neue Tabelle `site_content` (key/value JSON) mit RLS: alle lesen, nur Admin schreibt
- Neuer Admin-Tab **„Inhalte & Preise"** mit Sub-Tabs:
  Kontakt & Adresse · Branding · Rechtliches · Bankverbindung ·
  Preise Auto / Auto-Abos / Motorrad / MGK / Extras · Chatbot · Footer
- Neuer Hook `useSiteContent()` + `SiteContentProvider` — lädt Inhalte beim App-Start,
  Fallback auf `src/config/tenant.ts` bei DB-Fehler
- Umgestellt auf dynamische Inhalte: `SiteFooter`, `WhatsAppFloat`, `Preise`, `Kontakt`,
  `AGB`, `Impressum`, `Datenschutz` (Adresse, Telefon, E-Mail, Inhaber, Gerichtsstand,
  Stand-Datum, Verzugszins, Stornofrist, Bearbeitungsgebühr)
- Rechtlicher Fliesstext der Rechtsseiten bleibt im Code (bewusst nicht editierbar)


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

### v1.5.2 — 2026-06-20 (Admin-Tabs Sichtbarkeit)

**Admin-Panel (`src/pages/Admin.tsx`):**
- Tab-Leiste (KURSTERMINE / FOTO-PLANUNG / BUCHUNGEN / TEILNEHMER / TEAM / AKTIONEN / E-MAILS) optisch verstärkt: grösserer Text (`text-sm font-bold`), umrandeter Container (`bg-muted border`), aktiver Tab in Primär-Orange (`#e8501a`) mit weisser Schrift, Hover-State. Auf schmalen Viewports wickeln die Tabs um (`flex-wrap`).
- Keine Logik-/Funktionsänderung — rein visuell.

**Freeze-Status:** v1.5.2 ist die neue stabile Produktions-Version. Gleiche Freeze-Regeln wie v1.5.1.

---

### v1.5.1 — 2026-06-20 (Fahrstunden-Buttons same-tab)

**Fahrstunden-Seite (`src/pages/Fahrstunden.tsx`):**
- Beide „Fahrstunde buchen" / „Online buchen" Buttons öffnen `https://app.l-me.ch/api/anmeldung` jetzt im **selben Tab** (kein `target="_blank"` mehr). Damit funktioniert der Browser-Zurück-Pfeil zurück zu fahrschule-me.ch — konsistent mit der Chatbot-Logik aus v1.5.0.

**Grundkurs-Seite (`src/pages/GrundkursBuchen.tsx`):**
- Inline-Link „← Zurück zu fahrschule-me.ch" wieder entfernt (auf Wunsch).

**Freeze-Status:** v1.5.1 ist die neue stabile Produktions-Version. Gleiche Freeze-Regeln wie v1.5.0.

---

### v1.5.0 — 2026-06-20 (Admin Teilnehmer-Verwaltung + Chatbot Fahrstunden-Redirect)

**Admin – Teilnehmer-Übersicht (`AdminParticipants.tsx`):**
- Neuer Tab „Teilnehmer" im Admin-Panel: durchsuchbare Liste mit Name, Kontakt, Buchungstyp, gebuchten Kursen, Betrag, Zahlungsstatus.
- Filter: Alle / Anstehende Kurse / Vergangene Kurse / Offene Zahlungen.
- Detail-Panel: vollständige Personendaten, Zahlungsdetails, Kurs-Termine.
- **Bearbeiten:** E-Mail, Telefon, Adresse, PLZ, Ort inline editierbar.
- **Buchungsbestätigung erneut senden** über `send-transactional-email` (Template `booking-confirmation`).
- **Stornieren** (Status → `cancelled`, Plätze zurück, optional E-Mail an Teilnehmer mit Grund) und **Löschen** (Hard-Delete inkl. `booking_items` / `course_signatures`, Plätze zurück, keine E-Mail) via Edge Function `admin-cancel-booking` (Admin-Rolle erforderlich, Service Role intern).
- Neues E-Mail-Template `booking-cancelled.tsx` in Registry registriert.

**Admin – Manuelle Teilnehmer (`ManualParticipantDialog.tsx` + `admin-add-participant`):**
- Admin kann Teilnehmer manuell zu Kursterminen hinzufügen (vollständige Daten wie Online-Buchung, Preis editierbar, E-Mail-Versand optional per Checkbox).

**Admin – Verschieben (`AttendanceDialog.tsx`):**
- Ziel-Termin-Dropdown zeigt nur noch zukünftige, gleich-teilige Kurse (keine vergangenen / abgelaufenen Termine mehr).

**Chatbot (`ChatBot.tsx`):**
- Fahrstunden-Flow leitet jetzt direkt zur Fahrschul-App `https://app.l-me.ch/api/anmeldung` weiter (same-tab, kein neuer Tab).
- Interner Mehrschritt-Flow für Fahrstunden deaktiviert (Sub-Actions `fs_single` / `fs_pkg5` / `fs_pkg10` lösen ebenfalls Redirect aus).

**Freeze-Status:** v1.5.0 ist die neue stabile Produktions-Version. Gleiche Freeze-Regeln wie v1.4.0.

---

### v1.4.0 — 2026-06-19 (A1-Inhaber: Nur Teil 3 buchbar – CHF 250)

**Neuer Buchungsfluss für A1-Inhaber:**
- Eigener orange-farbener CTA-Button auf Startseite + auf `GrundkursBuchen`: „Bereits im Besitz von A1? Nur Teil 3 buchen – CHF 250".
- URL-Parameter `?a1=1` aktiviert A1-Modus: nur MGK Teil 3 sichtbar, Pauschalpreis CHF 250 direkt auf Kurskarten.
- Pflicht-Checkbox „Ich bestätige, dass ich bereits im Besitz von A1 bin" (Selbstdeklaration, kein Upload).
- **Serverseitiges Pricing-Enforcement** in `create-booking`: `courses.length === 1 && part === 3` → `serverTotal = 250`. Verhindert Client-Manipulation.
- Dokumentiert in `.lovable/memory/features/booking/a1-only-teil3.md`.

**Freeze-Status:** v1.4.0 ist die neue stabile Produktions-Version.

---

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
