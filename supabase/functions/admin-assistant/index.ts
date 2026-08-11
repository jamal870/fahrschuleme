// KI-Assistent für den Admin-Bereich.
// Nur für eingeloggte Admins. Kann Aktionen und Kurstermine lesen, anlegen,
// ändern und löschen sowie Buchungs-Statistiken liefern.
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

const tools = [
  {
    type: "function",
    function: {
      name: "list_promotions",
      description: "Listet alle Aktionen (auch inaktive) mit id, Titel, Kategorie, Preisen und Zeitraum.",
      parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "create_promotion",
      description: "Erstellt eine neue Aktion / ein Angebot.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: ["string", "null"] },
          price: { type: ["string", "null"], description: "Freitext-Preis, z.B. 'CHF 89.- statt 95.-'" },
          badge: { type: ["string", "null"], description: "Kurzes Label, z.B. 'NEU' oder '-15%'" },
          category: {
            type: ["string", "null"],
            enum: ["mgk", "grundkurs", "fahrstunden_auto", "fahrstunden_motorrad", null],
          },
          original_price: { type: ["number", "null"] },
          discount_price: { type: ["number", "null"] },
          starts_at: { type: ["string", "null"], description: "ISO-Datum oder null" },
          ends_at: { type: ["string", "null"], description: "ISO-Datum oder null" },
          active: { type: ["boolean", "null"] },
          sort_order: { type: ["integer", "null"] },
        },
        required: ["title", "description", "price", "badge", "category", "original_price", "discount_price", "starts_at", "ends_at", "active", "sort_order"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_promotion",
      description: "Ändert eine bestehende Aktion. Nur die angegebenen Felder werden geändert (null = unverändert lassen).",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: ["string", "null"] },
          description: { type: ["string", "null"] },
          price: { type: ["string", "null"] },
          badge: { type: ["string", "null"] },
          category: { type: ["string", "null"] },
          original_price: { type: ["number", "null"] },
          discount_price: { type: ["number", "null"] },
          starts_at: { type: ["string", "null"] },
          ends_at: { type: ["string", "null"] },
          active: { type: ["boolean", "null"] },
          sort_order: { type: ["integer", "null"] },
        },
        required: ["id", "title", "description", "price", "badge", "category", "original_price", "discount_price", "starts_at", "ends_at", "active", "sort_order"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_promotion",
      description: "Löscht eine Aktion endgültig. Nur nach ausdrücklicher Bestätigung des Admins verwenden.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_course_dates",
      description: "Listet Kurstermine (Standard: nur zukünftige).",
      parameters: {
        type: "object",
        properties: {
          part: { type: ["integer", "null"] },
          include_past: { type: ["boolean", "null"] },
        },
        required: ["part", "include_past"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_course_date",
      description: "Legt einen neuen Kurstermin an. Datum im Format TT.MM.JJJJ, Zeit z.B. '08:00 - 12:00'.",
      parameters: {
        type: "object",
        properties: {
          part: { type: "integer", description: "1, 2 oder 3" },
          date: { type: "string", description: "TT.MM.JJJJ" },
          time: { type: "string" },
          location: { type: "string" },
          price: { type: "number" },
          spots_available: { type: "integer" },
          instructor: { type: ["string", "null"] },
          instructor_number: { type: ["string", "null"] },
        },
        required: ["part", "date", "time", "location", "price", "spots_available", "instructor", "instructor_number"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_course_date",
      description: "Ändert einen Kurstermin (null = Feld unverändert).",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          part: { type: ["integer", "null"] },
          date: { type: ["string", "null"] },
          time: { type: ["string", "null"] },
          location: { type: ["string", "null"] },
          price: { type: ["number", "null"] },
          spots_available: { type: ["integer", "null"] },
          instructor: { type: ["string", "null"] },
          instructor_number: { type: ["string", "null"] },
        },
        required: ["id", "part", "date", "time", "location", "price", "spots_available", "instructor", "instructor_number"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_course_date",
      description: "Löscht einen Kurstermin. Nur wenn keine Buchungen bestehen und der Admin es ausdrücklich bestätigt hat.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_booking_stats",
      description: "Liefert Kennzahlen zu Buchungen (Anzahl nach Status, Umsatz, letzte Buchungen).",
      parameters: {
        type: "object",
        properties: { days: { type: ["integer", "null"], description: "Zeitraum in Tagen, Standard 30" } },
        required: ["days"],
        additionalProperties: false,
      },
    },
  },
];

const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function parseDate(d: string): number {
  const m = d?.match?.(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return 0;
  return new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00Z`).getTime();
}

function weekdayFor(d: string): string {
  const t = parseDate(d);
  if (!t) return "";
  return WEEKDAYS[new Date(t).getUTCDay()];
}

function clean<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== null && v !== undefined) out[k] = v;
  return out;
}

async function runTool(name: string, args: Record<string, any>) {
  switch (name) {
    case "list_promotions": {
      const { data, error } = await admin.from("promotions").select("*").order("sort_order");
      return error ? { error: error.message } : { promotions: data };
    }
    case "create_promotion": {
      const row = clean({
        title: args.title,
        description: args.description,
        price: args.price,
        badge: args.badge,
        category: args.category,
        original_price: args.original_price,
        discount_price: args.discount_price,
        starts_at: args.starts_at,
        ends_at: args.ends_at,
        active: args.active ?? true,
        sort_order: args.sort_order ?? 0,
      });
      const { data, error } = await admin.from("promotions").insert(row).select().single();
      return error ? { error: error.message } : { created: data };
    }
    case "update_promotion": {
      const { id, ...rest } = args;
      const patch = clean(rest);
      if (Object.keys(patch).length === 0) return { error: "keine_aenderung" };
      const { data, error } = await admin.from("promotions").update(patch).eq("id", id).select().single();
      return error ? { error: error.message } : { updated: data };
    }
    case "delete_promotion": {
      const { error } = await admin.from("promotions").delete().eq("id", args.id);
      return error ? { error: error.message } : { deleted: args.id };
    }
    case "list_course_dates": {
      let q = admin.from("course_dates").select("*");
      if (typeof args.part === "number") q = q.eq("part", args.part);
      const { data, error } = await q;
      if (error) return { error: error.message };
      const today = Date.now() - 86400000;
      const rows = (data ?? [])
        .filter((c) => (args.include_past ? true : parseDate(c.date) >= today))
        .sort((a, b) => parseDate(a.date) - parseDate(b.date));
      return { course_dates: rows };
    }
    case "create_course_date": {
      if (!/^\d{2}\.\d{2}\.\d{4}$/.test(args.date ?? "")) return { error: "datum_format_ungueltig (TT.MM.JJJJ)" };
      const id = `mgk-${args.part}-${args.date.split(".").reverse().join("")}-${Math.random().toString(36).slice(2, 6)}`;
      const row = clean({
        id,
        part: args.part,
        day: weekdayFor(args.date),
        date: args.date,
        time: args.time,
        location: args.location,
        price: args.price,
        spots_available: args.spots_available,
        instructor: args.instructor,
        instructor_number: args.instructor_number,
      });
      const { data, error } = await admin.from("course_dates").insert(row).select().single();
      return error ? { error: error.message } : { created: data };
    }
    case "update_course_date": {
      const { id, ...rest } = args;
      const patch = clean(rest);
      if (patch.date) {
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(String(patch.date))) return { error: "datum_format_ungueltig" };
        patch.day = weekdayFor(String(patch.date));
      }
      if (Object.keys(patch).length === 0) return { error: "keine_aenderung" };
      const { data, error } = await admin.from("course_dates").update(patch).eq("id", id).select().single();
      return error ? { error: error.message } : { updated: data };
    }
    case "delete_course_date": {
      const { count } = await admin
        .from("booking_items")
        .select("id", { count: "exact", head: true })
        .eq("course_date_id", args.id);
      if ((count ?? 0) > 0) return { error: `Kurs hat ${count} Buchung(en) und kann nicht gelöscht werden.` };
      const { error } = await admin.from("course_dates").delete().eq("id", args.id);
      return error ? { error: error.message } : { deleted: args.id };
    }
    case "get_booking_stats": {
      const days = typeof args.days === "number" ? args.days : 30;
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await admin
        .from("bookings")
        .select("id, first_name, last_name, booking_type, status, payment_status, total_price, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      if (error) return { error: error.message };
      const rows = data ?? [];
      const byStatus: Record<string, number> = {};
      let revenue = 0;
      for (const b of rows) {
        byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
        if (b.payment_status === "paid") revenue += Number(b.total_price ?? 0);
      }
      return { days, total: rows.length, byStatus, revenue_paid: revenue, latest: rows.slice(0, 10) };
    }
  }
  return { error: "unknown_tool" };
}

Deno.serve(async (req) => {
  try {
    return await handle(req);
  } catch (e) {
    console.error("admin-assistant fatal", e);
    return json({ error: `Serverfehler: ${e instanceof Error ? e.message : String(e)}` }, 500);
  }
});

async function handle(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!supabaseUrl || !serviceKey || !anonKey) {
    return json({ error: "Server-Konfiguration unvollständig (SUPABASE_URL / SERVICE_ROLE_KEY / ANON_KEY fehlen)." }, 500);
  }

  const aiConfig = await resolveAiConfig(admin as never, "admin");
  if ("error" in aiConfig) return json({ error: aiConfig.error }, 500);



  // --- Admin-Auth ---
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Nicht authentifiziert" }, 401);
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "Ungültige Session" }, 401);
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) return json({ error: "Kein Admin-Zugriff" }, 403);

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const history = (body.messages ?? [])
    .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (history.length === 0) return json({ error: "no_messages" }, 400);

  const today = new Date().toLocaleDateString("de-CH", { timeZone: "Europe/Zurich", dateStyle: "full" });

  const system = `Du bist der Admin-Assistent der Fahrschule "Fahrschule me" (Wettingen, Schweiz).
Heutiges Datum: ${today}. Sprache: Deutsch, "du", knapp und konkret.

AUFGABEN:
- Aktionen (Promotions) anlegen, ändern, aktivieren/deaktivieren und listen.
- Kurstermine (MGK Teil 1-3) planen, ändern, listen.
- Buchungs-Kennzahlen abfragen.

REGELN:
- Nutze IMMER die Tools statt zu raten. Erfinde keine IDs – erst listen, dann ändern.
- Vor jedem Löschen und vor grösseren Änderungen: kurz rückfragen und erst nach klarer Bestätigung ausführen.
- Fehlen Pflichtangaben (z.B. Datum, Zeit, Ort, Preis, Plätze bei Kursen), frage gezielt nach – maximal in einer kurzen Liste.
- Preise in CHF. Kursdatum immer im Format TT.MM.JJJJ. Der Wochentag wird automatisch berechnet.
- Nach einer Änderung: bestätige in einem Satz, was genau geändert wurde.
- Standardwerte MGK: Ort "Wettingen", Preis 200, 12 Plätze – nur vorschlagen, nicht ungefragt setzen.
- Formatiere mit **fett** für Kernpunkte, keine Tabellen.`;

  const messages: Record<string, unknown>[] = [{ role: "system", content: system }, ...history];
  const actions: string[] = [];

  try {
    for (let i = 0; i < 6; i++) {
      const res = await fetch(aiConfig.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...aiConfig.headers,
        },
        body: JSON.stringify({ model: aiConfig.model, messages, tools }),
      });


      if (res.status === 429) return json({ error: "rate_limited", message: "Zu viele Anfragen. Bitte kurz warten." }, 429);
      if (res.status === 402) return json({ error: "credits", message: "KI-Guthaben aufgebraucht." }, 402);
      if (!res.ok) {
        const detail = await res.text();
        console.error("gateway error", res.status, detail);
        return json({ error: "gateway_error", detail }, 502);
      }

      const data = await res.json();
      const msg = data.choices?.[0]?.message;
      if (!msg) return json({ error: "empty_response" }, 502);

      const calls = msg.tool_calls ?? [];
      if (calls.length === 0) return json({ reply: msg.content ?? "", actions });

      messages.push(msg);
      for (const call of calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function?.arguments || "{}");
        } catch { /* ignore */ }
        const name = call.function?.name ?? "";
        const result = await runTool(name, args);
        if (!(result as any)?.error && /^(create|update|delete)_/.test(name)) actions.push(name);
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result).slice(0, 12000),
        });
      }
    }
    return json({ reply: "Das dauert gerade zu lange – bitte formuliere die Anfrage etwas einfacher.", actions });
  } catch (e) {
    console.error("admin-assistant failed", e);
    return json({ error: `KI-Fehler: ${e instanceof Error ? e.message : String(e)}` }, 500);
  }
}

