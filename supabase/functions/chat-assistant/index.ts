// KI-Assistent für den Website-Chatbot ("Ask AI").
// Versteht Freitext, nutzt echte Daten (Kurse, Preise, Aktionen) via Tool-Calls
// und kann bestehende Chat-Flows (Buchung, Kontakt, FAQ) auslösen.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { resolveAiConfig } from "../_shared/ai-provider.ts";

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const FLOWS = [
  "start_booking",
  "start_fahrstunde",
  "show_categories",
  "show_prices",
  "show_faq",
  "contact",
  "whatsapp",
  "email_contact",
  "main_menu",
] as const;

const tools = [
  {
    type: "function",
    function: {
      name: "get_courses",
      description:
        "Liefert die aktuell buchbaren Motorrad-Grundkurs-Termine (MGK) mit Datum, Zeit, Ort und freien Plätzen.",
      parameters: {
        type: "object",
        properties: {
          part: { type: ["integer", "null"], description: "Kursteil 1, 2 oder 3. null = alle Teile." },
          limit: { type: ["integer", "null"], description: "Maximale Anzahl Termine (Standard 10)." },
        },
        required: ["part", "limit"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_fahrstunden_prices",
      description: "Liefert alle Fahrstunden-Angebote (Auto/Motorrad) inkl. Pakete und Preise aus der Datenbank.",
      parameters: {
        type: "object",
        properties: {
          category: { type: ["string", "null"], description: "'auto', 'motorrad' oder null für alle." },
        },
        required: ["category"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_promotions",
      description: "Liefert die aktuell aktiven Aktionen / Rabatte.",
      parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "start_flow",
      description:
        "Startet einen geführten Ablauf im Chat (Buchung, Preise, FAQ, Kontakt). Nur verwenden, wenn der Nutzer das wirklich möchte.",
      parameters: {
        type: "object",
        properties: {
          flow: { type: "string", enum: FLOWS as unknown as string[] },
        },
        required: ["flow"],
        additionalProperties: false,
      },
    },
  },
];

function parseDate(d: string): number {
  const m = d?.match?.(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return 0;
  return new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00Z`).getTime();
}

async function runTool(name: string, args: Record<string, unknown>) {
  if (name === "get_courses") {
    const part = typeof args.part === "number" ? args.part : null;
    const limit = typeof args.limit === "number" ? Math.min(args.limit, 20) : 10;
    let q = admin.from("course_dates").select("id, part, day, date, time, location, price, spots_available");
    if (part) q = q.eq("part", part);
    const { data, error } = await q;
    if (error) return { error: error.message };
    const today = Date.now() - 86400000;
    const rows = (data ?? [])
      .filter((c) => parseDate(c.date) >= today && (c.spots_available ?? 0) > 0)
      .sort((a, b) => parseDate(a.date) - parseDate(b.date))
      .slice(0, limit);
    return { courses: rows };
  }

  if (name === "get_fahrstunden_prices") {
    const cat = typeof args.category === "string" ? args.category : null;
    let sq = admin.from("fahrstunden_services").select("id, category, name, duration, price");
    if (cat) sq = sq.eq("category", cat);
    const [{ data: services }, { data: packages }] = await Promise.all([
      sq,
      admin.from("fahrstunden_packages").select("id, service_id, name, lessons, discount, total_price, price_per_lesson"),
    ]);
    const ids = new Set((services ?? []).map((s) => s.id));
    return { services: services ?? [], packages: (packages ?? []).filter((p) => ids.has(p.service_id)) };
  }

  if (name === "get_promotions") {
    const nowIso = new Date().toISOString();
    const { data } = await admin
      .from("promotions")
      .select("title, description, price, badge, category, original_price, discount_price, starts_at, ends_at")
      .eq("active", true)
      .order("sort_order");
    const rows = (data ?? []).filter(
      (p) => (!p.starts_at || p.starts_at <= nowIso) && (!p.ends_at || p.ends_at >= nowIso),
    );
    return { promotions: rows };
  }

  return { error: "unknown_tool" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const aiConfig = await resolveAiConfig(admin as never, "chatbot");
  if ("error" in aiConfig) return json({ error: aiConfig.error }, 500);


  let body: { messages?: { role: string; content: string }[]; context?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const history = (body.messages ?? [])
    .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (history.length === 0) return json({ error: "no_messages" }, 400);

  const today = new Date().toLocaleDateString("de-CH", { timeZone: "Europe/Zurich", dateStyle: "full" });

  const system = `Du bist der freundliche KI-Assistent der Fahrschule "Fahrschule me" in Wettingen (Schweiz).
Heutiges Datum: ${today}.

REGELN:
- Antworte immer auf Deutsch (Schweizer Kundenansprache, "du"), kurz und konkret (max. 5 Sätze bzw. kurze Listen).
- Nutze IMMER die Tools für Kurstermine, Fahrstunden-Preise und Aktionen. Erfinde niemals Termine, Preise oder Verfügbarkeiten.
- Preise in CHF. Kurstermine als "Datum, Zeit, Ort (freie Plätze)".
- Wenn der Nutzer buchen möchte, rufe start_flow auf (start_booking = Grundkurs, start_fahrstunde = Fahrstunden) und schreibe dazu einen kurzen Satz.
- Du darfst keine Preise ändern, Aktionen erstellen oder Daten schreiben. Solche Wünsche verweist du freundlich an das Admin-Panel bzw. an ${"das Team"}.
- Bei Unsicherheit: biete Kontakt (Telefon/WhatsApp) an.
- Formatiere mit **fett** für Kernpunkte, keine Tabellen.

STAMMDATEN & PREISLISTE:
${(body.context ?? "").slice(0, 8000)}`;

  const messages: Record<string, unknown>[] = [{ role: "system", content: system }, ...history];

  let flow: string | null = null;

  try {
    for (let i = 0; i < 4; i++) {
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
      if (calls.length === 0) {
        return json({ reply: msg.content ?? "", flow });
      }

      messages.push(msg);
      for (const call of calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function?.arguments || "{}");
        } catch { /* ignore */ }

        let result: unknown;
        if (call.function?.name === "start_flow") {
          const requested = String(args.flow ?? "");
          if ((FLOWS as readonly string[]).includes(requested)) {
            flow = requested;
            result = { ok: true, note: "Ablauf wird im Chat gestartet." };
          } else {
            result = { error: "unknown_flow" };
          }
        } else {
          result = await runTool(call.function?.name ?? "", args);
        }

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result).slice(0, 12000),
        });
      }
    }

    return json({ reply: "Das dauert gerade etwas zu lange – frag mich bitte nochmals oder wähle ein Thema.", flow });
  } catch (e) {
    console.error("chat-assistant failed", e);
    return json({ error: "internal_error" }, 500);
  }
});
