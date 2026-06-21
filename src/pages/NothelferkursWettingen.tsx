import LocalLandingPage from "@/components/LocalLandingPage";

const NothelferkursWettingen = () => (
  <LocalLandingPage
    path="/nothelferkurs-wettingen"
    seoTitle="Nothelferkurs Wettingen – obligatorisch für Lernfahrausweis | Fahrschule me"
    seoDescription="Nothelferkurs in Wettingen für den Lernfahrausweis (Auto/Motorrad). 10 Stunden, anerkannt vom Strassenverkehrsamt Aargau. Online buchen bei Fahrschule me."
    badge="Nothelferkurs Wettingen"
    h1="Nothelferkurs in"
    h1Accent="Wettingen"
    intro="Der Nothelferkurs (10 Stunden) ist Voraussetzung für den Lernfahrausweis. Bei Fahrschule me absolvierst du den Kurs in Wettingen – kompakt, praxisnah und vom Strassenverkehrsamt Aargau anerkannt. Inklusive Kursunterlagen und Nothelferausweis (6 Jahre gültig)."
    meetingPoint={{ label: "Wettingen", address: "Bahnhofstrasse 56, 5430 Wettingen" }}
    serviceName="Nothelferkurs"
    serviceType="DrivingSchool"
    benefits={[
      { title: "Anerkannt vom StVA Aargau", desc: "Offiziell anerkannter Kurs – Voraussetzung für den Lernfahrausweis." },
      { title: "Kompakt: 10 Stunden", desc: "An einem Wochenende oder über mehrere Abende absolvierbar." },
      { title: "Praxisnah", desc: "Reanimation, stabile Seitenlage, Verbände – alles unter realistischen Bedingungen geübt." },
      { title: "6 Jahre gültig", desc: "Der Nothelferausweis ist 6 Jahre lang gültig." },
      { title: "Faire Pauschale", desc: "130 CHF inkl. Kursdokumentation und Nothelferausweis – keine versteckten Kosten." },
      { title: "Direkt in Wettingen", desc: "Zentral gelegen, gut erreichbar mit ÖV und Auto." },
    ]}
    longText={[
      {
        heading: "Warum brauche ich einen Nothelferkurs?",
        body: "Wer in der Schweiz einen Lernfahrausweis für Auto (Kategorie B) oder Motorrad (A1, A2, A) beantragen will, muss einen anerkannten Nothelferkurs absolviert haben. Der Ausweis ist 6 Jahre gültig und wird vom Strassenverkehrsamt zwingend verlangt.",
      },
      {
        heading: "Inhalte des Kurses",
        body: "• Lebensrettende Sofortmassnahmen (Reanimation, stabile Seitenlage)\n• Verhalten am Unfallort (Absichern, Alarmierung 144)\n• Versorgung von Wunden, Blutungen, Verbrennungen\n• Umgang mit Bewusstlosen und Schockzuständen\n• Praktische Übungen mit Reanimationspuppe\n\nKursdauer: 10 Stunden (gesetzlich vorgeschrieben).",
      },
      {
        heading: "Ablauf bei Fahrschule me",
        body: "Du buchst den Kurs online, kommst zum Treffpunkt Bahnhofstrasse 56 in Wettingen und absolvierst den Kurs in einer kleinen Gruppe. Am Ende erhältst du den offiziellen Nothelferausweis – damit kannst du sofort beim Strassenverkehrsamt Aargau den Lernfahrausweis beantragen.",
      },
    ]}
    faqs={[
      { q: "Wie lange dauert der Kurs?", a: "10 Stunden – kompakt an einem Wochenende oder verteilt auf mehrere Abende." },
      { q: "Was kostet der Nothelferkurs?", a: "130 CHF pauschal, inklusive Kursdokumentation und offiziellem Nothelferausweis." },
      { q: "Wie lange ist der Ausweis gültig?", a: "6 Jahre. Danach ist eine Auffrischung empfohlen, aber für den Lernfahrausweis nur bei Neuerwerb nötig." },
      { q: "Ist der Kurs auch für Motorradfahrer Pflicht?", a: "Ja – für alle Lernfahrausweise (Auto und Motorrad) gleichermassen." },
    ]}
    primaryCta={{ label: "Jetzt anmelden", to: "/kontakt" }}
    secondaryCta={{ label: "Kurstermine ansehen", to: "/kurstermine" }}
    breadcrumbs={[{ label: "Nothelferkurs Wettingen" }]}
    relatedLinks={[
      { to: "/verkehrskunde-wettingen", title: "Verkehrskunde (VKU)", desc: "Der zweite obligatorische Kurs vor der Führerprüfung – auch bei uns in Wettingen." },
      { to: "/strassenverkehrsamt-aargau", title: "Strassenverkehrsamt Aargau", desc: "Lernfahrausweis beantragen – so geht's." },
      { to: "/fahrschule-wettingen", title: "Fahrschule Wettingen", desc: "Auto- und Motorrad-Fahrstunden direkt bei uns." },
    ]}
  />
);

export default NothelferkursWettingen;
