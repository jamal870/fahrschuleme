import LocalLandingPage from "@/components/LocalLandingPage";

const FahrschuleNeuenhof = () => (
  <LocalLandingPage
    path="/fahrschule-neuenhof"
    seoTitle="Fahrschule Neuenhof – Auto & Motorrad | Fahrschule me"
    seoDescription="Fahrschule für Neuenhof: Auto- und Motorrad-Fahrstunden mit Treffpunkt Wettingen. Mo–Sa 08–22 Uhr, faire Preise. Online buchen bei Fahrschule me."
    badge="Fahrschule Neuenhof"
    h1="Deine Fahrschule für"
    h1Accent="Neuenhof"
    intro="Du wohnst in Neuenhof? Unsere Fahrschule liegt nur wenige Minuten entfernt in Wettingen – schnell erreichbar mit Bus, Velo oder Auto. Auto- und Motorrad-Ausbildung aus einer Hand, flexible Zeiten Mo–Sa 08–22 Uhr."
    meetingPoint={{ label: "Wettingen (für Neuenhof)", address: "Bahnhofstrasse 56, 5430 Wettingen" }}
    serviceName="Fahrschule Neuenhof"
    serviceType="DrivingSchool"
    benefits={[
      { title: "Nur 5 Minuten von Neuenhof", desc: "Unser Standort Wettingen liegt direkt nebenan – kurze Anfahrt, kein Stress." },
      { title: "Auto & Motorrad", desc: "Kategorie B (Auto) sowie A1, A2 und A (Motorrad) – komplettes Angebot." },
      { title: "Faire Preise", desc: "Auto-Lektion 95 CHF, Motorrad 130 CHF. Abos mit Rabatt verfügbar." },
      { title: "Flexible Zeiten", desc: "Mo–Sa 08:00–22:00 Uhr – auch nach Feierabend oder am Wochenende." },
      { title: "Persönliche Betreuung", desc: "Vom ersten Kontakt bis zur Prüfung: ein fester Ansprechpartner." },
      { title: "Direkt online buchen", desc: "Termine ansehen, reservieren und bezahlen – in wenigen Klicks." },
    ]}
    longText={[
      {
        heading: "Fahrschule me – für Neuenhof",
        body: "Neuenhof gehört zum Bezirk Baden im Kanton Aargau und liegt direkt an Wettingen – unserem Hauptstandort. Für Fahrschüler aus Neuenhof bedeutet das: kurze Wege, schnelle Termine und Unterricht auf den Strassen, die du täglich befährst (A1, Limmatbrücke, Zentrum Wettingen, Baden Schulhausplatz).",
      },
      {
        heading: "Unser Angebot für Neuenhof",
        body: "• Auto-Fahrstunden (Kategorie B) – Einzel- und Doppellektionen, 10er-/20er-Abos\n• Motorrad-Fahrstunden für A1, A2 und A\n• Motorrad-Grundkurs (MGK) in Wettingen\n• Vor-Prüfungsfahrt inkl. Anmeldung beim Strassenverkehrsamt Aargau\n• Beratung zu VKU, Nothelferkurs und Lernfahrausweis",
      },
      {
        heading: "Treffpunkt und Anfahrt",
        body: "Unser Treffpunkt ist die Bahnhofstrasse 56 in 5430 Wettingen – von Neuenhof aus per Bus (Linie 1) oder mit dem Velo in wenigen Minuten erreichbar. Auf Wunsch holen wir dich direkt in Neuenhof ab.",
      },
    ]}
    faqs={[
      { q: "Kommt ihr nach Neuenhof zur Abholung?", a: "Ja, auf Anfrage holen wir dich direkt in Neuenhof ab. Sag uns einfach Bescheid bei der Buchung." },
      { q: "Findet der Motorrad-Grundkurs in Neuenhof statt?", a: "Nein, der MGK findet in Wettingen statt – wenige Minuten von Neuenhof entfernt." },
      { q: "Was kostet eine Autofahrstunde?", a: "95 CHF pro Einzellektion (45 Min). Mit dem 10er-Abo sparst du 50 CHF, mit dem 20er-Abo 150 CHF." },
      { q: "Wie melde ich mich an?", a: "Online über die Kontaktseite, per WhatsApp oder telefonisch unter 076 779 03 83." },
    ]}
    primaryCta={{ label: "Jetzt buchen", to: "/grundkurs" }}
    secondaryCta={{ label: "Preise ansehen", to: "/preise" }}
    breadcrumbs={[{ label: "Fahrschule Neuenhof" }]}
    relatedLinks={[
      { to: "/fahrschule-wettingen", title: "Fahrschule Wettingen", desc: "Unser Hauptstandort – Auto und Motorrad direkt vor der Tür." },
      { to: "/motorrad-grundkurs-wettingen", title: "MGK Wettingen", desc: "Der obligatorische 12h-Motorrad-Grundkurs für A1/A2/A." },
      { to: "/preise", title: "Alle Preise", desc: "Transparente Übersicht aller Lektionen und Pakete." },
    ]}
  />
);

export default FahrschuleNeuenhof;
