import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root wurde nicht gefunden.");
}

const root = createRoot(rootElement);

const renderFatalError = (title: string, message: string) => {
  root.render(
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <main className="w-full max-w-2xl border border-destructive/40 bg-card p-8 space-y-4" style={{ borderRadius: "3px" }}>
        <h1 className="font-heading text-2xl uppercase text-destructive">{title}</h1>
        <p className="font-body text-base leading-relaxed">{message}</p>
      </main>
    </div>,
  );
};

const hasValidSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const bootstrap = async () => {
  if (!hasValidSupabaseConfig()) {
    renderFatalError(
      "Konfiguration fehlt",
      "Diese Bereitstellung hat keine gültigen VITE_SUPABASE_URL- und VITE_SUPABASE_PUBLISHABLE_KEY-Werte. Bitte die Umgebungsvariablen im Hosting setzen und danach neu deployen.",
    );
    return;
  }

  try {
    const { default: App } = await import("./App.tsx");

    root.render(
      <HelmetProvider>
        <App />
      </HelmetProvider>,
    );
  } catch (error) {
    console.error(error);
    renderFatalError(
      "App konnte nicht geladen werden",
      error instanceof Error ? error.message : "Unbekannter Fehler beim Starten der App.",
    );
  }
};

void bootstrap();
