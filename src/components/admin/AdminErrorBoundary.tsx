import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Shown in the error card so it's clear which tab crashed. */
  label: string;
}

interface State {
  error: Error | null;
}

// Ohne diese Boundary lässt ein einzelner Laufzeitfehler in einem Admin-Tab
// (z.B. eine kaputte Datenform aus Supabase) React die komplette Seite
// unmounten -> leere weisse Seite ohne jeden Hinweis, was passiert ist.
class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Admin-Tab "${this.props.label}" ist abgestürzt:`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-xl mx-auto mt-8 bg-card border-2 border-destructive p-6 text-center space-y-3" style={{ borderRadius: "3px" }}>
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <h2 className="font-heading font-bold text-lg">Fehler im Tab „{this.props.label}"</h2>
          <p className="text-sm text-muted-foreground font-body break-words">{this.state.error.message}</p>
          <Button size="sm" variant="outline" className="font-body" onClick={() => this.setState({ error: null })}>
            <RefreshCw className="w-4 h-4 mr-1" /> Erneut versuchen
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AdminErrorBoundary;
