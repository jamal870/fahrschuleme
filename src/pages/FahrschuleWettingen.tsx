import LocalLandingPage from "@/components/LocalLandingPage";

const FahrschuleWettingen = () => (
  <LocalLandingPage
    path="/fahrschule-wettingen"
    seoTitle="Fahrschule Wettingen – Auto & Motorrad | Fahrschule me"
    seoDescription="Fahrschule in Wettingen für Auto- und Motorrad-Fahrstunden. Erfahrene Instruktoren, faire Preise, Mo–Sa 08–22 Uhr. Direkt online buchen bei Fahrschule me."
    badge="Fahrschule Wettingen"
    h1="Deine Fahrschule in"
    h1Accent="Wettingen"
    intro="Auto- und Motorrad-Fahrstunden direkt in Wettingen – mit erfahrenen, eidgenössisch geprüften Fahrlehrern. Flexible Termine Mo–Sa von 08:00 bis 22:00 Uhr, transparente Preise und persönliche Betreuung bis zur Prüfung."
    meetingPoint={{ label: "Wettingen", address: "Bahnhofstrasse 56, 5430 Wettingen" }}
    serviceName="Fahrschule Wettingen"
    serviceType="DrivingSchool"
    benefits={[
      { title: "Auto & Motorrad", desc: "Kategorie B (Auto), AM, A1, A2 und A (Motorrad) – alles aus einer Hand." },
      { title: "Faire Preise", desc: "Einzellektion Auto 95 CHF, Motorrad 130 CHF. Mit Abo sparst du bis zu 150 CHF." },
      { title: "Flexible Zeiten", desc: "Mo–Sa von 08:00 bis 22:00 Uhr – Lektionen auch nach Feierabend." },
      { title: "Treffpunkt zentral", desc: "Bahnhofstrasse 56, gut erreichbar mit dem ÖV und Auto." },
      { title: "Online-Buchung", desc: "Termine direkt online buchen und bezahlen – Twint, Karte oder Rechnung." },
      { title: "Persönliche Betreuung", desc: "Du wirst von der ersten Lektion bis zur Prüfung vom selben Fahrlehrer betreut." },
    ]}
    longText={[
      {
        heading: "Fahrschule me – Wettingen",
        body: "Wir sind deine lokale Fahrschule in Wettingen, mitten im Kanton Aargau. Bei uns lernst du nicht nur, die Prüfung zu bestehen – sondern, sicher und souverän zu fahren. Unser Fokus liegt auf qualitativ hochwertigem Unterricht: kleine Klassen, moderne Schulungsfahrzeuge und persönliche Betreuung.",
      },
      {
        heading: "Was bieten wir an?",
        body: "• Auto-Fahrstunden (Kategorie B) – Einzellektion 45 Min, Doppellektion 90 Min, Abos\n• Motorrad-Fahrstunden – Vorschulung, Grundschulung, Perfektionsschulung\n• Motorrad-Grundkurs (MGK) für A1, A2 und A\n• Vor-Prüfungsfahrt inkl. Prüfungsanmeldung\n• Beratung zur Anmeldung beim Strassenverkehrsamt Aargau",
      },
      {
        heading: "Für wen sind wir da?",
        body: "Fahrschüler aus Wettingen, Baden, Neuenhof, Würenlos, Spreitenbach, Killwangen, Ennetbaden, Obersiggenthal und der gesamten Region Limmattal/Aargau. Wir holen dich bei Bedarf auch ab anderen Treffpunkten ab – auf Anfrage.",
      },
    ]}
    faqs={[
      { q: "Wo finden die Fahrstunden statt?", a: "Treffpunkt ist die Bahnhofstrasse 56 in 5430 Wettingen. Auf Anfrage holen wir dich auch an anderen Orten in der Region ab." },
      { q: "Was kostet eine Autofahrstunde?", a: "Eine Einzellektion (45 Min) kostet 95 CHF. Mit dem 10er-Abo sparst du 50 CHF, mit dem 20er-Abo 150 CHF." },
      { q: "Bietet ihr auch Motorrad-Fahrstunden an?", a: "Ja. Motorrad-Einzellektion (60 Min) kostet 130 CHF. Wir bieten Vorschulung, Grundschulung und Vor-Prüfungsfahrt an." },
      { q: "Wie melde ich mich an?", a: "Am einfachsten online über die Kontakt- oder Kurstermin-Seite. Du kannst uns auch direkt anrufen oder per WhatsApp schreiben." },
    ]}
    primaryCta={{ label: "Jetzt buchen", to: "/grundkurs" }}
    secondaryCta={{ label: "Preise ansehen", to: "/preise" }}
    breadcrumbs={[{ label: "Fahrschule Wettingen" }]}
    relatedLinks={[
      { to: "/motorrad-grundkurs-wettingen", title: "Motorrad-Grundkurs Wettingen", desc: "Der obligatorische 12h-MGK für A1, A2 und A – direkt in Wettingen." },
      { to: "/fahrschule-baden", title: "Fahrschule Baden", desc: "Treffpunkt direkt am Bahnhof Baden – ideal für Pendler." },
      { to: "/preise", title: "Alle Preise im Überblick", desc: "Auto, Motorrad, MGK, Nothelfer und VKU – transparent aufgelistet." },
    ]}
  />
);

export default FahrschuleWettingen;
