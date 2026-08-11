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
  } catch (_) { /* Fallback auf Lovable AI */ }

  if (provider === "lovable") {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return { error: "missing_config" };
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

  if (!apiKey || !enabled) {
    // Fallback: Lovable AI, damit der Assistent nie komplett ausfällt
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return { error: "missing_provider_key" };
    return {
      provider: "lovable",
      model: DEFAULT_MODELS.lovable,
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
    };
  }

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

  // anthropic (OpenAI-kompatibler Endpunkt)
  return {
    provider,
    model: model || DEFAULT_MODELS.anthropic,
    url: "https://api.anthropic.com/v1/chat/completions",
    headers: { Authorization: `Bearer ${apiKey}` },
  };
}
