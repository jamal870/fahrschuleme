# Smoke-Test nach Migration

Auf https://fahrschuleme.lovable.app (oder Preview mit neuen Env-Vars) testen:

## Öffentlich
- [ ] Startseite lädt, Logo + Branding korrekt
- [ ] `/kurstermine` zeigt Kurse aus DB
- [ ] `/team` zeigt Team-Mitglieder
- [ ] `/fahrstunden` Preise korrekt
- [ ] iCal-Feed `/functions/v1/ical-feed` liefert .ics

## Buchung (End-to-End)
- [ ] Grundkurs auswählen → Formular → "Jetzt buchen"
- [ ] Stripe-Checkout öffnet in neuem Tab
- [ ] Testkarte 4242 4242 4242 4242 durchziehen
- [ ] Bestätigungsseite zeigt Erfolg
- [ ] Bestätigungsmail (Kunde) kommt an
- [ ] Admin-Notification-Mail kommt an
- [ ] Buchung erscheint in Admin → Buchungen mit Status "paid"
- [ ] `spots_available` der Kursdate ist um 1 gesunken

## Admin
- [ ] Login via Email/Passwort
- [ ] Rollenprüfung lässt rein
- [ ] Kurs anlegen / bearbeiten / löschen
- [ ] Foto-Import (parse-course-photo) funktioniert
- [ ] E-Mail-Einstellungen speichern
- [ ] Aktion anlegen
- [ ] PDF-Generierung (Rechnung)

## Bei Fehler
- Konsolen-Logs prüfen
- Edge-Function-Logs im neuen Supabase-Dashboard
- Stripe-Webhook-Log
