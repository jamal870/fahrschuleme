# Plan: Admin-Tab „Inhalte & Preise" (v2)

Ziel: Du kannst Preise, Kontaktdaten, Öffnungszeiten, WhatsApp, Branding-Texte UND die dynamischen Werte in AGB / Impressum / Datenschutz direkt im Admin-Panel ändern — ohne Code.

## Klarstellung zu AGB / Impressum / Datenschutz

Es wird unterschieden zwischen:

- **Dynamische Werte** (Adresse, Telefon, E-Mail, Inhaber, Öffnungszeiten, Bank, Preise, Verzugszins, Stornofristen, Stand-Datum) → **editierbar im Admin**, werden in alle drei Seiten automatisch eingesetzt.
- **Rechtlicher Fliesstext** (Paragrafenstruktur, Haftung, Urheberrecht, DSG-Klauseln) → **bleibt im Code**, da Änderungen rechtliche Risiken bergen. Wenn du hier etwas ändern willst, machst du es weiter per Auftrag an mich.

So bekommst du beides: schnelle Aktualisierung der Fakten + Schutz vor versehentlichem Bruch der Rechtstexte.

## Was du danach selbst ändern kannst

**Kontakt & Standort** (wirkt auf: Header, Footer, Kontakt, Impressum, Datenschutz, AGB-Gerichtsstand, Chatbot, WhatsApp-Button)
- Telefon, E-Mail, WhatsApp-Nummer
- Adresse (Strasse, PLZ, Ort, Gerichtsstand)
- Öffnungszeiten
- Inhaber-Name

**Branding** (wirkt auf: Header, Footer, SEO-Titel, E-Mail-Absender)
- Name, Tagline, Logo-Text

**Preise** (wirkt auf: Preise-Seite UND AGB-Verweise wie Bearbeitungsgebühr, Verzugszins, Stornogebühr)
- Auto-Lektionen & Abos
- Motorrad-Lektionen & Grundkurs
- Nothelfer, VKU
- Bearbeitungsgebühr, Verzugszins-%, Stornofrist (h)

**Bankverbindung** (wirkt auf: Buchungsbestätigung, E-Mails, ggf. Footer)
- IBAN, Kontoinhaber, Bank

**Seitentexte (Marketing, keine Rechtstexte)**
- Startseite Hero
- Sicherheits-Punkte
- Kontakt-Seite Intro
- Chatbot-Begrüssungen
- Footer-Copyright

**Stand-Datum der Rechtsseiten** (z.B. „Stand: Juni 2026")

## Was im Code bleibt

- Layout, Farben, Schriften, Logo-Bild
- **Rechtlicher Fliesstext** in AGB / Impressum / Datenschutz (Paragrafen, Klauseln)
- Routing, Buchungs-Logik, Stripe, E-Mail-Templates (Struktur)
- Bilder/Assets

## Technische Umsetzung

```text
DB                            Frontend
─────────────────────────     ─────────────────────────────────
site_content                  src/hooks/useSiteContent.ts
  key TEXT PK                    ↓ lädt 1x beim App-Start
  value JSONB                    ↓ React Context Provider
  updated_at TIMESTAMPTZ      
                              tenant.ts → bleibt als Fallback/Default
                              
                              AGB/Impressum/Datenschutz:
                                → Variablen-Slots ({{adresse}}, 
                                  {{telefon}}, {{verzugszins}}…)
                                  werden zur Laufzeit ersetzt
                              
                              Admin-Tab „Inhalte & Preise"
                                ↓ Sub-Tabs mit Formularen
                                ↓ UPDATE site_content
                                ↓ Cache invalidieren → Live-Update
```

**Schritte:**

1. **DB-Migration** — Tabelle `site_content` (key TEXT PK, value JSONB). RLS: alle dürfen lesen, nur Admin schreiben. Seed mit aktuellen `tenant.ts`-Werten + neuen Feldern (Verzugszins, Bearbeitungsgebühr, Stornofrist, Stand-Datum).

2. **Hook + Context** — `useSiteContent()` lädt alle Keys beim App-Start, cached in React Context. Fallback auf `tenant.ts` wenn DB leer / Fehler.

3. **Frontend umstellen** — alle `tenantConfig.X` Aufrufe an editierbaren Stellen ersetzen durch `useSiteContent().X`. Inkl. AGB/Impressum/Datenschutz: harte Strings wie „CHF 30.–", „5%", „24 Stunden", „Bahnhofstrasse 56, 5430 Wettingen", „Jimmy Ettanaghmalti", „Mai 2026" → Variablen.

4. **Admin-Tab „Inhalte & Preise"** mit Sub-Tabs:
   - Kontakt & Adresse
   - Öffnungszeiten
   - Preise Auto
   - Preise Motorrad
   - Preise Extras (Nothelfer, VKU)
   - Branding & Texte
   - Bankverbindung
   - Rechtliches (Verzugszins, Bearbeitungsgebühr, Stornofrist, Stand-Datum)
   - Chatbot-Texte
   
   Pro Sektion: Formular + Speichern + „Auf Default zurücksetzen" + Vorschau-Link.

5. **Cache-Invalidierung** — nach Speichern Context neu laden → Live-Vorschau sofort aktuell.

6. **Version-Bump** v1.6.0 + VERSION.md + Memory-Update.

## Risiken & Schutz

- **Risiko:** Falsche Eingabe (leerer Preis, kaputte E-Mail). → Validierung pro Feld (Pflicht, Format) + Fallback auf `tenant.ts`.
- **Risiko:** Tippfehler live. → Vorschau-Link öffnet betroffene Seite in neuem Tab vor dem Speichern.
- **Risiko Rechtstexte:** Du könntest aus Versehen Rechtssätze verändern. → Bewusst NUR Variablen editierbar, Fliesstext nicht im Admin sichtbar.
- **Sicherheit:** Schreibrechte nur `has_role(auth.uid(), 'admin')`.
- **Backup:** `tenant.ts` bleibt im Code → Notfall: Tabelle leeren = Default zurück.

## Aufwand
Ein grösserer Arbeitsschritt: 1 Migration + Hook/Context + ~12 Dateien anfassen + neuer Admin-Tab mit ~9 Sub-Formularen. Nach Freigabe in einem Zug umsetzbar.

## Nicht im Plan (separate Aufträge)
- Bilder-Upload (Hero, Team-Fotos) → Phase 2
- Mehrsprachigkeit DE/EN → Phase 3
- Rechtlicher Fliesstext editierbar → bewusst weggelassen (rechtliches Risiko)

---

**Soll ich so umsetzen?**
