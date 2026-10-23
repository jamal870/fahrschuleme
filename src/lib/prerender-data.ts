import { createContext, useContext } from "react";

// Data fetched once at build time by scripts/prerender.mjs and handed to
// renderRoute(), so pages that normally load from Supabase on mount still
// ship real content in the static HTML. In the browser there is no
// provider, so pages keep fetching live as before.
export interface PrerenderData {
  team?: unknown[];
  courseDates?: unknown[];
  promotions?: unknown[];
}

export const PrerenderDataContext = createContext<PrerenderData | null>(null);

export const usePrerenderData = () => useContext(PrerenderDataContext);
