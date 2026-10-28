import LocalLandingPage from "@/components/LocalLandingPage";
import { FAHRSTUNDEN_APP_URL } from "@/lib/booking-links";

const FahrschuleBaden = () => (
  <LocalLandingPage
    path="/fahrschule-baden/"
    seoTitle="Fahrschule Baden – Treffpunkt Bahnhof | Fahrschule me"
    seoDescription="Fahrschule für Baden mit Treffpunkt Bahnhof Baden: Auto- und Motorrad-Fahrstunden, MGK und Termine nach Vereinbarung. Online buchen."
    badge="Fahrschule Baden"
    h1="Fahrschule für"
    h1Accent="Baden – Treffpunkt Bahnhof"
    intro="Du wohnst in Baden? Kein Problem: Wir treffen dich direkt am Bahnhof Baden für deine Auto- oder Motorrad-Fahrstunde. Erfahrene Fahrlehrer, faire Preise und flexible Termine nach Vereinbarung."
    meetingPoint={{ label: "Baden Bahnhof", address: "Bahnhofplatz, 5400 Baden (Treffpunkt nach Absprache)" }}
    serviceName="Fahrschule Baden"
    serviceType="DrivingSchool"
    benefits={[
      { title: "Treffpunkt Bahnhof Baden", desc: "Wir holen dich direkt am Bahnhof Baden ab – kein Anfahrtsweg, keine Parkplatzsuche." },
      { title: "Auto & Motorrad", desc: "Kategorie B (Auto), AM, A1, A2 und A (Motorrad) – komplettes Angebot." },
      { title: "Flexible Zeiten", desc: "Termine nach Vereinbarung – ideal vor oder nach der Arbeit." },
      { title: "Faire Preise", desc: "95 CHF pro Autolektion, 130 CHF pro Motorradlektion. Abos verfügbar." },
      { title: "MGK Wettingen", desc: "Den Motorrad-Grundkurs absolvierst du bei uns in Wettingen – wenige Minuten von Baden entfernt." },
      { title: "Persönlicher Fahrlehrer", desc: "Vom Erstkontakt bis zur Prüfung wirst du vom selben erfahrenen Fahrlehrer betreut." },
    ]}
    longText={[
      {
        heading: "Fahrschule für Baden – mit Treffpunkt direkt am Bahnhof",
        body: "Für Fahrschüler aus Baden ist der Treffpunkt am Bahnhof Baden ideal: Du kommst mit dem Zug, der Bushaltestelle oder zu Fuss – und steigst direkt in dein Schulungsfahrzeug ein. Wir starten von dort die Fahrstunde im realen Verkehr von Baden, Wettingen und Umgebung.",
      },
      {
        heading: "Unser Angebot für Baden",
        body: "• Auto-Fahrstunden (Kategorie B) – Einzel- und Doppellektionen, Abos\n• Motorrad-Fahrstunden für A1, A2 und A\n• Motorrad-Grundkurs (MGK) – Durchführung in Wettingen, nur wenige Minuten entfernt\n• Vor-Prüfungsfahrt inklusive Prüfungsanmeldung beim Strassenverkehrsamt Aargau\n• Beratung zum Lernfahrausweis",
      },
      {
        heading: "Preise und Ablauf für Fahrschüler aus Baden",
        body: "Autofahrstunden starten am Bahnhof Baden (Treffpunkt nach Absprache) und kosten CHF 95 pro Lektion von 45 Minuten, die Doppellektion CHF 190. Motorradlektionen kosten CHF 130 für 60 Minuten. Den Motorrad-Grundkurs besuchst du an der Bahnhofstrasse 56 in Wettingen, drei Teile à CHF 160. Für einen ersten Überblick lohnt sich ein Blick auf unseren Autoführerschein und unseren A1 Führerschein.",
      },
      {
        heading: "Warum Fahrschule me in Baden?",
        body: "Wir kennen die Strassen von Baden, den Verkehr rund um Schulhausplatz, Bäderquartier und Kantonsspital genau – das macht den Unterricht effizient und prüfungsnah. Unsere Fahrlehrer sind eidgenössisch geprüft, geduldig und auf moderne Lehrmethoden spezialisiert.\n\nEinzugsgebiet: Baden, Ennetbaden, Obersiggenthal, Wettingen, Neuenhof, Würenlos, Untersiggenthal, Nussbaumen und der gesamte Bezirk Baden im Kanton Aargau.",
      },
    ]}
    faqs={[
      { q: "Wo genau ist der Treffpunkt in Baden?", a: "Bahnhof Baden – den exakten Treffpunkt klären wir kurz per WhatsApp oder Telefon vor der ersten Lektion." },
      { q: "Kostet die Anfahrt nach Baden extra?", a: "Nein. Der Treffpunkt Bahnhof Baden ist im normalen Lektionspreis enthalten." },
      { q: "Findet der MGK auch in Baden statt?", a: "Der Motorrad-Grundkurs wird am Standort Wettingen durchgeführt – nur wenige Minuten von Baden entfernt und mit dem ÖV gut erreichbar." },
      { q: "Welche Kategorien werden ausgebildet?", a: "Auto (Kategorie B) sowie Motorrad AM, A1, A2 und A." },
    ]}
    primaryCta={{ label: "Fahrstunde buchen", to: FAHRSTUNDEN_APP_URL }}
    secondaryCta={{ label: "Preise ansehen", to: "/preise/" }}
    breadcrumbs={[{ label: "Fahrschule Baden" }]}
    relatedLinks={[
      { to: "/fahrschule-wettingen/", title: "Fahrschule Wettingen", desc: "Unser Hauptstandort in Wettingen – Auto und Motorrad aus einer Hand." },
      { to: "/motorrad-grundkurs-wettingen/", title: "Motorrad-Grundkurs", desc: "MGK A1/A2/A in Wettingen – nur wenige Minuten von Baden." },
      { to: "/autofuehrerschein-wettingen/", title: "Autoführerschein", desc: "Ablauf, Fahrstunden, Abos und Kosten für die Kategorie B." },
      { to: "/a1-fuehrerschein-wettingen/", title: "A1 Führerschein", desc: "Motorrad ab 16 Jahren: Grundkurs, Fahrstunden und Kosten." },
      { to: "/strassenverkehrsamt-aargau/", title: "Strassenverkehrsamt Aargau", desc: "Anmeldung, Prüfung, Lernfahrausweis – alles Wichtige zum StVA." },
    ]}
  />
);

export default FahrschuleBaden;
