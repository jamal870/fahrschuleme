import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  path: string; // e.g. "/kurstermine" — appended to https://www.fahrschule-me.ch
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  image?: string;
  noindex?: boolean;
}

const SITE_URL = "https://www.fahrschule-me.ch";
/**
 * @id der Firma. Die Firma (DrivingSchool) ist genau einmal in index.html
 * definiert und wird in jede Seite kopiert; seitenspezifische Blöcke
 * (FAQPage, Breadcrumbs, Events, Offers) verweisen per @id darauf, statt
 * die Firma erneut zu beschreiben.
 */
export const BUSINESS_ID = "https://www.fahrschule-me.ch/#business";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Kanonische URL einer Route. Netlify liefert die vorgerenderten Seiten
 * als /<route>/index.html aus und leitet /<route> per 301 auf /<route>/
 * um ("Pretty URLs"). Canonical, og:url, Sitemap und JSON-LD nennen
 * deshalb einheitlich die Variante mit Schrägstrich am Ende.
 */
export const canonicalUrl = (path: string): string => {
  const clean = path.replace(/\/+$/, "");
  return clean === "" ? `${SITE_URL}/` : `${SITE_URL}${clean}/`;
};

/**
 * Setzt per-Seite SEO-Tags (title, description, canonical, og:*, twitter:*, JSON-LD).
 * Funktioniert für JS-Crawler (Google). Social-Crawler (LinkedIn, WhatsApp, FB)
 * sehen die Fallback-Tags aus index.html, da sie kein JavaScript ausführen.
 */
const Seo = ({ title, description, path, jsonLd, image = DEFAULT_IMAGE, noindex }: SeoProps) => {
  const url = canonicalUrl(path);
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default Seo;
