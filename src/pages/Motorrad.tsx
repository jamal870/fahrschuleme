import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatBot from "@/components/ChatBot";
import { tenantConfig } from "@/config/tenant";
import { Link } from "react-router-dom";
import grundkurs1 from "@/assets/grundkurs-1.png";
import grundkurs2 from "@/assets/grundkurs-2.png";
import grundkurs3 from "@/assets/grundkurs-3.png";

const images = [grundkurs1, grundkurs2, grundkurs3];

const Motorrad = () => (
  <div className="min-h-screen bg-background">
    <SiteHeader />
    <header className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Motorrad</p>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Motorradführerschein <span className="text-primary">in {tenantConfig.location.city}</span></h1>
        <p className="text-muted-foreground font-body max-w-2xl">
          Alle Kategorien (AM, A1, A2, A) – Grundkurs, Fahrstunden und Prüfungsvorbereitung aus einer Hand.
        </p>
      </div>
    </header>

    <section className="bg-section-alt py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Kategorien</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tenantConfig.categories.map((cat, i) => (
            <Link key={i} to="/grundkurs" className="bg-card border border-border p-5 hover:border-primary/50 hover:shadow-md transition-all block" style={{ borderRadius: "3px" }}>
              <h3 className="font-heading font-bold text-foreground text-lg mb-1">{cat.title}</h3>
              <p className="text-primary text-xs font-heading font-bold mb-2">{cat.age}</p>
              <p className="text-xs text-muted-foreground font-body">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-card py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Motorrad Grundkurse</h2>
        <p className="text-muted-foreground font-body mb-8">Der obligatorische 12-Stunden-Grundkurs in 3 Teilen.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((part) => (
            <Link key={part} to="/grundkurs" className="bg-section-alt border border-border p-6 text-center hover:border-primary/50 hover:shadow-md transition-all block" style={{ borderRadius: "3px" }}>
              <img src={images[part - 1]} alt={`Grundkurs ${part}`} className="w-32 h-32 mx-auto mb-3 object-contain" loading="lazy" />
              <div className="w-10 h-10 mx-auto mb-3 bg-primary/10 text-primary font-heading font-bold flex items-center justify-center" style={{ borderRadius: "3px" }}>{part}</div>
              <h3 className="font-heading font-bold text-foreground mb-1">Grundkurs {part}</h3>
              <p className="text-sm text-muted-foreground font-body mb-3">4 Stunden Praxis</p>
              <p className="text-lg font-heading font-bold text-primary">CHF 160.00</p>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <SiteFooter />
    <ChatBot />
  </div>
);

export default Motorrad;
