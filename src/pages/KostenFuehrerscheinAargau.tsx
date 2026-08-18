import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import Seo from "@/components/Seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedLinks from "@/components/RelatedLinks";

interface Row {
  pos: string;
  betrag: string;
  quelle: string;
  hinweis: string;
}

const amtlich: Row[] = [
  { pos: "Sehtest (Optiker/Augenarzt)", betrag: "CHF 15–25", quelle: "Optiker", hinweis: "Gültig 2 Jahre" },
  { pos: "Nothilfekurs (10 Std.)", betrag: "CHF 100–150", quelle: "Kursanbieter", hinweis: "Gültig 6 Jahre – wir vermitteln Partner" },
  { pos: "Gesuch Lernfahrausweis (Gemeinde)", betrag: "ca. CHF 30", quelle: "Wohngemeinde", hinweis: "Einreichung Einwohnerkontrolle" },
  { pos: "Theorieprüfung", betrag: "CHF 30", quelle: "StVA Aargau, Schafisheim", hinweis: "50 Fragen, max. 5 Fehler" },
  { pos: "Ausstellung Lernfahrausweis", betrag: "ca. CHF 50", quelle: "StVA Aargau", hinweis: "Gültig 24 Monate (Kat. B)" },
  { pos: "Verkehrskundeunterricht (VKU, 8 Std.)", betrag: "ca. CHF 200–280", quelle: "Partneranbieter", hinweis: "Führen wir aktuell nicht selbst durch" },
  { pos: "Praktische Führerprüfung", betrag: "CHF 120", quelle: "StVA Aargau", hinweis: "Dauer ca. 60 Minuten" },
  { pos: "Ausstellung Führerausweis auf Probe", betrag: "ca. CHF 65", quelle: "StVA Aargau", hinweis: "Probezeit 3 Jahre" },
];

const fahrschule: Row[] = [
  { pos: "Administrationsbeitrag (einmalig)", betrag: "CHF 130", quelle: "Fahrschule me", hinweis: "Inkl. Administration & Vollkaskoversicherung" },
  { pos: "Autofahrstunde 45 Min.", betrag: "CHF 95", quelle: "Fahrschule me", hinweis: "Auch auf Rechnung möglich" },
  { pos: "Doppellektion 2 × 45 Min.", betrag: "CHF 190", quelle: "Fahrschule me", hinweis: "Empfohlen für Autobahn/Überland" },
  { pos: "10er-Abo Auto", betrag: "CHF 900", quelle: "Fahrschule me", hinweis: "CHF 50 gespart" },
  { pos: "20er-Abo Auto", betrag: "CHF 1'760", quelle: "Fahrschule me", hinweis: "CHF 150 gespart" },
  { pos: "Motorrad-Grundkurs pro Teil (M1/M2/M3, je 4 Std.)", betrag: "CHF 160", quelle: "Fahrschule me", hinweis: "3 Teile obligatorisch = CHF 480" },
  { pos: "Motorradlektion 60 Min.", betrag: "CHF 130", quelle: "Fahrschule me", hinweis: "Doppellektion 2 × 45 Min.: CHF 180" },
];

const szenarien = [
  {
    titel: "Auto Kategorie B – sparsam",
    lektionen: "20 Lektionen",
    total: "ca. CHF 2'550",
    detail: "Amtliche Kosten (ca. CHF 550) + Administrationsbeitrag CHF 130 + 20 Lektionen im Abo (CHF 1'760) + VKU beim Partner.",
  },
  {
    titel: "Auto Kategorie B – realistisch",
    lektionen: "30–35 Lektionen",
    total: "ca. CHF 3'600–4'100",
    detail: "Schweizer Durchschnitt liegt bei rund 30 Lektionen bis zur Prüfungsreife. Basis: 20er-Abo plus Einzellektionen.",
  },
  {
    titel: "Motorrad A1 (125 cm³)",
    lektionen: "MGK + 4–6 Lektionen",
    total: "ca. CHF 1'500–1'800",
    detail: "Grundkurs 3 × CHF 160 + Fahrlektionen + amtliche Gebühren + Vor-Prüfungsfahrt inkl. Prüfung CHF 180.",
  },
];

