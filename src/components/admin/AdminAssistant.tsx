import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Send } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "Erstelle eine Aktion: Fahrstunden Auto -15% bis Ende Monat",
  "Plane einen neuen MGK Teil 1 am 12.09.2026, 08:00 - 12:00 in Wettingen",
  "Zeige mir alle zukünftigen Kurstermine",
  "Wie viele Buchungen hatten wir in den letzten 30 Tagen?",
];

/** Rendert **fett** und Zeilenumbrüche. */
const renderText = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={i} className="block">
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={j}>{part.slice(2, -2)}</strong>
          : <span key={j}>{part}</span>,
      )}
    </span>
  ));

const AdminAssistant = ({ onDataChanged }: { onDataChanged?: () => void }) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! Ich bin dein **Admin-Assistent**. Ich kann Aktionen erstellen und ändern, Kurstermine planen und dir Buchungszahlen zeigen. Was möchtest du tun?",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);
  useEffect(() => { if (!busy) inputRef.current?.focus(); }, [busy]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Session abgelaufen – bitte neu anmelden."); return; }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ messages: next }),
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || data?.error || `Fehler ${res.status}`;
        toast.error(msg);
        setMessages([...next, { role: "assistant", content: `Fehler: ${msg}` }]);
        return;
      }

      setMessages([...next, { role: "assistant", content: data.reply || "(keine Antwort)" }]);
      if (Array.isArray(data.actions) && data.actions.length > 0) {
        toast.success("Änderung gespeichert");
        onDataChanged?.();
      }
    } catch (e) {
      toast.error("Verbindung fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-card border border-border" style={{ borderRadius: "3px" }}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold uppercase text-sm">KI-Assistent</h2>
        <span className="text-xs text-muted-foreground font-body">Aktionen &amp; Kurse verwalten</span>
      </div>

      <div className="h-[420px] overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] px-3 py-2 text-sm font-body whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
              style={{ borderRadius: "3px" }}
            >
              {renderText(m.content)}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-muted px-3 py-2 flex gap-1" style={{ borderRadius: "3px" }}>
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs font-body border border-border px-2 py-1 hover:bg-muted text-left"
              style={{ borderRadius: "3px" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex gap-2 border-t border-border p-3"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="z.B. Erstelle eine Aktion für Motorrad-Fahrstunden…"
          disabled={busy}
          className="font-body"
        />
        <Button type="submit" disabled={busy || !input.trim()} className="font-body">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default AdminAssistant;
