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
// routes. Aliases are never listed in the sitemap (their canonical points
// elsewhere).
//
// `sitemap` carries the per-route sitemap metadata (changefreq/priority).
// `source` names the page file whose last git commit date becomes the
// sitemap <lastmod>; routes without a reliable source get no <lastmod>.
// `sitemap: false` keeps a route out of the sitemap entirely (used for
// routes whose canonical points at another URL).

export const SEO_ROUTES = [
  {
    path: "/",
    sitemap: { changefreq: "weekly", priority: 1.0 },
    source: "src/pages/Index.tsx",
    title: "Fahrschule me Wettingen – Auto, Motorrad & Grundkurs Baden",
    description:
      "Fahrschule in Wettingen & Baden: Autoprüfung, Motorrad-Grundkurs (MGK) und Fahrstunden. Erfahrene Instruktoren, faire Preise, Termine nach Vereinbarung.",
  },
  {
    path: "/grundkurs",
    sitemap: { changefreq: "weekly", priority: 0.9 },
    source: "src/pages/GrundkursBuchen.tsx",
    aliases: ["/grundkurs-buchen"],
    title: "Motorrad-Grundkurs buchen Wettingen | Fahrschule me",
    description:
      "Motorrad-Grundkurs (MGK) Teil 1, 2 und 3 direkt online buchen. Freie Plätze in Wettingen anzeigen und sofort reservieren.",
  },
  {
    path: "/impressum",
    sitemap: { changefreq: "yearly", priority: 0.3 },
    source: "src/pages/Impressum.tsx",
    title: "Impressum – Fahrschule me",
    description: "Impressum und rechtliche Angaben der Fahrschule me.",
  },
  {
    path: "/datenschutz",
    sitemap: { changefreq: "yearly", priority: 0.3 },
    source: "src/pages/Datenschutz.tsx",
    title: "Datenschutzerklärung – Fahrschule me",
    description: "Datenschutzerklärung der Fahrschule me gemäss Schweizer Datenschutzgesetz (DSG).",
  },
  {
    path: "/agb",
    sitemap: { changefreq: "yearly", priority: 0.3 },
    source: "src/pages/AGB.tsx",
    title: "AGB – Allgemeine Geschäftsbedingungen | Fahrschule me",
    description: "Allgemeine Geschäftsbedingungen der Fahrschule me.",
  },
  {
    path: "/team",
    sitemap: { changefreq: "monthly", priority: 0.6 },
    source: "src/pages/Team.tsx",
    title: "Unser Team – Fahrlehrer Fahrschule me Wettingen",
    description:
      "Lerne unser Team kennen: erfahrene Auto- und Motorrad-Fahrlehrer der Fahrschule me in Wettingen mit Qualifikationen und Erfahrung im Raum Baden.",
  },
  {
    path: "/motorrad-fuehrerschein-wettingen",
    sitemap: { changefreq: "weekly", priority: 0.9 },
    source: "src/pages/MotorradFuehrerscheinWettingen.tsx",
    aliases: ["/motorrad-fuhrerschein-wettingen"],
    title: "Motorrad Führerschein Wettingen – MGK & Kategorien A/A1/A2 | Fahrschule me",
    description:
      "Motorradführerschein in Wettingen (Bezirk Baden): Grundkurs MGK, Kategorien AM, A1, A2 und A. Kleine Gruppen, Termine nach Vereinbarung.",
  },
  {
    path: "/motorrad-grundkurs-wettingen",
    sitemap: { changefreq: "weekly", priority: 0.9 },
    source: "src/pages/MotorradGrundkursWettingen.tsx",
    title: "Motorrad Grundkurs Wettingen – MGK A1/A2/A | Fahrschule me",
    description:
      "Motorrad-Grundkurs (MGK) in Wettingen für A1, A2 und A. 12 Stunden in 3 Teilen, kleine Gruppen, Termine nach Vereinbarung. Online buchen bei Fahrschule me.",
  },
  {
    path: "/fahrschule-wettingen",
    sitemap: { changefreq: "weekly", priority: 0.9 },
    source: "src/pages/FahrschuleWettingen.tsx",
    title: "Fahrschule Wettingen – Auto & Motorrad | Fahrschule me",
    description:
      "Fahrschule in Wettingen für Auto- und Motorrad-Fahrstunden. Erfahrene Instruktoren, faire Preise, Termine nach Vereinbarung. Direkt online buchen bei Fahrschule me.",
  },
  {
    path: "/fahrschule-baden",
    sitemap: { changefreq: "weekly", priority: 0.9 },
    source: "src/pages/FahrschuleBaden.tsx",
    title: "Fahrschule Baden – Treffpunkt Bahnhof | Fahrschule me",
    description:
      "Fahrschule für Baden mit Treffpunkt Bahnhof Baden. Auto- und Motorrad-Fahrstunden, MGK, Termine nach Vereinbarung. Direkt online buchen bei Fahrschule me.",
  },
  {
    path: "/fahrschule-neuenhof",
    sitemap: { changefreq: "weekly", priority: 0.9 },
    source: "src/pages/FahrschuleNeuenhof.tsx",
    title: "Fahrschule Neuenhof – Auto & Motorrad | Fahrschule me",
    description:
      "Fahrschule für Neuenhof: Auto- und Motorrad-Fahrstunden mit Treffpunkt Wettingen. Termine nach Vereinbarung, faire Preise. Online buchen bei Fahrschule me.",
  },
  {
    path: "/fahrschule-spreitenbach",
    sitemap: { changefreq: "weekly", priority: 0.9 },
    source: "src/pages/FahrschuleSpreitenbach.tsx",
    title: "Fahrschule Spreitenbach – Auto & Motorrad | Fahrschule me",
    description:
      "Fahrschule für Spreitenbach mit Treffpunkt Wettingen. Auto- & Motorrad-Fahrstunden, MGK, faire Preise. Termine nach Vereinbarung. Online buchen bei Fahrschule me.",
  },
  {
    path: "/motorrad-fuehrerschein-baden",
    sitemap: { changefreq: "weekly", priority: 0.9 },
    source: "src/pages/MotorradFuehrerscheinBaden.tsx",
    aliases: ["/motorrad-fuhrerschein-baden"],
    title: "Motorrad-Führerschein Baden – A1/A2/A | Fahrschule me",
    description:
      "Motorrad-Führerschein für Baden: MGK, Fahrstunden und Vor-Prüfungsfahrt für A1, A2 und A. Treffpunkt Bahnhof Baden. Online buchen bei Fahrschule me.",
  },
  {
    path: "/nothelferkurs-wettingen",
    sitemap: { changefreq: "weekly", priority: 0.8 },
    source: "src/pages/NothelferkursWettingen.tsx",
    title: "Nothelferkurs Wettingen – obligatorisch für Lernfahrausweis | Fahrschule me",
    description:
      "Nothelferkurs in Wettingen für den Lernfahrausweis (Auto/Motorrad). 10 Stunden, anerkannt vom Strassenverkehrsamt Aargau. Online buchen bei Fahrschule me.",
  },
  {
    path: "/verkehrskunde-wettingen",
    sitemap: { changefreq: "weekly", priority: 0.8 },
    source: "src/pages/VerkehrskundeWettingen.tsx",
    title: "Verkehrskunde Wettingen (VKU) – obligatorischer Kurs | Fahrschule me",
    description:
      "Verkehrskundeunterricht (VKU) in Wettingen – 8 Lektionen, Pflicht vor der praktischen Führerprüfung. Anerkannt vom StVA Aargau. Online buchen bei Fahrschule me.",
  },
  {
    path: "/fahrstunden",
    sitemap: { changefreq: "weekly", priority: 0.8 },
    source: "src/pages/Fahrstunden.tsx",
    title: "Fahrstunden Auto & Motorrad in Wettingen | Fahrschule me",
    description:
      "Individuelle Auto- und Motorrad-Fahrstunden in Wettingen. Einzel- und Doppellektionen, 10er- und 20er-Abos. Jetzt Termin buchen bei Fahrschule me.",
  },
  {
    path: "/motorrad",
    sitemap: { changefreq: "weekly", priority: 0.8 },
    source: "src/pages/Motorrad.tsx",
    title: "Motorrad Führerschein Wettingen – A1, A2, A | Fahrschule me",
    description:
      "Motorrad-Ausbildung in Wettingen: Grundkurs (MGK), Vorprüfungsfahrt, individuelle Fahrstunden für Kategorien A1, A2 und A. Jetzt informieren.",
  },
  {
    path: "/preise",
    sitemap: { changefreq: "monthly", priority: 0.7 },
    source: "src/pages/Preise.tsx",
    title: "Preise Auto & Motorrad – Fahrschule me Wettingen",
    description:
      "Transparente Preise für Fahrstunden, Motorrad-Grundkurs, Verkehrskunde und Nothelfer in Wettingen. Faire Abos verfügbar.",
  },
  {
    path: "/kontakt",
    sitemap: { changefreq: "monthly", priority: 0.6 },
    source: "src/pages/Kontakt.tsx",
    title: "Kontakt – Fahrschule me Wettingen | Telefon, WhatsApp, E-Mail",
    description:
      "So erreichst du Fahrschule me: Telefon, WhatsApp und E-Mail. Bahnhofstrasse 56, 5430 Wettingen. Termine nach Vereinbarung.",
  },
  {
    path: "/kurstermine",
    sitemap: { changefreq: "daily", priority: 0.9 },
    source: "src/pages/Kurstermine.tsx",
    title: "Motorrad-Grundkurs Termine 2026 Wettingen | Fahrschule me",
    description:
      "Alle aktuellen MGK-Termine in Wettingen. Teil 1, 2 und 3 – freie Plätze, Preise und direkte Buchung bei Fahrschule me.",
  },
  {
    path: "/angebote",
    sitemap: { changefreq: "weekly", priority: 0.9 },
    source: "src/pages/Angebote.tsx",
    aliases: ["/aktionen"],
    title: "Aktionen & Angebote – Fahrschule me Wettingen & Baden",
    description:
      "Aktuelle Aktionen für Motorrad-Grundkurs, Auto-Fahrstunden und Kurse in Wettingen, Baden und Umgebung. Online buchen, faire Preise, limitierte Aktionen.",
  },
  {
    path: "/strassenverkehrsamt-aargau",
    sitemap: { changefreq: "monthly", priority: 0.7 },
    source: "src/pages/StrassenverkehrsamtAargau.tsx",
    title: "Strassenverkehrsamt Aargau – Lernfahrausweis & Prüfung in Schafisheim",
    description:
      "Kompletter Ratgeber zum Strassenverkehrsamt Aargau (Schafisheim): Lernfahrausweis beantragen, Theorie- und praktische Prüfung, Dokumente, Kosten und Tipps.",
  },
  {
    path: "/kosten-fuehrerschein-aargau",
    sitemap: { changefreq: "monthly", priority: 0.8 },
    source: "src/pages/KostenFuehrerscheinAargau.tsx",
    title: "Kosten Führerschein Aargau 2026 – alle Preise im Überblick",
    description:
      "Was kostet der Führerschein im Kanton Aargau? Alle Gebühren 2026: Lernfahrausweis, Theorie- und Führerprüfung Schafisheim, VKU, Fahrstunden und Motorrad-Grundkurs.",
  },
  {
    path: "/motorrad-kategorien-vergleich",
    sitemap: { changefreq: "monthly", priority: 0.8 },
    source: "src/pages/MotorradKategorienVergleich.tsx",
    title: "Motorrad-Kategorien AM, A1, A2, A im Vergleich (Schweiz 2026)",
    description:
      "AM, A1, A2 oder A? Vergleichstabelle mit Mindestalter, Leistung, Voraussetzungen, Grundkurs und Kosten für den Motorradführerschein in der Schweiz.",
  },
  {
    path: "/wie-viele-fahrstunden",
    sitemap: { changefreq: "monthly", priority: 0.8 },
    source: "src/pages/WieVieleFahrstunden.tsx",
    title: "Wie viele Fahrstunden brauche ich? Richtwerte Schweiz 2026",
    description:
      "Realistische Anzahl Fahrstunden bis zur Führerprüfung: Richtwerte nach Vorerfahrung, Dauer und Kosten für Auto und Motorrad – aus der Praxis in Wettingen/Baden.",
  },
  {
    path: "/fuer-fahrlehrer",
    sitemap: { changefreq: "weekly", priority: 0.8 },
    source: "src/pages/FuerFahrlehrer.tsx",
    aliases: ["/app"],
    title: "Fahrschule Software & App für Schweizer Fahrlehrer | fahrschule me",
    description:
      "Fahrschule Software mit Buchhaltung, Kalender, Schülerverwaltung und Rechnungen. Die Fahrlehrer App für iOS & Android. 30 Tage gratis testen.",
  },
];
