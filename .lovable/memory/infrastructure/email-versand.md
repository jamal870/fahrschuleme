---
name: E-Mail-Versand (eigenständig via Resend)
description: Absenderdomain notify.fahrschule-me.ch, Versand direkt über Resend-API, keine Lovable-Mailinfrastruktur
type: feature
---

# E-Mail-Versand

**Grundsatz: KEINE Abhängigkeit zu Lovable-Mailinfrastruktur.**
Versand läuft direkt über die Resend-API (`https://api.resend.com/emails`) mit
dem eigenen `RESEND_API_KEY` des Kunden.

## Konfiguration
- Absenderdomain: `notify.fahrschule-me.ch` (früher `notify.drive-me.ch` — abgelöst)
- Konstanten in `supabase/functions/send-transactional-email/index.ts`
  (`SITE_NAME`, `SENDER_DOMAIN`, `FROM_DOMAIN`)
- Absender: `Fahrschule me <noreply@notify.fahrschule-me.ch>`
- Versand-Worker: `supabase/functions/process-email-queue/index.ts` → `sendViaResend()`
- Unsubscribe-Link zeigt auf `https://www.fahrschule-me.ch/#/unsubscribe?token=...`

## DNS
Records kommen aus dem Resend-Dashboard (Domain `notify.fahrschule-me.ch`)
und werden im **Netlify-DNS** von `fahrschule-me.ch` eingetragen
(MX `send`, TXT SPF, TXT `resend._domainkey`).
NIE Lovable-NS-Delegation (`ns*.lovable.cloud`) verwenden.

## Sicherheit
`send-transactional-email` erlaubt anonymen Aufrufern nur eine Allowlist:
Buchungsbestätigungen nur mit gültiger `bookingId` + passender E-Mail,
Admin-Benachrichtigungen immer an feste Adresse.

## Typische Fehler
- `403 domain is not verified` → Resend-Domain-Verifikation fehlt/DNS unvollständig
- `API key is invalid` → `RESEND_API_KEY` neu setzen
- Empfänger in `suppressed_emails` (Bounce) → Eintrag prüfen/löschen
