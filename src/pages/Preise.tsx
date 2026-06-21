import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatBot from "@/components/ChatBot";
import Seo from "@/components/Seo";
import { useSiteContent } from "@/hooks/useSiteContent";

const PriceBlock = ({ items }: { items: { name: string; price: string; note?: string }[] }) => (
  <div className="space-y-3">
    {items.map((item, i) => (
      <div key={i}>
        <div className="flex items-center justify-between">
          <span className="font-body font-medium text-foreground text-sm">{item.name}</span>
          <span className="text-sm font-heading font-bold text-foreground ml-2">{item.price}</span>
        </div>
        {item.note && <p className="text-xs text-muted-foreground font-body mt-0.5">{item.note}</p>}
      </div>
    ))}
  </div>
);

const Preise = () => {
  const { content } = useSiteContent();
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Preise Auto & Motorrad – Fahrschule me Wettingen"
        description="Transparente Preise für Fahrstunden, Motorrad-Grundkurs, Verkehrskunde und Nothelfer in Wettingen. Faire Abos verfügbar."
        path="/preise"
      />
      <SiteHeader />
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Unsere Preise</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Preise & Kosten</h1>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">Finde das perfekte Fahrstundenpaket, das zu deinen Bedürfnissen passt.</p>
        </div>
      </header>

      <section className="bg-section-alt py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
            <h3 className="text-xl font-heading font-bold text-primary mb-4">Auto</h3>
            <PriceBlock items={content.pricing_auto} />
            <h4 className="text-lg font-heading font-bold text-primary mt-6 mb-3">Auto Abonnements</h4>
            <PriceBlock items={content.pricing_auto_abos} />
          </div>
          <div className="bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
            <h3 className="text-xl font-heading font-bold text-primary mb-4">Motorrad</h3>
            <PriceBlock items={content.pricing_motorrad} />
            <h4 className="text-lg font-heading font-bold text-foreground mt-6 mb-3">Motorrad Grundkurs</h4>
            <PriceBlock items={content.pricing_motorrad_grundkurs} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.pricing_extras.map((extra, i) => (
            <div key={i} className="bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
              <h3 className="text-xl font-heading font-bold text-primary mb-3">{extra.title}</h3>
              <div className="flex items-center justify-between">
                <span className="font-body font-medium text-foreground text-sm">{extra.name}</span>
                <span className="text-sm font-heading font-bold text-foreground">{extra.price}</span>
              </div>
              {extra.note && <p className="text-xs text-muted-foreground font-body mt-1">{extra.note}</p>}
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
      <ChatBot />
    </div>
  );
};

export default Preise;
