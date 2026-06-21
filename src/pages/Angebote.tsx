import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import { Sparkles, Tag, ArrowRight } from "lucide-react";
import { tenantConfig } from "@/config/tenant";

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
  category: string | null;
}

const SITE_URL = "https://fahrschule-me.ch";

const Angebote = () => {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("promotions")
        .select("id,title,description,price,badge,starts_at,ends_at,sort_order,original_price,discount_price,category")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      setItems((data || []) as Promotion[]);
      setLoading(false);
    })();
  }, []);

  const offerJsonLd = items.length === 0
    ? undefined
    : {
        "@context": "https://schema.org",
        "@graph": items.map((p) => ({
          "@type": "Offer",
          name: p.title,
          description: p.description || undefined,
          url: `${SITE_URL}/#/angebote`,
          priceCurrency: "CHF",
          price: p.discount_price ?? undefined,
          priceValidUntil: p.ends_at ? p.ends_at.slice(0, 10) : undefined,
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "LocalBusiness",
            name: tenantConfig.brand.name,
            address: {
              "@type": "PostalAddress",
              streetAddress: tenantConfig.contact.address.street,
              addressLocality: tenantConfig.location.city,
              addressCountry: "CH",
            },
          },
        })),
      };

  const fmt = (iso: string) => new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Aktionen & Angebote – Fahrschule me Wettingen & Baden"
        description="Aktuelle Aktionen für Motorrad-Grundkurs, Auto-Fahrstunden und Kurse in Wettingen, Baden und Umgebung. Online buchen, faire Preise, limitierte Aktionen."
        path="/angebote"
        jsonLd={offerJsonLd}
      />
      <SiteHeader />

      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 mb-4 border border-primary/30" style={{ borderRadius: "3px" }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-heading font-bold uppercase tracking-widest">Aktuelle Aktionen</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4 leading-tight">
            Angebote für Fahrschüler in <span className="text-primary">Wettingen & Baden</span>
          </h1>
          <p className="text-lg font-body text-muted-foreground max-w-2xl leading-relaxed">
            Aktuelle, zeitlich begrenzte Aktionen für Motorrad-Grundkurs (MGK), Auto-Fahrstunden und Motorrad-Fahrstunden im Raum Wettingen, Baden, Neuenhof, Würenlos und Spreitenbach. Alle Aktionen sind transparent und direkt online buchbar.
          </p>
        </div>
      </header>

      <section className="bg-section-alt py-16">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <p className="text-center text-muted-foreground font-body">Aktionen werden geladen …</p>
          ) : items.length === 0 ? (
            <div className="bg-card border border-border p-10 text-center" style={{ borderRadius: "3px" }}>
              <h2 className="font-heading font-bold text-xl text-foreground mb-2">Aktuell keine laufenden Aktionen</h2>
              <p className="text-muted-foreground font-body mb-6">Schau bald wieder vorbei – oder buche direkt einen Kurs zum regulären Preis.</p>
              <Link to="/kurstermine" className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide" style={{ borderRadius: "3px" }}>
                Kurstermine ansehen <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((p, idx) => (
                <article key={p.id} className="bg-card border border-border p-7 flex flex-col" style={{ borderRadius: "3px", boxShadow: "0 10px 30px -15px hsl(var(--primary) / 0.3)" }}>
                  {p.badge && (
                    <div className="inline-flex items-center gap-1.5 self-start bg-primary text-primary-foreground text-[10px] font-heading font-bold uppercase tracking-widest px-3 py-1.5 mb-4" style={{ borderRadius: "3px" }}>
                      <Tag className="w-3 h-3" />
                      {p.badge}
                    </div>
                  )}
                  <h2 className="font-heading font-bold text-foreground text-xl mb-3 leading-tight">{p.title}</h2>
                  {p.description && (
                    <p className="text-sm text-muted-foreground font-body mb-5 flex-1 whitespace-pre-line leading-relaxed">{p.description}</p>
                  )}
                  {(p.price || p.discount_price != null) && (
                    <div className="pt-4 border-t border-border flex items-baseline gap-2 flex-wrap mb-4">
                      <span className="text-xs font-body text-muted-foreground uppercase tracking-wide">Aktionspreis</span>
                      <div className="ml-auto flex items-baseline gap-2">
                        {p.original_price != null && (
                          <span className="font-body text-base text-muted-foreground line-through">CHF {Number(p.original_price).toFixed(0)}.-</span>
                        )}
                        <span className="font-heading font-bold text-2xl text-primary">{p.price || `CHF ${Number(p.discount_price).toFixed(0)}.-`}</span>
                      </div>
                    </div>
                  )}
                  {(p.starts_at || p.ends_at) && (
                    <p className="text-xs font-body text-muted-foreground mb-4">
                      {p.starts_at && p.ends_at ? `Gültig ${fmt(p.starts_at)} – ${fmt(p.ends_at)}` : p.ends_at ? `Gültig bis ${fmt(p.ends_at)}` : `Gültig ab ${fmt(p.starts_at!)}`}
                    </p>
                  )}
                  <Link
                    to={p.category === "mgk" || p.category === "grundkurs" ? "/kurstermine" : "/kontakt"}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-heading font-bold text-xs uppercase tracking-wide hover:opacity-90 transition-opacity"
                    style={{ borderRadius: "3px" }}
                  >
                    Jetzt buchen <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">Fahrschule me – Dein Partner in Wettingen & Baden</h2>
          <p className="text-muted-foreground font-body leading-relaxed mb-3">
            Wir bieten Motorrad-Grundkurse (MGK) für die Kategorien A1, A2 und A sowie Auto-Fahrstunden im gesamten Raum Aargau. Treffpunkte: Wettingen (Hauptsitz) und Baden Bahnhof. Lektionen sind Mo–Sa von 08:00 bis 22:00 Uhr buchbar – ideal auch nach Feierabend.
          </p>
          <p className="text-muted-foreground font-body leading-relaxed">
            Jede Aktion ist transparent, ohne versteckte Kosten und direkt online buchbar. Schnell sein lohnt sich – die Plätze in den Aktionsterminen sind begrenzt.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Angebote;
