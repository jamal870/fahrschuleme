import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { bookingId, email, customerName, courses, totalPrice } = await req.json();

    if (!bookingId || !email || !courses || !totalPrice) {
      throw new Error("Missing required fields: bookingId, email, courses, totalPrice");
    }

    // Check if customer already exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Build line items from selected courses
    const lineItems = courses.map((course: { part: number; date: string; time: string; price: number }) => ({
      price_data: {
        currency: "chf",
        product_data: {
          name: `MGK Teil ${course.part}`,
          description: `${course.date} – ${course.time}`,
        },
        unit_amount: Math.round(course.price * 100), // Stripe expects cents
      },
      quantity: 1,
    }));

    const origin = req.headers.get("origin") || "https://buchen.drive-me.ch";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/buchung-erfolgreich?booking_id=${bookingId}`,
      cancel_url: `${origin}/grundkurs-buchen`,
      metadata: {
        booking_id: bookingId,
        customer_name: customerName || "",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-COURSE-PAYMENT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
