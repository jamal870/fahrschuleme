// Daily cron: sends admin reminder email for courses starting in REMINDER_DAYS days.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REMINDER_DAYS = 2; // 2 Tage vor Kursstart

// Parse "TT.MM.JJJJ" -> Date (00:00 local)
function parseSwissDate(s: string): Date | null {
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / 86400000);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { data: courses, error } = await supabase
      .from("course_dates")
      .select("id, part, date, day, time, location, instructor");
    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueCourses = (courses || []).filter((c: any) => {
      const d = parseSwissDate(c.date);
      if (!d) return false;
      return daysBetween(today, d) === REMINDER_DAYS;
    });

    console.log(`[send-course-reminders] Found ${dueCourses.length} courses in ${REMINDER_DAYS} days`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    let sent = 0;
    for (const course of dueCourses) {
      // fetch confirmed participants
      const { data: items } = await supabase
        .from("booking_items")
        .select("bookings!inner(first_name, last_name, phone, payment_method, status)")
        .eq("course_date_id", course.id);

      const participants = (items || [])
        .map((it: any) => it.bookings)
        .filter((b: any) => b && b.status === "confirmed")
        .map((b: any) => ({
          firstName: b.first_name,
          lastName: b.last_name,
          phone: b.phone,
          paid: !(b.payment_method || "").toLowerCase().includes("bar"),
        }));

      const idempotencyKey = `course-reminder-${course.id}-${today.toISOString().slice(0, 10)}`;

      const res = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          templateName: "course-reminder",
          idempotencyKey,
          templateData: {
            coursePart: course.part,
            courseDate: course.date,
            courseDay: course.day,
            courseTime: course.time,
            courseLocation: course.location,
            instructor: course.instructor,
            daysUntil: REMINDER_DAYS,
            participantCount: participants.length,
            participants,
          },
        }),
      });

      if (res.ok) sent++;
      else console.error(`[send-course-reminders] Failed for ${course.id}:`, await res.text());
    }

    return new Response(
      JSON.stringify({ checked: courses?.length || 0, due: dueCourses.length, sent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[send-course-reminders] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
