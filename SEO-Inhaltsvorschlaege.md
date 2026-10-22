# SEO-Inhaltsvorschläge für dünne Seiten

Stand: 20.10.2026. Nur Gliederungen und Fragen, keine fertigen Texte.
Alle Stellen mit `[BITTE PRÜFEN]` müssen vor dem Schreiben bestätigt werden.
Keine Zahlen, Preise oder Kursdetails aus diesem Dokument übernehmen, ohne
sie gegen `src/config/tenant.ts` bzw. den Admin (Inhalte & Preise) zu prüfen.

Wortzahlen im Server-HTML (Audit 20.10.2026): `/fahrstunden` 84,
`/motorrad` 91, `/grundkurs` 125, `/angebote` 115. Ortsseiten liegen bei
310–420. Ziel: jede dieser Seiten auf 300+ Wörter echten Inhalt, ohne die
Buchungs- und Aktionslogik zu verändern.

---

## /fahrstunden – „Fahrstunden Auto & Motorrad in Wettingen"

Heute: H1 „Motorrad & Auto Fahrstunden", Aktions-Teaser, CTA zur App.
Die Seite erklärt nicht, wie eine Fahrstunde abläuft.

Vorgeschlagene Struktur:

- H1: Fahrstunden Auto & Motorrad in Wettingen (bestehend)
- H2: So läuft deine erste Fahrstunde ab
  - Treffpunkt, Dauer einer Lektion `[BITTE PRÜFEN: 45 Min Auto / 60 Min Motorrad laut Ortsseiten]`
  - Was du mitbringen musst (Lernfahrausweis, Brille) `[BITTE PRÜFEN]`
- H2: Einzellektion oder Abo – was passt zu dir?
  - 10er-/20er-Abo: wann es sich lohnt (ohne Preise nennen, Link auf /preise/)
- H2: Fahrstunden für Auto (Kategorie B)
  - Für Anfänger, Wiedereinsteiger, Prüfungsvorbereitung
- H2: Fahrstunden für Motorrad (A1, A2, A)
  - Vorschulung, Grundschulung, Vor-Prüfungsfahrt `[BITTE PRÜFEN: Begriffe wie auf /fahrschule-wettingen/]`
- H2: Häufige Fragen (als FAQ, Schema per FAQPage)
  - Wie viele Fahrstunden brauche ich? (Link auf /wie-viele-fahrstunden/)
  - Kann ich mit dem eigenen Auto üben?  `[BITTE PRÜFEN]`
  - Holt ihr mich zu Hause ab? `[BITTE PRÜFEN: Ortsseiten sagen „auf Anfrage"]`
  - Was passiert bei Absage? `[BITTE PRÜFEN: Stornofrist aus AGB]`
- H2: Fahrstunde buchen (bestehender CTA)

---

## /motorrad – „Motorrad Führerschein Wettingen – A1, A2, A"

Heute: H1 „Motorradführerschein", Kategorien-Kacheln, drei Grundkurs-Teile.
Fast nur Stichworte, kaum Fliesstext.

Vorgeschlagene Struktur:

- H1: Motorradführerschein in Wettingen (bestehend, Schreibweise siehe Rückfrage im Bericht)
- H2: Der Weg zum Motorradführerschein in 4 Schritten
  - Lernfahrausweis, Grundkurs (MGK), Fahrstunden, Prüfung – nur die Reihenfolge, keine Fristen erfinden `[BITTE PRÜFEN: 4-Monats-Frist für MGK laut /motorrad-fuehrerschein-wettingen/]`
- H2: Welche Kategorie passt zu mir? (AM, A1, A2, A)
  - Kurzer Absatz je Kategorie mit Mindestalter `[BITTE PRÜFEN: Werte aus tenant.ts categories]`
  - Link auf /motorrad-kategorien-vergleich/
- H2: Motorrad-Grundkurs (MGK) – Teil 1, 2 und 3
  - Was in jedem Teil geübt wird (1–2 Sätze je Teil, keine neuen Inhalte erfinden) `[BITTE PRÜFEN]`
  - Link auf /motorrad-grundkurs-wettingen/ und /kurstermine/
