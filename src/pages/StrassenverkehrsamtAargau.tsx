import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, FileText, Eye, Heart, BookOpen, Car, CheckCircle2, ExternalLink, ChevronRight } from "lucide-react";
import Seo from "@/components/Seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { tenantConfig } from "@/config/tenant";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wo befindet sich das Strassenverkehrsamt Aargau?",
      acceptedAnswer: { "@type": "Answer", text: "Das Strassenverkehrsamt des Kantons Aargau befindet sich in Schafisheim an der Postfach, 5503 Schafisheim. Es ist die zentrale Anlaufstelle für Führerausweise, Theorie- und praktische Prüfungen im Kanton Aargau." },
    },
    {
      "@type": "Question",
      name: "Welche Dokumente brauche ich für den Lernfahrausweis im Aargau?",
      acceptedAnswer: { "@type": "Answer", text: "Du brauchst: das ausgefüllte Gesuchsformular der Gemeinde, einen amtlichen Sehtest (gültig 2 Jahre), den Nothilfekurs-Ausweis (gültig 6 Jahre), eine Kopie der ID/Pass und ein Passfoto. Die Gemeinde leitet alles ans Strassenverkehrsamt weiter." },
    },
    {
      "@type": "Question",
      name: "Wie melde ich mich zur Theorieprüfung in Schafisheim an?",
      acceptedAnswer: { "@type": "Answer", text: "Die Anmeldung zur Theorieprüfung erfolgt online über das Portal des Strassenverkehrsamts Aargau. Voraussetzung ist ein gültiger Sehtest und der Nothilfekurs. Die Prüfung kostet aktuell CHF 30." },
    },
    {
      "@type": "Question",
      name: "Wie lange gilt der Lernfahrausweis Kategorie B im Aargau?",
      acceptedAnswer: { "@type": "Answer", text: "Der Lernfahrausweis Kategorie B ist 24 Monate gültig. In dieser Zeit musst du die praktische Führerprüfung bestehen, sonst musst du neu beginnen." },
    },
    {
      "@type": "Question",
      name: "Wer kann mich auf Fahrübungen begleiten?",
      acceptedAnswer: { "@type": "Answer", text: "Begleitperson sein darf, wer mindestens 23 Jahre alt ist und seit mindestens 3 Jahren den Führerausweis Kategorie B unbefristet besitzt. Empfehlung: für Prüfungsreife immer auch professionelle Fahrstunden nehmen." },
    },
  ],
};

const documents = [
  { icon: FileText, label: "Gesuchsformular", desc: "Erhältlich bei deiner Wohngemeinde" },
  { icon: Eye, label: "Sehtest (max. 2 Jahre alt)", desc: "Bei Optiker oder Augenarzt – CHF 15–25" },
  { icon: Heart, label: "Nothilfekurs (max. 6 Jahre alt)", desc: "10 Stunden Kurs – CHF 100–150" },
  { icon: FileText, label: "Kopie ID oder Pass", desc: "Identitätsnachweis" },
  { icon: FileText, label: "Passfoto", desc: "Aktuell, biometrisch" },
];

const steps = [
  {
    num: 1,
    title: "Sehtest & Nothilfekurs absolvieren",
    body: "Beim Optiker einen amtlichen Sehtest machen (CHF 15–25). Parallel den 10-stündigen Nothilfekurs buchen (CHF 100–150). Beide Bestätigungen sind 2 bzw. 6 Jahre gültig.",
  },
  {
    num: 2,
    title: "Gesuch bei der Wohngemeinde einreichen",
    body: "Gesuchsformular auf der Gemeinde abholen oder herunterladen. Mit Sehtest, Nothilfeausweis, ID-Kopie und Passfoto bei der Einwohnerkontrolle abgeben. Gemeindegebühr ca. CHF 30.",
  },
  {
    num: 3,
    title: "Theorieprüfung in Schafisheim ablegen",
    body: "Sobald die Bestätigung des Strassenverkehrsamts kommt, kannst du die Theorieprüfung online buchen. Geprüft werden 50 Fragen, mind. 45 müssen richtig sein. Kosten: CHF 30.",
  },
  {
    num: 4,
    title: "Lernfahrausweis erhalten",
    body: "Nach bestandener Theorieprüfung wird der Lernfahrausweis Kategorie B per Post zugestellt. Er ist 24 Monate gültig – jetzt darfst du mit Begleitperson oder Fahrlehrer üben.",
  },
  {
    num: 5,
    title: "Fahrstunden bei Fahrschule me",
    body: "Empfohlen: 30–40 Lektionen à 45 Min für Prüfungsreife. Wir trainieren gezielt die Prüfungsstrecken im Raum Baden/Wettingen – inkl. Tunnel, Autobahn, Stadtverkehr und Rückwärtsparkieren.",
  },
  {
    num: 6,
    title: "Praktische Führerprüfung in Schafisheim",
    body: "Wenn dein Fahrlehrer dich für prüfungsreif erklärt, melden wir dich direkt an. Die Prüfung dauert ca. 60 Min. Bei Bestehen erhältst du den Führerausweis auf Probe (3 Jahre).",
  },
];

