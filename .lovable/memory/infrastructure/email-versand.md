---
name: E-Mail-Versand (eigenständig via Resend)
description: Absenderdomain drive-me.ch (in Resend verifiziert), Versand direkt über Resend-API, DNS bleibt bei tajo.host.ch
type: feature
---

# E-Mail-Versand

**Grundsatz: KEINE Abhängigkeit zu Lovable-Mailinfrastruktur.**
Versand läuft direkt über die Resend-API (`https://api.resend.com/emails`) mit
dem eigenen `RESEND_API_KEY` des Kunden.

## Konfiguration
- Absenderdomain: `drive-me.ch` — die einzige in Resend verifizierte Domain.
  Eine zweite Domain (`notify.fahrschule-me.ch`) erfordert einen kostenpflichtigen
  Resend-Plan → wurde bewusst NICHT eingerichtet.
- Absender: `Fahrschule me <noreply@drive-me.ch>`
- Konstanten in `supabase/functions/send-transactional-email/index.ts`
  (`SITE_NAME`, `SENDER_DOMAIN`, `FROM_DOMAIN`)
- Versand-Worker: `supabase/functions/process-email-queue/index.ts` → `sendViaResend()`
- Unsubscribe-Link zeigt auf `https://www.fahrschule-me.ch/#/unsubscribe?token=...`

## DNS
DNS von `drive-me.ch` bleibt bei **tajo.host.ch** — dort sind SPF/DKIM/MX für
Resend korrekt gesetzt (Domain in Resend = VERIFIZIERT). Nichts anfassen.
NIE Lovable-NS-Delegation (`ns*.lovable.cloud`) verwenden.


## Sicherheit
`send-transactional-email` erlaubt anonymen Aufrufern nur eine Allowlist:
Buchungsbestätigungen nur mit gültiger `bookingId` + passender E-Mail,
Admin-Benachrichtigungen immer an feste Adresse.

## Typische Fehler
- `403 domain is not verified` → Resend-Domain-Verifikation fehlt/DNS unvollständig
- `API key is invalid` → `RESEND_API_KEY` neu setzen
- Empfänger in `suppressed_emails` (Bounce) → Eintrag prüfen/löschen
