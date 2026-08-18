import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import Seo from "@/components/Seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedLinks from "@/components/RelatedLinks";

interface Kat {
  kat: string;
  label: string;
  alter: string;
  fahrzeug: string;
  leistung: string;
  voraussetzung: string;
  aufstieg: string;
}

const kategorien: Kat[] = [
  {
    kat: "AM",
    label: "Kleinmotorrad / Motorfahrrad",
    alter: "ab 15 Jahren",
    fahrzeug: "Motorfahrräder und Kleinmotorräder bis 50 cm³",
    leistung: "max. 45 km/h, max. 4 kW",
    voraussetzung: "Lernfahrausweis + Theorieprüfung, Grundkurs empfohlen",
    aufstieg: "Einstieg für Jugendliche, später Wechsel auf A1",
  },
  {
    kat: "A1",
    label: "125er",
    alter: "ab 16 Jahren (125 cm³ ab 16)",
    fahrzeug: "Motorräder bis 125 cm³",
    leistung: "max. 11 kW, Verhältnis max. 0.1 kW/kg",
    voraussetzung: "Lernfahrausweis, Theorieprüfung, Motorrad-Grundkurs (12 Std.), praktische Prüfung",
    aufstieg: "Basis für A2 – Praxis zählt beim Umstieg",
  },
  {
    kat: "A2",
    label: "Mittelklasse",
    alter: "ab 18 Jahren",
    fahrzeug: "Motorräder aller Hubräume mit Leistungsbegrenzung",
    leistung: "max. 35 kW, max. 0.2 kW/kg",
    voraussetzung: "Lernfahrausweis, Theorieprüfung, Motorrad-Grundkurs, praktische Prüfung",
    aufstieg: "Nach 2 Jahren A2 direkt weiter zur Kategorie A",
  },
  {
    kat: "A",
    label: "Unbegrenzt",
    alter: "ab 18 mit 2 Jahren A2, direkt ab 25 Jahren",
    fahrzeug: "Alle Motorräder ohne Leistungsbegrenzung",
    leistung: "unbegrenzt",
    voraussetzung: "Praktische Prüfung Kategorie A; Grundkurs falls noch nicht absolviert",
    aufstieg: "Endstufe – keine weitere Aufstufung nötig",
  },
];

const ablauf = [
  { num: 1, title: "Lernfahrausweis beantragen", body: "Sehtest, Nothilfekurs und Gesuch bei der Wohngemeinde. Nach bestandener Theorieprüfung erhältst du den Lernfahrausweis der gewünschten Kategorie." },
  { num: 2, title: "Motorrad-Grundkurs (MGK) absolvieren", body: "Obligatorisch für A1, A2 und A: 3 Teile à 4 Stunden (M1, M2, M3), zwingend in chronologischer Reihenfolge. Bei uns CHF 160 pro Teil." },
  { num: 3, title: "Fahrstunden im Verkehr", body: "Lektion 60 Minuten CHF 130 bzw. Doppellektion 2 × 45 Minuten CHF 180. Vorschulung auf dem Übungsplatz möglich." },
  { num: 4, title: "Praktische Prüfung", body: "Prüfung beim Strassenverkehrsamt Aargau. Vor-Prüfungsfahrt inkl. Prüfung (120 Minuten): CHF 180." },
];

