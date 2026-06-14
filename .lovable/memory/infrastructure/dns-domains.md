---
name: DNS & Domain Setup (Netlify + Hostpoint)
description: Komplette Domain-Architektur für fahrschule-me.ch und l-me.ch. Registrar Hostpoint, Hosting Netlify, Nameserver Netlify DNS (nsone.net).
type: feature
---

# Domain-Setup — Stand: 14. Juni 2026

## Architektur (Single Source of Truth)

- **Registrar:** Hostpoint (admin.hostpoint.ch) für BEIDE Domains
- **Hosting:** Netlify (Site: `fahrschuleme.netlify.app`)
- **DNS-Provider:** Netlify DNS (Nameserver: `dns1-4.p05.nsone.net`)
- **Code-Deploy:** GitHub → Netlify (Auto-Deploy via `netlify.toml`)

## Domains

### fahrschule-me.ch (Hauptdomain)
- `fahrschule-me.ch` A `75.2.60.5` → Netlify (Primary)
- `www.fahrschule-me.ch` CNAME `fahrschuleme.netlify.app.` → redirects to primary
- `app.fahrschule-me.ch` A `187.124.55.146` → externe App (NICHT anfassen)
- MX/SPF/DKIM/DMARC → Hostpoint Mail (NICHT anfassen)

### l-me.ch (Alte Domain → 301 Redirect)
- `l-me.ch` A `75.2.60.5` → Netlify
- `www.l-me.ch` CNAME `fahrschuleme.netlify.app.`
- `app.l-me.ch` A `187.124.55.146`
- Redirect auf `www.fahrschule-me.ch` läuft via `netlify.toml`

## Wichtige Regeln

1. **NIE Lovable Custom Domain Flow vorschlagen.** Alles läuft über Netlify.
2. **NIE DNS-Records, IPs (185.158.133.1) oder Lovable-TXT-Records vorschlagen.**
3. **Code-Push:** Läuft automatisch GitHub → Netlify. Kein manueller Deploy nötig.
4. **Lovable Publish** ist NICHT der Live-Deploy. Live ist Netlify.

## Checkliste bei Domain-Problemen (in dieser Reihenfolge!)

1. **Registrar-Nameserver prüfen** (Hostpoint → Domain → Nameserver):
   müssen `dns1-4.p05.nsone.net` sein, NICHT Cloudflare, NICHT Hostpoint-Default.
2. **Netlify DNS Records prüfen** (app.netlify.com → DNS):
   A `@` → 75.2.60.5, CNAME `www` → fahrschuleme.netlify.app.
3. **Netlify Site Domains prüfen** (Site → Domain management):
   alle 4 Domains als Aliases zugewiesen, eine als Primary.
4. **Propagation abwarten:** https://dnschecker.org/#NS/<domain>
   NS-Wechsel: 1–6h (max 24h), A-Records: 10–60 min.

## Fehler-Lookup

| Fehler | Ursache | Fix |
|---|---|---|
| `DNS_PROBE_FINISHED_NXDOMAIN` | NS noch nicht propagiert ODER NS falsch | NS bei Registrar prüfen → dnschecker.org |
| Cloudflare Error 1000 | NS zeigen noch auf Cloudflare | NS bei Registrar auf nsone.net umstellen |
| SSL not provisioned | DNS noch nicht überall propagiert | Warten, dann Netlify "Renew certificate" |

## Goldene Regel für mich (AI)

Beim allerersten Domain/DNS-Problem IMMER zuerst **alle 4 Schichten in EINER Frage** klären:
1. Bei welchem Registrar ist die Domain?
2. Wo zeigen die Nameserver hin?
3. Welche DNS-Records gibt es aktuell?
4. Welche Domains sind im Netlify-Site zugewiesen?

NICHT schrittweise Screenshots anfragen — das nervt den User massiv und ist Zeitverschwendung.
