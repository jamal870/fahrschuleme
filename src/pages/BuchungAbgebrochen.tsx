import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import BrandLogo from "@/components/BrandLogo";
import Seo from "@/components/Seo";

// Stripe leitet hierher, wenn der Kunde den Checkout abbricht. Die Kursplätze
// werden sofort freigegeben, statt bis zum Ablauf der Stripe-Session zu warten.
export default function BuchungAbgebrochen() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [loading, setLoading] = useState(!!bookingId);

  useEffect(() => {
    if (!bookingId) return;
    supabase.functions
      .invoke("cancel-course-payment", { body: { bookingId } })
      .catch(() => {
        // Sicherheitsnetz: Stripe-Session läuft nach 30 Min. ab und der Webhook
        // gibt die Plätze dann trotzdem frei.
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <Seo
        title="Zahlung abgebrochen – Fahrschule me"
        description="Die Online-Zahlung wurde abgebrochen. Es wurde keine Buchung angelegt."
        path="/buchung-abgebrochen"
        noindex
      />
      <nav className="absolute top-0 left-0 right-0 max-w-5xl mx-auto px-6 py-5 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo imgClassName="h-12 w-auto" />
        </Link>
      </nav>
      <div className="text-center max-w-lg">
        {loading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-body">Reservierung wird freigegeben...</p>
          </div>
        ) : (
          <>
            <XCircle className="w-20 h-20 text-destructive mx-auto mb-6" />
            <h1 className="text-3xl font-heading font-bold text-foreground mb-3">Zahlung abgebrochen</h1>
            <p className="text-muted-foreground font-body mb-2">
              Die Online-Zahlung wurde nicht abgeschlossen. Es wurde <strong>keine Buchung</strong> angelegt und nichts belastet.
            </p>
            <p className="text-sm text-muted-foreground font-body mb-6">
              Die reservierten Kursplätze sind wieder frei. Du kannst die Buchung jederzeit erneut starten – auch mit Barzahlung oder Überweisung.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="font-heading uppercase" style={{ borderRadius: "3px" }}>
                <Link to="/grundkurs">Erneut buchen</Link>
              </Button>
              <Button asChild variant="outline" className="font-heading uppercase" style={{ borderRadius: "3px" }}>
                <Link to="/">Zur Startseite</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
