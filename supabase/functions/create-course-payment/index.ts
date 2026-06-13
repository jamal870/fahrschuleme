import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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

    // Use service role to fetch authoritative prices from DB
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { bookingId, email, customerName } = await req.json();

    if (!bookingId || !email) {
      throw new Error("Missing required fields: bookingId, email");
    }

    // Verify booking exists, is pending_payment, AND email matches
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, status, email, total_price")
      .eq("id", bookingId)
      .eq("status", "pending_payment")
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found or not in pending_payment status");
    }

    // Verify caller's email matches booking email (prevents unauthorized access)
    if (booking.email !== email) {
      throw new Error("Email does not match booking");
    }

    // Fetch booking items to get course IDs
    const { data: items } = await supabase
      .from("booking_items")
      .select("course_date_id")
      .eq("booking_id", bookingId);

    const courseIds = items?.map((i: any) => i.course_date_id).filter(Boolean) || [];
    if (courseIds.length === 0) {
      throw new Error("No course items found for this booking");
    }

    // Fetch authoritative prices from database (NEVER trust client prices)
    const { data: courses, error: coursesError } = await supabase
      .from("course_dates")
      .select("id, part, date, time, price")
      .in("id", courseIds);

    if (coursesError || !courses || courses.length === 0) {
      throw new Error("Could not fetch course data from database");
    }

    const bookedTotalCents = Math.round(Number(booking.total_price) * 100);
    const courseCount = courses.length;
    const defaultCourseSumCents = courses.reduce((sum: number, course: any) => sum + Math.round(Number(course.price) * 100), 0);

    // Use the already server-calculated booking total so active promotions are respected in checkout.
    // If the booking total differs from the plain course sum, distribute the booked total across line items.
    const unitAmounts = (() => {
      if (courseCount === 0) return [] as number[];
      if (bookedTotalCents <= 0 || bookedTotalCents === defaultCourseSumCents) {
        return courses.map((course: any) => Math.round(Number(course.price) * 100));
      }

      const baseAmount = Math.floor(bookedTotalCents / courseCount);
      const remainder = bookedTotalCents - baseAmount * courseCount;

      return courses.map((_: any, index: number) => baseAmount + (index < remainder ? 1 : 0));
    })();

    const lineItems = courses.map((course: any, index: number) => ({
      price_data: {
        currency: "chf",
        product_data: {
          name: `MGK Teil ${course.part}`,
          description: `${course.date} – ${course.time}`,
        },
        unit_amount: unitAmounts[index],
      },
      quantity: 1,
    }));

    // Check if customer already exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://buchen.drive-me.ch";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: lineItems,
      mode: "payment",
       success_url: `${origin}/#/buchung-erfolgreich?booking_id=${bookingId}`,
       cancel_url: `${origin}/#/grundkurs`,
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
    return new Response(JSON.stringify({ error: "Zahlung konnte nicht initialisiert werden. Bitte versuche es erneut." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
