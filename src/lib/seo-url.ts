export const SITE_URL = "https://www.fahrschule-me.ch";

// Netlify serves the prerendered directory index at /route/. Canonicals
// must use that final URL, rather than the /route URL that redirects to it.
export function canonicalUrl(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  return `${SITE_URL}${pathname || ""}/`;
}
