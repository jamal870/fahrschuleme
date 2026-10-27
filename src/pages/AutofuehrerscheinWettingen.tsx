import LocalLandingPage from "@/components/LocalLandingPage";
import { FAHRSTUNDEN_APP_URL } from "@/lib/booking-links";

const AutofuehrerscheinWettingen = () => (
  <LocalLandingPage
    path="/autofuehrerschein-wettingen/"
    seoTitle="Autoführerschein Wettingen – Fahrstunden | Fahrschule me"
    seoDescription="Autoführerschein (Kat. B) in Wettingen: Ablauf, Fahrstunden, Abos und Kosten. Treffpunkt Bahnhof Wettingen, Termine nach Vereinbarung. Jetzt anfragen."
    badge="Autoführerschein Wettingen"
    h1="Autoführerschein in"
    h1Accent="Wettingen"
    intro="Von der ersten Fahrstunde bis zur praktischen Prüfung: Bei Fahrschule me lernst du Auto fahren mit persönlicher Betreuung, transparenten Preisen und Terminen nach Vereinbarung. Treffpunkt ist der Bahnhof Wettingen."
    meetingPoint={{ label: "Bahnhof Wettingen", address: "5430 Wettingen" }}
    serviceName="Autofahrstunden Wettingen"
    benefits={[
      { title: "Klare Preise", desc: "Einzellektion 95 CHF (45 Min.), Doppellektion 190 CHF. Mit dem 10er- oder 20er-Abo sparst du 50 bzw. 150 CHF." },
      { title: "Termine nach Vereinbarung", desc: "Du planst deine Fahrstunden mit deinem Fahrlehrer, auch nach Feierabend." },
      { title: "Vollkasko inklusive", desc: "Im einmaligen Administrationsbeitrag von 130 CHF sind die Administration und die Vollkaskoversicherung enthalten." },
      { title: "Zentraler Treffpunkt", desc: "Wir treffen uns am Bahnhof Wettingen, ideal mit dem ÖV erreichbar." },
      { title: "Online buchen und bezahlen", desc: "Zahlung per Twint, Karte oder auf Rechnung." },
      { title: "Persönliche Betreuung", desc: "Du wirst von der ersten Lektion bis zur Prüfung vom selben Fahrlehrer begleitet." },
    ]}
    longText={[
      {
        heading: "Der Weg zum Autoführerschein (Kategorie B)",
        body: "1. Sehtest beim Optiker machen und den Nothelferkurs bei einem anerkannten Anbieter absolvieren.\n2. Lernfahrausweis beantragen und die Theorieprüfung beim Strassenverkehrsamt Aargau in Schafisheim bestehen.\n3. Fahrstunden bei Fahrschule me besuchen.\n4. Den Verkehrskundeunterricht (VKU) bei einem anerkannten Anbieter abschliessen.\n5. Praktische Führerprüfung beim Strassenverkehrsamt ablegen.\n6. Den Führerausweis auf Probe erhalten, die Probezeit dauert drei Jahre.",
      },
      {
        heading: "Fahrstunden bei Fahrschule me",
        body: "Fahrstunden sind in der Schweiz nicht vorgeschrieben. Weil die praktische Prüfung aber viele Situationen abdeckt, lohnt sich Unterricht mit einem Fahrlehrer, der dich und deinen Lernstand kennt. Wir beginnen dort, wo du stehst, und üben Schritt für Schritt Ortsverkehr, Vortritt, Kreisel, Überland und Autobahn sowie die Manöver, die in der Prüfung verlangt werden.\n\nDie Doppellektion (2 × 45 Minuten) eignet sich besonders für Autobahn und Überland. Zum Ende der Ausbildung fahren wir die Strecken rund um das Strassenverkehrsamt.",
      },
      {
        heading: "Preise im Überblick",
        body: "• Einzellektion (45 Min.): 95 CHF, auch auf Rechnung möglich\n• Doppellektion (2 × 45 Min.): 190 CHF\n• 10er-Abo: 900 CHF\n• 20er-Abo: 1'760 CHF\n• Administrationsbeitrag einmalig: 130 CHF, inklusive Vollkaskoversicherung\n\nNothelferkurs und Verkehrskundeunterricht bieten wir nicht an, beide absolvierst du bei einem anerkannten Anbieter. Alle weiteren Kosten wie amtliche Gebühren findest du in der Übersicht der Kosten im Kanton Aargau.",
      },
      {
        heading: "Wie viele Fahrstunden brauchst du?",
        body: "Das hängt von deiner Vorerfahrung, deinem Alter und deiner Fahrpraxis ab. Eine erste Einschätzung bekommst du in unserem Ratgeber. Nach den ersten Lektionen sagen wir dir ehrlich, wie viele Stunden du voraussichtlich brauchst.",
      },
      {
        heading: "Für wen sind wir da?",
        body: "Für Fahrschülerinnen und Fahrschüler aus Wettingen, Baden, Neuenhof, Würenlos, Spreitenbach, Killwangen, Ennetbaden, Obersiggenthal und der Region Limmattal und Aargau. Auf Anfrage holen wir dich auch an einem anderen Ort in der Region ab.",
      },
    ]}
    faqs={[
      { q: "Was kostet der Autoführerschein im Kanton Aargau?", a: "Das hängt von der Anzahl Fahrstunden ab. Bei etwa 30 Fahrstunden rechnen wir mit rund CHF 3'600 bis 4'100 inklusive amtlicher Gebühren sowie VKU und Nothelferkurs bei externen Anbietern (Preise je nach Anbieter). Die Aufstellung findest du auf der Seite Kosten Führerschein Aargau." },
      { q: "Was kostet eine Autofahrstunde?", a: "Eine Einzellektion (45 Minuten) kostet 95 CHF, eine Doppellektion (2 × 45 Minuten) 190 CHF. Mit dem 10er-Abo für 900 CHF sparst du 50 CHF, mit dem 20er-Abo für 1'760 CHF sparst du 150 CHF." },
      { q: "Brauche ich Fahrstunden, um die Prüfung zu bestehen?", a: "Fahrstunden sind in der Schweiz nicht vorgeschrieben. Die praktische Prüfung stellt aber hohe Anforderungen, deshalb ist Unterricht bei einem Fahrlehrer für die meisten sinnvoll." },
      { q: "Wo ist der Treffpunkt?", a: "Der Treffpunkt ist der Bahnhof Wettingen. Auf Anfrage holen wir dich auch an anderen Orten in der Region ab." },
      { q: "Wie melde ich mich an?", a: "Am einfachsten über die Fahrschul-App: Dort meldest du dich an und buchst deine Fahrstunde. Du kannst uns auch anrufen oder per WhatsApp schreiben." },
    ]}
    primaryCta={{ label: "Fahrstunde buchen", to: FAHRSTUNDEN_APP_URL }}
    secondaryCta={{ label: "Preise ansehen", to: "/preise/" }}
    breadcrumbs={[{ label: "Autoführerschein Wettingen" }]}
    relatedLinks={[
      { to: "/kosten-fuehrerschein-aargau/", title: "Kosten Führerschein Aargau", desc: "Alle Gebühren und Preise vom Sehtest bis zum Führerausweis auf Probe." },
      { to: "/wie-viele-fahrstunden/", title: "Wie viele Fahrstunden brauche ich?", desc: "Orientierungswerte nach Vorerfahrung, Alter und Fahrpraxis." },
      { to: "/strassenverkehrsamt-aargau/", title: "Strassenverkehrsamt Aargau", desc: "Lernfahrausweis, Theorie und praktische Prüfung in Schafisheim." },
    ]}
  />
);

export default AutofuehrerscheinWettingen;