const faq = [
  {
    "@type": "Question",
    name: "Was ist der Unterschied zwischen A1, A2 und A?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "A1 gilt ab 16 Jahren für Motorräder bis 125 cm³ und maximal 11 kW. A2 gilt ab 18 Jahren für Motorräder bis 35 kW ohne Hubraumbegrenzung. Die Kategorie A ist unbegrenzt und ist ab 18 Jahren nach zwei Jahren Praxis mit A2 oder direkt ab 25 Jahren möglich.",
    },
  },
  {
    "@type": "Question",
    name: "Ab welchem Alter darf ich in der Schweiz Motorrad fahren?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Kategorie AM (bis 45 km/h) ist ab 15 Jahren möglich, die Kategorie A1 mit 125 cm³ ab 16 Jahren, A2 ab 18 Jahren und die unbegrenzte Kategorie A ab 18 Jahren mit zwei Jahren A2-Erfahrung oder direkt ab 25 Jahren.",
    },
  },
  {
    "@type": "Question",
    name: "Ist der Motorrad-Grundkurs für alle Kategorien Pflicht?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Für die Kategorien A1, A2 und A ist der Motorrad-Grundkurs mit 12 Stunden obligatorisch. Er besteht aus den drei Teilen M1, M2 und M3 zu je 4 Stunden und muss chronologisch absolviert werden. Für die Kategorie AM wird er empfohlen.",
    },
  },
  {
    "@type": "Question",
    name: "Was kostet der Motorradführerschein in Wettingen?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Der Motorrad-Grundkurs kostet bei der Fahrschule me CHF 480 für alle drei Teile (CHF 160 pro Teil). Eine Motorradlektion à 60 Minuten kostet CHF 130, eine Doppellektion 2 × 45 Minuten CHF 180, die Vor-Prüfungsfahrt inklusive Prüfung CHF 180. Dazu kommen die amtlichen Gebühren des Strassenverkehrsamts Aargau.",
    },
  },
  {
    "@type": "Question",
    name: "Kann ich mit A2 direkt auf A aufsteigen?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Ja. Nach zwei Jahren unfallfreier Praxis mit der Kategorie A2 ist der Aufstieg auf die unbegrenzte Kategorie A möglich. Ohne A2-Vorerfahrung ist der Direkteinstieg in A ab 25 Jahren möglich.",
    },
  },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Motorrad-Kategorien AM, A1, A2 und A im Vergleich (Schweiz)",
    inLanguage: "de-CH",
    datePublished: "2026-08-18",
    dateModified: "2026-08-18",
    author: { "@type": "Organization", name: "Fahrschule me" },
    publisher: { "@type": "Organization", name: "Fahrschule me" },
  },
];