const StrassenverkehrsamtAargau = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Strassenverkehrsamt Aargau – Lernfahrausweis & Prüfung in Schafisheim"
        description="Kompletter Ratgeber zum Strassenverkehrsamt Aargau (Schafisheim): Lernfahrausweis beantragen, Theorie- und praktische Prüfung, Dokumente, Kosten und Tipps."
        path="/strassenverkehrsamt-aargau"
        jsonLd={faqJsonLd}
      />
      <SiteHeader />

      {/* Hero */}
      <header className="bg-card border-b-2 border-primary">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
          <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-3">
            Ratgeber · Kanton Aargau
          </p>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground leading-tight mb-5">
            Strassenverkehrsamt Aargau:<br />
            <span className="text-primary">Lernfahrausweis & Führerprüfung</span>
          </h1>
          <p className="text-lg font-body text-muted-foreground leading-relaxed max-w-2xl">
            Alles, was du wissen musst, um im Kanton Aargau (Standort Schafisheim) deinen Lernfahrausweis
            zu beantragen, die Theorieprüfung zu bestehen und die praktische Führerprüfung erfolgreich abzulegen.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 font-body text-foreground">
        {/* Kontakt-Box */}
        <section className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-12" style={{ borderRadius: "3px" }}>
          <h2 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Strassenverkehrsamt Aargau – Standort & Kontakt
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold text-foreground mb-1">Adresse</p>
              <p className="text-muted-foreground">Strassenverkehrsamt des Kantons Aargau<br />Postfach<br />5503 Schafisheim</p>
            </div>
            <div>
              <p className="font-bold text-foreground mb-1 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Öffnungszeiten</p>
              <p className="text-muted-foreground">Mo–Fr: 07:30–16:30 Uhr<br />Termine online buchbar</p>
            </div>
          </div>
          <a
            href="https://www.ag.ch/de/verwaltung/dvi/strassenverkehrsamt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-5 text-sm font-heading font-bold text-primary hover:underline"
          >
            Zur offiziellen Website <ExternalLink className="w-4 h-4" />
          </a>
        </section>

        {/* Schritt-für-Schritt */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            In 6 Schritten zum Führerausweis im Aargau
          </h2>
          <p className="text-muted-foreground mb-8">
            Der Weg vom ersten Antrag bis zur bestandenen Führerprüfung – realistisch dauert das 4–8 Monate.
          </p>

          <div className="space-y-5">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-5 p-5 bg-card border border-border" style={{ borderRadius: "3px" }}>
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground font-heading font-bold flex items-center justify-center" style={{ borderRadius: "3px" }}>
                  {s.num}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dokumente */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            Welche Dokumente brauchst du für den Lernfahrausweis?
          </h2>
          <p className="text-muted-foreground mb-6">
            Alle Unterlagen werden bei deiner Wohngemeinde eingereicht – diese leitet sie ans Strassenverkehrsamt Aargau weiter.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {documents.map((d) => (
              <div key={d.label} className="flex items-start gap-3 p-4 bg-card border border-border" style={{ borderRadius: "3px" }}>
                <d.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-bold text-sm text-foreground">{d.label}</p>
                  <p className="text-xs text-muted-foreground">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prüfungen */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">
            Theorie- und praktische Prüfung in Schafisheim
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-6 bg-card border border-border" style={{ borderRadius: "3px" }}>
              <BookOpen className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-heading font-bold text-foreground text-lg mb-2">Theorieprüfung</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> 50 Fragen, max. 5 Fehler</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> Dauer: 45 Minuten</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> Kosten: CHF 30</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> Online-Buchung übers SVA Aargau</li>
              </ul>
            </div>

            <div className="p-6 bg-card border border-border" style={{ borderRadius: "3px" }}>
              <Car className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-heading font-bold text-foreground text-lg mb-2">Praktische Prüfung</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> Dauer: ca. 60 Minuten</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> Startort: Schafisheim</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> Kosten: CHF 120</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> Anmeldung durch deine Fahrschule</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">
            Häufige Fragen
          </h2>
          <div className="space-y-4">
            {faqJsonLd.mainEntity.map((q) => (
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

        {/* CTA */}
        <section className="bg-primary text-primary-foreground p-8 md:p-12 text-center" style={{ borderRadius: "3px" }}>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">
            Bereit für deine Fahrstunden?
          </h2>
          <p className="text-base md:text-lg opacity-95 mb-6 max-w-2xl mx-auto">
            {tenantConfig.brand.name} in {tenantConfig.location.city} – wir trainieren gezielt
            die Prüfungsstrecken des Strassenverkehrsamts Aargau. Mo–Sa 08–22 Uhr.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/fahrstunden"
              className="inline-flex items-center gap-2 px-6 py-3 bg-background text-primary font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              style={{ borderRadius: "3px" }}
            >
              Autofahrstunden
            </Link>
            <Link
              to="/grundkurs"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-foreground text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary-foreground hover:text-primary transition-colors"
              style={{ borderRadius: "3px" }}
            >
              Motorrad-Grundkurs
            </Link>
          </div>
        </section>

        {/* Zurück */}
        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-heading font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Zurück zur Startseite
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default StrassenverkehrsamtAargau;
