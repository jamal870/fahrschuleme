// Admin-only: manually add a participant to a course outside the regular booking flow.
// Verifies the caller is admin, creates a booking + booking_item (trigger decrements spots),
// optionally sends confirmation email, and syncs GCal.
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // --- Auth + admin check ---
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Nicht authentifiziert" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Ungültige Session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Kein Admin-Zugriff" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Input ---
    const body = await req.json();
    const {
      courseDateId,
      firstName, lastName, email, phone, address,
      postalCode, city, faNumber, birthDate,
      paymentMethod, price, sendEmail,
    } = body;

    if (!courseDateId || !firstName || !lastName || !email || !phone || !address
      || !faNumber || !birthDate || !paymentMethod || price == null) {
      return new Response(JSON.stringify({ error: "Fehlende Pflichtfelder" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Ungültige E-Mail" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const serverPrice = Math.max(0, Number(price));
    if (!Number.isFinite(serverPrice)) {
      return new Response(JSON.stringify({ error: "Ungültiger Preis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify course exists + spots
    const { data: course, error: courseErr } = await admin
      .from("course_dates").select("*").eq("id", courseDateId).maybeSingle();
    if (courseErr || !course) {
      return new Response(JSON.stringify({ error: "Kurstermin nicht gefunden" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (course.spots_available <= 0) {
      return new Response(JSON.stringify({ error: "Kein Platz mehr verfügbar" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create booking (status confirmed — manual admin entry)
    const { data: booking, error: bErr } = await admin
      .from("bookings")
      .insert({
        booking_type: "grundkurs",
        first_name: String(firstName).trim(),
        last_name: String(lastName).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        address: String(address).trim(),
        postal_code: postalCode ? String(postalCode).trim() : null,
        city: city ? String(city).trim() : null,
        fa_number: String(faNumber).trim(),
        birth_date: String(birthDate).trim(),
        payment_method: String(paymentMethod),
        total_price: serverPrice,
        status: "confirmed",
        payment_status: String(paymentMethod).toLowerCase().includes("bar") ? "pending" : "paid",
      })
      .select("id").single();
    if (bErr) throw bErr;

    // Booking item (trigger decrements spots)
    const { error: itemErr } = await admin
      .from("booking_items")
      .insert({ booking_id: booking.id, course_date_id: courseDateId });
    if (itemErr) throw itemErr;

    // Optional confirmation email
    if (sendEmail) {
      try {
        const now = new Date();
        const bookingDateStr = now.toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" });
        await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceKey}`,
            "apikey": serviceKey,
          },
          body: JSON.stringify({
            templateName: "booking-confirmation",
            recipientEmail: String(email).trim().toLowerCase(),
            idempotencyKey: `manual-add-${booking.id}`,
            templateData: {
              firstName: String(firstName).trim(),
              lastName: String(lastName).trim(),
              address: String(address).trim(),
              postalCode: postalCode ? String(postalCode).trim() : undefined,
              city: city ? String(city).trim() : undefined,
              birthDate: String(birthDate).trim(),
              faNumber: String(faNumber).trim(),
              phone: String(phone).trim(),
              email: String(email).trim().toLowerCase(),
              courses: [{
                part: course.part, date: course.date, time: course.time,
                location: course.location, price: serverPrice,
              }],
              totalPrice: serverPrice.toFixed(2),
              paymentMethod,
              bookingId: booking.id,
              bookingDate: bookingDateStr,
            },
          }),
        });
      } catch (e) {
        console.warn("[admin-add-participant] email failed", (e as Error).message);
      }
    }

    // Sync GCal (fire and forget)
    try {
      await fetch(`${supabaseUrl}/functions/v1/sync-course-to-gcal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
          "apikey": serviceKey,
        },
        body: JSON.stringify({ courseDateId, action: "upsert" }),
      });
    } catch (e) {
      console.warn("[admin-add-participant] gcal sync failed", (e as Error).message);
    }

    return new Response(JSON.stringify({ ok: true, bookingId: booking.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin-add-participant]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
