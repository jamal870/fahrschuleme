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
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) throw new Error("No stripe-signature header");

    const event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);

    console.log(`[STRIPE-WEBHOOK] Event type: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (!bookingId) {
        console.error("[STRIPE-WEBHOOK] No booking_id in session metadata");
        return new Response(JSON.stringify({ received: true }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }

      console.log(`[STRIPE-WEBHOOK] Confirming booking ${bookingId}`);

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { auth: { persistSession: false } }
      );

      // Update booking status to confirmed
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId)
        .eq("status", "pending_payment");

      if (updateError) {
        console.error("[STRIPE-WEBHOOK] Update error:", updateError);
        throw updateError;
      }

      // Fetch booking for email
      const { data: booking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (booking) {
        // Fetch booking items
        const { data: items } = await supabase
          .from("booking_items")
          .select("course_date_id")
          .eq("booking_id", bookingId);

        const courseIds = items?.map((i: any) => i.course_date_id).filter(Boolean) || [];
        let courses: any[] = [];
        if (courseIds.length > 0) {
          const { data: courseData } = await supabase
            .from("course_dates")
            .select("*")
            .in("id", courseIds);
          courses = courseData || [];
        }

        const total = courses.reduce((s: number, c: any) => s + (c.price || 0), 0);

        // Send confirmation email
        try {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "booking-confirmation",
              recipientEmail: booking.email,
              idempotencyKey: `booking-confirm-${bookingId}`,
              templateData: {
                firstName: booking.first_name,
                lastName: booking.last_name,
                address: booking.address,
                birthDate: booking.birth_date,
                faNumber: booking.fa_number,
                phone: booking.phone,
                email: booking.email,
                courses: courses.map((c: any) => ({
                  part: c.part,
                  date: c.date,
                  time: c.time,
                  location: c.location,
                  price: c.price,
                })),
                totalPrice: total.toFixed(2),
                paymentMethod: booking.payment_method,
                bookingId: bookingId,
                bookingDate: new Date().toLocaleDateString("de-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              },
            },
          });
          console.log(`[STRIPE-WEBHOOK] Confirmation email sent for ${bookingId}`);
        } catch (emailErr) {
          console.error("[STRIPE-WEBHOOK] Email error:", emailErr);
        }

        // Send admin notification now that payment is confirmed
        try {
          const bookingItems = await supabase
            .from("booking_items")
            .select("course_date_id, fahrstunden_service_id, fahrstunden_package_id")
            .eq("booking_id", bookingId);

          let itemsSummary = "";
          if (courses.length > 0) {
            itemsSummary = courses.map((c: any) => `MGK Teil ${c.part}`).join(', ');
          } else {
            // Fahrstunde - get service/package name
            const item = bookingItems.data?.[0];
            if (item?.fahrstunden_package_id) {
              const { data: pkg } = await supabase.from("fahrstunden_packages").select("name").eq("id", item.fahrstunden_package_id).single();
              itemsSummary = pkg?.name || "Fahrstunden-Paket";
            } else if (item?.fahrstunden_service_id) {
              const { data: svc } = await supabase.from("fahrstunden_services").select("name").eq("id", item.fahrstunden_service_id).single();
              itemsSummary = svc?.name || "Fahrstunde";
            }
          }

          const adminBookingDate = new Date().toLocaleDateString("de-CH", {
            day: "numeric", month: "long", year: "numeric",
          });

          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "admin-booking-notification",
              idempotencyKey: `admin-notify-${bookingId}`,
              templateData: {
                bookingId: bookingId,
                bookingType: booking.booking_type,
                firstName: booking.first_name,
                lastName: booking.last_name,
                email: booking.email,
                phone: booking.phone,
                address: booking.address,
                birthDate: booking.birth_date,
                faNumber: booking.fa_number,
                paymentMethod: booking.payment_method,
                totalPrice: (booking.total_price || 0).toFixed(2),
                bookingDate: adminBookingDate,
                items: itemsSummary,
              },
            },
          });
          console.log(`[STRIPE-WEBHOOK] Admin notification sent for ${bookingId}`);
        } catch (adminEmailErr) {
          console.error("[STRIPE-WEBHOOK] Admin notification error:", adminEmailErr);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[STRIPE-WEBHOOK] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
