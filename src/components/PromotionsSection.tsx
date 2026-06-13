import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  badge: string | null;
}

const PromotionsSection = () => {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("promotions")
        .select("id,title,description,price,badge,starts_at,ends_at")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      const filtered = (data || []).filter((p: any) => {
        if (p.starts_at && p.starts_at > nowIso) return false;
        if (p.ends_at && p.ends_at < nowIso) return false;
        return true;
      });
      setItems(filtered as Promotion[]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section id="aktionen" className="bg-primary/5 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Aktuelle Aktionen
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Spare jetzt mit unseren Angeboten
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <div
              key={p.id}
              className="bg-card border-2 border-primary p-6 flex flex-col relative"
              style={{ borderRadius: "3px" }}
            >
              {p.badge && (
                <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-heading font-bold uppercase px-3 py-1 tracking-wide" style={{ borderRadius: "3px" }}>
                  {p.badge}
                </span>
              )}
              <h3 className="font-heading font-bold text-foreground text-xl mb-2 mt-2">{p.title}</h3>
              {p.description && (
                <p className="text-sm text-muted-foreground font-body mb-4 flex-1 whitespace-pre-line">{p.description}</p>
              )}
              {p.price && (
                <p className="text-2xl font-heading font-bold text-primary mt-auto">{p.price}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionsSection;
