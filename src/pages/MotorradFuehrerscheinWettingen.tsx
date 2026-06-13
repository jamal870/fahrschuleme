import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Users, MapPin, Bike, ChevronRight, ShieldCheck, GraduationCap, Calendar } from "lucide-react";
import { tenantConfig } from "@/config/tenant";
import Seo from "@/components/Seo";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wo finde ich den Motorrad-Grundkurs in Wettingen?",
      acceptedAnswer: { "@type": "Answer", text: "Fahrschule me führt den Motorrad-Grundkurs (MGK) in Wettingen durch – zentral im Bezirk Baden, gut erreichbar aus Baden, Neuenhof, Würenlos und Spreitenbach." },
    },
    {
      "@type": "Question",
      name: "Wie lange dauert der Motorrad-Grundkurs?",
      acceptedAnswer: { "@type": "Answer", text: "Der MGK besteht aus 3 Teilen à 4 Stunden (insgesamt 12 Stunden), die innerhalb von 4 Monaten abgeschlossen werden müssen." },
    },
    {
      "@type": "Question",
      name: "Welche Motorrad-Kategorien bietet Fahrschule me an?",
      acceptedAnswer: { "@type": "Answer", text: "Wir unterrichten alle Motorrad-Kategorien: AM (Mofa/Roller), A1 (125 cm³), A2 (bis 35 kW) und A (unbeschränkt)." },
    },
    {
      "@type": "Question",
      name: "Was kostet der Motorrad-Grundkurs in Wettingen?",
      acceptedAnswer: { "@type": "Answer", text: "Der vollständige MGK (3 Teile) kostet ab CHF 480. Aktuelle Preise findest du auf unserer Preisseite." },
    },
  ],
};

const categories = [
  { code: "AM", title: "Mofa / Roller", desc: "Einstieg in die motorisierte Zweiradwelt – Mofa und leichte Roller bis 50 cm³.", spec1: { label: "Alter", value: "ab 15 Jahren" }, spec2: { label: "Max", value: "45 km/h" } },
  { code: "A1", title: "Leichtmotorrad", desc: "Der erste richtige Motorradführerschein – 125 cm³ und 11 kW.", spec1: { label: "Alter", value: "ab 16 Jahren" }, spec2: { label: "Max", value: "125 cm³ / 11 kW" } },
  { code: "A2", title: "Mittlere Klasse", desc: "Mehr Power für erfahrene Einsteiger – bis 35 kW Motorradleistung.", spec1: { label: "Alter", value: "ab 18 Jahren" }, spec2: { label: "Max", value: "35 kW" } },
  { code: "A", title: "Unbegrenzt", desc: "Volle Freiheit – Kategorie A ohne Leistungsbeschränkung.", spec1: { label: "Direkt", value: "ab 20 Jahren" }, spec2: { label: "Stufe", value: "ab 24 Jahren" } },
];

const advantages = [
  { icon: GraduationCap, title: "Erfahrene Instruktoren", desc: "Staatlich geprüfte Fahrlehrer mit jahrelanger Erfahrung im Motorradunterricht." },
  { icon: Users, title: "Kleine Gruppen", desc: "Persönliche Betreuung und mehr Fahrzeit pro Teilnehmer im Grundkurs." },
  { icon: Clock, title: "Flexible Zeiten", desc: "Termine Mo–Sa von 08:00 bis 22:00 Uhr – passend zu deinem Alltag." },
  { icon: ShieldCheck, title: "Sicheres Fahren", desc: "Fokus auf defensiver Fahrtechnik und sicherem Verhalten im Strassenverkehr." },
];

