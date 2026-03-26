

## Logo in E-Mail-Templates ändern

Das neue Logo (blaues "L"-Quadrat + oranges "me" in Schreibschrift + "FAHRSCHULE · WETTINGEN") wird in beiden E-Mail-Templates eingesetzt.

### Schritte

1. **Logo-Bild hochladen** – Das hochgeladene Logo (`IMG_7345.png`, horizontale Version) ins Projekt kopieren und dann in den bestehenden Supabase Storage Bucket `email-assets` hochladen (ersetzt oder ergänzt das bisherige `drive-me-logo.png`).

2. **Booking-Confirmation Template updaten** (`supabase/functions/_shared/transactional-email-templates/booking-confirmation.tsx`)
   - Logo-URL auf das neue Bild im Storage Bucket ändern
   - Header-Hintergrund auf Dunkelblau (`#1a2344`) setzen, damit das Logo auf dunklem Hintergrund gut aussieht (wie im Original-Branding)
   - Padding im Header anpassen

3. **Admin-Notification Template updaten** (`supabase/functions/_shared/transactional-email-templates/admin-booking-notification.tsx`)
   - Gleiche Logo-URL-Änderung
   - Gleicher dunkler Header-Hintergrund

4. **Edge Function neu deployen** – `send-transactional-email` und `preview-transactional-email` redeployen, damit die Änderungen live sind.

### Technische Details
- Das horizontale Logo (IMG_7345.png) wird verwendet, da es besser in E-Mail-Header passt
- Storage-Pfad: `email-assets/drive-me-logo-new.png` (oder Überschreiben des bestehenden)
- Header-Style: `backgroundColor: '#1a2344'`, `padding: '24px 25px'`, `borderRadius: '8px 8px 0 0'`