const MotorradKategorienVergleich = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Motorrad-Kategorien AM, A1, A2, A im Vergleich (Schweiz 2026)"
      description="AM, A1, A2 oder A? Vergleichstabelle mit Mindestalter, Leistung, Voraussetzungen, Grundkurs und Kosten für den Motorradführerschein in der Schweiz."
      path="/motorrad-kategorien-vergleich"
      jsonLd={jsonLd}
    />
    <SiteHeader />

    <header className="bg-card border-b-2 border-primary">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-3">Ratgeber · Stand August 2026</p>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
          Motorrad-Kategorien AM, A1, A2 und A im Vergleich
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
          Welche Kategorie passt zu deinem Alter und deinem Wunschmotorrad? Alle Unterschiede bei Mindestalter,
          Leistung, Grundkurs und Kosten – aus der Praxis der Fahrschule me in Wettingen (Kanton Aargau).
        </p>
      </div>
    </header>

    <div className="max-w-5xl mx-auto px-6 pt-6">
      <Breadcrumbs items={[{ label: "Motorrad-Kategorien im Vergleich" }]} />
    </div>

    <main className="max-w-5xl mx-auto px-6 py-10">
      <section className="mb-10 p-5 bg-card border-l-4 border-primary" style={{ borderRadius: "3px" }}>
        <p className="text-sm text-foreground leading-relaxed">
          <strong className="font-heading">Kurzantwort:</strong> <strong>AM</strong> ab 15 Jahren (max. 45 km/h),
          <strong> A1</strong> ab 16 Jahren (125 cm³, max. 11 kW), <strong>A2</strong> ab 18 Jahren (max. 35 kW) und
          <strong> A</strong> unbegrenzt ab 18 Jahren mit zwei Jahren A2 oder direkt ab 25 Jahren. Für A1, A2 und A ist
          der Motorrad-Grundkurs mit 12 Stunden obligatorisch.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">Vergleichstabelle</h2>
        <div className="overflow-x-auto border border-border" style={{ borderRadius: "3px" }}>
          <table className="w-full text-sm font-body min-w-[860px]">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-heading font-bold">Kategorie</th>
                <th className="px-4 py-3 font-heading font-bold">Mindestalter</th>
                <th className="px-4 py-3 font-heading font-bold">Fahrzeug</th>
                <th className="px-4 py-3 font-heading font-bold">Leistung</th>
                <th className="px-4 py-3 font-heading font-bold">Voraussetzungen</th>
                <th className="px-4 py-3 font-heading font-bold">Aufstieg</th>
              </tr>
            </thead>
            <tbody>
              {kategorien.map((k) => (
                <tr key={k.kat} className="border-t border-border align-top">
                  <td className="px-4 py-3">
                    <span className="font-heading font-bold text-primary text-base">{k.kat}</span>
                    <span className="block text-xs text-muted-foreground">{k.label}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{k.alter}</td>
                  <td className="px-4 py-3 text-muted-foreground">{k.fahrzeug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{k.leistung}</td>
                  <td className="px-4 py-3 text-muted-foreground">{k.voraussetzung}</td>
                  <td className="px-4 py-3 text-muted-foreground">{k.aufstieg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">Welche Kategorie passt zu dir?</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="p-5 bg-card border border-border" style={{ borderRadius: "3px" }}>
            <h3 className="font-heading font-bold text-foreground mb-2">16–17 Jahre</h3>
            <p className="text-sm text-muted-foreground">A1 ist die richtige Wahl: 125 cm³ reichen für Alltag, Schulweg und Agglomeration Baden/Wettingen völlig aus.</p>
          </div>
          <div className="p-5 bg-card border border-border" style={{ borderRadius: "3px" }}>
            <h3 className="font-heading font-bold text-foreground mb-2">18–24 Jahre</h3>
            <p className="text-sm text-muted-foreground">A2 mit 35 kW – nach zwei Jahren Praxis ohne erneute Grundausbildung Aufstieg auf A.</p>
          </div>
          <div className="p-5 bg-card border border-border" style={{ borderRadius: "3px" }}>
            <h3 className="font-heading font-bold text-foreground mb-2">Ab 25 Jahren</h3>
            <p className="text-sm text-muted-foreground">Direkteinstieg in die unbegrenzte Kategorie A möglich – ohne Umweg über A2.</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">Ablauf bis zum Motorradausweis</h2>
        <div className="space-y-4">
          {ablauf.map((s) => (
            <div key={s.num} className="flex gap-5 p-5 bg-card border border-border" style={{ borderRadius: "3px" }}>
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground font-heading font-bold flex items-center justify-center" style={{ borderRadius: "3px" }}>{s.num}</div>
              <div>
                <h3 className="font-heading font-bold text-foreground text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">Häufige Fragen</h2>
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
        Angaben zu Alter und Leistung folgen der Schweizer Verkehrszulassungsverordnung (Stand August 2026);
        massgebend ist das Strassenverkehrsamt Aargau. Preise gemäss Preisliste der Fahrschule me.
      </p>

      <section className="bg-primary text-primary-foreground p-8 md:p-12 text-center" style={{ borderRadius: "3px" }}>
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">Motorrad-Grundkurs buchen</h2>
        <p className="opacity-95 mb-6 max-w-2xl mx-auto">M1 Freitag 17:00, M2 Samstag 08:00, M3 Sonntag 08:00 – ein Durchgang pro Woche in Wettingen.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/grundkurs-buchen" className="px-6 py-3 bg-background text-primary font-heading font-bold text-sm uppercase tracking-wide" style={{ borderRadius: "3px" }}>Grundkurs buchen</Link>
          <Link to="/kurstermine" className="px-6 py-3 border-2 border-primary-foreground font-heading font-bold text-sm uppercase tracking-wide" style={{ borderRadius: "3px" }}>Kurstermine</Link>
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
        { to: "/kosten-fuehrerschein-aargau", title: "Kosten Führerschein Aargau 2026", desc: "Alle Gebühren, Kurskosten und Fahrstundenpreise in einer Übersicht." },
        { to: "/motorrad", title: "Motorrad-Ausbildung", desc: "Ausbildung, Vorschulung und Prüfungsvorbereitung für alle Motorradkategorien." },
        { to: "/wie-viele-fahrstunden", title: "Wie viele Fahrstunden brauche ich?", desc: "Realistische Lektionenzahl für Auto und Motorrad nach Vorerfahrung." },
      ]}
    />

    <SiteFooter />
  </div>
);

export default MotorradKategorienVergleich;
