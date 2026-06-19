---
name: A1-Inhaber Buchung (nur Teil 3)
description: Sonderbuchungsfluss für Schüler mit bereits vorhandenem A1-Ausweis – nur MGK Teil 3 zum Pauschalpreis CHF 250
type: feature
---

## Regel
Schüler, die bereits im Besitz der Führerausweis-Kategorie A1 sind, müssen nur Kursteil 3 absolvieren.
Preis dafür: **CHF 250.00 Pauschal** (statt CHF 160 wie im 3-Teile-Paket).

## Einstieg
- URL-Parameter `?a1=1` auf `/grundkurs-buchen` aktiviert den A1-Modus.
- Eigener Button auf Startseite (Index, Sektion „Online Buchen"): „Nur Teil 3 (A1-Inhaber) – CHF 250".
- Hinweislink zusätzlich oben in der Standard-Grundkurs-Buchungsseite.

## Frontend-Verhalten im A1-Modus
- Nur Teil 3 wird geladen & angezeigt (Teil 1 + 2 ausgeblendet).
- Kursterminkarten zeigen CHF 250.00 statt course.price.
- Submit-Button erst aktiv, wenn der Schüler die Pflicht-Checkbox „Ich bestätige, dass ich A1 besitze" angehakt hat (Selbstdeklaration, kein Upload).
- Summary und Gesamtbetrag = CHF 250.00.

## Backend-Enforcement (create-booking edge function)
**Sicherheitskritisch:** Preis wird serverseitig erzwungen, nicht vom Client übernommen.
Regel: `courses.length === 1 && courses[0].part === 3` → `serverTotal = 250`.
So kann ein A1-Schüler nicht den Standardpreis durch Client-Manipulation erwirken,
und ein Normalkunde kann nicht „nur Teil 3 zum A1-Preis" buchen, weil der Standardfluss
immer alle 3 Teile verlangt.

## Wichtig bei Änderungen
- Wenn der Standardfluss jemals einzelne Teilbuchungen erlauben soll, muss die A1-Logik
  durch ein explizites Client-Flag (z. B. `a1Only: true`) ersetzt werden, das serverseitig
  validiert wird.
- Preis CHF 250 ist als Konstante `A1_TEIL3_PRICE` in `GrundkursBuchen.tsx` und in
  `supabase/functions/create-booking/index.ts` hinterlegt – beide synchron halten.