const faq = [
  {
    "@type": "Question",
    name: "Was kostet der Autoführerschein im Kanton Aargau insgesamt?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Mit 30 Fahrstunden liegen die Gesamtkosten im Kanton Aargau bei rund CHF 3'600–4'100. Darin enthalten sind amtliche Gebühren von ca. CHF 550 (Sehtest, Nothilfekurs, Lernfahrausweis, Theorie- und praktische Prüfung), der VKU beim Partneranbieter sowie die Fahrstunden zu CHF 95 pro 45 Minuten bei der Fahrschule me in Wettingen.",
    },
  },
  {
    "@type": "Question",
    name: "Wie viel kostet eine Fahrstunde in Wettingen und Baden?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Eine Autofahrlektion à 45 Minuten kostet bei der Fahrschule me CHF 95. Im 10er-Abo kostet sie CHF 90 (CHF 900), im 20er-Abo CHF 88 (CHF 1'760). Eine Motorradlektion à 60 Minuten kostet CHF 130.",
    },
  },
  {
    "@type": "Question",
    name: "Welche Gebühren verlangt das Strassenverkehrsamt Aargau?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Das Strassenverkehrsamt Aargau in Schafisheim verlangt CHF 30 für die Theorieprüfung, CHF 120 für die praktische Führerprüfung sowie je rund CHF 50–65 für die Ausstellung von Lernfahrausweis und Führerausweis auf Probe. Dazu kommt eine Gemeindegebühr von ca. CHF 30 für das Gesuch.",
    },
  },
  {
    "@type": "Question",
    name: "Was kostet der Motorrad-Grundkurs im Aargau?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Der obligatorische Motorrad-Grundkurs (MGK) besteht aus drei Teilen à 4 Stunden. Bei der Fahrschule me kostet jeder Teil CHF 160, der komplette Grundkurs also CHF 480. Die Teile M1, M2 und M3 müssen chronologisch besucht werden.",
    },
  },
  {
    "@type": "Question",
    name: "Kann ich Fahrstunden auf Rechnung bezahlen?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Ja. Fahrstunden können auf Rechnung bezahlt werden (CHF 95 pro 45 Minuten). Online-Zahlungen per Karte oder TWINT sind ebenfalls möglich; dabei wird ein Zuschlag von 3 % für Zahlungsgebühren erhoben.",
    },
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq,
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Kosten Führerschein Aargau 2026 – komplette Kostenübersicht",
    inLanguage: "de-CH",
    datePublished: "2026-08-18",
    dateModified: "2026-08-18",
    author: { "@type": "Organization", name: "Fahrschule me" },
    publisher: { "@type": "Organization", name: "Fahrschule me" },
    about: "Kosten für Lernfahrausweis, Fahrstunden, VKU und Führerprüfung im Kanton Aargau",
  },
];

