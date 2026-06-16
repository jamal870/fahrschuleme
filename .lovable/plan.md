# App von Lovable unabhängig machen

Lovable steckt aktuell an **drei Stellen** in deiner App. Jede muss einzeln migriert werden – und für jede brauche ich Inputs/Keys von dir, die ich nicht selbst erzeugen kann.

## 1. Lovable AI Gateway (Gemini, Vision, Chatbot)

**Heute:** Alle AI-Calls (`AdminPhotoImport`, ChatBot, etc.) gehen an `https://ai.gateway.lovable.dev` mit `LOVABLE_API_KEY`.

**Migration:**
- Eigenen **Google AI Studio API Key** anlegen (https://aistudio.google.com/apikey)
- In allen Edge Functions `lovable-ai`/`gateway`-Calls ersetzen durch direkte Aufrufe an `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- Neuer Secret: `GOOGLE_AI_API_KEY`

**Betroffene Edge Functions (aktuell):** alle, die Gemini nutzen (Chatbot, Photo-Import, etc.)

## 2. Lovable Cloud (= Supabase-Backend)

**Heute:** Datenbank, Auth, Edge Functions, Storage laufen auf von Lovable verwaltetem Supabase-Projekt (`dspspshgnointeqxgnrw`).

**Migration:**
- Eigenes Supabase-Projekt anlegen (kostenlos auf supabase.com)
- Vollständigen Datenbank-Dump exportieren → in neues Projekt importieren (Tabellen, RLS, Funktionen, Trigger, Seeds)
- Alle ~15+ Edge Functions neu deployen (`supabase functions deploy ...`)
- Storage-Buckets + Files migrieren
- Secrets neu setzen: `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, Google Calendar OAuth, etc.
- Auth-Provider (Google OAuth) neu konfigurieren
- `src/integrations/supabase/client.ts` mit neuer URL + anon key überschreiben

**Wichtig:** Auf Lovable Cloud sind nur **CSV-Exports** möglich, kein voller `pg_dump`. Für eine echte Migration musst du den Lovable-Support kontaktieren oder die Schemas manuell als SQL-Migrationen abziehen (liegen bereits in `supabase/migrations/`).

## 3. Hosting & Domain

**Heute:** App läuft auf `fahrschuleme.lovable.app`.

**Migration:**
- Code auf eigenes GitHub-Repo (GitHub-Sync in Lovable aktivieren → eigener Owner)
- Hosting auf Vercel/Netlify/Cloudflare Pages
- Eigene Domain dort verbinden
- iFrame-Embed auf Hauptdomain auf neue URL umstellen

---

## Was ich JETZT brauche, um zu starten

Bitte sag mir, in welcher Reihenfolge wir vorgehen – und liefere mir:

1. **AI zuerst (einfachster Schritt, 1-2 Std.):** Eigener Google AI Studio API Key
2. **Cloud (groß, 1+ Tag Arbeit):** Eigenes Supabase-Projekt + dessen URL/anon/service-role-Keys + Bestätigung, dass ich alle Stripe/Resend/Google Secrets neu im neuen Projekt setze
3. **Hosting (separat, kein Code-Change):** Entscheidung welcher Hoster + Domain

## Empfehlung

Schrittweise vorgehen, **Punkt 1 zuerst**. Das löst dich vom Lovable-AI-Gateway, ändert die App-Funktionalität nicht und ist in einer Session machbar. Cloud-Migration ist ein eigenes, größeres Projekt und sollte erst angegangen werden, wenn Punkt 1 läuft.

**Soll ich mit Schritt 1 (eigener Google AI Key) starten?** Wenn ja, hol dir den Key und ich baue alle Gemini-Calls um.
