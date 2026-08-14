// Admin-only: imports course dates from the asa/SARI VKU-PGS iframe interface.
// Read-only towards asa. Never deletes courses, never touches bookings or spots of booked courses.
// Body: { mode: "preview" | "apply", section?: "pgs" | "vku", defaultPrice?: number, ids?: string[] }
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// iframe-ID der Fahrschule (öffentlich, aus den asa-Benutzereinstellungen)
const ASA_ORG_ID = "VktVXzE0MTc=";

const MONTH_DAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

interface AsaCourse {
  id: string;
  part: number;
  date: string;   // TT.MM.JJJJ
  day: string;
  time: string;   // "13:00 – 17:00"
  location: string;
  spots: number | null;
}

function stripHtml(html: string) {
  let t = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  t = t.replace(/<[^>]+>/g, " ");
  // numerische HTML-Entities zuerst (asa liefert u.a. &#160; direkt im Text)
  t = t.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
       .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
  t = t.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
       .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  t = t.replace(/\u00a0/g, " ");

  return t.replace(/\s+/g, " ").trim();
}

function dayName(d: number, m: number, y: number) {
  return MONTH_DAYS[new Date(y, m - 1, d).getDay()];
}

function parseCourses(html: string): AsaCourse[] {
  const text = stripHtml(html);
  // Muster: "Teil 1 Mittwoch 12.08.2026 07:00 – 11:00 <Ort> Zur Kursgruppe anmelden 5 freie Plätze"
  const re = /Teil\s*(\d)\s+[A-Za-zäöü]+\s+(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})\s+(.*?)\s+Zur Kursgruppe anmelden(?:\s+(\d+)\s+freie)?/g;
  const out: AsaCourse[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const [, partS, dd, mm, yyyy, from, to, locRaw, spotsS] = m;
    const part = Number(partS);
    const date = `${dd}.${mm}.${yyyy}`;
    const id = `asa-p${part}-${yyyy}${mm}${dd}-${from.replace(":", "")}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      part,
      date,
      day: dayName(Number(dd), Number(mm), Number(yyyy)),
      time: `${from} – ${to}`,
      location: locRaw.replace(/\s+$/, "").slice(0, 200),
      spots: spotsS ? Number(spotsS) : null,
    });
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // --- Auth + Admin-Check ---
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Nicht authentifiziert" }, 401);
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Ungültige Session" }, 401);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: roleRow } = await admin
      .from("user_roles").select("role")
      .eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return json({ error: "Kein Admin-Zugriff" }, 403);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "apply" ? "apply" : "preview";
    const section = body.section === "vku" ? "vku" : "pgs";
    const defaultPrice = Number.isFinite(Number(body.defaultPrice)) ? Number(body.defaultPrice) : 160;
    const onlyIds: string[] | null = Array.isArray(body.ids) ? body.ids : null;

    // --- asa iframe abrufen ---
    const url = `https://iframe.vku-pgs.asa.ch/de/public/coursegroup/all/${encodeURIComponent(ASA_ORG_ID)}/1/${section}/`;
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "fahrschule-me-import/1.0" } });
    if (!res.ok) {
      const t = await res.text();
      console.error(`asa fetch failed [${res.status}]: ${t.slice(0, 300)}`);
      return json({ error: "asa-Portal nicht erreichbar", status: res.status }, 502);
    }
    const parsed = parseCourses(await res.text());

    // --- Bestehende Termine laden ---
    const { data: existingRows, error: exErr } = await admin
      .from("course_dates").select("id, part, date, time, location, price, spots_available");
    if (exErr) return json({ error: "DB-Fehler: " + exErr.message }, 500);
    const existing = new Map((existingRows || []).map((r: any) => [r.id, r]));
    // Slot-Index: Teil|Datum|Startzeit – erkennt denselben Kurs auch unter anderer ID
    const startOf = (t: string) => String(t || "").split(/[–-]/)[0].trim();
    const slotIndex = new Map<string, any>();
    for (const r of existingRows || []) {
      slotIndex.set(`${r.part}|${r.date}|${startOf(r.time)}`, r);
    }

    const items = parsed.map((c) => {
      const cur = existing.get(c.id);
      if (!cur) {
        const dup = slotIndex.get(`${c.part}|${c.date}|${startOf(c.time)}`);
        if (dup) {
          return {
            ...c,
            action: "duplicate" as const,
            changes: [`Bereits vorhanden als "${dup.id}" – wird ignoriert`],
          };
        }
        return { ...c, action: "new" as const, changes: [] as string[] };
      }
      const changes: string[] = [];
      if (cur.date !== c.date) changes.push(`Datum ${cur.date} → ${c.date}`);
      if (cur.time !== c.time) changes.push(`Zeit ${cur.time} → ${c.time}`);
      if (cur.location !== c.location) changes.push(`Ort ${cur.location} → ${c.location}`);
      return { ...c, action: changes.length ? ("update" as const) : ("unchanged" as const), changes };
    });

    if (mode === "preview") {
      return json({ section, url, count: items.length, items });
    }

    // --- Übernehmen ---
    const selectable = items.filter(
      (i) => i.action !== "unchanged" && i.action !== "duplicate" && (!onlyIds || onlyIds.includes(i.id)),
    );
    const duplicates = items.filter((i) => i.action === "duplicate").length;
    let created = 0, updated = 0;
    const errors: string[] = [];

    for (const i of selectable) {
      if (i.action === "new") {
        const { error } = await admin.from("course_dates").insert({
          id: i.id, part: i.part, date: i.date, day: i.day, time: i.time,
          location: i.location, price: defaultPrice,
          spots_available: i.spots ?? 5,
        });
        if (error) errors.push(`${i.id}: ${error.message}`); else created++;
      } else {
        // Nur Termin-/Ortsdaten aktualisieren – Preis, Plätze und Buchungen bleiben unberührt
        const { error } = await admin.from("course_dates")
          .update({ date: i.date, day: i.day, time: i.time, location: i.location })
          .eq("id", i.id);
        if (error) errors.push(`${i.id}: ${error.message}`); else updated++;
      }
    }

    return json({ section, created, updated, duplicates, skipped: items.length - selectable.length, errors });
  } catch (e) {
    console.error("import-asa-courses error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