const Table = ({ title, rows }: { title: string; rows: Row[] }) => (
  <div className="mb-10">
    <h3 className="font-heading font-bold text-lg text-foreground mb-3">{title}</h3>
    <div className="overflow-x-auto border border-border" style={{ borderRadius: "3px" }}>
      <table className="w-full text-sm font-body min-w-[640px]">
        <thead className="bg-muted">
          <tr className="text-left">
            <th className="px-4 py-3 font-heading font-bold">Position</th>
            <th className="px-4 py-3 font-heading font-bold whitespace-nowrap">Betrag</th>
            <th className="px-4 py-3 font-heading font-bold">Stelle</th>
            <th className="px-4 py-3 font-heading font-bold">Hinweis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.pos} className="border-t border-border">
              <td className="px-4 py-3 text-foreground">{r.pos}</td>
              <td className="px-4 py-3 font-heading font-bold text-primary whitespace-nowrap">{r.betrag}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.quelle}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.hinweis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const KostenFuehrerscheinAargau = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Kosten Führerschein Aargau 2026 – alle Preise im Überblick"
      description="Was kostet der Führerschein im Kanton Aargau? Alle Gebühren 2026: Lernfahrausweis, Theorie- und Führerprüfung Schafisheim, VKU, Fahrstunden und Motorrad-Grundkurs."
      path="/kosten-fuehrerschein-aargau"
      jsonLd={jsonLd}
    />
    <SiteHeader />

    <header className="bg-card border-b-2 border-primary">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-3">Ratgeber · Stand August 2026</p>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
          Kosten Führerschein Aargau 2026
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
          Alle Kostenpositionen vom Sehtest bis zum Führerausweis auf Probe – amtliche Gebühren des
          Strassenverkehrsamts Aargau in Schafisheim, Kurskosten und Fahrstundenpreise der Fahrschule me in Wettingen.
        </p>
      </div>
    </header>

    <div className="max-w-4xl mx-auto px-6 pt-6">
      <Breadcrumbs items={[{ label: "Kosten Führerschein Aargau" }]} />
    </div>

    <main className="max-w-4xl mx-auto px-6 py-10">
      <section className="mb-10 p-5 bg-card border-l-4 border-primary" style={{ borderRadius: "3px" }}>
        <p className="text-sm text-foreground leading-relaxed">
          <strong className="font-heading">Kurzantwort:</strong> Der Autoführerschein (Kategorie B) kostet im Kanton Aargau
          insgesamt rund <strong>CHF 3'600–4'100</strong> bei 30 Fahrstunden. Davon entfallen ca. <strong>CHF 550</strong> auf
          amtliche Gebühren, ca. <strong>CHF 200–280</strong> auf den VKU und der Rest auf Fahrstunden
          (CHF 95 pro 45 Minuten, günstiger im Abo). Der Motorrad-Grundkurs kostet CHF 480 für alle drei Teile.
        </p>
      </section>

      <Table title="1. Amtliche Gebühren & obligatorische Kurse" rows={amtlich} />
      <Table title="2. Preise Fahrschule me (Wettingen)" rows={fahrschule} />

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">3. Gesamtkosten nach Szenario</h2>
        <p className="text-muted-foreground mb-6">
          Wie viel du effektiv zahlst, hängt vor allem von der Anzahl Fahrstunden ab.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {szenarien.map((s) => (
            <div key={s.titel} className="p-5 bg-card border border-border" style={{ borderRadius: "3px" }}>
              <h3 className="font-heading font-bold text-foreground mb-1">{s.titel}</h3>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">{s.lektionen}</p>
              <p className="text-2xl font-heading font-bold text-primary mb-3">{s.total}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">Wo lässt sich sparen?</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="p-4 bg-card border border-border" style={{ borderRadius: "3px" }}>
            <strong className="text-foreground font-heading">Abo statt Einzellektionen:</strong> Das 20er-Abo spart CHF 150,
            das 10er-Abo CHF 50 gegenüber Einzelbuchungen.
          </li>
          <li className="p-4 bg-card border border-border" style={{ borderRadius: "3px" }}>
            <strong className="text-foreground font-heading">Privat üben mit Begleitperson:</strong> Erlaubt ab 23 Jahren
            Begleitalter und 3 Jahren unbefristetem Ausweis – reduziert die nötigen Lektionen deutlich.
          </li>
          <li className="p-4 bg-card border border-border" style={{ borderRadius: "3px" }}>
            <strong className="text-foreground font-heading">Doppellektionen buchen:</strong> Weniger Rüstzeit pro Lektion,
            mehr effektive Fahrzeit auf Autobahn und Überland.
          </li>
          <li className="p-4 bg-card border border-border" style={{ borderRadius: "3px" }}>
            <strong className="text-foreground font-heading">Rechnung statt Online-Zahlung:</strong> Bei Online-Zahlung fällt
            ein Zuschlag von 3 % für Zahlungsgebühren an.
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">Häufige Fragen zu den Kosten</h2>
        <div className="space-y-4">
          {faq.map((q) => (
            <details key={q.name} className="p-5 bg-card border border-border group" style={{ borderRadius: "3px" }}>
              <summary className="font-heading font-bold text-foreground cursor-pointer flex justify-between items-center gap-4">
                {q.name}
                <ChevronRight className="w-4 h-4 text-primary transition-transform group-open:rotate-90 flex-shrink-0" />
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{q.acceptedAnswer.text}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="flex gap-3 text-xs text-muted-foreground mb-10">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
        Preise der Fahrschule me sind verbindlich (Stand August 2026). Amtliche Gebühren und Kurskosten Dritter sind
        Richtwerte – massgebend sind das Strassenverkehrsamt Aargau und der jeweilige Anbieter.
      </p>

      <section className="bg-primary text-primary-foreground p-8 md:p-12 text-center" style={{ borderRadius: "3px" }}>
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">Fahrstunden in Wettingen buchen</h2>
        <p className="opacity-95 mb-6 max-w-2xl mx-auto">
          Mo–Sa 08:00–22:00 Uhr, Abendtermine möglich – im Raum Wettingen, Baden, Neuenhof und Spreitenbach.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/fahrstunden" className="px-6 py-3 bg-background text-primary font-heading font-bold text-sm uppercase tracking-wide" style={{ borderRadius: "3px" }}>Autofahrstunden</Link>
          <Link to="/preise" className="px-6 py-3 border-2 border-primary-foreground font-heading font-bold text-sm uppercase tracking-wide" style={{ borderRadius: "3px" }}>Preisübersicht</Link>
        </div>
      </section>

      <div className="mt-12 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-heading font-bold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Zurück zur Startseite
        </Link>
      </div>
    </main>

    <RelatedLinks
      links={[
        { to: "/wie-viele-fahrstunden", title: "Wie viele Fahrstunden brauche ich?", desc: "Orientierungswerte nach Vorerfahrung, Alter und Fahrpraxis – mit Lektionentabelle." },
        { to: "/motorrad-kategorien-vergleich", title: "Motorrad-Kategorien AM, A1, A2, A", desc: "Alter, Leistung, Voraussetzungen und Kosten im direkten Vergleich." },
        { to: "/strassenverkehrsamt-aargau", title: "Strassenverkehrsamt Aargau", desc: "Lernfahrausweis, Theorie- und praktische Prüfung in Schafisheim Schritt für Schritt." },
      ]}
    />

    <SiteFooter />
  </div>
);

export default KostenFuehrerscheinAargau;
