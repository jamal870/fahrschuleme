import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter (per isolate lifetime)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 bookings per email per minute

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(email);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Fetch active promotion discount price for a given category (or null)
async function getActivePromoPrice(supabase: any, category: string): Promise<number | null> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("promotions")
    .select("discount_price, starts_at, ends_at")
    .eq("category", category)
    .eq("active", true)
    .not("discount_price", "is", null);
  if (error || !data) return null;
  const match = data.find((p: any) =>
    (!p.starts_at || p.starts_at <= nowIso) &&
    (!p.ends_at || p.ends_at >= nowIso)
  );
  return match ? Number(match.discount_price) : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const {
      bookingType, firstName, lastName, email, phone, address,
      faNumber, birthDate, paymentMethod, totalPrice,
      courseDateIds, // for grundkurs: array of course_date IDs
      fahrstundenServiceId, fahrstundenPackageId, instructor, // for fahrstunde
    } = body;

    // --- Input validation ---
    if (!bookingType || !firstName || !lastName || !email || !phone || !address || !faNumber || !birthDate || !paymentMethod || totalPrice == null) {
      return new Response(JSON.stringify({ error: "Fehlende Pflichtfelder" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Ungültige E-Mail-Adresse" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate booking type
    if (!["grundkurs", "fahrstunde"].includes(bookingType)) {
      return new Response(JSON.stringify({ error: "Ungültiger Buchungstyp" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Derive status server-side based on payment method (never trust client)
    const pmLower = String(paymentMethod || "").toLowerCase();
    const isOnlinePayment = pmLower.includes("stripe") || pmLower.includes("twint") || pmLower.includes("online") || pmLower.includes("karte");
    const status = isOnlinePayment ? "pending_payment" : "confirmed";

    // Rate limit by email
    if (!checkRateLimit(email.toLowerCase().trim())) {
      return new Response(JSON.stringify({ error: "Zu viele Buchungen. Bitte warte einen Moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- For grundkurs: validate course dates exist and have spots ---
    if (bookingType === "grundkurs") {
      if (!Array.isArray(courseDateIds) || courseDateIds.length === 0) {
        return new Response(JSON.stringify({ error: "Keine Kurstermine ausgewählt" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify all courses exist, have spots, and fetch authoritative prices
      const { data: courses, error: coursesError } = await supabase
        .from("course_dates")
        .select("id, price, spots_available, part")
        .in("id", courseDateIds);

      if (coursesError || !courses || courses.length !== courseDateIds.length) {
        return new Response(JSON.stringify({ error: "Einer oder mehrere Kurstermine sind ungültig" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const noSpots = courses.find((c: any) => c.spots_available <= 0);
      if (noSpots) {
        return new Response(JSON.stringify({ error: `Kein Platz mehr verfügbar für Kursteil ${noSpots.part}` }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Use server-side price (never trust client)
      const serverTotal = courses.reduce((sum: number, c: any) => sum + Number(c.price), 0);

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          booking_type: bookingType,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          fa_number: faNumber.trim(),
          birth_date: birthDate.trim(),
          payment_method: paymentMethod,
          total_price: serverTotal,
          status,
        })
        .select("id")
        .single();

      if (bookingError) throw bookingError;

      // Insert booking items (trigger auto_decrement_spots will fire)
      for (const courseId of courseDateIds) {
        const { error: itemError } = await supabase
          .from("booking_items")
          .insert({ booking_id: booking.id, course_date_id: courseId });
        if (itemError) throw itemError;
      }

      // Only send admin notification for non-Stripe bookings (cash etc.)
      // Stripe bookings get notified after payment confirmation via webhook
      if (status !== "pending_payment") {
        const courseSummary = courses.map((c: any) => `MGK Teil ${c.part}`).join(', ');
        const now = new Date();
        const bookingDateStr = now.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const adminEmailResponse = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceKey}`,
            "apikey": serviceKey,
          },
          body: JSON.stringify({
            templateName: 'admin-booking-notification',
            idempotencyKey: `admin-notify-${booking.id}`,
            templateData: {
              bookingId: booking.id,
              bookingType,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim(),
              address: address.trim(),
              birthDate: birthDate.trim(),
              faNumber: faNumber.trim(),
              paymentMethod,
              totalPrice: serverTotal.toFixed(2),
              bookingDate: bookingDateStr,
              items: courseSummary,
            },
          }),
        });

        if (!adminEmailResponse.ok) {
          console.error("[CREATE-BOOKING] Admin notification failed", {
            status: adminEmailResponse.status,
            bookingId: booking.id,
            bookingType,
            body: await adminEmailResponse.text(),
          });
        }
      }

      return new Response(JSON.stringify({ bookingId: booking.id, totalPrice: serverTotal }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Fahrstunde booking ---
    if (bookingType === "fahrstunde") {
      // Validate service exists and get server-side price
      let serverPrice = 0;
      let serviceName = "";

      if (fahrstundenPackageId) {
        const { data: pkg, error: pkgError } = await supabase
          .from("fahrstunden_packages")
          .select("id, total_price, name")
          .eq("id", fahrstundenPackageId)
          .single();
        if (pkgError || !pkg) {
          return new Response(JSON.stringify({ error: "Ungültiges Paket" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        serverPrice = Number(pkg.total_price);
        serviceName = pkg.name;
      } else if (fahrstundenServiceId) {
        const { data: svc, error: svcError } = await supabase
          .from("fahrstunden_services")
          .select("id, price, name")
          .eq("id", fahrstundenServiceId)
          .single();
        if (svcError || !svc) {
          return new Response(JSON.stringify({ error: "Ungültiger Service" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        serverPrice = Number(svc.price);
        serviceName = svc.name;
      } else {
        return new Response(JSON.stringify({ error: "Kein Service oder Paket ausgewählt" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          booking_type: bookingType,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          fa_number: faNumber.trim(),
          birth_date: birthDate.trim(),
          payment_method: paymentMethod,
          total_price: serverPrice,
          status,
        })
        .select("id")
        .single();

      if (bookingError) throw bookingError;

      // Insert booking item
      const { error: itemError } = await supabase
        .from("booking_items")
        .insert({
          booking_id: booking.id,
          fahrstunden_service_id: fahrstundenServiceId || null,
          fahrstunden_package_id: fahrstundenPackageId || null,
          instructor: instructor || null,
        });
      if (itemError) throw itemError;

      // Only send admin notification for non-Stripe bookings
      if (status !== "pending_payment") {
        const fNow = new Date();
        const fBookingDateStr = fNow.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
        const fSupabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const fServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const fAdminEmailResponse = await fetch(`${fSupabaseUrl}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${fServiceKey}`,
            "apikey": fServiceKey,
          },
          body: JSON.stringify({
            templateName: 'admin-booking-notification',
            idempotencyKey: `admin-notify-${booking.id}`,
            templateData: {
              bookingId: booking.id,
              bookingType,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim(),
              address: address.trim(),
              birthDate: birthDate.trim(),
              faNumber: faNumber.trim(),
              paymentMethod,
              totalPrice: serverPrice.toFixed(2),
              bookingDate: fBookingDateStr,
              items: serviceName,
            },
          }),
        });

        if (!fAdminEmailResponse.ok) {
          console.error("[CREATE-BOOKING] Admin notification failed", {
            status: fAdminEmailResponse.status,
            bookingId: booking.id,
            bookingType,
            body: await fAdminEmailResponse.text(),
          });
        }
      }

      return new Response(JSON.stringify({ bookingId: booking.id, totalPrice: serverPrice }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ungültiger Buchungstyp" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-BOOKING] Error:", msg);
    return new Response(JSON.stringify({ error: "Buchung fehlgeschlagen. Bitte versuche es erneut oder kontaktiere uns." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
