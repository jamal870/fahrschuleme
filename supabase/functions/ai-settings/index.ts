// Verwaltung der KI-Anbieter-Schlüssel und Modelle. Nur für eingeloggte Admins.
// Schlüssel werden nie im Klartext zurückgegeben (nur maskiert).
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

const PROVIDERS = ["lovable", "openai", "gemini", "anthropic"];
const ASSISTANTS = ["chatbot", "admin"];

const mask = (key: string | null) =>
  !key ? null : key.length <= 8 ? "••••" : `${key.slice(0, 4)}••••${key.slice(-4)}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ error: "unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData } = await userClient.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: "unauthorized" }, 401);

  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) return json({ error: "forbidden" }, 403);

  let body: {
    action?: string;
    provider?: string;
    api_key?: string | null;
    enabled?: boolean;
    assistant?: string;
    model?: string;
  } = {};
  try {
    body = await req.json();
  } catch { /* GET-artiger Aufruf */ }

  const action = body.action ?? "list";

  if (action === "list") {
    const [{ data: providers }, { data: configs }] = await Promise.all([
      admin.from("ai_providers").select("provider, api_key, enabled, updated_at"),
      admin.from("ai_assistant_config").select("assistant, provider, model, updated_at"),
    ]);
    return json({
      providers: (providers ?? []).map((p) => ({
        provider: p.provider,
        enabled: p.enabled,
        has_key: !!p.api_key,
        masked_key: mask(p.api_key),
        updated_at: p.updated_at,
      })),
      assistants: configs ?? [],
    });
  }

  if (action === "save_provider") {
    const provider = String(body.provider ?? "");
    if (!PROVIDERS.includes(provider)) return json({ error: "invalid_provider" }, 400);

    const patch: Record<string, unknown> = { provider };
    if (typeof body.enabled === "boolean") patch.enabled = body.enabled;
    if (body.api_key !== undefined) {
      const key = typeof body.api_key === "string" ? body.api_key.trim() : "";
      patch.api_key = key.length > 0 ? key : null;
    }

    const { error } = await admin.from("ai_providers").upsert(patch, { onConflict: "provider" });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  if (action === "save_assistant") {
    const assistant = String(body.assistant ?? "");
    const provider = String(body.provider ?? "");
    const model = String(body.model ?? "").trim();
    if (!ASSISTANTS.includes(assistant)) return json({ error: "invalid_assistant" }, 400);
    if (!PROVIDERS.includes(provider)) return json({ error: "invalid_provider" }, 400);
    if (!model) return json({ error: "missing_model" }, 400);

    const { error } = await admin
      .from("ai_assistant_config")
      .upsert({ assistant, provider, model }, { onConflict: "assistant" });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  if (action === "test") {
    const provider = String(body.provider ?? "");
    if (!PROVIDERS.includes(provider)) return json({ error: "invalid_provider" }, 400);
    const { resolveAiConfig, DEFAULT_MODELS } = await import("../_shared/ai-provider.ts");
    // Temporär: Konfiguration für diesen Anbieter simulieren
    const fake = {
      from: () => ({
        select: () => ({
          eq: (_c: string, _v: string) => ({
            maybeSingle: async () => {
              if (_c === "assistant") {
                return { data: { provider, model: body.model || DEFAULT_MODELS[provider] } };
              }
              const { data } = await admin
                .from("ai_providers")
                .select("api_key, enabled")
                .eq("provider", provider)
                .maybeSingle();
              return { data };
            },
          }),
        }),
      }),
    } as never;
    const cfg = await resolveAiConfig(fake, "chatbot");
    if ("error" in cfg) return json({ error: cfg.error }, 400);

    const res = await fetch(cfg.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...cfg.headers },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: "user", content: "Antworte nur mit: OK" }],
        max_tokens: 16,
      }),
    });
    const text = await res.text();
    if (!res.ok) return json({ ok: false, status: res.status, detail: text.slice(0, 500) }, 200);
    return json({ ok: true, provider: cfg.provider, model: cfg.model });
  }

  return json({ error: "unknown_action" }, 400);
});
