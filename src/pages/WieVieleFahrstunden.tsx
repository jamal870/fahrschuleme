import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import Seo from "@/components/Seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedLinks from "@/components/RelatedLinks";

interface Profil {
  profil: string;
  lektionen: string;
  dauer: string;
  kosten: string;
  hinweis: string;
}

const profile: Profil[] = [
  {
    profil: "Viel Privatübung mit Begleitperson (100+ Std.)",
    lektionen: "10–15 Lektionen",
    dauer: "2–3 Monate",
    kosten: "ca. CHF 900–1'425",
    hinweis: "Fokus auf Prüfungsstrecken, Manöver und Autobahn",
  },
  {
    profil: "Etwas Privatübung (30–60 Std.)",
    lektionen: "18–25 Lektionen",
    dauer: "3–5 Monate",
    kosten: "ca. CHF 1'600–2'200",
    hinweis: "20er-Abo lohnt sich (CHF 1'760)",
  },
  {
    profil: "Keine Privatübung, Ersterwerb",
    lektionen: "28–38 Lektionen",
    dauer: "5–8 Monate",
    kosten: "ca. CHF 2'500–3'400",
    hinweis: "Schweizer Durchschnitt liegt bei rund 30 Lektionen",
  },
  {
    profil: "Ausländischer Ausweis / Umschreibung",
    lektionen: "4–8 Lektionen",
    dauer: "3–6 Wochen",
    kosten: "ca. CHF 380–760",
    hinweis: "Kontrollfahrt-Training, Schweizer Verkehrsregeln",
  },
  {
    profil: "Wiedereinsteiger nach langer Pause",
    lektionen: "5–10 Lektionen",
    dauer: "1–2 Monate",
    kosten: "ca. CHF 475–950",
    hinweis: "Auffrischung Manöver, Verkehrssicherheit",
  },
  {
    profil: "Motorrad A1 / A2 nach Grundkurs",
    lektionen: "4–8 Lektionen (60 Min.)",
    dauer: "1–2 Monate",
    kosten: "ca. CHF 520–1'040",
    hinweis: "Zusätzlich Vor-Prüfungsfahrt inkl. Prüfung CHF 180",
  },
];

const faktoren = [
  { titel: "Vorerfahrung", body: "Wer mit Begleitperson viel übt, braucht deutlich weniger Lektionen. Entscheidend ist geübte Fahrzeit im echten Verkehr, nicht nur auf Parkplätzen." },
  { titel: "Alter beim Einstieg", body: "Jüngere Fahrschüler lernen Bedienung und Blickführung oft schneller, ältere bringen mehr Verkehrsverständnis mit – am Ende gleicht sich das meist aus." },
  { titel: "Regelmässigkeit", body: "1–2 Lektionen pro Woche sind ideal. Grosse Pausen zwischen den Lektionen kosten Wiederholungszeit und damit Geld." },
  { titel: "Prüfungsgebiet", body: "Im Raum Baden/Wettingen gehören Tunnel, Autobahn A1, Kreisel und dichter Stadtverkehr zum Prüfungsstoff – dafür braucht es gezieltes Training." },
];

const faq = [
  {
    "@type": "Question",
    name: "Wie viele Fahrstunden braucht man in der Schweiz durchschnittlich?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Ohne nennenswerte Privatübung sind in der Schweiz rund 28 bis 38 Fahrlektionen à 45 Minuten realistisch. Wer viel mit einer Begleitperson übt, kommt oft mit 10 bis 15 Lektionen aus. Eine gesetzliche Mindestanzahl an Fahrstunden gibt es für die Kategorie B nicht.",
    },
  },
  {
    "@type": "Question",
    name: "Gibt es eine vorgeschriebene Mindestzahl an Fahrstunden?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Nein. Für die Kategorie B schreibt das Gesetz keine Mindestanzahl an Fahrlektionen vor. Obligatorisch sind der Nothilfekurs und der Verkehrskundeunterricht (VKU); beim Motorrad zusätzlich der Grundkurs mit 12 Stunden.",
    },
  },
  {
    "@type": "Question",
    name: "Wie lange dauert es bis zur Führerprüfung?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Vom Lernfahrausweis bis zur praktischen Prüfung dauert es typischerweise 4 bis 8 Monate. Bei 1 bis 2 Lektionen pro Woche und paralleler Privatübung ist die Prüfungsreife oft nach 3 bis 5 Monaten erreicht.",
    },
  },
  {
    "@type": "Question",
    name: "Was kosten 30 Fahrstunden bei der Fahrschule me?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "30 Lektionen kosten als Einzellektionen CHF 2'850. Günstiger ist die Kombination aus 20er-Abo (CHF 1'760) und 10er-Abo (CHF 900), also CHF 2'660. Dazu kommt der einmalige Administrationsbeitrag von CHF 130.",
    },
  },
  {
    "@type": "Question",
    name: "Wie viele Motorradlektionen brauche ich nach dem Grundkurs?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Nach dem 12-stündigen Motorrad-Grundkurs sind meist 4 bis 8 Lektionen à 60 Minuten (CHF 130) bis zur Prüfungsreife nötig. Empfohlen wird zusätzlich die Vor-Prüfungsfahrt inklusive Prüfung über 120 Minuten für CHF 180.",
    },
  },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Wie viele Fahrstunden brauche ich? Richtwerte für die Schweiz",
    inLanguage: "de-CH",
    datePublished: "2026-08-18",
    dateModified: "2026-08-18",
    author: { "@type": "Organization", name: "Fahrschule me" },
    publisher: { "@type": "Organization", name: "Fahrschule me" },
  },
];

