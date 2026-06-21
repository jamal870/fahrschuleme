import LocalLandingPage from "@/components/LocalLandingPage";

const VerkehrskundeWettingen = () => (
  <LocalLandingPage
    path="/verkehrskunde-wettingen"
    seoTitle="Verkehrskunde Wettingen (VKU) – obligatorischer Kurs | Fahrschule me"
    seoDescription="Verkehrskundeunterricht (VKU) in Wettingen – 8 Lektionen, Pflicht vor der praktischen Führerprüfung. Anerkannt vom StVA Aargau. Online buchen bei Fahrschule me."
    badge="VKU Wettingen"
    h1="Verkehrskunde (VKU) in"
    h1Accent="Wettingen"
    intro="Der Verkehrskundeunterricht (VKU) ist für alle Fahrschüler in der Schweiz Pflicht und Voraussetzung für die praktische Führerprüfung. Bei Fahrschule me absolvierst du den 8-Lektionen-Kurs in Wettingen – kompakt, modern und prüfungsnah."
    meetingPoint={{ label: "Wettingen", address: "Bahnhofstrasse 56, 5430 Wettingen" }}
    serviceName="Verkehrskunde VKU"
    serviceType="DrivingSchool"
    benefits={[
      { title: "Anerkannt vom StVA Aargau", desc: "Offiziell zugelassener VKU-Kurs für alle Kategorien (B, A1, A2, A)." },
      { title: "8 Lektionen", desc: "Gesetzlich vorgeschrieben – verteilt auf mehrere Abende oder einen Block." },
      { title: "Pauschalpreis 130 CHF", desc: "Inklusive aller VKU-Unterlagen – keine Zusatzkosten." },
      { title: "Erfahrene Moderatoren", desc: "Unsere Fahrlehrer machen Theorie verständlich und praxisnah." },
      { title: "Zentral in Wettingen", desc: "Bahnhofstrasse 56 – mit ÖV und Auto bestens erreichbar." },
      { title: "Online buchen", desc: "Termin reservieren, bezahlen und loslegen – alles digital." },
    ]}
    longText={[
      {
        heading: "Was ist der Verkehrskundeunterricht?",
        body: "Der VKU vermittelt dir das nötige Wissen, um sicher und vorausschauend am Strassenverkehr teilzunehmen. Er ist in der Schweiz obligatorisch und muss vor der praktischen Führerprüfung absolviert sein – egal ob für Auto (B), Motorrad (A1/A2/A) oder andere Kategorien.",
      },
      {
        heading: "Inhalte des Kurses",
        body: "• Verkehrswahrnehmung und Gefahrenerkennung\n• Fahrzeugbedienung und Fahrphysik\n• Verkehrsregeln, Vortritt, Signale\n• Energiesparendes und umweltbewusstes Fahren\n• Verhalten in besonderen Situationen (Tunnel, Nacht, Witterung)\n• Mensch und Verkehr – Konzentration, Stress, Substanzen\n\nKursdauer: 8 Lektionen à 45 Minuten.",
      },
      {
        heading: "Ablauf bei Fahrschule me",
        body: "Du buchst den VKU online und kommst zum Treffpunkt Bahnhofstrasse 56 in Wettingen. Der Kurs wird in kleinen Gruppen durchgeführt, mit Videos, Diskussionen und Fallbeispielen. Nach Abschluss erhältst du die Bestätigung – damit kannst du dich zur praktischen Prüfung anmelden.",
      },
    ]}
    faqs={[
      { q: "Wie lange dauert der VKU?", a: "8 Lektionen à 45 Minuten – kompakt verteilt auf mehrere Abende oder einen Block." },
      { q: "Was kostet der VKU?", a: "130 CHF pauschal, inklusive aller VKU-Unterlagen." },
      { q: "Wann muss ich den VKU absolvieren?", a: "Spätestens vor der praktischen Führerprüfung. Wir empfehlen aber, ihn zu Beginn der Ausbildung zu machen." },
      { q: "Ist der VKU für Motorradfahrer Pflicht?", a: "Ja – der VKU ist für alle Kategorien (B, A1, A2, A) Voraussetzung für die praktische Prüfung." },
    ]}
    primaryCta={{ label: "Jetzt anmelden", to: "/kontakt" }}
    secondaryCta={{ label: "Kurstermine ansehen", to: "/kurstermine" }}
    breadcrumbs={[{ label: "Verkehrskunde Wettingen" }]}
    relatedLinks={[
      { to: "/nothelferkurs-wettingen", title: "Nothelferkurs Wettingen", desc: "Der erste obligatorische Kurs – Voraussetzung für den Lernfahrausweis." },
      { to: "/fahrschule-wettingen", title: "Fahrschule Wettingen", desc: "Auto- und Motorrad-Fahrstunden direkt bei uns." },
      { to: "/strassenverkehrsamt-aargau", title: "Strassenverkehrsamt Aargau", desc: "Anmeldung zur praktischen Prüfung beim StVA." },
    ]}
  />
);

export default VerkehrskundeWettingen;
