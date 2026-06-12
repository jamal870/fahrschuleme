import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import { tenantConfig } from "@/config/tenant";

interface CourseRow {
  id: string;
  part: number;
  day: string;
  date: string;       // "dd.mm.yyyy"
  time: string;       // "HH:MM – HH:MM"
  location: string;
  instructor: string | null;
  spots_available: number;
  price: number;
}

const SITE_URL = "https://fahrschule-me.ch";

// "01.05.2026" -> "2026-05-01"
const toIsoDate = (d: string) => {
  const [dd, mm, yyyy] = d.split(".");
  return `${yyyy}-${mm}-${dd}`;
};

// "13:00 – 17:00" -> ["13:00", "17:00"]
const splitTime = (t: string) => {
  const m = t.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  return m ? [m[1], m[2]] : ["08:00", "12:00"];
};

const buildEventJsonLd = (rows: CourseRow[]) =>
  rows.map((r) => {
    const iso = toIsoDate(r.date);
    const [start, end] = splitTime(r.time);
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: `Motorrad-Grundkurs Teil ${r.part} – ${tenantConfig.brand.name}`,
      startDate: `${iso}T${start}:00+02:00`,
      endDate: `${iso}T${end}:00+02:00`,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: `${r.location} – ${tenantConfig.brand.name}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: tenantConfig.contact.address.street,
          addressLocality: tenantConfig.location.city,
          postalCode: "5430",
          addressCountry: "CH",
        },
      },
      organizer: {
        "@type": "Organization",
        name: tenantConfig.brand.name,
        url: SITE_URL,
      },
      offers: {
        "@type": "Offer",
        price: r.price,
        priceCurrency: "CHF",
        availability:
          r.spots_available > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/SoldOut",
        url: `${SITE_URL}/#/grundkurs`,
        validFrom: new Date().toISOString(),
      },
      description: `Motorrad-Grundkurs Teil ${r.part} (4h) in ${r.location}. Kategorien A1, A2, A. Gesetzlich vorgeschriebener Kurs (12 Stunden, 3 Teile).`,
    };
  });

const Kurstermine = () => {
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("course_dates")
        .select("id, part, day, date, time, location, instructor, spots_available, price")
        .order("date");
      if (!error && data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const future = (data as CourseRow[]).filter((r) => {
          const iso = toIsoDate(r.date);
          return new Date(iso) >= today;
        });
        setRows(future);
      }
      setLoading(false);
    })();
  }, []);


const Kurstermine = () => {
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Motorrad-Grundkurs Termine 2026 Wettingen | Fahrschule me";

    const metas: { name?: string; property?: string; content: string }[] = [
      {
        name: "description",
        content:
          "Alle aktuellen Termine für den Motorrad-Grundkurs (MGK) in Wettingen. Teil 1, 2 und 3 – freie Plätze, Preise und direkte Buchung bei Fahrschule me.",
      },
      { property: "og:title", content: "Motorrad-Grundkurs Termine – Fahrschule me Wettingen" },
      {
        property: "og:description",
        content: "Verfügbare MGK-Termine 2026 in Wettingen. Jetzt online buchen.",
      },
      { property: "og:url", content: `${SITE_URL}/#/kurstermine` },
      { property: "og:type", content: "website" },
    ];

    const created: HTMLElement[] = [];
    metas.forEach((m) => {
      const sel = m.name ? `meta[name="${m.name}"]` : `meta[property="${m.property}"]`;
      let el = document.head.querySelector<HTMLMetaElement>(sel);
      if (!el) {
        el = document.createElement("meta");
        if (m.name) el.setAttribute("name", m.name);
        if (m.property) el.setAttribute("property", m.property);
        document.head.appendChild(el);
        created.push(el);
      }
      el.setAttribute("content", m.content);
    });

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = canonical?.getAttribute("href") || null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
      created.push(canonical);
    }
    canonical.setAttribute("href", `${SITE_URL}/kurstermine`);

    return () => {
      created.forEach((el) => el.remove());
      if (canonical && prevCanonical) canonical.setAttribute("href", prevCanonical);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("course_dates")
        .select("id, part, day, date, time, location, instructor, spots_available, price")
        .order("date");
      if (!error && data) {
        // Filter to today and future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const future = (data as CourseRow[]).filter((r) => {
          const iso = toIsoDate(r.date);
          return new Date(iso) >= today;
        });
        setRows(future);
      }
      setLoading(false);
    })();
  }, []);

  // Inject JSON-LD whenever rows change
  useEffect(() => {
    if (!rows.length) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(buildEventJsonLd(rows));
    script.setAttribute("data-page", "kurstermine");
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [rows]);

  const byPart = (p: number) => rows.filter((r) => r.part === p);

  const renderPart = (p: number) => {
    const items = byPart(p);
    return (
      <div key={p} className="mb-10">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
          Teil {p}
        </h2>
        {items.length === 0 ? (
          <p className="text-muted-foreground font-body">Aktuell keine Termine.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((r) => (
              <div
                key={r.id}
                className="border border-border bg-card p-4 flex items-center justify-between"
                style={{ borderRadius: "3px" }}
              >
                <div>
                  <div className="font-heading font-bold text-lg">
                    {r.day}, {r.date}
                  </div>
                  <div className="text-sm text-muted-foreground font-body">
                    {r.time} · {r.location}
                  </div>
                  <div className="text-sm font-body mt-1">
                    CHF {r.price}.–{" "}
                    <span
                      className={
                        r.spots_available > 0 ? "text-primary" : "text-destructive"
                      }
                    >
                      · {r.spots_available > 0 ? `${r.spots_available} Plätze frei` : "Ausgebucht"}
                    </span>
                  </div>
                </div>
                <Link
                  to="/grundkurs"
                  className="inline-flex items-center px-3 py-2 bg-primary text-primary-foreground font-heading font-bold text-xs uppercase tracking-wide hover:opacity-90"
                  style={{ borderRadius: "3px" }}
                >
                  Buchen
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
          Motorrad-Grundkurs Termine in Wettingen
        </h1>
        <p className="text-muted-foreground font-body mb-8">
          Alle freien MGK-Termine 2026 bei {tenantConfig.brand.name}. Der Kurs besteht aus 3 Teilen
          (je 4h) und ist für die Kategorien A1, A2 und A gesetzlich vorgeschrieben.
        </p>
        {loading ? (
          <p className="font-body">Termine werden geladen…</p>
        ) : (
          <>
            {renderPart(1)}
            {renderPart(2)}
            {renderPart(3)}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default Kurstermine;
