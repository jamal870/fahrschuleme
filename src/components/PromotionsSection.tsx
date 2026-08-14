import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TrackedCta from "@/components/TrackedCta";
import PromoPrice from "@/components/PromoPrice";
import { Sparkles, Tag, ArrowRight, ExternalLink } from "lucide-react";

const FAHRSTUNDEN_APP_URL = "https://app.l-me.ch/api/anmeldung";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  badge: string | null;
  original_price: number | null;
  discount_price: number | null;
  category: string | null;
  starts_at: string | null;
  ends_at: string | null;
}

const PromotionsSection = () => {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("promotions")
        .select("id,title,description,price,badge,category,starts_at,ends_at,sort_order,original_price,discount_price")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      setItems((data || []) as Promotion[]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section
      id="aktionen"
      className="relative overflow-hidden py-20 bg-foreground"
      style={{
        boxShadow: "inset 0 0 100px -30px hsl(var(--primary) / 0.25), 0 0 60px -20px hsl(var(--primary) / 0.35)",
      }}
    >
      {/* Background decorations */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-40"
        style={{ background: "hsl(var(--primary))" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ background: "hsl(var(--primary))" }}
      />
      {/* Top glow line */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.8), transparent)" }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 mb-4 border border-primary/40 animate-pulse" style={{ borderRadius: "3px" }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-heading font-bold uppercase tracking-widest">Limitierte Aktionen</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-background mb-3">
            Nur jetzt: <span className="text-primary">{items[0]?.title || "Spare richtig"}</span>
          </h2>
          <p className="text-background/60 font-body max-w-xl mx-auto">
            Aktuelle Angebote – solange verfügbar. Schnell sein lohnt sich.
          </p>
        </div>

        <div
          className={
            items.length === 1
              ? "grid grid-cols-1 gap-6 max-w-2xl mx-auto"
              : items.length === 2
              ? "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          }
        >
          {items.map((p, idx) => (
            <article
              key={p.id}
              className="group relative bg-card p-7 md:p-10 flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1"
              style={{
                borderRadius: "3px",
                boxShadow: "0 20px 50px -20px hsl(var(--primary) / 0.5)",
              }}
            >
              {/* Top accent stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.4))" }}
              />

              {/* Corner number */}
              <span className="absolute top-4 right-4 font-heading font-bold text-6xl text-primary/10 leading-none select-none">
                {String(idx + 1).padStart(2, "0")}
              </span>

              {p.badge && (
                <div className="inline-flex items-center gap-1.5 self-start bg-primary text-primary-foreground text-[10px] font-heading font-bold uppercase tracking-widest px-3 py-1.5 mb-5" style={{ borderRadius: "3px" }}>
                  <Tag className="w-3 h-3" />
                  {p.badge}
                </div>
              )}

              <h3 className="font-heading font-bold text-foreground text-2xl mb-3 leading-tight relative">
                {p.title}
              </h3>

              {p.description && (
                <p className="text-sm text-muted-foreground font-body mb-6 flex-1 whitespace-pre-line leading-relaxed relative">
                  {p.description}
                </p>
              )}

              <PromoPrice price={p.price} originalPrice={p.original_price} discountPrice={p.discount_price} />


              {(p.starts_at || p.ends_at) && (() => {
                const fmt = (iso: string) => new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
                const now = new Date();
                const notYet = p.starts_at && new Date(p.starts_at) > now;
                let label = "";
                if (p.starts_at && p.ends_at) label = `Gültig ${fmt(p.starts_at)} – ${fmt(p.ends_at)}`;
                else if (p.starts_at) label = `Gültig ab ${fmt(p.starts_at)}`;
                else if (p.ends_at) label = `Gültig bis ${fmt(p.ends_at)}`;
                return (
                  <div className="relative mt-3 text-xs font-body text-muted-foreground">
                    {notYet ? <span className="font-bold text-primary">Bald verfügbar – </span> : null}
                    {label}
                  </div>
                );
              })()}

              {(p.category === "fahrstunden_auto" || p.category === "fahrstunden_motorrad") && (
                <TrackedCta
                  to={FAHRSTUNDEN_APP_URL}
                  label="Jetzt buchen"
                  external
                  className="relative mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-heading font-bold text-xs uppercase tracking-wide hover:opacity-90 transition-opacity"
                  icon="external"
                />
              )}

              {/* Hover glow */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.08), transparent 60%)",
                }}
              />
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/angebote"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
            style={{ borderRadius: "3px" }}
          >
            Alle Angebote ansehen <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PromotionsSection;
