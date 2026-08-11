import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, KeyRound, Save, Zap } from "lucide-react";

type ProviderRow = {
  provider: string;
  enabled: boolean;
  has_key: boolean;
  masked_key: string | null;
};

type AssistantRow = { assistant: string; provider: string; model: string };

const PROVIDER_LABELS: Record<string, string> = {
  lovable: "Lovable AI (Standard, ohne eigenen Key)",
  openai: "OpenAI",
  gemini: "Google Gemini",
  anthropic: "Anthropic Claude",
};

const PROVIDER_HINTS: Record<string, string> = {
  openai: "Key aus platform.openai.com → API keys (sk-…)",
  gemini: "Key aus aistudio.google.com → API key",
  anthropic: "Key aus console.anthropic.com → API keys (sk-ant-…)",
};

const MODEL_SUGGESTIONS: Record<string, string[]> = {
  lovable: ["google/gemini-3.6-flash", "google/gemini-2.5-pro", "openai/gpt-5-mini"],
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
  gemini: ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro"],
  anthropic: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"],
};

const ASSISTANT_LABELS: Record<string, string> = {
  chatbot: "Website-Chatbot (Ask AI)",
  admin: "Admin-Assistent",
};

const DEFAULT_PROVIDERS: ProviderRow[] = [
  { provider: "lovable", enabled: true, has_key: false, masked_key: null },
  { provider: "openai", enabled: false, has_key: false, masked_key: null },
  { provider: "gemini", enabled: false, has_key: false, masked_key: null },
  { provider: "anthropic", enabled: false, has_key: false, masked_key: null },
];

const DEFAULT_ASSISTANTS: AssistantRow[] = [
  { assistant: "chatbot", provider: "lovable", model: "google/gemini-3.6-flash" },
  { assistant: "admin", provider: "lovable", model: "google/gemini-3.6-flash" },
];

