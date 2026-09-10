// List of routes prerendered at build time (see scripts/prerender.mjs and
// src/entry-server.tsx). For each `path`, prerender.mjs server-renders the
// real page component and uses its actual <Seo>-generated title,
// description, canonical link and JSON-LD — so title/description here are
// only the fallback used if that SSR render throws for some reason (keep
// them roughly in sync with the page's <Seo> props, but a mismatch only
// matters in that fallback case).
//
// `aliases` are extra URL paths that render the same page component and
// therefore get the same content, but whose canonical link still points at
// the primary `path` — matching what <Seo path="..."> does today for these
// routes.

export const SEO_ROUTES = [
  {
    path: "/",
    title: "Fahrschule me Wettingen – Auto, Motorrad & Grundkurs Baden",
    description:
      "Fahrschule in Wettingen & Baden: Autoprüfung, Motorrad-Grundkurs (MGK) und Fahrstunden. Erfahrene Instruktoren, faire Preise, Termine Mo–Sa 08–22 Uhr.",
  },
  {
    path: "/grundkurs",
    aliases: ["/grundkurs-buchen"],
    title: "Motorrad-Grundkurs buchen Wettingen | Fahrschule me",
    description:
      "Motorrad-Grundkurs (MGK) Teil 1, 2 und 3 direkt online buchen. Freie Plätze in Wettingen anzeigen und sofort reservieren.",
  },
  {
    path: "/impressum",
    title: "Impressum – Fahrschule me",
    description: "Impressum und rechtliche Angaben der Fahrschule me.",
  },
  {
    path: "/datenschutz",
    title: "Datenschutzerklärung – Fahrschule me",
    description: "Datenschutzerklärung der Fahrschule me gemäss Schweizer Datenschutzgesetz (DSG).",
  },
  {
    path: "/agb",
    title: "AGB – Allgemeine Geschäftsbedingungen | Fahrschule me",
    description: "Allgemeine Geschäftsbedingungen der Fahrschule me.",
  },
  {
    path: "/team",
    title: "Unser Team – Fahrlehrer Fahrschule me Wettingen",
    description:
      "Lerne unser Team kennen: erfahrene Auto- und Motorrad-Fahrlehrer der Fahrschule me in Wettingen mit Qualifikationen und Erfahrung im Raum Baden.",
  },
  {
    path: "/motorrad-fuehrerschein-wettingen",
    aliases: ["/motorrad-fuhrerschein-wettingen"],
    title: "Motorrad Führerschein Wettingen – MGK & Kategorien A/A1/A2 | Fahrschule me",
    description:
      "Motorradführerschein in Wettingen (Bezirk Baden): Grundkurs MGK, Kategorien AM, A1, A2 und A. Kleine Gruppen, flexible Termine Mo–Sa 08–22 Uhr.",
  },
  {
    path: "/motorrad-grundkurs-wettingen",
    title: "Motorrad Grundkurs Wettingen – MGK A1/A2/A | Fahrschule me",
    description:
      "Motorrad-Grundkurs (MGK) in Wettingen für A1, A2 und A. 12 Stunden in 3 Teilen, kleine Gruppen, Mo–Sa 08–22 Uhr. Online buchen bei Fahrschule me.",
  },
  {
    path: "/fahrschule-wettingen",
    title: "Fahrschule Wettingen – Auto & Motorrad | Fahrschule me",
    description:
      "Fahrschule in Wettingen für Auto- und Motorrad-Fahrstunden. Erfahrene Instruktoren, faire Preise, Mo–Sa 08–22 Uhr. Direkt online buchen bei Fahrschule me.",
  },
  {
    path: "/fahrschule-baden",
    title: "Fahrschule Baden – Treffpunkt Bahnhof | Fahrschule me",
    description:
      "Fahrschule für Baden mit Treffpunkt Bahnhof Baden. Auto- und Motorrad-Fahrstunden, MGK, Mo–Sa 08–22 Uhr. Direkt online buchen bei Fahrschule me.",
  },
  {
    path: "/fahrschule-neuenhof",
    title: "Fahrschule Neuenhof – Auto & Motorrad | Fahrschule me",
    description:
      "Fahrschule für Neuenhof: Auto- und Motorrad-Fahrstunden mit Treffpunkt Wettingen. Mo–Sa 08–22 Uhr, faire Preise. Online buchen bei Fahrschule me.",
  },
  {
    path: "/fahrschule-spreitenbach",
    title: "Fahrschule Spreitenbach – Auto & Motorrad | Fahrschule me",
    description:
      "Fahrschule für Spreitenbach mit Treffpunkt Wettingen. Auto- & Motorrad-Fahrstunden, MGK, faire Preise. Mo–Sa 08–22 Uhr. Online buchen bei Fahrschule me.",
  },
  {
    path: "/motorrad-fuehrerschein-baden",
    aliases: ["/motorrad-fuhrerschein-baden"],
    title: "Motorrad-Führerschein Baden – A1/A2/A | Fahrschule me",
    description:
      "Motorrad-Führerschein für Baden: MGK, Fahrstunden und Vor-Prüfungsfahrt für A1, A2 und A. Treffpunkt Bahnhof Baden. Online buchen bei Fahrschule me.",
  },
  {
    path: "/nothelferkurs-wettingen",
    title: "Nothelferkurs Wettingen – obligatorisch für Lernfahrausweis | Fahrschule me",
    description:
      "Nothelferkurs in Wettingen für den Lernfahrausweis (Auto/Motorrad). 10 Stunden, anerkannt vom Strassenverkehrsamt Aargau. Online buchen bei Fahrschule me.",
  },
  {
    path: "/verkehrskunde-wettingen",
    title: "Verkehrskunde Wettingen (VKU) – obligatorischer Kurs | Fahrschule me",
    description:
      "Verkehrskundeunterricht (VKU) in Wettingen – 8 Lektionen, Pflicht vor der praktischen Führerprüfung. Anerkannt vom StVA Aargau. Online buchen bei Fahrschule me.",
  },
  {
    path: "/fahrstunden",
    title: "Fahrstunden Auto & Motorrad in Wettingen | Fahrschule me",
    description:
      "Individuelle Auto- und Motorrad-Fahrstunden in Wettingen. Einzel- und Doppellektionen, 10er- und 20er-Abos. Jetzt Termin buchen bei Fahrschule me.",
  },
  {
    path: "/motorrad",
    title: "Motorrad Führerschein Wettingen – A1, A2, A | Fahrschule me",
    description:
      "Motorrad-Ausbildung in Wettingen: Grundkurs (MGK), Vorprüfungsfahrt, individuelle Fahrstunden für Kategorien A1, A2 und A. Jetzt informieren.",
  },
  {
    path: "/preise",
    title: "Preise Auto & Motorrad – Fahrschule me Wettingen",
    description:
      "Transparente Preise für Fahrstunden, Motorrad-Grundkurs, Verkehrskunde und Nothelfer in Wettingen. Faire Abos verfügbar.",
  },
  {
    path: "/kontakt",
    title: "Kontakt – Fahrschule me Wettingen | Telefon, WhatsApp, E-Mail",
    description:
      "So erreichst du Fahrschule me: Telefon, WhatsApp und E-Mail. Bahnhofstrasse 56, 5430 Wettingen. Mo–Sa 08–22 Uhr.",
  },
  {
    path: "/kurstermine",
    title: "Motorrad-Grundkurs Termine 2026 Wettingen | Fahrschule me",
    description:
      "Alle aktuellen MGK-Termine in Wettingen. Teil 1, 2 und 3 – freie Plätze, Preise und direkte Buchung bei Fahrschule me.",
  },
  {
    path: "/angebote",
    aliases: ["/aktionen"],
    title: "Aktionen & Angebote – Fahrschule me Wettingen & Baden",
    description:
      "Aktuelle Aktionen für Motorrad-Grundkurs, Auto-Fahrstunden und Kurse in Wettingen, Baden und Umgebung. Online buchen, faire Preise, limitierte Aktionen.",
  },
  {
    path: "/strassenverkehrsamt-aargau",
    title: "Strassenverkehrsamt Aargau – Lernfahrausweis & Prüfung in Schafisheim",
    description:
      "Kompletter Ratgeber zum Strassenverkehrsamt Aargau (Schafisheim): Lernfahrausweis beantragen, Theorie- und praktische Prüfung, Dokumente, Kosten und Tipps.",
  },
  {
    path: "/kosten-fuehrerschein-aargau",
    title: "Kosten Führerschein Aargau 2026 – alle Preise im Überblick",
    description:
      "Was kostet der Führerschein im Kanton Aargau? Alle Gebühren 2026: Lernfahrausweis, Theorie- und Führerprüfung Schafisheim, VKU, Fahrstunden und Motorrad-Grundkurs.",
  },
  {
    path: "/motorrad-kategorien-vergleich",
    title: "Motorrad-Kategorien AM, A1, A2, A im Vergleich (Schweiz 2026)",
    description:
      "AM, A1, A2 oder A? Vergleichstabelle mit Mindestalter, Leistung, Voraussetzungen, Grundkurs und Kosten für den Motorradführerschein in der Schweiz.",
  },
  {
    path: "/wie-viele-fahrstunden",
    title: "Wie viele Fahrstunden brauche ich? Richtwerte Schweiz 2026",
    description:
      "Realistische Anzahl Fahrstunden bis zur Führerprüfung: Richtwerte nach Vorerfahrung, Dauer und Kosten für Auto und Motorrad – aus der Praxis in Wettingen/Baden.",
  },
  {
    path: "/fuer-fahrlehrer",
    aliases: ["/app"],
    title: "Fahrschule Software & App für Schweizer Fahrlehrer | fahrschule me",
    description:
      "Fahrschule Software mit Buchhaltung, Kalender, Schülerverwaltung und Rechnungen. Die Fahrlehrer App für iOS & Android. 30 Tage gratis testen.",
  },
];
