# Plan: l-me.ch → fahrschule-me.ch weiterleiten

## Ziel
Wenn jemand `l-me.ch` (oder `www.l-me.ch`) im Browser eingibt, soll er automatisch auf `https://www.fahrschule-me.ch` umgeleitet werden — inklusive aller Unterseiten (`l-me.ch/kontakt` → `fahrschule-me.ch/kontakt`).

## Voraussetzung
Du musst Zugang zum DNS-Verwalter von `l-me.ch` haben (also dort, wo die Domain registriert ist — z. B. Hostpoint, Infomaniak, Cloudflare, GoDaddy etc.).

## Lösungsweg

Es gibt **zwei mögliche Wege**. Empfehlung: **Weg A** (sauberer, behält Pfade bei).

---

### Weg A: l-me.ch als zweite Domain im Lovable-Projekt verbinden (empfohlen)

1. **In Lovable**: Projekt-Einstellungen → Domains → „Connect Domain" → `l-me.ch` eingeben.
2. **Zweites Mal** dasselbe mit `www.l-me.ch` machen.
3. Lovable zeigt DNS-Einträge an (A-Record `185.158.133.1` + TXT-Record für Verifizierung).
4. **Beim DNS-Anbieter von l-me.ch** diese Einträge eintragen.
5. Warten bis Status „Active" (kann bis zu 72 h dauern, meist < 1 h).
6. In Lovable `fahrschule-me.ch` als **Primary Domain** markieren → alle anderen Domains leiten automatisch dorthin um, inkl. Pfaden und HTTPS.

**Ergebnis**: `l-me.ch/xyz` → `https://www.fahrschule-me.ch/xyz` mit 301-Redirect.

---

### Weg B: 301-Weiterleitung direkt beim DNS-/Hosting-Anbieter von l-me.ch

Wenn dein Anbieter eine „Domain Forwarding" / „Weiterleitung" Funktion hat (Hostpoint, Infomaniak, Cloudflare Page Rules, etc.):

1. Beim Anbieter von `l-me.ch` einloggen.
2. Funktion „URL-Weiterleitung" / „Domain Forwarding" suchen.
3. Ziel: `https://www.fahrschule-me.ch`
4. Typ: **301 (permanent)**, mit Option „Pfad beibehalten" aktivieren falls vorhanden.

**Vorteil**: kein DNS-Eintrag in Lovable nötig.  
**Nachteil**: Funktioniert nur, wenn der Anbieter das anbietet, und manchmal ohne sauberes HTTPS.

---

## Was ich vorbereiten kann
- ✅ Sobald du mir sagst „mach Weg A", brauche ich **nichts coden** — du fügst die Domain im Lovable-Dashboard hinzu, und ich begleite dich beim Setup.
- Optional: Ich kann auch eine kleine Info-Notiz auf der Webseite anzeigen, falls jemand `l-me.ch` aufruft („Wir sind umgezogen auf fahrschule-me.ch") — aber bei Weg A nicht nötig, der Redirect ist transparent.

## Frage an dich
1. Wo ist `l-me.ch` registriert (Hostpoint / Infomaniak / Cloudflare / sonst)?
2. Soll ich Weg A oder Weg B empfehlen?