export default function AdminAiSettings() {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [assistants, setAssistants] = useState<AssistantRow[]>([]);
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [backendOk, setBackendOk] = useState(true);

  const call = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("ai-settings", { body: payload });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await call({ action: "list" });
      const provs: ProviderRow[] = data.providers ?? [];
      const asss: AssistantRow[] = data.assistants ?? [];
      setProviders(provs.length ? provs : DEFAULT_PROVIDERS);
      setAssistants(asss.length ? asss : DEFAULT_ASSISTANTS);
      setBackendOk(true);
    } catch (e) {
      setProviders(DEFAULT_PROVIDERS);
      setAssistants(DEFAULT_ASSISTANTS);
      setBackendOk(false);
      toast.error("KI-Einstellungen konnten nicht geladen werden", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load();
  }, []);

  const saveProvider = async (provider: string, patch: Record<string, unknown>) => {
    setBusy(provider);
    try {
      await call({ action: "save_provider", provider, ...patch });
      setKeyInputs((s) => ({ ...s, [provider]: "" }));
      toast.success("Gespeichert");
      await load();
    } catch (e) {
      toast.error("Speichern fehlgeschlagen", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setBusy(null);
    }
  };

  const testProvider = async (provider: string, model?: string, resultKey?: string) => {
    const key = resultKey ?? provider;
    setBusy(`test-${key}`);
    setTestResults((s) => ({ ...s, [key]: undefined as never }));
    try {
      const res = await call({ action: "test", provider, model });
      if (res.ok) {
        setTestResults((s) => ({
          ...s,
          [key]: { ok: true, message: `Verbindung ok (${res.provider} / ${res.model})`, at: Date.now() },
        }));
        toast.success(`Verbindung ok (${res.provider} / ${res.model})`);
      } else {
        const detail = String(res.detail ?? "").slice(0, 200);
        setTestResults((s) => ({
          ...s,
          [key]: { ok: false, message: `Fehler ${res.status}: ${detail || "unbekannt"}`, at: Date.now() },
        }));
        toast.error(`Fehler ${res.status}`, { description: detail });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
      setTestResults((s) => ({ ...s, [key]: { ok: false, message: msg, at: Date.now() } }));
      toast.error("Test fehlgeschlagen", { description: msg });
    } finally {
      setBusy(null);
    }
  };


  const saveAssistant = async (row: AssistantRow) => {
    setBusy(row.assistant);
    try {
      await call({
        action: "save_assistant",
        assistant: row.assistant,
        provider: row.provider,
        model: row.model,
      });
      toast.success("Zuordnung gespeichert");
      await load();
    } catch (e) {
      toast.error("Speichern fehlgeschlagen", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Lade KI-Einstellungen …
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!backendOk && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Die Funktion <code>ai-settings</code> ist auf dem Live-Server noch nicht installiert.
          Änderungen können erst gespeichert werden, wenn sie deployed ist. Unten siehst du die
          Standardwerte.
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading uppercase">
            <KeyRound className="h-5 w-5 text-primary" /> KI-Anbieter &amp; Schlüssel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {providers.map((p) => (
            <div key={p.provider} className="rounded-md border p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{PROVIDER_LABELS[p.provider] ?? p.provider}</span>
                  {p.has_key && <Badge variant="secondary">{p.masked_key}</Badge>}
                  {p.provider === "lovable" && <Badge variant="outline">kein Key nötig</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`sw-${p.provider}`} className="text-sm text-muted-foreground">
                    Aktiv
                  </Label>
                  <Switch
                    id={`sw-${p.provider}`}
                    checked={p.enabled}
                    onCheckedChange={(v) => saveProvider(p.provider, { enabled: v })}
                    disabled={busy === p.provider}
                  />
                </div>
              </div>

              {p.provider !== "lovable" && (
                <>
                  <p className="text-xs text-muted-foreground">{PROVIDER_HINTS[p.provider]}</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="password"
                      autoComplete="off"
                      placeholder={p.has_key ? "Neuen Key eingeben (ersetzt bestehenden)" : "API-Key einfügen"}
                      value={keyInputs[p.provider] ?? ""}
                      onChange={(e) => setKeyInputs((s) => ({ ...s, [p.provider]: e.target.value }))}
                    />
                    <Button
                      onClick={() => saveProvider(p.provider, { api_key: keyInputs[p.provider] ?? "" })}
                      disabled={busy === p.provider || !(keyInputs[p.provider] ?? "").trim()}
                    >
                      <Save className="h-4 w-4 mr-1" /> Speichern
                    </Button>
                    {p.has_key && (
                      <Button
                        variant="outline"
                        onClick={() => saveProvider(p.provider, { api_key: null, enabled: false })}
                        disabled={busy === p.provider}
                      >
                        Entfernen
                      </Button>
                    )}
                  </div>
                </>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => testProvider(p.provider)}
                disabled={busy === `test-${p.provider}`}
              >
                {busy === `test-${p.provider}` ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-1" />
                )}
                Verbindung testen
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading uppercase">Modell pro Assistent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {assistants.map((a) => (
            <div key={a.assistant} className="rounded-md border p-4 space-y-3">
              <div className="font-semibold">{ASSISTANT_LABELS[a.assistant] ?? a.assistant}</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Anbieter</Label>
                  <Select
                    value={a.provider}
                    onValueChange={(v) =>
                      setAssistants((rows) =>
                        rows.map((r) =>
                          r.assistant === a.assistant
                            ? { ...r, provider: v, model: MODEL_SUGGESTIONS[v]?.[0] ?? r.model }
                            : r,
                        ),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PROVIDER_LABELS).map((key) => (
                        <SelectItem key={key} value={key}>
                          {PROVIDER_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Modell</Label>
                  <Input
                    value={a.model}
                    list={`models-${a.assistant}`}
                    onChange={(e) =>
                      setAssistants((rows) =>
                        rows.map((r) =>
                          r.assistant === a.assistant ? { ...r, model: e.target.value } : r,
                        ),
                      )
                    }
                  />
                  <datalist id={`models-${a.assistant}`}>
                    {(MODEL_SUGGESTIONS[a.provider] ?? []).map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
              </div>
              <Button onClick={() => saveAssistant(a)} disabled={busy === a.assistant}>
                {busy === a.assistant ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Speichern
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Ist ein gewählter Anbieter nicht aktiv oder fehlt der Key, nutzt der Assistent
            automatisch Lovable AI als Fallback.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
