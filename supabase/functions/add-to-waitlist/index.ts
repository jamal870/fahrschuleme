import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple rate-limit per email
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW = 60_000;
const MAX = 5;
function check(email: string): boolean {
  const now = Date.now();
  const e = rateLimit.get(email);
  if (!e || now > e.resetAt) { rateLimit.set(email, { count: 1, resetAt: now + WINDOW }); return true; }
  if (e.count >= MAX) return false;
  e.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { courseDateId, firstName, lastName, email, phone, notes } = await req.json();

    if (!courseDateId || !firstName || !lastName || !email || !phone) {
      return new Response(JSON.stringify({ error: "Fehlende Pflichtfelder" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email)) {
      return new Response(JSON.stringify({ error: "Ungültige E-Mail-Adresse" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normEmail = email.trim().toLowerCase();
    if (!check(normEmail)) {
      return new Response(JSON.stringify({ error: "Zu viele Anfragen. Bitte warte einen Moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify course exists
    const { data: course, error: cErr } = await supabase
      .from("course_dates")
      .select("id, part, date, day, time, location")
      .eq("id", courseDateId)
      .single();
    if (cErr || !course) {
      return new Response(JSON.stringify({ error: "Kurstermin nicht gefunden" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert (unique constraint prevents duplicates)
    const { data: entry, error: insErr } = await supabase
      .from("waitlist")
      .insert({
        course_date_id: courseDateId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: normEmail,
        phone: phone.trim(),
        notes: notes?.trim() || null,
      })
      .select("id")
      .single();

    if (insErr) {
      if (insErr.code === "23505") {
        return new Response(JSON.stringify({ error: "Du stehst bereits auf der Warteliste für diesen Kurs." }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw insErr;
    }

    // Notify admin (best-effort)
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}`, apikey: anonKey },
        body: JSON.stringify({
          templateName: "waitlist-admin-notification",
          idempotencyKey: `waitlist-${entry.id}`,
          templateData: {
            coursePart: course.part,
            courseDate: course.date,
            courseDay: course.day,
            courseTime: course.time,
            courseLocation: course.location,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normEmail,
            phone: phone.trim(),
            notes: notes?.trim() || "",
          },
        }),
      });
    } catch (e) {
      console.error("[add-to-waitlist] Admin notification failed:", e);
    }

    return new Response(JSON.stringify({ id: entry.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[add-to-waitlist] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
