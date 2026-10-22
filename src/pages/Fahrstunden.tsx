import RelatedLinks from "@/components/RelatedLinks";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatBot from "@/components/ChatBot";
import Seo from "@/components/Seo";
import TrackedCta from "@/components/TrackedCta";
import PromoPrice from "@/components/PromoPrice";
import { supabase } from "@/integrations/supabase/client";
import { tenantConfig } from "@/config/tenant";
import { CreditCard, Bike, Clock, Users, ExternalLink, Sparkles, Tag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FAHRSTUNDEN_APP_URL = "https://app.l-me.ch/api/anmeldung";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  badge: string | null;
  original_price: number | null;
  discount_price: number | null;
  starts_at: string | null;
  ends_at: string | null;
}

const FahrstundenPromotions = () => {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("promotions")
        .select("id,title,description,price,badge,starts_at,ends_at,sort_order,original_price,discount_price")
        .eq("active", true)
        .in("category", ["fahrstunden_auto", "fahrstunden_motorrad"])
        .order("sort_order", { ascending: true });
      setItems((data || []) as Promotion[]);
      setLoading(false);
    })();
  }, []);

  if (loading || items.length === 0) return null;

  const fmt = (iso: string) => new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <section
      className="relative overflow-hidden py-14 bg-primary text-primary-foreground"
      style={{
        boxShadow: "inset 0 0 100px -30px hsl(var(--primary-foreground) / 0.15), 0 0 60px -20px hsl(var(--primary) / 0.45)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--primary-foreground)) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Top glow line */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary-foreground) / 0.8), transparent)" }}
      />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-foreground/20 px-3 py-1.5 mb-3 border border-primary-foreground/40 animate-pulse" style={{ borderRadius: "3px" }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-heading font-bold uppercase tracking-widest">Aktuelle Fahrstunden-Aktionen</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold">Schnapp dir einen Deal</h2>
            <p className="text-primary-foreground/80 font-body mt-1">Limitierte Angebote für Auto- und Motorrad-Fahrstunden.</p>
          </div>
          <Link
            to="/angebote/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-foreground text-primary font-heading font-bold text-xs uppercase tracking-wide hover:opacity-90 shrink-0"
            style={{ borderRadius: "3px" }}
          >
            Alle Angebote <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className={items.length === 1 ? "grid grid-cols-1 gap-6 max-w-2xl" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
          {items.map((p) => (
            <article
              key={p.id}
              className="group relative bg-background text-foreground p-6 md:p-8 flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1"
              style={{ borderRadius: "3px", boxShadow: "0 20px 50px -20px rgba(0,0,0,0.3)" }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.4))" }}
              />
              {p.badge && (
                <div className="inline-flex items-center gap-1.5 self-start bg-primary text-primary-foreground text-[10px] font-heading font-bold uppercase tracking-widest px-3 py-1.5 mb-4" style={{ borderRadius: "3px" }}>
                  <Tag className="w-3 h-3" />
                  {p.badge}
                </div>
              )}
              <h3 className="font-heading font-bold text-foreground text-xl md:text-2xl mb-2 leading-tight">{p.title}</h3>
              {p.description && (
                <p className="text-sm text-muted-foreground font-body mb-5 flex-1 whitespace-pre-line leading-relaxed">{p.description}</p>
              )}
              <PromoPrice
                price={p.price}
                originalPrice={p.original_price}
                discountPrice={p.discount_price}
                className="mb-4"
              />

              {(p.starts_at || p.ends_at) && (
                <p className="text-xs font-body text-muted-foreground mb-4">
                  {p.starts_at && p.ends_at ? `Gültig ${fmt(p.starts_at)} – ${fmt(p.ends_at)}` : p.ends_at ? `Gültig bis ${fmt(p.ends_at)}` : `Gültig ab ${fmt(p.starts_at!)}`}
                </p>
              )}
              <TrackedCta
                to={FAHRSTUNDEN_APP_URL}
                label="Jetzt buchen"
                external
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-heading font-bold text-xs uppercase tracking-wide hover:opacity-90 transition-opacity"
                icon="external"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const Fahrstunden = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Fahrstunden Auto & Motorrad in Wettingen | Fahrschule me"
      description="Individuelle Auto- und Motorrad-Fahrstunden in Wettingen. Einzel- und Doppellektionen, 10er- und 20er-Abos. Jetzt Termin buchen bei Fahrschule me."
      path="/fahrstunden/"
    />
    <SiteHeader />
    <header className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Fahrstunden</p>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Motorrad & Auto Fahrstunden</h1>
        <p className="text-muted-foreground font-body max-w-2xl mb-6">
          Termine nach Vereinbarung. Vorschulung, Grundschulung oder Perfektionsschulung – Schritt für Schritt lernst du alles, was du brauchst.
        </p>
          <TrackedCta
            to={FAHRSTUNDEN_APP_URL}
            label="Fahrstunde buchen"
            external
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90"
            icon="external"
          />
      </div>
    </header>

      <section className="bg-card py-10">
        <div className="max-w-5xl mx-auto px-6 font-body text-muted-foreground space-y-4">
          <h2 className="text-2xl font-heading font-bold text-foreground">Auto und Motorrad: Unterricht passend zu deinem Lernstand</h2>
          <p>Bei den Auto- und Motorrad-Fahrstunden in Wettingen steht dein aktueller Lernstand im Mittelpunkt. Ob du zum ersten Mal am Steuer sitzt, nach einer Pause wieder einsteigst oder einzelne Situationen vor der Prüfung üben möchtest: Besprich deine Vorerfahrung und deine Ziele mit deinem Fahrlehrer. So lässt sich klären, welche Übungen für deinen nächsten Schritt sinnvoll sind.</p>
          <p>Zur Vorbereitung auf die Fahrstunde helfen konkrete Fragen: Möchtest du das Anfahren sicherer beherrschen, den Blick im Verkehr schulen oder anspruchsvolle Verkehrssituationen üben? Notiere, was dir noch Schwierigkeiten macht. Die Preise und verfügbaren Pakete findest du auf unserer Preisseite. Für die Terminvereinbarung kannst du die verlinkte Fahrschul-App nutzen oder direkt Kontakt aufnehmen.</p>
        </div>
      </section>

    <FahrstundenPromotions />

      <section className="bg-card py-10">
        <div className="max-w-5xl mx-auto px-6 font-body text-muted-foreground space-y-4">
          <h2 className="text-2xl font-heading font-bold text-foreground">Erfolgreich mit unseren Motorradfahrlektionen</h2>
          <p>Eine gute Fahrzeugbedienung genügt schon lange nicht mehr für das Bestehen der praktischen Führerprüfung. Deshalb lohnt es sich, mindestens zwei Wochen vor deiner Motorrad-Führerprüfung die Meinung eines Experten einzuholen.</p>
          <p>Unsere Motorradfahrlehrer und ehemaligen Führerprüfungsexperten wissen genau, welche Voraussetzungen bei der Führerprüfung erfüllt sein müssen. Mit ihren Tipps und Tricks aus jahrzehntelanger Erfahrung bestehst du die Prüfung mit möglichst wenig Aufwand. Eine Prüfungssimulation kannst du direkt bei uns anfragen.</p>

          <h3 className="text-lg font-heading font-bold text-foreground pt-2">Das erwartet dich</h3>
          <p>Die Motorrad-Führerprüfungen der Kategorie A1 nehmen die Prüfungsexperten nicht als Sozius ab, sondern mit einem Fahrzeug der Kategorie B (Auto) mit Funk. Die Führerprüfungen der Kategorie A nehmen die Experten dagegen als Beifahrer (Sozius) ab.</p>

          <h3 className="text-lg font-heading font-bold text-foreground pt-2">Besonders sicher</h3>
          <p>Sicherheit ist beim Motorradfahren besonders wichtig. Wir legen grossen Wert darauf, dass du nach einer Fahrlektion oder Prüfungssimulation die Risiken kennst und sicher und selbstbewusst mit deinem Motorrad fährst.</p>

          <h3 className="text-lg font-heading font-bold text-foreground pt-2">Darauf musst du achten</h3>
          <p>Für die Sicherheitsausrüstung (inklusive Helm) bist du als Fahrschüler selbst verantwortlich. Dein Motorrad muss die gesetzlichen Anforderungen erfüllen (Reifen, Bremsen, Beleuchtung usw.) und für die Fahrt mit zwei Personen (Kategorie A) vorbereitet sein.</p>
        </div>
      </section>

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
        <p className="text-muted-foreground font-body mb-6">
          Buche deine Fahrstunde direkt über unsere Fahrschul-App – einfach Termin auswählen und losfahren.
        </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <TrackedCta
              to={FAHRSTUNDEN_APP_URL}
              label="Online buchen"
              external
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90"
              icon="external"
            />
          <a href={`tel:${tenantConfig.contact.phone}`} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary hover:text-primary-foreground" style={{ borderRadius: "3px" }}>
            {tenantConfig.contact.phone}
          </a>
          <Link to="/kontakt/" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border text-foreground font-heading font-bold text-sm uppercase tracking-wide hover:bg-section-alt" style={{ borderRadius: "3px" }}>
            Kontakt
          </Link>
        </div>
      </div>
    </section>

    <div className="max-w-6xl mx-auto px-6 py-10">
      <RelatedLinks links={[
        { to: "/nothelferkurs-wettingen/", title: "Nothelferkurs in Wettingen", desc: "Informationen zu Kursinhalten, Ablauf und Anmeldung." },
        { to: "/verkehrskunde-wettingen/", title: "Verkehrskunde in Wettingen", desc: "Informationen zum VKU und zur Kursanmeldung." },
      ]} />
    </div>

    <section className="bg-card py-10">
      <div className="max-w-5xl mx-auto px-6 font-body text-muted-foreground space-y-3">
        <h2 className="text-2xl font-heading font-bold text-foreground">Einzellektion oder Abo?</h2>
        <p>Die Preisübersicht unterscheidet zwischen einzelnen Auto-Fahrstunden, Doppellektionen sowie 10er- und 20er-Abos. Für Motorrad-Fahrstunden sind eigene Angebote aufgeführt. Vergleiche jeweils die Beschreibung der gewünschten Leistung; Auto- und Motorrad-Angebote haben unterschiedliche Umfänge. Die aktuellen Beträge findest du auf der Preisseite, ohne zwischen verschiedenen Angebotsseiten rechnen zu müssen.</p>
      </div>
    </section>

    <SiteFooter />
    <ChatBot />
  </div>
);

export default Fahrstunden;
