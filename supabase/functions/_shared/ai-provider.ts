// Zentrale Auswahl des KI-Anbieters (Lovable AI, OpenAI, Google Gemini, Anthropic).
// Die Schlüssel liegen in public.ai_providers und werden nur serverseitig gelesen.

export type AiCallConfig = {
  provider: string;
  model: string;
  url: string;
  headers: Record<string, string>;
};

export const DEFAULT_MODELS: Record<string, string> = {
  lovable: "google/gemini-3.6-flash",
  openai: "gpt-4o-mini",
  gemini: "gemini-2.0-flash",
  anthropic: "claude-sonnet-4-20250514",
};

type Client = {
  from: (t: string) => {
    select: (c: string) => {
      eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: any }> };
    };
  };
};

const ENV_KEYS: Record<string, string[]> = {
  openai: ["OPENAI_API_KEY"],
  gemini: ["GEMINI_API_KEY", "GOOGLE_AI_API_KEY"],
  anthropic: ["ANTHROPIC_API_KEY"],
};

function envKey(provider: string): string | null {
  for (const name of ENV_KEYS[provider] ?? []) {
    const v = Deno.env.get(name);
    if (v) return v;
  }
  return null;
}

// Wenn kein Anbieter konfiguriert ist: erster verfügbarer Env-Key gewinnt.
function envFallback(): AiCallConfig | { error: string } {
  for (const provider of ["openai", "gemini", "anthropic"]) {
    const key = envKey(provider);
    if (key) return buildConfig(provider, DEFAULT_MODELS[provider], key);
  }
  return {
    error:
      "Kein KI-Anbieter konfiguriert. Bitte im Admin unter „KI-Keys“ einen Anbieter aktivieren und den API-Key speichern (oder LOVABLE_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY auf dem Server setzen).",
  };
}

function buildConfig(provider: string, model: string, apiKey: string): AiCallConfig {
  if (provider === "openai") {
    return {
      provider,
      model: model || DEFAULT_MODELS.openai,
      url: "https://api.openai.com/v1/chat/completions",
      headers: { Authorization: `Bearer ${apiKey}` },
    };
  }
  if (provider === "gemini") {
    return {
      provider,
      model: model || DEFAULT_MODELS.gemini,
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      headers: { Authorization: `Bearer ${apiKey}` },
    };
  }
  return {
    provider,
    model: model || DEFAULT_MODELS.anthropic,
    url: "https://api.anthropic.com/v1/chat/completions",
    headers: { Authorization: `Bearer ${apiKey}` },
  };
}

export async function resolveAiConfig(
  admin: Client,
  assistant: "chatbot" | "admin",
): Promise<AiCallConfig | { error: string }> {
  let provider = "lovable";
  let model = DEFAULT_MODELS.lovable;

  try {
    const { data } = await admin
      .from("ai_assistant_config")
      .select("provider, model")
      .eq("assistant", assistant)
      .maybeSingle();
    if (data?.provider) provider = data.provider;
    if (data?.model) model = data.model;
  } catch (_) { /* Fallback unten */ }

  if (provider === "lovable") {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return envFallback();
    return {
      provider,
      model: model || DEFAULT_MODELS.lovable,
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
    };
  }

  let apiKey: string | null = null;
  let enabled = false;
  try {
    const { data } = await admin
      .from("ai_providers")
      .select("api_key, enabled")
      .eq("provider", provider)
      .maybeSingle();
    apiKey = data?.api_key ?? null;
    enabled = !!data?.enabled;
  } catch (_) { /* ignore */ }

  if (!apiKey || !enabled) apiKey = envKey(provider);

  if (!apiKey) {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (key) {
      return {
        provider: "lovable",
        model: DEFAULT_MODELS.lovable,
        url: "https://ai.gateway.lovable.dev/v1/chat/completions",
        headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
      };
    }
    return envFallback();
  }

  return buildConfig(provider, model, apiKey);
}
