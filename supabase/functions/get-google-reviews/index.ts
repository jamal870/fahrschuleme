// Google Places API (New) - fetch reviews for the configured place.
// Key bleibt serverseitig. Ergebnis wird 24h in der DB gecacht, damit das
// Google-Tageskontingent (100 Requests/Tag) nicht überschritten wird.
// Bei Quota-/API-Fehlern wird der letzte gespeicherte Stand ausgeliefert.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

interface PlaceReview {
  rating: number;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
}

interface PlaceResponse {
  rating?: number;
  userRatingCount?: number;
  reviews?: PlaceReview[];
  googleMapsUri?: string;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

const json = (body: unknown, status = 200, maxAge = 21600) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
  // Bereinigt versehentliche Prefixe wie "Place ID: " und Whitespace
  const placeId = Deno.env.get("GOOGLE_PLACE_ID")?.replace(/^.*?(ChIJ[A-Za-z0-9_-]+).*$/s, "$1").trim();

  if (!apiKey || !placeId) {
    return json({ error: "missing_config", detail: "GOOGLE_PLACES_API_KEY oder GOOGLE_PLACE_ID nicht gesetzt." }, 500, 0);
  }

  // 1) Cache lesen
  const { data: cached } = await admin
    .from("google_reviews_cache")
    .select("payload, fetched_at")
    .eq("id", placeId)
    .maybeSingle();

  const cacheAge = cached?.fetched_at ? Date.now() - new Date(cached.fetched_at).getTime() : Infinity;
  if (cached && cacheAge < CACHE_TTL_MS) {
    return json(cached.payload);
  }

  // 2) Frisch laden
  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=de`;
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri",
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("google_api_error", res.status, txt);
      // Stale-Fallback: lieber alte Bewertungen als gar keine
      if (cached) return json(cached.payload);
      return json({ rating: null, total: 0, mapsUrl: null, reviews: [], unavailable: true }, 200, 300);
    }

    const data: PlaceResponse = await res.json();
    const payload = {
      rating: data.rating ?? null,
      total: data.userRatingCount ?? 0,
      mapsUrl: data.googleMapsUri ?? null,
      reviews: (data.reviews ?? []).slice(0, 5).map((r) => ({
        rating: r.rating,
        text: r.text?.text ?? r.originalText?.text ?? "",
        author: r.authorAttribution?.displayName ?? "Google Nutzer",
        photo: r.authorAttribution?.photoUri ?? null,
        relativeTime: r.relativePublishTimeDescription ?? "",
        publishedAt: r.publishTime ?? null,
      })),
    };

    await admin
      .from("google_reviews_cache")
      .upsert({ id: placeId, payload, fetched_at: new Date().toISOString() });

    return json(payload);
  } catch (e) {
    console.error("fetch_failed", e);
    if (cached) return json(cached.payload);
    return json({ rating: null, total: 0, mapsUrl: null, reviews: [], unavailable: true }, 200, 300);
  }
});
