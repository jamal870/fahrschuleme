import { Phone, Mail, MapPin, Clock, Users, ChevronRight, Bike, Car, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import ChatBot from "@/components/ChatBot";
import { tenantConfig } from "@/config/tenant";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-card border-b-2 border-primary">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1">
            <div className="flex flex-col leading-tight">
              <span className="flex items-baseline gap-0.5">
                <span className="text-[22px] font-heading font-bold text-foreground" style={{ letterSpacing: "0.05em" }}>{tenantConfig.brand.logoText.main}</span>
                <span className="text-[28px] text-primary" style={{ fontFamily: "'Kaushan Script', cursive" }}>{tenantConfig.brand.logoText.accent}</span>
              </span>
              <span className="text-[10px] font-body text-muted-foreground -mt-1">{tenantConfig.brand.logoText.sub}</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium font-body text-muted-foreground">
            <a href="#grundkurs" className="hover:text-primary transition-colors">Grundkurs</a>
            <a href="#fahrstunden" className="hover:text-primary transition-colors">Fahrstunden</a>
            <a href="#kategorien" className="hover:text-primary transition-colors">Kategorien</a>
            <a href="#preise" className="hover:text-primary transition-colors">Preise</a>
            <a href="#kontakt" className="hover:text-primary transition-colors">Kontakt</a>
            <a
              href={tenantConfig.booking.externalBookingUrl || "/grundkurs-buchen"}
              target={tenantConfig.booking.externalBookingUrl ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              style={{ borderRadius: "3px" }}
            >
              Jetzt Buchen
            </a>
          </div>
        </div>
      </nav>

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
              <div key={i} className="bg-card border border-border p-5 hover:border-primary/50 transition-colors" style={{ borderRadius: "3px" }}>
                <h3 className="font-heading font-bold text-foreground text-lg mb-1">{cat.title}</h3>
                <p className="text-primary text-xs font-heading font-bold mb-2">{cat.age}</p>
                <p className="text-xs text-muted-foreground font-body">{cat.desc}</p>
              </div>
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
              <div key={part} className="bg-card border border-border p-6 text-center hover:border-primary/50 transition-colors" style={{ borderRadius: "3px" }}>
                <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 text-primary font-heading font-bold text-xl flex items-center justify-center" style={{ borderRadius: "3px" }}>
                  {part}
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1">Grundkurs {part}</h3>
                <p className="text-sm text-muted-foreground font-body mb-3">4 Stunden Praxis</p>
                <p className="text-lg font-heading font-bold text-primary">CHF 160.00</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-primary/5 border-l-4 border-primary p-4" style={{ borderRadius: "0 3px 3px 0" }}>
            <p className="text-sm text-muted-foreground font-body">
              <strong className="text-foreground">💡 Tipp:</strong> Nutze unseren Chatbot unten rechts, um verfügbare Termine zu sehen und direkt zu buchen!
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
                { icon: <CreditCard className="w-5 h-5 text-primary mt-0.5 shrink-0" />, title: "Ratenzahlung möglich", desc: "In Zusammenarbeit mit Crowd4Cash – flexible Finanzierung." },
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
          <div className="border border-border overflow-hidden bg-card shadow-sm" style={{ borderRadius: "3px" }}>
            <iframe
              src={tenantConfig.booking.externalBookingUrl || "/grundkurs-buchen"}
              title="Grundkurs buchen"
              className="w-full border-0"
              style={{ height: "800px" }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-primary bg-card py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-muted-foreground font-body">
          {tenantConfig.footer.copyright}
        </div>
      </footer>

      {/* Chatbot */}
      <ChatBot />
    </div>
  );
};

export default Index;