const MotorradFuehrerscheinWettingen = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 bg-card border-b-2 border-primary">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-heading font-bold text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Startseite
          </Link>
          <Link
            to="/grundkurs"
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
            style={{ borderRadius: "3px" }}
          >
            Kurs buchen
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-card">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-3">
            Fahrschule {tenantConfig.location.city} · Bezirk {tenantConfig.location.region} · Aargau
          </p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground leading-none mb-5">
            Motorrad Führerschein<br />
            <span className="text-primary">in {tenantConfig.location.city}</span>
          </h1>
          <p className="text-lg font-body text-muted-foreground leading-relaxed mb-8 max-w-2xl">
            Hol dir deinen Motorradführerschein bei {tenantConfig.brand.name} in {tenantConfig.location.city} –
            Kategorien AM, A1, A2 und A. Erfahrene Instruktoren, kleine Gruppen und Termine bis 22 Uhr.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/grundkurs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              style={{ borderRadius: "3px" }}
            >
              Kurs buchen <ChevronRight className="w-4 h-4" />
            </Link>
            <a
              href="#kategorien"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors"
              style={{ borderRadius: "3px" }}
            >
              Kategorien ansehen
            </a>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: <Bike className="w-5 h-5 mx-auto mb-1" />, label: "AM / A1 / A2 / A" },
              { icon: <Clock className="w-5 h-5 mx-auto mb-1" />, label: "Mo–Sa 08:00–22:00" },
              { icon: <Users className="w-5 h-5 mx-auto mb-1" />, label: "Kleine Gruppen" },
              { icon: <MapPin className="w-5 h-5 mx-auto mb-1" />, label: `${tenantConfig.location.city} / ${tenantConfig.location.region}` },
            ].map((s, i) => (
              <div key={i} className="py-2">
                {s.icon}
                <p className="text-xs font-heading font-bold uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategorien */}
      <section id="kategorien" className="bg-section-alt py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Angebot</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">Alle Kategorien</h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              Von der leichten 125er bis zum grossen Motorrad ohne Leistungsgrenze –
              {" "}{tenantConfig.brand.name} begleitet dich durch alle Stufen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <div key={c.code} className="bg-card border border-border p-6 flex flex-col" style={{ borderRadius: "3px" }}>
                <div className="text-3xl font-heading font-bold text-primary mb-1">{c.code}</div>
                <h3 className="font-heading font-bold text-foreground uppercase text-sm tracking-wide mb-3">{c.title}</h3>
                <p className="text-sm text-muted-foreground font-body mb-4 flex-1">{c.desc}</p>
                <dl className="text-xs font-body space-y-1 border-t border-border pt-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{c.spec1.label}</dt>
                    <dd className="font-heading font-bold text-foreground">{c.spec1.value}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{c.spec2.label}</dt>
                    <dd className="font-heading font-bold text-foreground">{c.spec2.value}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/grundkurs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              style={{ borderRadius: "3px" }}
            >
              Kurs buchen <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Vorteile */}
      <section className="bg-card py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">
              Warum {tenantConfig.brand.name}
            </p>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-3">Deine Vorteile</h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              Erfahrene Instruktoren, flexible Zeiten und eine persönliche Begleitung vom ersten Tag bis zur Prüfung.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {advantages.map((a) => (
              <div key={a.title} className="bg-section-alt border border-border p-6" style={{ borderRadius: "3px" }}>
                <a.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-heading font-bold text-foreground uppercase text-sm tracking-wide mb-2">{a.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grundkurs Ablauf */}
      <section className="bg-section-alt py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Ablauf</p>
            <h2 className="text-3xl font-heading font-bold text-foreground">Motorrad-Grundkurs in 3 Teilen</h2>
            <p className="text-muted-foreground font-body mt-2">
              Der obligatorische 12-Stunden-Grundkurs muss in der richtigen Reihenfolge absolviert werden.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((part) => (
              <div key={part} className="bg-card border border-border p-6 text-center" style={{ borderRadius: "3px" }}>
                <div className="w-10 h-10 mx-auto mb-3 bg-primary/10 text-primary font-heading font-bold text-base flex items-center justify-center" style={{ borderRadius: "3px" }}>
                  {part}
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1">Grundkurs {part}</h3>
                <p className="text-sm text-muted-foreground font-body mb-2">4 Stunden Praxis</p>
                <p className="text-lg font-heading font-bold text-primary">CHF 160.00</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/grundkurs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              style={{ borderRadius: "3px" }}
            >
              <Calendar className="w-4 h-4" /> Termine anzeigen
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-primary bg-card py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-muted-foreground font-body space-y-2">
          <div className="space-x-3">
            <Link to="/impressum" className="hover:text-primary">Impressum</Link>
            <span>·</span>
            <Link to="/datenschutz" className="hover:text-primary">Datenschutz</Link>
            <span>·</span>
            <Link to="/agb" className="hover:text-primary">AGB</Link>
            <span>·</span>
            <Link to="/team" className="hover:text-primary">Team</Link>
          </div>
          <div>{tenantConfig.footer.copyright}</div>
        </div>
      </footer>
    </div>
  );
};

export default MotorradFuehrerscheinWettingen;
