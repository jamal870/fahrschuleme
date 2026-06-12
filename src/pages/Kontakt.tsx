import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatBot from "@/components/ChatBot";
import Seo from "@/components/Seo";
import { tenantConfig } from "@/config/tenant";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Kontakt = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Kontakt – Fahrschule me Wettingen | Telefon, WhatsApp, E-Mail"
      description="So erreichst du Fahrschule me: Telefon, WhatsApp und E-Mail. Bahnhofstrasse 56, 5430 Wettingen. Mo–Sa 08–22 Uhr."
      path="/kontakt"
    />
    <SiteHeader />
    <header className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Kontakt</p>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">So erreichst du uns</h1>
        <p className="text-muted-foreground font-body max-w-2xl">Wir melden uns innerhalb von 24 Stunden.</p>
      </div>
    </header>

    <section className="bg-section-alt py-16">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: <Phone className="w-6 h-6 text-primary" />, label: "Telefon", value: tenantConfig.contact.phone, href: `tel:${tenantConfig.contact.phone}` },
          { icon: <Mail className="w-6 h-6 text-primary" />, label: "E-Mail", value: tenantConfig.contact.email, href: `mailto:${tenantConfig.contact.email}` },
          { icon: <MapPin className="w-6 h-6 text-primary" />, label: "Adresse", value: `${tenantConfig.contact.address.street}\n${tenantConfig.contact.address.city}` },
          { icon: <Clock className="w-6 h-6 text-primary" />, label: "Öffnungszeiten", value: tenantConfig.contact.openingHours },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border p-6 flex items-start gap-4" style={{ borderRadius: "3px" }}>
            {c.icon}
            <div>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-1">{c.label}</p>
              {c.href ? (
                <a href={c.href} className="font-heading font-bold text-foreground hover:text-primary whitespace-pre-line">{c.value}</a>
              ) : (
                <p className="font-heading font-bold text-foreground whitespace-pre-line">{c.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-card py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="border border-border overflow-hidden" style={{ borderRadius: "3px" }}>
          <iframe
            title="Standort"
            src={`https://www.google.com/maps?q=${encodeURIComponent(tenantConfig.contact.address.street + " " + tenantConfig.contact.address.city)}&output=embed`}
            className="w-full border-0"
            style={{ height: "400px" }}
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <SiteFooter />
    <ChatBot />
  </div>
);

export default Kontakt;
