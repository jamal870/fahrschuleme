// Pushes a course_date entry to Jamal's Google Calendar via the Lovable connector gateway.
// Body: { courseDateId: string, action: "upsert" | "delete" }
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GCAL_BASE = "https://www.googleapis.com/calendar/v3";
const CALENDAR_ID = "primary";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") ?? "608631487176-tn1kechi71mr1cbegngqo8qha5s6legk.apps.googleusercontent.com";

function parseSwiss(d: string) {
  const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return null;
  return { d: +m[1], mo: +m[2], y: +m[3] };
}
function parseTime(t: string) {
  const parts = t.split(/[–-]/).map((p) => p.trim());
  const a = parts[0]?.match(/(\d{1,2}):(\d{2})/);
  const b = parts[1]?.match(/(\d{1,2}):(\d{2})/);
  return {
    sh: a ? +a[1] : 9, sm: a ? +a[2] : 0,
    eh: b ? +b[1] : (a ? +a[1] + 4 : 13), em: b ? +b[2] : (a ? +a[2] : 0),
  };
}
function isoLocal(y: number, mo: number, d: number, h: number, mi: number) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${y}-${p(mo)}-${p(d)}T${p(h)}:${p(mi)}:00`;
}

let cachedToken: { token: string; expiresAt: number } | null = null;
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_REFRESH_TOKEN");
  if (!clientSecret || !refreshToken) {
    throw new Error("GOOGLE_CLIENT_SECRET or GOOGLE_REFRESH_TOKEN not configured");
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`OAuth token refresh ${res.status}: ${text}`);
  const json = JSON.parse(text);
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return cachedToken.token;
}

async function gcall(path: string, method: string, body?: unknown) {
  const token = await getAccessToken();
  const res = await fetch(`${GCAL_BASE}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GCal ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { courseDateId, action } = await req.json();
    if (!courseDateId || !action) throw new Error("courseDateId and action required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: course, error } = await supabase
      .from("course_dates").select("*").eq("id", courseDateId).maybeSingle();
    if (error) throw error;

    if (action === "delete") {
      if (course?.gcal_event_id) {
        try { await gcall(`/calendars/${CALENDAR_ID}/events/${course.gcal_event_id}`, "DELETE"); }
        catch (e) { console.warn("delete gcal event failed:", (e as Error).message); }
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!course) throw new Error("course not found");
    const dp = parseSwiss(course.date);
    if (!dp) throw new Error("invalid course date");
    const t = parseTime(course.time);

    const summary = `MGK Teil ${course.part}${course.instructor ? ` (${course.instructor})` : ""}`;
    const description = [
      `Motorrad-Grundkurs Teil ${course.part}`,
      `Fahrlehrer: ${course.instructor || "–"}`,
      `Plätze: ${course.spots_available}`,
      `Preis: CHF ${course.price}`,
      `Course-ID: ${course.id}`,
    ].join("\n");

    const eventBody = {
      summary,
      description,
      location: course.location || "Wettingen",
      start: { dateTime: isoLocal(dp.y, dp.mo, dp.d, t.sh, t.sm), timeZone: "Europe/Zurich" },
      end:   { dateTime: isoLocal(dp.y, dp.mo, dp.d, t.eh, t.em), timeZone: "Europe/Zurich" },
      transparency: "opaque", // blocks time as Busy
    };

    let eventId = course.gcal_event_id as string | null;
    if (eventId) {
      try {
        await gcall(`/calendars/${CALENDAR_ID}/events/${eventId}`, "PUT", eventBody);
      } catch (e) {
        console.warn("PUT failed, creating new:", (e as Error).message);
        const created = await gcall(`/calendars/${CALENDAR_ID}/events`, "POST", eventBody);
        eventId = created.id;
      }
    } else {
      const created = await gcall(`/calendars/${CALENDAR_ID}/events`, "POST", eventBody);
      eventId = created.id;
    }

    if (eventId && eventId !== course.gcal_event_id) {
      await supabase.from("course_dates").update({ gcal_event_id: eventId }).eq("id", course.id);
    }

    return new Response(JSON.stringify({ ok: true, eventId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[sync-course-to-gcal]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
