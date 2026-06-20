// Admin-only: cancel or delete a booking. Cancel: status=cancelled, restore spots, notify user.
// Delete: hard-delete bookings (cascades booking_items) after restoring spots.
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

    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return j({ error: "Nicht authentifiziert" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return j({ error: "Ungültige Session" }, 401);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return j({ error: "Kein Admin-Zugriff" }, 403);

    const body = await req.json();
    const { bookingId, mode, reason, notify } = body as {
      bookingId: string; mode: "cancel" | "delete"; reason?: string; notify?: boolean;
    };
    if (!bookingId || !mode) return j({ error: "Fehlende Parameter" }, 400);

    // Load booking + items + courses
    const { data: booking, error: bErr } = await admin
      .from("bookings").select("*").eq("id", bookingId).maybeSingle();
    if (bErr || !booking) return j({ error: "Buchung nicht gefunden" }, 404);

    if (mode === "cancel" && booking.status === "cancelled") {
      return j({ error: "Buchung ist bereits storniert" }, 400);
    }

    const { data: items } = await admin
      .from("booking_items").select("course_date_id").eq("booking_id", bookingId);
    const courseIds = (items || []).map((i: any) => i.course_date_id).filter(Boolean) as string[];

    let courses: any[] = [];
    if (courseIds.length) {
      const { data: cd } = await admin
        .from("course_dates").select("id, part, day, date, time, location").in("id", courseIds);
      courses = cd || [];
    }

    // Only restore spots if booking was confirmed (i.e. spots were decremented)
    const shouldRestore = booking.status === "confirmed";

    if (mode === "cancel") {
      const { error: updErr } = await admin
        .from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
      if (updErr) throw updErr;
    } else {
      // delete booking_items first (in case no cascade), then booking
      await admin.from("course_signatures").delete().eq("booking_id", bookingId);
      await admin.from("booking_items").delete().eq("booking_id", bookingId);
      const { error: delErr } = await admin.from("bookings").delete().eq("id", bookingId);
      if (delErr) throw delErr;
    }

    if (shouldRestore) {
      for (const cid of courseIds) {
        await admin.rpc("increment_spots", { course_id: cid });
      }
    }

    // GCal sync (best effort)
    for (const cid of courseIds) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/sync-course-to-gcal`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}`, "apikey": serviceKey },
          body: JSON.stringify({ courseDateId: cid, action: "upsert" }),
        });
      } catch (_) { /* ignore */ }
    }

    // Email only on cancel
    if (mode === "cancel" && notify !== false && booking.email) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}`, "apikey": serviceKey },
          body: JSON.stringify({
            templateName: "booking-cancelled",
            recipientEmail: booking.email,
            idempotencyKey: `cancel-${bookingId}-${Date.now()}`,
            templateData: {
              firstName: booking.first_name,
              courses: courses.map((c) => ({
                part: c.part, day: c.day, date: c.date, time: c.time, location: c.location,
              })),
              reason: reason || null,
              bookingId,
            },
          }),
        });
      } catch (e) {
        console.warn("[admin-cancel-booking] email failed", (e as Error).message);
      }
    }

    return j({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin-cancel-booking]", msg);
    return j({ error: msg }, 500);
  }
});

function j(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
