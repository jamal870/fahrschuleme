import { Phone, Mail, MapPin, Clock, Users, Bike, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import ChatBot from "@/components/ChatBot";
import PromotionsSection from "@/components/PromotionsSection";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import { tenantConfig } from "@/config/tenant";
import grundkurs1 from "@/assets/grundkurs-1.png";
import grundkurs2 from "@/assets/grundkurs-2.png";
import grundkurs3 from "@/assets/grundkurs-3.png";

const grundkursImages = [grundkurs1, grundkurs2, grundkurs3];

const homeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wo macht Fahrschule me Fahrstunden im Raum Baden/Wettingen?",
      acceptedAnswer: { "@type": "Answer", text: "Fahrschule me ist in Wettingen ansässig und bietet Auto- und Motorrad-Fahrstunden im Raum Baden, Wettingen, Neuenhof, Würenlos und Spreitenbach." },
    },
    {
      "@type": "Question",
      name: "Was kostet eine Autofahrstunde bei Fahrschule me?",
      acceptedAnswer: { "@type": "Answer", text: "Eine Einzellektion (45 Min) kostet CHF 95. Mit den Abos (10er/20er) sparst du bis zu CHF 150 auf den Gesamtpreis." },
    },
    {
      "@type": "Question",
      name: "Wie melde ich mich für den Motorrad-Grundkurs (MGK) an?",
      acceptedAnswer: { "@type": "Answer", text: "Du kannst dich direkt online über die Kurstermine-Seite anmelden. Die Buchung wird nach Zahlung automatisch bestätigt." },
    },
    {
      "@type": "Question",
      name: "Welche Öffnungs- und Unterrichtszeiten habt ihr?",
      acceptedAnswer: { "@type": "Answer", text: "Fahrstunden und Kurse sind Montag bis Samstag von 08:00 bis 22:00 Uhr möglich – ideal auch nach Feierabend." },
    },
  ],
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Fahrschule me Wettingen – Auto, Motorrad & Grundkurs Baden"
        description="Fahrschule in Wettingen & Baden: Autoprüfung, Motorrad-Grundkurs (MGK) und Fahrstunden. Erfahrene Instruktoren, faire Preise, Termine Mo–Sa 08–22 Uhr."
        path="/"
        jsonLd={homeFaqJsonLd}
      />
      <SiteHeader />

      {/* Hero */}
      <header className="bg-card">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground leading-none mb-4">
              Motorradführerschein<br />
              <span className="text-primary">in {tenantConfig.location.city}</span>
            </h1>
            <p className="text-lg font-body text-muted-foreground leading-relaxed mb-8 max-w-lg">
              {tenantConfig.brand.name} – {tenantConfig.brand.tagline} · {tenantConfig.contact.openingHours}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#grundkurs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
                style={{ borderRadius: "3px" }}
              >
                Grundkurs buchen
              </a>
              <a
                href="#kategorien"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
                style={{ borderRadius: "3px" }}
              >
                Alle Kategorien
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: <Bike className="w-5 h-5 mx-auto mb-1" />, label: "AM / A1 / A2 / A" },
              { icon: <Clock className="w-5 h-5 mx-auto mb-1" />, label: tenantConfig.contact.openingHours },
              { icon: <Users className="w-5 h-5 mx-auto mb-1" />, label: "Kleine Gruppen" },
              { icon: <MapPin className="w-5 h-5 mx-auto mb-1" />, label: tenantConfig.location.region },
            ].map((stat, i) => (
              <div key={i} className="py-2">
                {stat.icon}
                <p className="text-xs font-heading font-bold uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PromotionsSection />

      {/* Erklärvideo */}
      <section className="bg-card py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">In 60 Sekunden erklärt</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              So einfach kommst du zum Motorradführerschein
            </h2>
          </div>
          <div className="mx-auto max-w-sm overflow-hidden shadow-2xl" style={{ borderRadius: "3px" }}>
            <video
              src="/erklarvideo.mp4"
              controls
              playsInline
              preload="metadata"
              poster="/og-image.jpg"
              className="w-full h-auto block bg-black"
            />
          </div>
        </div>
      </section>



      {/* Sicherheit */}
      <section className="bg-section-alt py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Sicheres Fahren</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Sichere Fahrpraxis ist unser Ziel
            </h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              Bei {tenantConfig.brand.name} in {tenantConfig.location.city} liegt unser Fokus darauf, dich zu einem sicheren und kompetenten Fahrer auszubilden.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenantConfig.safetyPoints.map((item, i) => (
              <div key={i} className="bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
                <h3 className="font-heading font-bold text-foreground mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategorien */}
      <section id="kategorien" className="bg-card py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Kategorien</p>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">Motorrad-Kategorien</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {tenantConfig.categories.map((cat, i) => (
              <a key={i} href="#/grundkurs" className="bg-card border border-border p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer block" style={{ borderRadius: "3px" }}>
                <h3 className="font-heading font-bold text-foreground text-lg mb-1">{cat.title}</h3>
                <p className="text-primary text-xs font-heading font-bold mb-2">{cat.age}</p>
                <p className="text-xs text-muted-foreground font-body">{cat.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Grundkurs */}
      <section id="grundkurs" className="bg-section-alt py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Motorrad Grundkurse</h2>
          <p className="text-muted-foreground font-body mb-8">
            Der obligatorische 12-Stunden-Grundkurs in 3 Teilen. Die Kursteile müssen in der richtigen Reihenfolge absolviert werden.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((part) => (
              <a key={part} href="#/grundkurs" className="bg-card border border-border p-6 text-center hover:border-primary/50 hover:shadow-md transition-all cursor-pointer block" style={{ borderRadius: "3px" }}>
                <img src={grundkursImages[part - 1]} alt={`Grundkurs ${part}`} className="w-32 h-32 mx-auto mb-3 object-contain" loading="lazy" />
                <div className="w-10 h-10 mx-auto mb-3 bg-primary/10 text-primary font-heading font-bold text-base flex items-center justify-center" style={{ borderRadius: "3px" }}>
                  {part}
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1">Grundkurs {part}</h3>
                <p className="text-sm text-muted-foreground font-body mb-3">4 Stunden Praxis</p>
                <p className="text-lg font-heading font-bold text-primary">CHF 160.00</p>
              </a>
            ))}
          </div>
          <div className="mt-6 bg-primary/5 border-l-4 border-primary p-4" style={{ borderRadius: "0 3px 3px 0" }}>
            <p className="text-sm text-muted-foreground font-body">
              <strong className="text-foreground">💡 Tipp:</strong> Klicke auf einen Kursteil oben, um direkt verfügbare Termine zu sehen und zu buchen!
            </p>
          </div>
        </div>
      </section>

      {/* Fahrstunden */}
      <section id="fahrstunden" className="bg-card py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-section-alt border border-border p-8 md:p-12" style={{ borderRadius: "3px" }}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Motorrad Fahrstunden</h2>
            <p className="text-muted-foreground font-body mb-6 max-w-2xl">
              Flexibel Mo–Sa von 08–22 Uhr. Ob Vorschulung, Grundschulung oder Perfektionsschulung – Schritt für Schritt lernst du alles, was du benötigst.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <CreditCard className="w-5 h-5 text-primary mt-0.5 shrink-0" />, title: "Flexible Bezahlung", desc: "Bar, Überweisung oder bequem online bezahlen." },
                { icon: <Bike className="w-5 h-5 text-primary mt-0.5 shrink-0" />, title: "Kein eigenes Motorrad?", desc: "Kein Problem! Wir helfen dir, ein geeignetes Motorrad zu mieten." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-card border border-border p-4" style={{ borderRadius: "3px" }}>
                  {item.icon}
                  <div>
                    <p className="font-heading font-bold text-foreground text-sm mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground font-body">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Preise */}
      <section id="preise" className="bg-section-alt py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Unsere Preise</p>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Preise & Kosten</h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto text-sm">
              Finde das perfekte Fahrstundenpaket, das zu deinen Bedürfnissen passt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Auto */}
            <div className="bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
              <h3 className="text-xl font-heading font-bold text-primary mb-4">Auto</h3>
              <div className="space-y-3">
                {tenantConfig.pricing.auto.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between">
                      <span className="font-body font-medium text-foreground text-sm">{item.name}</span>
                      <span className="text-sm font-heading font-bold text-foreground ml-2">{item.price}</span>
                    </div>
                    {item.note && <p className="text-xs text-muted-foreground font-body mt-0.5">{item.note}</p>}
                  </div>
                ))}
              </div>

              <h4 className="text-lg font-heading font-bold text-primary mt-6 mb-3">Auto Abonnements</h4>
              <div className="space-y-3">
                {tenantConfig.pricing.autoAbos.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between">
                      <span className="font-body font-medium text-foreground text-sm">{item.name}</span>
                      <span className="text-sm font-heading font-bold text-foreground ml-2">{item.price}</span>
                    </div>
                    {item.note && <p className="text-xs text-muted-foreground font-body mt-0.5">{item.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Motorrad */}
            <div className="bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
              <h3 className="text-xl font-heading font-bold text-primary mb-4">Motorrad</h3>
              <div className="space-y-3">
                {tenantConfig.pricing.motorrad.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between">
                      <span className="font-body font-medium text-foreground text-sm">{item.name}</span>
                      <span className="text-sm font-heading font-bold text-foreground ml-2">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="text-lg font-heading font-bold text-foreground mt-6 mb-3">Motorrad Grundkurs</h4>
              <div className="space-y-3">
                {tenantConfig.pricing.motorradGrundkurs.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between">
                      <span className="font-body font-medium text-foreground text-sm">{item.name}</span>
                      <span className="text-sm font-heading font-bold text-foreground ml-2">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verkehrskunde & Nothelfer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-8">
            <div className="bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
              <h3 className="text-xl font-heading font-bold text-primary mb-3">Verkehrskunde</h3>
              <div className="flex items-center justify-between">
                <span className="font-body font-medium text-foreground text-sm">Verkehrskunde</span>
                <span className="text-sm font-heading font-bold text-foreground">180.-</span>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">Inkl. der obligatorischen VKU-Unterlagen</p>
            </div>
            <div className="bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
              <h3 className="text-xl font-heading font-bold text-primary mb-3">Nothelfer</h3>
              <div className="flex items-center justify-between">
                <span className="font-body font-medium text-foreground text-sm">Nothelfer</span>
                <span className="text-sm font-heading font-bold text-foreground">120.-</span>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">Inkl. Kursdokumentation und Nothelferausweis (6 Jahre gültig)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section id="kontakt" className="bg-card py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-section-alt border border-border p-8 md:p-12" style={{ borderRadius: "3px" }}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Kontakt</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <MapPin className="w-5 h-5 text-primary" />, label: "Adresse", value: `${tenantConfig.contact.address.street}\n${tenantConfig.contact.address.detail}\n${tenantConfig.contact.address.city}` },
                { icon: <Phone className="w-5 h-5 text-primary" />, label: "Telefon", value: tenantConfig.contact.phone },
                { icon: <Mail className="w-5 h-5 text-primary" />, label: "E-Mail", value: tenantConfig.contact.email },
                { icon: <Clock className="w-5 h-5 text-primary" />, label: "Öffnungszeiten", value: tenantConfig.contact.openingHours },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  {c.icon}
                  <div>
                    <p className="text-xs text-muted-foreground font-body">{c.label}</p>
                    <p className="font-body font-medium text-foreground text-sm whitespace-pre-line">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Buchung Embed */}
      <section id="buchen" className="bg-section-alt py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Online Buchen</p>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">Grundkurs direkt buchen</h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              Wähle deinen Wunschtermin und buche deinen Motorrad-Grundkurs bequem online.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              to="/grundkurs-buchen"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              style={{ borderRadius: "3px" }}
            >
              Zum Buchungsformular
            </Link>
            <Link
              to="/grundkurs-buchen?a1=1"
              className="inline-flex items-center gap-2 px-8 py-4 bg-card border-2 border-primary text-primary font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary/5 transition-colors"
              style={{ borderRadius: "3px" }}
            >
              Nur Teil 3 (A1-Inhaber) – CHF 250
            </Link>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Du bist bereits im Besitz der Kategorie A1? Buche direkt nur den Kursteil 3 zum Pauschalpreis.
          </p>
        </div>
      </section>

      <SiteFooter />

      {/* Chatbot */}
      <ChatBot />
    </div>
  );
};

export default Index;
