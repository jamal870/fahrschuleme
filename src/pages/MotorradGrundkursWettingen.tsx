import LocalLandingPage from "@/components/LocalLandingPage";

const MotorradGrundkursWettingen = () => (
  <LocalLandingPage
    path="/motorrad-grundkurs-wettingen"
    seoTitle="Motorrad Grundkurs Wettingen – MGK A1/A2/A | Fahrschule me"
    seoDescription="Motorrad-Grundkurs (MGK) in Wettingen für A1, A2 und A. 12 Stunden in 3 Teilen, kleine Gruppen, Mo–Sa 08–22 Uhr. Online buchen bei Fahrschule me."
    badge="MGK Wettingen"
    h1="Motorrad Grundkurs (MGK) in"
    h1Accent="Wettingen"
    intro="Der obligatorische 12-Stunden-Motorrad-Grundkurs für A1, A2 und A – direkt in Wettingen. Wir bilden dich in kleinen Gruppen sicher und praxisnah auf alles vor, was du auf der Strasse brauchst."
    meetingPoint={{ label: "Wettingen", address: "Bahnhofstrasse 56, 5430 Wettingen" }}
    serviceName="Motorrad Grundkurs"
    serviceType="MotorcycleSchool"
    benefits={[
      { title: "Alle Kategorien", desc: "MGK für A1 (125 cc), A2 (35 kW) und A (unbegrenzt) – passend zu deinem Ausweis." },
      { title: "12 Stunden in 3 Teilen", desc: "Die Kursteile M1, M2 und M3 absolvierst du in der gesetzlich vorgeschriebenen Reihenfolge." },
      { title: "Kleine Gruppen", desc: "Wenige Teilnehmer pro Kurs – mehr persönliche Anleitung, schnellere Lernfortschritte." },
      { title: "Mo–Sa 08–22 Uhr", desc: "Flexible Termine – auch nach Feierabend oder am Samstag." },
      { title: "Erfahrene Instruktoren", desc: "Eidgenössisch geprüfte Fahrlehrer mit jahrelanger Praxiserfahrung." },
      { title: "Direkt online buchen", desc: "Termine ansehen, Platz reservieren, zahlen – alles in wenigen Minuten." },
    ]}
    longText={[
      {
        heading: "Was ist der Motorrad-Grundkurs (MGK)?",
        body: "Der Motorrad-Grundkurs ist in der Schweiz für alle Motorradkategorien (A1, A2 und A) obligatorisch. Er umfasst 12 Stunden und wird in drei Teilen à 4 Stunden absolviert – M1, M2 und M3. Die Reihenfolge ist gesetzlich vorgeschrieben: ohne abgeschlossenen M1 kein M2, ohne M2 kein M3.\n\nIm MGK lernst du das sichere Beherrschen deines Motorrads in Theorie und Praxis: Gleichgewicht, Bremsen, Kurventechnik, Verkehrsverhalten und das richtige Verhalten in Gefahrensituationen.",
      },
      {
        heading: "MGK in Wettingen – Ablauf bei Fahrschule me",
        body: "Wir starten am Treffpunkt Bahnhofstrasse 56 in 5430 Wettingen. Du brauchst deinen Lernfahrausweis, ein verkehrstüchtiges Motorrad und die komplette Schutzausrüstung (Helm, Handschuhe, Jacke, Hose, Stiefel). Auf Wunsch helfen wir dir, ein passendes Motorrad zu mieten.\n\nNach dem erfolgreichen Abschluss aller drei Kursteile erhältst du den Kursausweis und darfst zur praktischen Führerprüfung antreten.",
      },
      {
        heading: "Einzugsgebiet",
        body: "Unser MGK in Wettingen ist auch ideal für Fahrschüler aus Baden, Neuenhof, Würenlos, Spreitenbach, Killwangen und dem gesamten Limmattal sowie aus dem Raum Aargau. Du erreichst uns in wenigen Minuten – Bahnhof Wettingen liegt direkt um die Ecke.",
      },
    ]}
    faqs={[
      { q: "Wie lange dauert der MGK insgesamt?", a: "Der gesamte Motorrad-Grundkurs dauert 12 Stunden und ist in drei Teile à 4 Stunden aufgeteilt (M1, M2, M3)." },
      { q: "Muss ich die Kursteile in einer bestimmten Reihenfolge buchen?", a: "Ja. Die Kursteile müssen in chronologischer Reihenfolge absolviert werden: zuerst M1, dann M2, dann M3." },
      { q: "Brauche ich ein eigenes Motorrad?", a: "Es ist sinnvoll, weil du auf deinem eigenen Motorrad geprüft wirst. Wir helfen dir aber gerne, ein geeignetes Motorrad zu mieten, falls du noch keines hast." },
      { q: "Was kostet der MGK?", a: "Pro Kursteil 160 CHF (M1, M2, M3). Aktuelle Aktionen findest du auf der Angebote-Seite." },
      { q: "Wie lange ist der MGK gültig?", a: "Nach dem MGK hast du zwei Jahre Zeit, die praktische Führerprüfung zu bestehen." },
    ]}
    primaryCta={{ label: "Kurstermine ansehen", to: "/kurstermine" }}
    secondaryCta={{ label: "Aktionen ansehen", to: "/angebote" }}
    breadcrumbs={[
      { label: "Motorrad", to: "/motorrad" },
      { label: "MGK Wettingen" },
    ]}
    relatedLinks={[
      { to: "/motorrad-fuehrerschein-wettingen", title: "Motorrad-Führerschein Wettingen", desc: "Alles zum Ablauf – von Lernfahrausweis bis Prüfung." },
      { to: "/kurstermine", title: "Aktuelle MGK-Termine", desc: "Freie Plätze für M1, M2 und M3 – direkt online buchen." },
      { to: "/fahrschule-baden", title: "Aus Baden anreisen?", desc: "Treffpunkt Bahnhof Baden – wir holen dich für die Fahrstunden ab." },
    ]}
  />
);

export default MotorradGrundkursWettingen;
