// Freigabe von Kursplätzen, die durch eine nicht abgeschlossene Online-Zahlung
// blockiert sind. Der Trigger trg_decrement_spots zieht den Platz bereits beim
// Insert der booking_items ab (Status "pending_payment") - wird die Zahlung
// abgebrochen, schlägt fehl oder läuft die Stripe-Session ab, muss der Platz
// hier explizit wieder freigegeben werden.

export type FailReason = "abgebrochen" | "abgelaufen" | "fehlgeschlagen";

export const ADMIN_EMAILS = ["info@l-me.ch", "jamal@drive-me.ch"];

// Stripe erlaubt für Checkout-Sessions minimal 30 Minuten bis zum Ablauf.
export const RESERVATION_MINUTES = 30;
// Der Sweep darf erst greifen, wenn die Stripe-Session sicher abgelaufen ist
// (Session läuft RESERVATION_MINUTES + 1 Min., plus Puffer für den Webhook) -
// sonst könnte ein Kunde in der letzten Minute zahlen, obwohl der Platz schon
// wieder freigegeben wurde.
export const STALE_AFTER_MINUTES = RESERVATION_MINUTES + 5;

interface ReleasedBooking {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  payment_method: string | null;
  total_price: number | null;
  created_at: string;
  courses: Array<{ part: number; day: string | null; date: string; time: string; location: string }>;
}

// Setzt genau dann Status/Plätze zurück, wenn die Buchung noch "pending_payment"
// ist (Guard gegen doppelte Freigabe durch Webhook + Abbruchseite + Sweep).
export async function releasePendingBooking(supabase: any, bookingId: string): Promise<ReleasedBooking | null> {
  const { data: rows, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled", payment_status: "failed" })
    .eq("id", bookingId)
    .eq("status", "pending_payment")
    .select("id, first_name, last_name, email, phone, payment_method, total_price, created_at");
  if (error) throw error;
  const booking = rows?.[0];
  if (!booking) return null;

  const { data: items } = await supabase
    .from("booking_items")
    .select("course_date_id")
    .eq("booking_id", bookingId);
  const courseIds = (items || []).map((i: any) => i.course_date_id).filter(Boolean) as string[];

  for (const cid of courseIds) {
    const { error: incErr } = await supabase.rpc("increment_spots", { course_id: cid });
    if (incErr) console.error("[release-pending-booking] increment_spots failed", cid, incErr.message);
  }

  let courses: ReleasedBooking["courses"] = [];
  if (courseIds.length) {
    const { data: cd } = await supabase
      .from("course_dates")
      .select("part, day, date, time, location")
      .in("id", courseIds);
    courses = (cd || []).slice().sort((a: any, b: any) => Number(a.part) - Number(b.part));
  }

  return { ...booking, courses };
}

export async function notifyPaymentFailed(
  supabaseUrl: string,
  serviceKey: string,
  booking: ReleasedBooking,
  reason: FailReason,
) {
  const send = async (templateName: string, recipientEmail: string, idempotencyKey: string, templateData: Record<string, unknown>) => {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ templateName, recipientEmail, idempotencyKey, templateData }),
    });
    if (!res.ok) {
      console.error("[release-pending-booking] email failed", { templateName, recipientEmail, status: res.status, body: (await res.text()).slice(0, 300) });
    }
  };

  const shortId = booking.id.slice(0, 8).toUpperCase();

  await send("payment-failed", booking.email, `payment-failed-${booking.id}`, {
    firstName: booking.first_name,
    courses: booking.courses,
    reason,
    bookingId: shortId,
  });

  for (const adminEmail of ADMIN_EMAILS) {
    await send("admin-payment-failed", adminEmail, `admin-payment-failed-${booking.id}-${adminEmail}`, {
      bookingId: shortId,
      firstName: booking.first_name,
      lastName: booking.last_name,
      email: booking.email,
      phone: booking.phone,
      paymentMethod: booking.payment_method,
      totalPrice: booking.total_price != null ? Number(booking.total_price).toFixed(2) : undefined,
      createdAt: booking.created_at,
      courses: booking.courses,
      reason,
    });
  }
}

export async function handleFailedPayment(
  supabase: any,
  supabaseUrl: string,
  serviceKey: string,
  bookingId: string,
  reason: FailReason,
): Promise<boolean> {
  const released = await releasePendingBooking(supabase, bookingId);
  if (!released) return false;
  console.log(`[release-pending-booking] ${bookingId} freigegeben (${reason}), ${released.courses.length} Kursplätze zurück`);
  try {
    await notifyPaymentFailed(supabaseUrl, serviceKey, released, reason);
  } catch (e) {
    console.error("[release-pending-booking] notify failed", (e as Error).message);
  }
  return true;
}

// Sicherheitsnetz, falls der Stripe-Webhook (checkout.session.expired) nicht
// ankommt: alle "pending_payment"-Buchungen, deren Reservierungsfenster
// abgelaufen ist, freigeben. Wird opportunistisch bei neuen Buchungen aufgerufen,
// da auf dem VPS kein Cron-Scheduler für Edge Functions läuft.
export async function releaseStalePendingBookings(supabase: any, supabaseUrl: string, serviceKey: string): Promise<number> {
  const cutoff = new Date(Date.now() - STALE_AFTER_MINUTES * 60_000).toISOString();
  const { data: stale, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("status", "pending_payment")
    .lt("created_at", cutoff)
    .limit(50);
  if (error || !stale?.length) return 0;

  let count = 0;
  for (const b of stale) {
    try {
      if (await handleFailedPayment(supabase, supabaseUrl, serviceKey, b.id, "abgelaufen")) count++;
    } catch (e) {
      console.error("[release-pending-booking] stale release failed", b.id, (e as Error).message);
    }
  }
  return count;
}
