import { Link } from "react-router-dom";
import { MapPin, Clock, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import GoogleReviews from "@/components/GoogleReviews";
import Breadcrumbs, { type BreadcrumbItem } from "@/components/Breadcrumbs";
import RelatedLinks, { type RelatedLink } from "@/components/RelatedLinks";
import { tenantConfig } from "@/config/tenant";

export interface LocalLandingProps {
  path: string;                 // z.B. "/fahrschule-wettingen"
  seoTitle: string;
  seoDescription: string;
  badge: string;                // kleines Label oben
  h1: string;
  h1Accent?: string;            // farbiger Teil im H1
  intro: string;                // Lead-Paragraph
  meetingPoint: { label: string; address: string };
  serviceName: string;          // für JSON-LD Service
  serviceType: "MotorcycleSchool" | "DrivingSchool";
  benefits: { title: string; desc: string }[];
  faqs?: { q: string; a: string }[];
  primaryCta: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  longText: { heading: string; body: string }[];
  breadcrumbs?: BreadcrumbItem[];
  relatedLinks?: RelatedLink[];
}

const SITE_URL = "https://fahrschule-me.ch";

const LocalLandingPage = (p: LocalLandingProps) => {
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": p.serviceType,
      name: `${tenantConfig.brand.name} – ${p.serviceName}`,
      url: `${SITE_URL}/#${p.path}`,
      telephone: tenantConfig.contact.phone,
      email: tenantConfig.contact.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: tenantConfig.contact.address.detail,
        addressLocality: tenantConfig.location.city,
        postalCode: "5430",
        addressCountry: "CH",
      },
      areaServed: ["Wettingen", "Baden", "Neuenhof", "Würenlos", "Spreitenbach", "Aargau"],
      openingHours: "Mo-Sa 08:00-22:00",
    },
  ];

  if (p.faqs && p.faqs.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo title={p.seoTitle} description={p.seoDescription} path={p.path} jsonLd={jsonLd} />
      <SiteHeader />
      {p.breadcrumbs && p.breadcrumbs.length > 0 && <Breadcrumbs items={p.breadcrumbs} />}

      {/* Hero */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 mb-4 border border-primary/30" style={{ borderRadius: "3px" }}>
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs font-heading font-bold uppercase tracking-widest">{p.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4 leading-tight max-w-3xl">
            {p.h1} {p.h1Accent && <span className="text-primary">{p.h1Accent}</span>}
          </h1>
          <p className="text-lg font-body text-muted-foreground max-w-2xl leading-relaxed mb-6">{p.intro}</p>
          <div className="flex flex-wrap gap-3">
            <Link to={p.primaryCta.to} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity" style={{ borderRadius: "3px" }}>
              {p.primaryCta.label} <ArrowRight className="w-4 h-4" />
            </Link>
            {p.secondaryCta && (
              <Link to={p.secondaryCta.to} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors" style={{ borderRadius: "3px" }}>
                {p.secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Treffpunkt + Öffnungszeiten */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-body">
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><strong className="font-heading">Treffpunkt:</strong> {p.meetingPoint.label} – {p.meetingPoint.address}</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><strong className="font-heading">Zeiten:</strong> Mo–Sa 08:00–22:00</div>
          <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><strong className="font-heading">Telefon:</strong> <a href={`tel:${tenantConfig.contact.phone.replace(/\s/g, "")}`} className="underline">{tenantConfig.contact.phone}</a></div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-section-alt py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-10">Warum {tenantConfig.brand.name}?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {p.benefits.map((b, i) => (
              <div key={i} className="bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
                <CheckCircle2 className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-heading font-bold text-foreground mb-2 text-lg">{b.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Long-form SEO Text */}
      <section className="bg-card py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          {p.longText.map((sec, i) => (
            <div key={i}>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">{sec.heading}</h2>
              <p className="text-muted-foreground font-body leading-relaxed whitespace-pre-line">{sec.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      {p.faqs && p.faqs.length > 0 && (
        <section className="bg-section-alt py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-8">Häufige Fragen</h2>
            <div className="space-y-4">
              {p.faqs.map((f, i) => (
                <div key={i} className="bg-card border border-border p-5" style={{ borderRadius: "3px" }}>
                  <h3 className="font-heading font-bold text-foreground mb-2">{f.q}</h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Google Bewertungen */}
      <GoogleReviews />

      {/* Final CTA */}
      <section className="bg-foreground text-background py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Bereit für den nächsten Schritt?</h2>
          <p className="font-body text-background/70 mb-6">Buche direkt online oder ruf uns an – wir helfen dir persönlich weiter.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to={p.primaryCta.to} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide" style={{ borderRadius: "3px" }}>
              {p.primaryCta.label} <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={`tel:${tenantConfig.contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-background text-background font-heading font-bold text-sm uppercase tracking-wide hover:bg-background hover:text-foreground transition-colors" style={{ borderRadius: "3px" }}>
              <Phone className="w-4 h-4" /> {tenantConfig.contact.phone}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default LocalLandingPage;
