import LocalLandingPage from "@/components/LocalLandingPage";

const MotorradFuehrerscheinBaden = () => (
  <LocalLandingPage
    path="/motorrad-fuehrerschein-baden"
    seoTitle="Motorrad-Führerschein Baden – A1/A2/A | Fahrschule me"
    seoDescription="Motorrad-Führerschein für Baden: MGK, Fahrstunden und Vor-Prüfungsfahrt für A1, A2 und A. Treffpunkt Bahnhof Baden. Online buchen bei Fahrschule me."
    badge="Motorrad-Führerschein Baden"
    h1="Motorrad-Führerschein in"
    h1Accent="Baden"
    intro="Den Motorrad-Führerschein für Baden machst du bei Fahrschule me – mit Treffpunkt Bahnhof Baden für Fahrstunden und dem MGK direkt in Wettingen, nur wenige Minuten entfernt. Wir begleiten dich von der Anmeldung bis zur bestandenen Prüfung."
    meetingPoint={{ label: "Baden Bahnhof / MGK in Wettingen", address: "Bahnhof Baden / Bahnhofstrasse 56, 5430 Wettingen" }}
    serviceName="Motorrad-Führerschein Baden"
    serviceType="MotorcycleSchool"
    benefits={[
      { title: "Alle Kategorien", desc: "A1 (125 cc), A2 (35 kW) und A (unbegrenzt) – wir bilden dich für jede Stufe aus." },
      { title: "Treffpunkt Bahnhof Baden", desc: "Für Fahrstunden treffen wir uns direkt am Bahnhof Baden – keine Parkplatzsuche." },
      { title: "MGK in Wettingen", desc: "Den obligatorischen 12h-Grundkurs absolvierst du in Wettingen, schnell erreichbar." },
      { title: "Erfahrene Instruktoren", desc: "Eidgenössisch geprüfte Fahrlehrer mit jahrelanger Praxis." },
      { title: "Flexible Termine", desc: "Mo–Sa 08–22 Uhr – auch abends und samstags." },
      { title: "Komplettpaket", desc: "MGK, Fahrstunden, Vor-Prüfungsfahrt und Prüfungsanmeldung aus einer Hand." },
    ]}
    longText={[
      {
        heading: "Motorrad-Führerschein für Baden – So läuft es ab",
        body: "1. Lernfahrausweis beim Strassenverkehrsamt Aargau beantragen (Sehtest + Nothelfer erforderlich).\n2. Motorrad-Grundkurs (MGK) bei uns in Wettingen – 12 Stunden in 3 Teilen.\n3. Fahrstunden mit Treffpunkt Bahnhof Baden – im realen Verkehr deiner Region.\n4. Vor-Prüfungsfahrt – wir prüfen mit dir alles unter Prüfungsbedingungen.\n5. Praktische Führerprüfung beim Strassenverkehrsamt.",
      },
      {
        heading: "Welche Kategorie passt zu dir?",
        body: "• A1 (ab 16 Jahren): bis 125 cc / 11 kW – ideal für Pendler.\n• A2 (ab 18 Jahren): bis 35 kW – Einstieg auf grössere Maschinen.\n• A (ab 25 Jahren, oder 2 Jahre nach A2): unbegrenzte Leistung.\n\nNach 2 Jahren Praxis auf A2 kannst du direkt auf Kategorie A umsteigen (ohne Grundkurs).",
      },
      {
        heading: "Warum Fahrschule me?",
        body: "Wir kennen die Strecken rund um Baden, den Verkehr in Wettingen, Neuenhof und auf der Limmattalbrücke wie unsere Westentasche. Unsere Schulungsmotorräder sind modern und gepflegt, der Unterricht ist persönlich und prüfungsnah.",
      },
    ]}
    faqs={[
      { q: "Wie viele Fahrstunden brauche ich für die Motorradprüfung?", a: "Das ist individuell. Wir empfehlen 8–15 Lektionen vor der Prüfung – je nach Vorerfahrung und Kategorie." },
      { q: "Brauche ich ein eigenes Motorrad?", a: "Du wirst auf deinem eigenen Motorrad geprüft. Wir helfen dir gerne, ein geeignetes Motorrad zu mieten." },
      { q: "Wo findet der MGK statt?", a: "In Wettingen, an der Bahnhofstrasse 56 – wenige Minuten von Baden entfernt." },
      { q: "Was kostet das Gesamtpaket?", a: "MGK: 3× 160 CHF, Motorrad-Lektion: 130 CHF (60 Min). Genaue Pakete besprechen wir individuell." },
    ]}
    primaryCta={{ label: "Kurstermine ansehen", to: "/kurstermine" }}
    secondaryCta={{ label: "Preise ansehen", to: "/preise" }}
    breadcrumbs={[
      { label: "Motorrad", to: "/motorrad" },
      { label: "Motorrad-Führerschein Baden" },
    ]}
    relatedLinks={[
      { to: "/motorrad-grundkurs-wettingen", title: "MGK Wettingen", desc: "Der obligatorische 12h-Grundkurs für A1/A2/A." },
      { to: "/fahrschule-baden", title: "Fahrschule Baden", desc: "Auto- und Motorrad-Fahrstunden mit Treffpunkt Bahnhof Baden." },
      { to: "/strassenverkehrsamt-aargau", title: "Strassenverkehrsamt Aargau", desc: "Anmeldung, Lernfahrausweis und Prüfung beim StVA." },
    ]}
  />
);

export default MotorradFuehrerscheinBaden;
