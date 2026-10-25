import LocalLandingPage from "@/components/LocalLandingPage";

const A1FuehrerscheinWettingen = () => (
  <LocalLandingPage
    path="/a1-fuehrerschein-wettingen/"
    seoTitle="A1 Führerschein Wettingen – 125 ccm | Fahrschule me"
    seoDescription="A1 Führerschein (125 ccm) in Wettingen: ab 16 Jahren, Grundkurs in 3 Teilen à CHF 160, Fahrstunden und Prüfungsvorbereitung. Ablauf und Kosten im Überblick."
    badge="Motorrad A1"
    h1="A1 Führerschein in"
    h1Accent="Wettingen"
    intro="Mit der Kategorie A1 fährst du ab 16 Jahren Motorräder bis 125 cm³ und 11 kW. Bei Fahrschule me besuchst du den obligatorischen Grundkurs in Wettingen, übst in Fahrstunden und bereitest dich gezielt auf die praktische Prüfung vor."
    meetingPoint={{ label: "Wettingen", address: "Bahnhofstrasse 56, 5430 Wettingen" }}
    serviceName="A1 Führerschein Wettingen"
    benefits={[
      { title: "Ab 16 Jahren", desc: "Kategorie A1 für Motorräder bis 125 cm³ und maximal 11 kW." },
      { title: "Grundkurs in 3 Teilen", desc: "Obligatorischer Motorrad-Grundkurs mit 12 Stunden Praxis, je Teil 4 Stunden." },
      { title: "Klare Preise", desc: "Grundkurs CHF 160 pro Teil, Motorradlektion CHF 130, Vor-Prüfungsfahrt inklusive Prüfung CHF 180." },
      { title: "Kleine Gruppen", desc: "Der Grundkurs findet in kleinen Gruppen in Wettingen statt." },
      { title: "Weg für A1-Inhaber", desc: "Wer bereits A1 besitzt, bucht für die Kategorie A nur Kursteil 3 zum Pauschalpreis von CHF 250." },
      { title: "Online buchen", desc: "Termine für alle Kursteile siehst du online und buchst sie direkt." },
    ]}
    longText={[
      {
        heading: "Das darfst du mit der Kategorie A1 fahren",
        body: "A1 gilt für Motorräder bis 125 cm³ mit höchstens 11 kW Leistung (Verhältnis höchstens 0.1 kW pro Kilogramm). Du kannst die Kategorie ab 16 Jahren erwerben. Sie ist ein guter Einstieg und die Basis für den späteren Wechsel auf A2. Mit der Praxis aus A2 steht dir nach zwei Jahren die unbegrenzte Kategorie A offen.",
      },
      {
        heading: "So kommst du zum A1 Führerschein",
        body: "1. Sehtest machen, Nothelferkurs bei einem anerkannten Anbieter absolvieren und das Gesuch bei der Wohngemeinde einreichen.\n2. Theorieprüfung beim Strassenverkehrsamt Aargau bestehen und den Lernfahrausweis der Kategorie A1 erhalten.\n3. Motorrad-Grundkurs bei uns in Wettingen besuchen: drei Teile mit je vier Stunden, in der richtigen Reihenfolge.\n4. In Fahrstunden das Fahren im Verkehr üben.\n5. Praktische Prüfung beim Strassenverkehrsamt ablegen. Vorher kannst du die Vor-Prüfungsfahrt buchen.",
      },
      {
        heading: "Grundkurs und Fahrzeug",
        body: "Der Grundkurs ersetzt keine Fahrlektionen. Du solltest dein Fahrzeug schon vor dem ersten Kurstag bedienen und dich im Strassenverkehr sicher bewegen können. Nimm deinen Lernfahrausweis mit und plane Helm und passende Schutzausrüstung ein. Du wirst auf deinem eigenen Motorrad geprüft. Kläre vorab mit uns, ob dein Fahrzeug der Kategorie A1 entspricht.",
      },
      {
        heading: "Kosten im Überblick",
        body: "• Motorrad-Grundkurs: 3 Teile à CHF 160, zusammen CHF 480\n• Motorradlektion (60 Minuten): CHF 130\n• Doppellektion (2 × 45 Minuten): CHF 180\n• Vor-Prüfungsfahrt inklusive Prüfung (120 Minuten): CHF 180\n• Nur Kursteil 3 für A1-Inhaber: CHF 250\n\nWie viele Lektionen du brauchst, hängt von deiner Vorerfahrung ab. Unser Kostenratgeber rechnet für A1 mit Grundkurs und vier bis sechs Lektionen, dazu kommen die amtlichen Gebühren.",
      },
    ]}
    faqs={[
      { q: "Ab welchem Alter gibt es die Kategorie A1?", a: "Die Kategorie A1 für Motorräder bis 125 cm³ erwirbst du ab 16 Jahren." },
      { q: "Brauche ich für A1 einen Grundkurs?", a: "Ja. Der Motorrad-Grundkurs mit 12 Stunden in drei Teilen ist für A1, A2 und A obligatorisch. Die Kursteile müssen in der richtigen Reihenfolge besucht werden." },
      { q: "Was kostet der A1 Grundkurs?", a: "Jeder der drei Kursteile kostet CHF 160, zusammen CHF 480." },
      { q: "Ich habe schon A1. Was brauche ich für die Kategorie A?", a: "Für den Weg von A1 zur Kategorie A buchst du bei uns nur Kursteil 3 zum Pauschalpreis von CHF 250. Der Buchungsweg für A1-Inhaber ist auf der Grundkurs-Seite gekennzeichnet." },
      { q: "Wo findet der Grundkurs statt?", a: "In Wettingen. Die aktuellen Termine siehst du bei den Kurstermine." },
    ]}
    primaryCta={{ label: "Grundkurs buchen", to: "/grundkurs/" }}
    secondaryCta={{ label: "Kurstermine ansehen", to: "/kurstermine/" }}
    breadcrumbs={[{ label: "Motorrad", to: "/motorrad/" }, { label: "A1 Führerschein Wettingen" }]}
    relatedLinks={[
      { to: "/motorrad-kategorien-vergleich/", title: "AM, A1, A2 und A im Vergleich", desc: "Alter, Leistung und Voraussetzungen aller Kategorien in einer Tabelle." },
      { to: "/motorrad-grundkurs-wettingen/", title: "Motorrad-Grundkurs Wettingen", desc: "Ablauf und Inhalt des obligatorischen Grundkurses." },
      { to: "/kosten-fuehrerschein-aargau/", title: "Kosten Führerschein Aargau", desc: "Alle Gebühren und Preise im Überblick." },
      { to: "/motorrad/", title: "Motorrad-Ausbildung", desc: "Grundkurs, Fahrstunden und Prüfungsvorbereitung." },
    ]}
  />
);

export default A1FuehrerscheinWettingen;
