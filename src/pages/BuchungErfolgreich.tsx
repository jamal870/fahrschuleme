import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bike, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function BuchungErfolgreich() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();
      setBooking(data);
      setLoading(false);
    };

    fetchBooking();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <nav className="absolute top-0 left-0 right-0 max-w-5xl mx-auto px-6 py-5 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <Bike className="w-7 h-7 text-primary" />
          <span className="text-xl font-bold font-[Outfit] text-foreground">Drive me</span>
          <span className="text-xs text-muted-foreground font-medium mt-1">Fahrschule</span>
        </Link>
      </nav>

      <div className="text-center max-w-lg">
        {loading ? (
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        ) : (
          <>
            <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
            <h1 className="text-3xl font-bold font-[Outfit] text-foreground mb-3">
              Buchung & Zahlung erfolgreich!
            </h1>
            <p className="text-muted-foreground mb-2">
              Vielen Dank für deine Buchung{booking ? `, ${booking.first_name}` : ""}.
            </p>
            {booking && (
              <p className="text-sm text-muted-foreground mb-6">
                Eine Bestätigung wurde an <strong>{booking.email}</strong> gesendet.
              </p>
            )}
            <Button asChild className="mt-4">
              <Link to="/">Zurück zur Startseite</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
