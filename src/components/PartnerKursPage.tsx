import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";
import Seo, { BUSINESS_ID, canonicalUrl } from "@/components/Seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedLinks, { type RelatedLink } from "@/components/RelatedLinks";
import TrackedCta from "@/components/TrackedCta";
import { FAHRSTUNDEN_APP_URL, PARTNER_LINK_REL } from "@/lib/booking-links";

export interface PartnerKursProps {
  path: string;
  seoTitle: string;
  seoDescription: string;
  badge: string;
  h1: string;
  h1Accent: string;
  intro: string;
  facts: { label: string; value: string }[];
  sections: { heading: string; body: string[] }[];
  faqs: { q: string; a: string }[];
  partnerUrl: string;
  partnerLabel: string;
  breadcrumbLabel: string;
  related: RelatedLink[];
}

/** Infoseite zu einem Kurs, den Fahrschule me nicht selbst durchführt, sondern über die Partner-Fahrschule vermittelt. */
const PartnerKursPage = (p: PartnerKursProps) => {
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonicalUrl(p.path)}#webpage`,
      url: canonicalUrl(p.path),
      name: p.seoTitle,
      description: p.seoDescription,
      inLanguage: "de-CH",
      about: p.h1 + " " + p.h1Accent,
      isPartOf: { "@id": BUSINESS_ID },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo title={p.seoTitle} description={p.seoDescription} path={p.path} jsonLd={jsonLd} />
      <SiteHeader />
      <Breadcrumbs items={[{ label: p.breadcrumbLabel }]} />

      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 mb-4 border border-primary/30"
            style={{ borderRadius: "3px" }}
          >
            <span className="text-xs font-heading font-bold uppercase tracking-widest">{p.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4 leading-tight max-w-3xl">
            {p.h1} <span className="text-primary">{p.h1Accent}</span>
          </h1>
          <p className="text-lg font-body text-muted-foreground max-w-2xl leading-relaxed mb-6">{p.intro}</p>
          <div className="flex flex-wrap gap-3">
            <TrackedCta
              to={p.partnerUrl}
              label={p.partnerLabel}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              icon="external"
              rel={PARTNER_LINK_REL}
            />
            <Link
              to="/fuehrerausweis-ab-2027/"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors"
              style={{ borderRadius: "3px" }}
            >
              Der Weg ab 2027
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-section-alt py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {p.facts.map((f) => (
            <div key={f.label} className="bg-card border border-border p-5" style={{ borderRadius: "3px" }}>
              <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground">{f.label}</p>
              <p className="font-heading font-bold text-foreground text-lg mt-1">{f.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          {p.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">{s.heading}</h2>
              <div className="space-y-3 font-body text-muted-foreground leading-relaxed">
                {s.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-section-alt py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">Häufige Fragen</h2>
          <div className="space-y-4">
            {p.faqs.map((f) => (
              <details key={f.q} className="p-5 bg-card border border-border group" style={{ borderRadius: "3px" }}>
                <summary className="font-heading font-bold text-foreground cursor-pointer flex justify-between items-center gap-4">
                  {f.q}
                  <ChevronRight className="w-4 h-4 text-primary transition-transform group-open:rotate-90 flex-shrink-0" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <RelatedLinks links={p.related} />

      <section className="bg-foreground text-background py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Bereit für den nächsten Schritt?</h2>
          <p className="font-body text-background/70 mb-6">
            Kurs bei unserer Partner-Fahrschule buchen und die Fahrstunden bei uns planen.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <TrackedCta
              to={p.partnerUrl}
              label={p.partnerLabel}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide"
              icon="external"
              rel={PARTNER_LINK_REL}
            />
            <TrackedCta
              to={FAHRSTUNDEN_APP_URL}
              label="Fahrstunde buchen"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-background/40 text-background font-heading font-bold text-sm uppercase tracking-wide hover:bg-background hover:text-foreground transition-colors"
              icon="external"
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default PartnerKursPage;
