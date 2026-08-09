// Pushes a course_date entry to the Google Calendar via a Google Service Account (JWT, no Lovable gateway).
// Body: { courseDateId: string, action: "upsert" | "delete" }
// Required secrets: GOOGLE_SA_CLIENT_EMAIL, GOOGLE_SA_PRIVATE_KEY, GOOGLE_CALENDAR_ID
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GCAL_BASE = "https://www.googleapis.com/calendar/v3";
const CALENDAR_ID = Deno.env.get("GOOGLE_CALENDAR_ID") || "primary";


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

function b64url(data: Uint8Array | string) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64ToBytes(b64: string) {
  let s = b64.replace(/[^A-Za-z0-9+/_=-]/g, "").replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  if (s.length % 4 === 1) s = s.slice(0, -1);
  if (s.length % 4) s += "=".repeat(4 - (s.length % 4));
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function pemToDer(pem: string) {
  const body = pem.replace(/-----[^-]+-----/g, "");
  return b64ToBytes(body);
}


let cachedToken: { token: string; exp: number } | null = null;

async function getAccessToken() {
  if (cachedToken && cachedToken.exp > Date.now() / 1000 + 60) return cachedToken.token;

  const clientEmail = Deno.env.get("GOOGLE_SA_CLIENT_EMAIL");
  // Bevorzugt: base64-kodierter Key (keine Zeilenumbrüche/Kommas -> keine .env-Parsingfehler)
  const rawB64 = Deno.env.get("GOOGLE_SA_PRIVATE_KEY_B64");
  const normalizePem = (v: string) =>
    v.trim().replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
  const decodeKey = (v: string): Uint8Array => {
    let cleaned = v.trim().replace(/^["']|["']$/g, "");
    try {
      if (cleaned.includes("%")) cleaned = decodeURIComponent(cleaned);
    } catch { /* kein URL-kodierter Wert */ }
    cleaned = cleaned.replace(/\\n/g, "\n").replace(/\\r/g, "");

    // Komplettes Service-Account-JSON direkt in der Variable.
    if (cleaned.startsWith("{")) {
      const json = JSON.parse(cleaned);
      if (json.private_key) return pemToDer(normalizePem(String(json.private_key)));
    }

    // Fall 1: bereits ein PEM.
    if (cleaned.includes("PRIVATE KEY")) return pemToDer(normalizePem(cleaned));

    // Fall 2: Base64 (kann PEM, JSON oder direkt DER enthalten).
    const decodedBytes = b64ToBytes(cleaned);
    const decoded = new TextDecoder().decode(decodedBytes);
    const t = decoded.trim();
    if (t.startsWith("{")) {
      try {
        const j = JSON.parse(t);
        if (j.private_key) return pemToDer(normalizePem(String(j.private_key)));
      } catch { /* ignore */ }
    }
    if (decoded.includes("PRIVATE KEY")) return pemToDer(normalizePem(decoded));

    // Base64 kann direkt den binären PKCS#8-DER-Schlüssel enthalten.
    return decodedBytes;
  };
  const rawKey = rawB64 || Deno.env.get("GOOGLE_SA_PRIVATE_KEY") || "";
  let privateKeyDer: Uint8Array;
  try {
    privateKeyDer = decodeKey(rawKey);
  } catch (e) {
    const head = rawKey.trim().slice(0, 12).replace(/[^\x20-\x7E]/g, "?");
    throw new Error(
      `Private Key konnte nicht gelesen werden (Länge ${rawKey.length}, Anfang "${head}"): ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  if (!clientEmail || privateKeyDer.length === 0) {
    throw new Error("Google Calendar Service Account ist nicht konfiguriert (GOOGLE_SA_CLIENT_EMAIL / GOOGLE_SA_PRIVATE_KEY_B64)");
  }





  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "pkcs8",
      privateKeyDer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );
  } catch (e) {
    throw new Error(
      `PKCS#8-Import fehlgeschlagen (${privateKeyDer.length} Bytes): ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  const sig = new Uint8Array(await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`),
  ));
  const jwt = `${header}.${claim}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Google token ${res.status}: ${text}`);
  const json = JSON.parse(text);
  cachedToken = { token: json.access_token, exp: now + (json.expires_in ?? 3600) };
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Authorization: only internal service-role callers or admin users
    const callerToken = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    let allowed = callerToken !== "" && callerToken === serviceKey;
    if (!allowed && callerToken) {
      const { data: userData } = await supabase.auth.getUser(callerToken);
      if (userData?.user) {
        const { data: roleRow } = await supabase
          .from("user_roles").select("role")
          .eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
        allowed = !!roleRow;
      }
    }
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Kein Admin-Zugriff" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { courseDateId, action } = await req.json();

    if (action === "debug-key") {
      const b64 = Deno.env.get("GOOGLE_SA_PRIVATE_KEY_B64") || "";
      const plain = Deno.env.get("GOOGLE_SA_PRIVATE_KEY") || "";
      const info = (v: string) => ({
        length: v.length,
        head: v.slice(0, 20).replace(/[^\x20-\x7E]/g, "?"),
        tail: v.slice(-20).replace(/[^\x20-\x7E]/g, "?"),
        hasPem: v.includes("PRIVATE KEY"),
        hasBackslashN: v.includes("\\n"),
        hasNewline: v.includes("\n"),
      });
      let decodedHead = "";
      try {
        const bytes = b64ToBytes(b64 || plain);
        decodedHead = new TextDecoder().decode(bytes.slice(0, 40)).replace(/[^\x20-\x7E]/g, "?")
          + " | hex:" + Array.from(bytes.slice(0, 6)).map((b) => b.toString(16).padStart(2, "0")).join(" ")
          + " | bytes:" + bytes.length;
      } catch (e) {
        decodedHead = "decode error: " + (e instanceof Error ? e.message : String(e));
      }
      return new Response(JSON.stringify({
        GOOGLE_SA_PRIVATE_KEY_B64: info(b64),
        GOOGLE_SA_PRIVATE_KEY: info(plain),
        clientEmailSet: !!Deno.env.get("GOOGLE_SA_CLIENT_EMAIL"),
        decodedHead,
      }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!courseDateId || !action) throw new Error("courseDateId and action required");



    const { data: course, error } = await supabase
      .from("course_dates").select("*").eq("id", courseDateId).maybeSingle();
    if (error) throw new Error(`DB course_dates: ${error.message}${error.hint ? ` (${error.hint})` : ""}`);

    if (action === "delete") {
      if (course?.gcal_event_id) {
        try { await gcall(`/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${course.gcal_event_id}`, "DELETE"); }
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

    // Teilnehmer (bestätigt) für diesen Kurs laden
    const { data: items } = await supabase
      .from("booking_items")
      .select("booking_id, bookings!inner(first_name, last_name, phone, email, status)")
      .eq("course_date_id", courseDateId);
    const participants = (items || [])
      .map((it: any) => it.bookings)
      .filter((b: any) => b && b.status === "confirmed");
    const tnCount = participants.length;

    const participantLines = participants.length
      ? participants
          .map((b: any, i: number) =>
            `  ${i + 1}. ${b.first_name} ${b.last_name} – ${b.phone || "–"}`,
          )
          .join("\n")
      : "  (noch keine Teilnehmer)";

    const summary = `MGK Teil ${course.part}${course.instructor ? ` (${course.instructor})` : ""} – ${tnCount} TN`;
    const description = [
      `Motorrad-Grundkurs Teil ${course.part}`,
      `Fahrlehrer: ${course.instructor || "–"}`,
      `Teilnehmer: ${tnCount} (freie Plätze: ${course.spots_available})`,
      `Preis: CHF ${course.price}`,
      ``,
      `Teilnehmerliste:`,
      participantLines,
      ``,
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
        await gcall(`/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${eventId}`, "PUT", eventBody);
      } catch (e) {
        console.warn("PUT failed, creating new:", (e as Error).message);
        const created = await gcall(`/calendars/${encodeURIComponent(CALENDAR_ID)}/events`, "POST", eventBody);
        eventId = created.id;
      }
    } else {
      const created = await gcall(`/calendars/${encodeURIComponent(CALENDAR_ID)}/events`, "POST", eventBody);
      eventId = created.id;
    }

    if (eventId && eventId !== course.gcal_event_id) {
      await supabase.from("course_dates").update({ gcal_event_id: eventId }).eq("id", course.id);
    }

    return new Response(JSON.stringify({ ok: true, eventId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error
      ? e.message
      : (typeof e === "object" && e !== null ? JSON.stringify(e) : String(e));
    console.error("[sync-course-to-gcal]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
