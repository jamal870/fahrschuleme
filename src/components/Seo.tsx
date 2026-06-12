import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  path: string; // e.g. "/kurstermine" — appended to https://fahrschule-me.ch
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  image?: string;
}

const SITE_URL = "https://fahrschule-me.ch";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Setzt per-Seite SEO-Tags (title, description, canonical, og:*, twitter:*, JSON-LD).
 * Funktioniert für JS-Crawler (Google). Social-Crawler (LinkedIn, WhatsApp, FB)
 * sehen die Fallback-Tags aus index.html, da sie kein JavaScript ausführen.
 */
const Seo = ({ title, description, path, jsonLd, image = DEFAULT_IMAGE }: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

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
