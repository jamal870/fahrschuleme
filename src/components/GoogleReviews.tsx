import { useEffect, useState } from "react";
import { Star, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { tenantConfig } from "@/config/tenant";

interface Review {
  rating: number;
  text: string;
  author: string;
  photo: string | null;
  relativeTime: string;
  publishedAt: string | null;
}

interface ReviewsPayload {
  rating: number | null;
  total: number;
  mapsUrl: string | null;
  reviews: Review[];
}

const Stars = ({ value }: { value: number }) => (
  <div className="flex gap-0.5" aria-label={`${value} von 5 Sternen`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const GoogleReviews = ({ heading = "Google Bewertungen" }: { heading?: string }) => {
  const [data, setData] = useState<ReviewsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.functions
      .invoke("get-google-reviews")
      .then(({ data: d, error: e }) => {
        if (cancelled) return;
        if (e) setError(e.message);
        else setData(d as ReviewsPayload);
      })
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error || !data || !data.reviews?.length) return null;

  // JSON-LD aggregate rating
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tenantConfig.brand.name,
    aggregateRating: data.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: data.rating,
          reviewCount: data.total,
        }
      : undefined,
    review: data.reviews.map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      author: { "@type": "Person", name: r.author },
      reviewBody: r.text,
    })),
  };

  return (
    <section className="bg-section-alt py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">
            Echte Stimmen aus Wettingen &amp; Baden
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">{heading}</h2>
          {data.rating != null && (
            <div className="inline-flex items-center gap-3 bg-card border border-border px-4 py-2" style={{ borderRadius: "3px" }}>
              <span className="text-2xl font-heading font-bold text-foreground">{data.rating.toFixed(1)}</span>
              <Stars value={data.rating} />
              <span className="text-sm font-body text-muted-foreground">({data.total} Bewertungen)</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.reviews.map((r, i) => (
            <article key={i} className="bg-card border border-border p-5 flex flex-col" style={{ borderRadius: "3px" }}>
              <div className="flex items-center gap-3 mb-3">
                {r.photo ? (
                  <img src={r.photo} alt="" loading="lazy" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-sm">
                    {r.author.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-heading font-bold text-foreground text-sm truncate">{r.author}</p>
                  <p className="text-xs text-muted-foreground font-body">{r.relativeTime}</p>
                </div>
              </div>
              <Stars value={r.rating} />
              {r.text && (
                <p className="text-sm text-muted-foreground font-body leading-relaxed mt-3 line-clamp-6">{r.text}</p>
              )}
            </article>
          ))}
        </div>

        {data.mapsUrl && (
          <div className="text-center mt-8">
            <a
              href={data.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors"
              style={{ borderRadius: "3px" }}
            >
              Auf Google bewerten <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default GoogleReviews;
