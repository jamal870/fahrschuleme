// Google Places API (New) - fetch reviews for the configured place.
// Key bleibt serverseitig. Antwort wird 6h gecached via Cache-Control.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
  const placeId = Deno.env.get("GOOGLE_PLACE_ID");

  if (!apiKey || !placeId) {
    return new Response(
      JSON.stringify({ error: "missing_config", detail: "GOOGLE_PLACES_API_KEY oder GOOGLE_PLACE_ID nicht gesetzt." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

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
      return new Response(
        JSON.stringify({ error: "google_api_error", status: res.status, detail: txt }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=21600, s-maxage=21600",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "fetch_failed", detail: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
