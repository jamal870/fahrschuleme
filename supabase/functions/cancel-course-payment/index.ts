// Wird von der Abbruchseite (/buchung-abgebrochen) aufgerufen, wenn der Kunde
// den Stripe-Checkout verlässt: gibt die reservierten Kursplätze sofort frei,
// statt bis zum Ablauf der Stripe-Session zu warten. Die Buchungs-ID ist eine
// nicht erratbare UUID, die nur der Buchende kennt; betroffen sein können
// ausschliesslich Buchungen im Status "pending_payment".
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { handleFailedPayment, releaseStalePendingBookings } from "../_shared/release-pending-booking.ts";

// Die noch offene Stripe-Session beenden, damit der Kunde nicht per
// "Zurück"-Taste doch noch auf einer bereits freigegebenen Buchung bezahlt.
async function expireOpenStripeSession(bookingId: string) {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) return;
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const sessions = await stripe.checkout.sessions.list({
    limit: 20,
    created: { gte: Math.floor(Date.now() / 1000) - 2 * 60 * 60 },
  });
  for (const s of sessions.data) {
    if (s.metadata?.booking_id === bookingId && s.status === "open") {
      await stripe.checkout.sessions.expire(s.id);
    }
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { bookingId } = await req.json();
    if (typeof bookingId !== "string" || !UUID_RE.test(bookingId)) {
      return new Response(JSON.stringify({ error: "Ungültige Buchungs-ID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const released = await handleFailedPayment(supabase, supabaseUrl, serviceKey, bookingId, "abgebrochen");

    if (released) {
      try {
        await expireOpenStripeSession(bookingId);
      } catch (e) {
        console.warn("[CANCEL-COURSE-PAYMENT] Stripe session expire failed", (e as Error).message);
      }
    }

    // Gelegenheit nutzen, um liegengebliebene Reservierungen aufzuräumen.
    await releaseStalePendingBookings(supabase, supabaseUrl, serviceKey);

    return new Response(JSON.stringify({ ok: true, released }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CANCEL-COURSE-PAYMENT] Error:", msg);
    return new Response(JSON.stringify({ error: "Abbruch konnte nicht verarbeitet werden." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
