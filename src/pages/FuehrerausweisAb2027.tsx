import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Car,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  Info,
  ListChecks,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import Seo, { BUSINESS_ID } from "@/components/Seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { tenantConfig } from "@/config/tenant";
import TrackedCta from "@/components/TrackedCta";
import { FAHRSTUNDEN_APP_URL, PARTNER_LINK_REL, PARTNER_NOTHILFE_URL, PARTNER_VKU_URL } from "@/lib/booking-links";

const faqs = [
  {
    q: "Ab wann gilt der neue Ablauf?",
    a: "Der neue Ablauf gilt ab dem 1. Januar 2027. Welche Übergangsregeln für Personen gelten, die vorher begonnen haben, gibt das Strassenverkehrsamt bekannt. Wenn du bald startest, frag uns, wir sagen dir, was wir wissen.",
  },
  {
    q: "Was ist neu am Ablauf?",
    a: "Der Antrag läuft online oder am Schalter, und die Person wird erfasst und erhält einen FABER-PIN. Sehtest, Nothilfekurs, Foto und Verkehrskundeunterricht (VKU) erledigst du danach in beliebiger Reihenfolge. Anschliessend folgen Theorieprüfung, Lernfahrausweis, praktische Grundschulung bei der Fahrschule und die praktische Prüfung.",
  },
  {
    q: "Bietet Fahrschule me den Nothilfekurs und den VKU an?",
    a: "Wir führen die beiden Kurse nicht selbst durch. Du buchst sie bei unserer Partner-Fahrschule Star (fahrschule-star.ch). Die praktische Ausbildung mit Fahrstunden machst du bei uns.",
  },
  {
    q: "Was ist die praktische Grundschulung (PGS)?",
    a: "PGS steht für praktische Grundschulung. Sie findet bei der Fahrschule statt: beim Auto als praktische Ausbildung, beim Motorrad als Grundkurs.",
  },
  {
    q: "Wie lange dauert die Probezeit?",
    a: "Nach der praktischen Prüfung erhältst du den Führerausweis auf Probe (FAP). Die Probezeit dauert drei Jahre. Du besuchst den Weiterausbildungskurs (WAB). Nach drei Jahren Probezeit wird der Führerausweis im Kreditkartenformat (FAK) ausgestellt.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  about: { "@id": BUSINESS_ID },
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const steps = [
  {
    icon: FileText,
    title: "Antrag stellen",
    body: "Du stellst den Antrag für den Lernfahrausweis online oder am Schalter. Dabei weist du dich aus und reichst das Gesuch ein.",
  },
  {
    icon: UserCheck,
    title: "Erfassung und FABER-PIN",
    body: "Das Strassenverkehrsamt erfasst dich im System und teilt dir deinen persönlichen FABER-PIN zu.",
  },
  {
    icon: ListChecks,
    title: "Vorbereitung in beliebiger Reihenfolge",
    body: "Foto, Sehtest, Nothilfekurs und Verkehrskundeunterricht (VKU) erledigst du in der Reihenfolge, die für dich passt. Nothilfekurs und VKU buchst du bei unserer Partner-Fahrschule Star.",
  },
  {
    icon: BookOpen,
    title: "Theorieprüfung",
    body: "Du legst die Theorieprüfung ab. Gemäss Übersicht kommt sie vor der Ausstellung des Lernfahrausweises.",
  },
  {
    icon: CreditCard,
    title: "Lernfahrausweis (LFA)",
    body: "Nach bestandener Theorie stellt das Strassenverkehrsamt deinen Lernfahrausweis aus. Jetzt beginnt das Fahren.",
  },
  {
    icon: Car,
    title: "Praktische Grundschulung (PGS) bei der Fahrschule",
    body: "Beim Auto ist das die praktische Ausbildung mit Fahrstunden bei uns. Beim Motorrad ist die PGS der Grundkurs. In beiden Fällen bereiten wir dich Schritt für Schritt auf die praktische Prüfung vor.",
  },
  {
    icon: Award,
    title: "Praktische Führerprüfung",
    body: "Du legst die praktische Prüfung ab. Danach wird der Führerausweis auf Probe (FAP) ausgestellt.",
  },
  {
    icon: GraduationCap,
    title: "Weiterausbildungskurs (WAB)",
    body: "Nach dem Führerausweis auf Probe besuchst du den Weiterausbildungskurs.",
  },
  {
    icon: Clock,
    title: "Drei Jahre Probezeit, dann Führerausweis (FAK)",
    body: "Nach drei Jahren Probezeit wird dein Führerausweis im Kreditkartenformat (FAK) ausgestellt.",
  },
];

const glossary = [
  { abbr: "FABER-PIN", text: "Persönlicher Code, den du bei der Erfassung im System erhältst" },
  { abbr: "LFA", text: "Lernfahrausweis" },
  { abbr: "PGS", text: "Praktische Grundschulung bei der Fahrschule" },
  { abbr: "VKU", text: "Verkehrskundeunterricht" },
  { abbr: "FAP", text: "Führerausweis auf Probe" },
  { abbr: "WAB", text: "Weiterausbildungskurs während der Probezeit" },
  { abbr: "FAK", text: "Führerausweis im Kreditkartenformat" },
];

const FuehrerausweisAb2027 = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Weg zum Führerausweis ab 2027 – Ablauf im Überblick"
        description="So läuft der Weg zum Führerausweis ab 2027: Antrag, Theorie, Lernfahrausweis, Grundschulung, Prüfung und Probezeit. Das heisst es für dich."
        path="/fuehrerausweis-ab-2027/"
        jsonLd={faqJsonLd}
      />
      <SiteHeader />

      <header className="bg-card border-b-2 border-primary">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
          <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-3">
            Ratgeber · Neuer Ablauf
          </p>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground leading-tight mb-5">
            Der Weg zum Führerausweis <span className="text-primary">ab 2027</span>
          </h1>
          <p className="text-lg font-body text-muted-foreground leading-relaxed max-w-2xl">
            Der Ablauf von Antrag bis Führerausweis wird ab dem 1. Januar 2027 neu organisiert. Hier siehst du die
            Stationen im Überblick und was das für deine Ausbildung bei {tenantConfig.brand.name} bedeutet.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 font-body text-foreground">
        <section
          className="bg-primary/5 border border-primary/20 p-6 mb-12 flex gap-4"
          style={{ borderRadius: "3px" }}
        >
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className="font-heading font-bold text-foreground mb-1">Stand der Informationen</p>
            <p>
              Diese Seite zeigt den Ablauf, der ab dem 1. Januar 2027 gilt (Stand Oktober 2026). Die Übergangsregeln und
              die Einzelheiten zu den einzelnen Schritten gibt das Strassenverkehrsamt bekannt. Wir ergänzen die Seite,
              sobald wir mehr wissen.
            </p>
          </div>
        </section>

        <figure className="mb-12">
          <img
            src="/images/weg-zum-fuehrerausweis-2027.webp"
            alt="Übersicht der Stationen auf dem Weg zum Führerausweis ab 2027: Antrag, Erfassung mit FABER-PIN, Vorbereitung, Theorieprüfung, Lernfahrausweis, praktische Grundschulung, Prüfung, Weiterausbildungskurs und Probezeit"
            width={1600}
            height={1003}
            loading="lazy"
            decoding="async"
            className="w-full h-auto border border-border"
            style={{ borderRadius: "3px" }}
          />
          <figcaption className="text-xs text-muted-foreground mt-2">
            Der Weg zum Führerausweis ab 1. Januar 2027 im Überblick.
          </figcaption>
        </figure>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
            Die Stationen im Überblick
          </h2>
          <p className="text-muted-foreground mb-8">Vom Antrag bis zum Führerausweis im Kreditkartenformat.</p>
          <ol className="space-y-5">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="flex gap-5 p-5 bg-card border border-border"
                style={{ borderRadius: "3px" }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground font-heading font-bold flex items-center justify-center"
                  style={{ borderRadius: "3px" }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground text-lg mb-1 flex items-center gap-2">
                    <s.icon className="w-4 h-4 text-primary" /> {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
            Was das für deine Ausbildung heisst
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Die praktische Ausbildung bleibt bei der Fahrschule. Wir fahren mit dir, bis du für die Prüfung bereit bist, mit
              einem Fahrlehrer, der deinen Lernstand kennt, und Terminen nach Vereinbarung.
            </p>
            <p>
              Nothilfekurs und Verkehrskundeunterricht führen wir nicht selbst durch. Beide buchst du bei unserer
              Partner-Fahrschule Star. Plane sie früh ein, weil sie im neuen Ablauf zur Vorbereitung gehören und in
              beliebiger Reihenfolge möglich sind.
            </p>
            <div className="flex flex-wrap gap-3">
              <TrackedCta
                to={PARTNER_NOTHILFE_URL}
                label="Nothilfekurs buchen (Partner)"
                external
                icon="external"
                rel={PARTNER_LINK_REL}
              >
                Nothilfekurs buchen
              </TrackedCta>
              <TrackedCta
                to={PARTNER_VKU_URL}
                label="VKU buchen (Partner)"
                external
                icon="external"
                rel={PARTNER_LINK_REL}
              >
                VKU buchen
              </TrackedCta>
            </div>
            <p>
              Wenn du bald mit dem Führerausweis startest und unsicher bist, welcher Ablauf für dich gilt, melde dich bei uns.
              Wir sagen dir ehrlich, was wir wissen, und verweisen dich für Verbindliches ans Strassenverkehrsamt.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">Abkürzungen</h2>
          <dl className="grid sm:grid-cols-2 gap-3">
            {glossary.map((g) => (
              <div key={g.abbr} className="p-4 bg-card border border-border" style={{ borderRadius: "3px" }}>
                <dt className="font-heading font-bold text-sm text-foreground">{g.abbr}</dt>
                <dd className="text-xs text-muted-foreground mt-0.5">{g.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">Häufige Fragen</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="p-5 bg-card border border-border group" style={{ borderRadius: "3px" }}>
                <summary className="font-heading font-bold text-foreground cursor-pointer flex justify-between items-center gap-4">
                  {f.q}
                  <ChevronRight className="w-4 h-4 text-primary transition-transform group-open:rotate-90 flex-shrink-0" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-primary text-primary-foreground p-8 md:p-12 text-center" style={{ borderRadius: "3px" }}>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">Fahrstunden bei Fahrschule me</h2>
          <p className="text-base md:text-lg opacity-95 mb-6 max-w-2xl mx-auto">
            Wir begleiten dich praktisch bis zur Prüfung, in Wettingen, Baden und Umgebung.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={FAHRSTUNDEN_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-background text-primary font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              style={{ borderRadius: "3px" }}
            >
              Fahrstunde buchen
            </a>
            <Link
              to="/strassenverkehrsamt-aargau/"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-foreground text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary-foreground hover:text-primary transition-colors"
              style={{ borderRadius: "3px" }}
            >
              <ShieldCheck className="w-4 h-4" /> Strassenverkehrsamt Aargau
            </Link>
          </div>
        </section>

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-heading font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Zurück zur Startseite
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default FuehrerausweisAb2027;
