import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function BuchungErfolgreich() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }

    // Poll for booking confirmation (webhook confirms it server-side)
    let attempts = 0;
    const maxAttempts = 30; // 30 * 2s = 60s max wait

    const poll = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("status, first_name, email")
        .eq("id", bookingId)
        .single();

      if (data?.status === "confirmed") {
        setConfirmed(true);
        setLoading(false);
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        setLoading(false);
        return;
      }

      setTimeout(poll, 2000);
    };

    poll();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <nav className="absolute top-0 left-0 right-0 max-w-5xl mx-auto px-6 py-5 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex items-baseline gap-0.5">
            <span className="text-[22px] font-heading font-bold text-foreground" style={{ letterSpacing: "0.05em" }}>Drive</span>
            <span className="text-[28px] text-primary" style={{ fontFamily: "'Kaushan Script', cursive" }}>me</span>
          </span>
          <span className="text-[10px] font-body text-muted-foreground">Fahrschule</span>
        </Link>
      </nav>
      <div className="text-center max-w-lg">
        {loading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-body">Zahlung wird überprüft...</p>
          </div>
        ) : confirmed ? (
          <>
            <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-heading font-bold text-foreground mb-3">Buchung & Zahlung erfolgreich!</h1>
            <p className="text-muted-foreground font-body mb-2">
              Vielen Dank für deine Buchung. Die Bestätigung wird per E-Mail gesendet.
            </p>
            <Button asChild className="mt-4 font-heading uppercase" style={{ borderRadius: "3px" }}>
              <Link to="/">Zurück zur Startseite</Link>
            </Button>
          </>
        ) : (
          <>
            <Clock className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-heading font-bold text-foreground mb-3">Zahlung wird verarbeitet</h1>
            <p className="text-muted-foreground font-body mb-6">
              Die Zahlungsbestätigung steht noch aus. Du erhältst eine E-Mail, sobald alles bestätigt ist.
            </p>
            <Button asChild className="mt-4 font-heading uppercase" style={{ borderRadius: "3px" }}>
              <Link to="/">Zurück zur Startseite</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
