import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatBot from "@/components/ChatBot";
import { tenantConfig } from "@/config/tenant";
import { CreditCard, Bike, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Fahrstunden = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <header className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Fahrstunden</p>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Motorrad & Auto Fahrstunden</h1>
        <p className="text-muted-foreground font-body max-w-2xl">
          Flexibel Mo–Sa von 08–22 Uhr. Ob Vorschulung, Grundschulung oder Perfektionsschulung – Schritt für Schritt lernst du alles, was du benötigst.
        </p>
      </div>
    </header>

    <section className="bg-section-alt py-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: <CreditCard className="w-6 h-6 text-primary" />, title: "Flexible Bezahlung", desc: "Bar, Überweisung oder bequem online bezahlen." },
          { icon: <Bike className="w-6 h-6 text-primary" />, title: "Kein eigenes Motorrad?", desc: "Kein Problem! Wir helfen dir, ein geeignetes Motorrad zu mieten." },
          { icon: <Clock className="w-6 h-6 text-primary" />, title: "Flexible Termine", desc: tenantConfig.contact.openingHours },
          { icon: <Users className="w-6 h-6 text-primary" />, title: "Individuelle Betreuung", desc: "Persönlicher Unterricht abgestimmt auf dein Tempo." },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4 bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
            {item.icon}
            <div>
              <h3 className="font-heading font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-card py-16">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Bereit für die erste Fahrstunde?</h2>
        <p className="text-muted-foreground font-body mb-6">Ruf uns an oder buche direkt online.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href={`tel:${tenantConfig.contact.phone}`} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90" style={{ borderRadius: "3px" }}>
            {tenantConfig.contact.phone}
          </a>
          <Link to="/kontakt" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary hover:text-primary-foreground" style={{ borderRadius: "3px" }}>
            Kontakt
          </Link>
        </div>
      </div>
    </section>

    <SiteFooter />
    <ChatBot />
  </div>
);

export default Fahrstunden;
