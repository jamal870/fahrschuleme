import LocalLandingPage from "@/components/LocalLandingPage";

const FahrschuleSpreitenbach = () => (
  <LocalLandingPage
    path="/fahrschule-spreitenbach"
    seoTitle="Fahrschule Spreitenbach – Auto & Motorrad | Fahrschule me"
    seoDescription="Fahrschule für Spreitenbach mit Treffpunkt Wettingen. Auto- & Motorrad-Fahrstunden, MGK, faire Preise. Mo–Sa 08–22 Uhr. Online buchen bei Fahrschule me."
    badge="Fahrschule Spreitenbach"
    h1="Fahrschule für"
    h1Accent="Spreitenbach"
    intro="Aus Spreitenbach erreichst du unsere Fahrschule in Wettingen in wenigen Minuten. Wir bilden dich für Auto (Kategorie B) und Motorrad (A1/A2/A) aus – flexibel, persönlich und zu fairen Preisen."
    meetingPoint={{ label: "Wettingen (für Spreitenbach)", address: "Bahnhofstrasse 56, 5430 Wettingen" }}
    serviceName="Fahrschule Spreitenbach"
    serviceType="DrivingSchool"
    benefits={[
      { title: "Schnell aus Spreitenbach", desc: "Via Limmattalbahn oder Auto bist du in unter 10 Minuten bei uns." },
      { title: "Auto & Motorrad", desc: "Kategorie B, A1, A2 und A – das komplette Angebot." },
      { title: "Faire Preise", desc: "95 CHF Auto, 130 CHF Motorrad. Mit Abo bis zu 150 CHF Rabatt." },
      { title: "Flexible Termine", desc: "Mo–Sa 08–22 Uhr – auch abends und am Samstag möglich." },
      { title: "MGK in Wettingen", desc: "Den obligatorischen Motorrad-Grundkurs absolvierst du direkt bei uns." },
      { title: "Online-Buchung", desc: "Termine reservieren, Twint/Karte zahlen – alles digital." },
    ]}
    longText={[
      {
        heading: "Deine Fahrschule für Spreitenbach",
        body: "Spreitenbach liegt im Bezirk Baden und grenzt direkt an Wettingen – unseren Hauptstandort. Für Fahrschüler aus Spreitenbach sind wir die ideale Wahl: kurze Anfahrt, Unterricht im realen Verkehr deiner Region (Tivoli, Shoppi, A1, Limmattalbahn) und persönliche Betreuung.",
      },
      {
        heading: "Was bieten wir?",
        body: "• Auto-Fahrstunden (Kategorie B) – Einzel-, Doppellektionen und Abos\n• Motorrad-Fahrstunden für A1, A2 und A\n• Motorrad-Grundkurs (MGK) in Wettingen\n• Vor-Prüfungsfahrt inklusive Prüfungsanmeldung\n• Beratung zu Lernfahrausweis, VKU und Nothelferkurs",
      },
      {
        heading: "Treffpunkt und Anfahrt",
        body: "Bahnhofstrasse 56, 5430 Wettingen. Mit der Limmattalbahn (Haltestelle Wettingen) oder dem Auto über die A1/Tivoli-Ausfahrt schnell erreichbar. Auf Wunsch holen wir dich auch in Spreitenbach ab.",
      },
    ]}
    faqs={[
      { q: "Wie lange dauert die Anfahrt aus Spreitenbach?", a: "Mit dem Auto ca. 8 Minuten, mit der Limmattalbahn ca. 12 Minuten bis zum Treffpunkt Wettingen." },
      { q: "Holt ihr mich in Spreitenbach ab?", a: "Ja, gegen Absprache. Erwähne den Wunsch einfach bei der Buchung." },
      { q: "Wo findet der MGK statt?", a: "In Wettingen, an der Bahnhofstrasse 56. Nur wenige Minuten von Spreitenbach entfernt." },
      { q: "Welche Kategorien werden ausgebildet?", a: "Auto (B) sowie Motorrad AM, A1, A2 und A." },
    ]}
    primaryCta={{ label: "Jetzt buchen", to: "/grundkurs" }}
    secondaryCta={{ label: "Preise ansehen", to: "/preise" }}
    breadcrumbs={[{ label: "Fahrschule Spreitenbach" }]}
    relatedLinks={[
      { to: "/fahrschule-wettingen", title: "Fahrschule Wettingen", desc: "Unser Hauptstandort – das vollständige Angebot." },
      { to: "/motorrad-grundkurs-wettingen", title: "MGK Wettingen", desc: "Der 12h-Motorrad-Grundkurs für A1/A2/A." },
      { to: "/strassenverkehrsamt-aargau", title: "Strassenverkehrsamt Aargau", desc: "Alles zur Anmeldung und Prüfung beim StVA." },
    ]}
  />
);

export default FahrschuleSpreitenbach;
