import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function BuchungErfolgreich() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const emailSentRef = useRef(false);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }

    const confirmAndNotify = async () => {
      // Fetch booking
      const { data } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
      if (!data) { setLoading(false); return; }

      // Update status to confirmed if pending
      if (data.status === "pending_payment" || data.status === "pending") {
        await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bookingId);
        data.status = "confirmed";
      }

      setBooking(data);
      setLoading(false);

      // Send confirmation email only once
      if (!emailSentRef.current) {
        emailSentRef.current = true;

        // Fetch booking items for email
        const { data: items } = await supabase.from("booking_items").select("course_date_id").eq("booking_id", bookingId);
        const courseIds = items?.map(i => i.course_date_id).filter(Boolean) || [];

        let courses: any[] = [];
        if (courseIds.length > 0) {
          const { data: courseData } = await supabase.from("course_dates").select("*").in("id", courseIds);
          courses = courseData || [];
        }

        const total = courses.reduce((s: number, c: any) => s + (c.price || 0), 0);

        try {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "booking-confirmation",
              recipientEmail: data.email,
              idempotencyKey: `booking-confirm-${bookingId}`,
              templateData: {
                firstName: data.first_name,
                lastName: data.last_name,
                address: data.address,
                birthDate: data.birth_date,
                faNumber: data.fa_number,
                phone: data.phone,
                email: data.email,
                courses: courses.map(c => ({
                  part: c.part,
                  date: c.date,
                  time: c.time,
                  location: c.location,
                  price: c.price,
                })),
                totalPrice: total.toFixed(2),
                paymentMethod: data.payment_method,
                bookingId: bookingId,
                bookingDate: new Date().toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" }),
              },
            },
          });
        } catch (emailErr) {
          console.error("Email send error:", emailErr);
        }
      }
    };

    confirmAndNotify();
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
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        ) : (
          <>
            <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-heading font-bold text-foreground mb-3">Buchung & Zahlung erfolgreich!</h1>
            <p className="text-muted-foreground font-body mb-2">
              Vielen Dank für deine Buchung{booking ? `, ${booking.first_name}` : ""}.
            </p>
            {booking && <p className="text-sm text-muted-foreground font-body mb-6">Bestätigung an <strong>{booking.email}</strong> gesendet.</p>}
            <Button asChild className="mt-4 font-heading uppercase" style={{ borderRadius: "3px" }}>
              <Link to="/">Zurück zur Startseite</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
