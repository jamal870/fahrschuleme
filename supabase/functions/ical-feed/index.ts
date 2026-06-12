// Public iCalendar feed of all course_dates – subscribe in Google/Apple Calendar
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function pad(n: number) { return String(n).padStart(2, "0"); }
function parseDdMmYyyy(s: string): { y: number; m: number; d: number } | null {
  const m = s?.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return null;
  return { d: +m[1], m: +m[2], y: +m[3] };
}
// "13:00 – 17:00" or "13:00 - 17:00" or "13:00"
function parseTime(s: string): { sh: number; sm: number; eh: number; em: number } {
  const parts = s.split(/[–-]/).map((p) => p.trim());
  const a = parts[0]?.match(/(\d{1,2}):(\d{2})/);
  const b = parts[1]?.match(/(\d{1,2}):(\d{2})/);
  const sh = a ? +a[1] : 9, sm = a ? +a[2] : 0;
  const eh = b ? +b[1] : sh + 4, em = b ? +b[2] : sm;
  return { sh, sm, eh, em };
}
function esc(s: string) { return String(s ?? "").replace(/[\\;,]/g, (c) => "\\" + c).replace(/\n/g, "\\n"); }
// Local time in Europe/Zurich – emit as floating local with TZID
function fmtLocal(y: number, mo: number, d: number, h: number, mi: number) {
  return `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(mi)}00`;
}

const VTIMEZONE = `BEGIN:VTIMEZONE
TZID:Europe/Zurich
BEGIN:STANDARD
DTSTART:19701025T030000
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:19700329T020000
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
END:VTIMEZONE`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await supabase.from("course_dates").select("*").order("date");
  if (error) return new Response("Error: " + error.message, { status: 500 });

  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const events: string[] = [];
  for (const c of data || []) {
    const dp = parseDdMmYyyy(c.date);
    if (!dp) continue;
    const t = parseTime(c.time);
    const dtStart = fmtLocal(dp.y, dp.m, dp.d, t.sh, t.sm);
    const dtEnd = fmtLocal(dp.y, dp.m, dp.d, t.eh, t.em);
    const summary = `MGK Teil ${c.part}${c.instructor ? ` (${c.instructor})` : ""}`;
    const description = `Motorrad-Grundkurs Teil ${c.part}\\nFahrlehrer: ${c.instructor || "–"}\\nPlätze frei: ${c.spots_available}\\nPreis: CHF ${c.price}`;
    events.push(
      [
        "BEGIN:VEVENT",
        `UID:${c.id}@fahrschule-me.ch`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;TZID=Europe/Zurich:${dtStart}`,
        `DTEND;TZID=Europe/Zurich:${dtEnd}`,
        `SUMMARY:${esc(summary)}`,
        `LOCATION:${esc(c.location || "Wettingen")}`,
        `DESCRIPTION:${description}`,
        "END:VEVENT",
      ].join("\r\n"),
    );
  }

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//drive-me.ch//Kurstermine//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Fahrschule-me Kurstermine",
    "X-WR-TIMEZONE:Europe/Zurich",
    VTIMEZONE,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="kurstermine.ics"',
      "Cache-Control": "public, max-age=300",
    },
  });
});