- H2: Motorrad-Fahrstunden und Vor-Prüfungsfahrt
- H2: Häufige Fragen
  - Brauche ich ein eigenes Motorrad? `[BITTE PRÜFEN]`
  - Welche Ausrüstung ist Pflicht? `[BITTE PRÜFEN]`
  - Kann ich den MGK auch im Winter machen? `[BITTE PRÜFEN]`
- H2: Jetzt Grundkurs buchen (CTA)

Hinweis Kannibalisierung: `/motorrad` und `/motorrad-fuehrerschein-wettingen/`
zielen auf dasselbe Keyword. Vorschlag: `/motorrad` als Übersicht („alles
rund ums Motorrad bei Fahrschule me"), die Unterseite als Ortsseite mit
Fokus Wettingen. Alternativ `/motorrad` per Canonical auf die Unterseite
zeigen lassen. Entscheidung offen.

---

## /grundkurs – „Motorrad-Grundkurs buchen Wettingen"

Heute: Buchungsformular mit Kursauswahl. Fast kein erklärender Text, die
Seite ist aber in der Sitemap mit Priorität 0.9.

Das Formular darf nicht verändert werden. Vorschlag: einen kurzen
Textblock **über** dem Formular und ein FAQ **darunter**.

- H1: Motorrad-Grundkurs (MGK) in Wettingen buchen (bestehend) `[BITTE PRÜFEN: aktuelle H1 im Formular]`
- Einleitung (2–3 Sätze): Was der MGK ist, 3 Teile à 4 Stunden `[BITTE PRÜFEN]`, Treffpunkt
- Formular (unverändert)
- H2: Häufige Fragen zur Buchung
  - Muss ich alle drei Teile auf einmal buchen? `[BITTE PRÜFEN: Formular erlaubt Einzelteile?]`
  - Was ist die FA-Nummer und wo finde ich sie? (Text existiert bereits im Formular, als FAQ sichtbar machen)
  - Wie bezahle ich? (Online, Bar, Überweisung – ohne Gebührenhöhe nennen, steht im Formular)
  - Was passiert, wenn ich einen Teil verpasse? `[BITTE PRÜFEN]`
  - Ich habe bereits A1 – brauche ich nur Teil 3? (bestehende A1-Logik im Formular)
- H2: Nächste Kurstermine (Link auf /kurstermine/)

---

## /angebote – „Aktionen & Angebote"

Heute: dynamische Aktionsliste; ohne laufende Aktion steht „Aktuell keine
laufenden Aktionen" plus ein kurzer Absatz. Die Seite ist dann fast leer.

Vorgeschlagene Struktur (statischer Teil, der immer sichtbar ist):

- H1: Aktionen & Angebote (bestehend)
- Aktionsliste (dynamisch, unverändert)
- H2: So funktionieren unsere Aktionen
  - Zeitlich begrenzt, gelten für Neubuchungen `[BITTE PRÜFEN]`, nicht kombinierbar `[BITTE PRÜFEN]`
- H2: Dauerhaft günstiger: Abos und Paketpreise
  - Verweis auf 10er-/20er-Abo und MGK-Paket, Link auf /preise/ (keine Preise nennen)
- H2: Häufige Fragen
  - Kann ich eine Aktion nachträglich nutzen? `[BITTE PRÜFEN]`
  - Gilt die Aktion auch für Motorrad? `[BITTE PRÜFEN]`
  - Wie erfahre ich von neuen Aktionen? `[BITTE PRÜFEN: Newsletter vorhanden? /unsubscribe deutet darauf hin]`
- H2: Jetzt buchen (CTA)

---

## Offene Entscheidungen

1. `/motorrad` vs. `/motorrad-fuehrerschein-wettingen/`: Übersicht vs. Ortsseite, oder Canonical?
2. `/grundkurs`: Text über dem Formular ist eine Designänderung, bitte freigeben.
3. Alle `[BITTE PRÜFEN]`-Stellen: Fakten von euch bestätigen lassen.
