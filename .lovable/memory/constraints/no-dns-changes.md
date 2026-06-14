---
name: Never touch DNS
description: DNS verbleibt immer beim externen Anbieter (Netlify). Niemals DNS-Records, Nameserver oder Domain-Verbindungen über Lovable vorschlagen oder ändern.
type: constraint
---

**Verboten:** DNS-Änderungen, Domain-Verbindungen über Lovable, Nameserver-Wechsel, A-Record-Vorschläge.

**Warum:** User hat explizit gesagt „DNS bleibt bei Netlify" und will keine Lovable-Domain-Verwaltung. Frühere Versuche haben Verwirrung und Mehrarbeit verursacht.

**How to apply:** Wenn es um Domains/Redirects/DNS geht → Lösung muss bei Netlify (oder dem aktuellen DNS-Provider) liegen, z. B. via `netlify.toml`, Netlify-Domain-Forwarding oder Netlify-DNS-Panel. Niemals den Lovable-„Connect Domain"-Flow vorschlagen.
