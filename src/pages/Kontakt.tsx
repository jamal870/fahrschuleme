import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatBot from "@/components/ChatBot";
import Seo from "@/components/Seo";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Kontakt = () => {
  const { content } = useSiteContent();
  const c = content.contact;
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Kontakt – Telefon, WhatsApp, E-Mail | Fahrschule me"
        description="So erreichst du Fahrschule me: Telefon, WhatsApp und E-Mail. Bahnhofstrasse 56, 5430 Wettingen. Termine nach Vereinbarung."
        path="/kontakt/"
      />
      <SiteHeader />
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Kontakt</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Kontakt zur Fahrschule me in Wettingen</h1>
          <p className="text-muted-foreground font-body max-w-2xl">Wir melden uns innerhalb von 24 Stunden.</p>
        </div>
      </header>

      <section className="bg-card py-10">
        <div className="max-w-5xl mx-auto px-6 font-body text-muted-foreground space-y-4">
          <h2 className="text-2xl font-heading font-bold text-foreground">Deine Anfrage an die Fahrschule</h2>
          <p>Du möchtest Fahrstunden vereinbaren, hast Fragen zum Motorrad-Grundkurs oder möchtest wissen, welches Angebot zu dir passt? Über die angegebenen Kontaktdaten erreichst du die Fahrschule me in Wettingen. Telefon, E-Mail und der WhatsApp-Kontakt auf der Website geben dir verschiedene Möglichkeiten, deine Anfrage zu stellen.</p>
          <p>Nenne uns am besten die gewünschte Ausbildung, deine bisherige Fahrerfahrung und mögliche Zeitfenster. Bei einer Frage zu einer bestehenden Kursbuchung helfen auch das Kursdatum und der betreffende Kursteil.</p>
          <p>Bitte sende keine unnötigen Ausweiskopien oder sensiblen Unterlagen über eine allgemeine Anfrage. Den Standort findest du in der Karte; den genauen Treffpunkt für deine Fahrstunde solltest du bei der Terminvereinbarung bestätigen.</p>
        </div>
      </section>

      <section className="bg-section-alt py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: <Phone className="w-6 h-6 text-primary" />, label: "Telefon", value: c.phone, href: `tel:${c.phone}` },
            { icon: <Mail className="w-6 h-6 text-primary" />, label: "E-Mail", value: c.email, href: `mailto:${c.email}` },
            { icon: <MapPin className="w-6 h-6 text-primary" />, label: "Adresse", value: `${c.address.street}\n${c.address.detail}\n${c.address.city}` },
            { icon: <Clock className="w-6 h-6 text-primary" />, label: "Öffnungszeiten", value: c.openingHours },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-border p-6 flex items-start gap-4" style={{ borderRadius: "3px" }}>
              {item.icon}
              <div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-1">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="font-heading font-bold text-foreground hover:text-primary whitespace-pre-line">{item.value}</a>
                ) : (
                  <p className="font-heading font-bold text-foreground whitespace-pre-line">{item.value}</p>
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
              src={`https://www.google.com/maps?q=${encodeURIComponent(c.address.street + " " + c.address.city)}&output=embed`}
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
};

export default Kontakt;