const WieVieleFahrstunden = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Wie viele Fahrstunden brauche ich? Richtwerte Schweiz 2026"
      description="Realistische Anzahl Fahrstunden bis zur Führerprüfung: Richtwerte nach Vorerfahrung, Dauer und Kosten für Auto und Motorrad – aus der Praxis in Wettingen/Baden."
      path="/wie-viele-fahrstunden"
      jsonLd={jsonLd}
    />
    <SiteHeader />

    <header className="bg-card border-b-2 border-primary">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-3">Ratgeber · Stand August 2026</p>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
          Wie viele Fahrstunden brauche ich?
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
          Richtwerte nach Vorerfahrung, inklusive Dauer und Kosten – basierend auf der Ausbildungspraxis
          der Fahrschule me im Raum Wettingen, Baden und Spreitenbach.
        </p>
      </div>
    </header>

    <div className="max-w-5xl mx-auto px-6 pt-6">
      <Breadcrumbs items={[{ label: "Wie viele Fahrstunden brauche ich?" }]} />
    </div>

    <main className="max-w-5xl mx-auto px-6 py-10">
      <section className="mb-10 p-5 bg-card border-l-4 border-primary" style={{ borderRadius: "3px" }}>
        <p className="text-sm text-foreground leading-relaxed">
          <strong className="font-heading">Kurzantwort:</strong> Ohne Privatübung sind <strong>28–38 Lektionen</strong> à
          45 Minuten realistisch, mit regelmässiger Privatübung <strong>10–20 Lektionen</strong>. Eine gesetzliche
          Mindestzahl gibt es für die Kategorie B nicht. Beim Motorrad kommen nach dem obligatorischen Grundkurs
          meist <strong>4–8 Lektionen</strong> dazu.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">Richtwerte nach Ausgangslage</h2>
        <div className="overflow-x-auto border border-border" style={{ borderRadius: "3px" }}>
          <table className="w-full text-sm font-body min-w-[760px]">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3 font-heading font-bold">Ausgangslage</th>
                <th className="px-4 py-3 font-heading font-bold">Lektionen</th>
                <th className="px-4 py-3 font-heading font-bold">Dauer</th>
                <th className="px-4 py-3 font-heading font-bold">Kosten</th>
                <th className="px-4 py-3 font-heading font-bold">Hinweis</th>
              </tr>
            </thead>
            <tbody>
              {profile.map((p) => (
                <tr key={p.profil} className="border-t border-border align-top">
                  <td className="px-4 py-3 text-foreground">{p.profil}</td>
                  <td className="px-4 py-3 font-heading font-bold text-primary whitespace-nowrap">{p.lektionen}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.dauer}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.kosten}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.hinweis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Berechnungsbasis: Autolektion 45 Minuten CHF 95 (Abo günstiger), Motorradlektion 60 Minuten CHF 130.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">Was die Anzahl Lektionen beeinflusst</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {faktoren.map((f) => (
            <div key={f.titel} className="p-5 bg-card border border-border" style={{ borderRadius: "3px" }}>
              <h3 className="font-heading font-bold text-foreground mb-2">{f.titel}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">So planst du deine Ausbildung</h2>
        <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-5">
          <li>Erste 3–5 Lektionen: Fahrzeugbedienung, Blickführung, Ortsverkehr Wettingen.</li>
          <li>Lektion 6–15: Kreisel, Vortritt, Überland und erste Autobahnfahrten Richtung Baden/Zürich.</li>
          <li>Lektion 16–25: Manöver (Rückwärtsparkieren, Wenden), Nachtfahrt, dichter Verkehr.</li>
          <li>Letzte Lektionen: Prüfungssimulation auf den Strecken des Strassenverkehrsamts Aargau in Schafisheim.</li>
        </ol>
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
        Die Lektionenzahlen sind Erfahrungswerte der Fahrschule me und keine Garantie – die Prüfungsreife wird
        individuell beurteilt. Preise Stand August 2026.
      </p>

      <section className="bg-primary text-primary-foreground p-8 md:p-12 text-center" style={{ borderRadius: "3px" }}>
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">Erste Fahrstunde vereinbaren</h2>
        <p className="opacity-95 mb-6 max-w-2xl mx-auto">Wir schätzen nach der ersten Lektion ehrlich ein, wie viele Stunden du realistisch brauchst.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/fahrstunden" className="px-6 py-3 bg-background text-primary font-heading font-bold text-sm uppercase tracking-wide" style={{ borderRadius: "3px" }}>Fahrstunden</Link>
          <Link to="/kontakt" className="px-6 py-3 border-2 border-primary-foreground font-heading font-bold text-sm uppercase tracking-wide" style={{ borderRadius: "3px" }}>Kontakt</Link>
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
        { to: "/kosten-fuehrerschein-aargau", title: "Kosten Führerschein Aargau 2026", desc: "Alle Gebühren und Preise vom Sehtest bis zum Führerausweis auf Probe." },
        { to: "/motorrad-kategorien-vergleich", title: "Motorrad-Kategorien im Vergleich", desc: "AM, A1, A2 und A: Alter, Leistung und Voraussetzungen in einer Tabelle." },
        { to: "/strassenverkehrsamt-aargau", title: "Strassenverkehrsamt Aargau", desc: "Der Weg zum Lernfahrausweis und zur Prüfung in Schafisheim." },
      ]}
    />

    <SiteFooter />
  </div>
);

export default WieVieleFahrstunden;
