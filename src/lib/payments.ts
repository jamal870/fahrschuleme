import { supabase } from "@/integrations/supabase/client";

export type PaymentMethod = "bar" | "ueberweisung" | "twint" | "stripe" | "sonstiges";

export interface BookingPayment {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod | string;
  paid_at: string;
  note: string | null;
  stripe_session_id: string | null;
  created_at: string;
}

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "bar", label: "Bar" },
  { value: "ueberweisung", label: "Überweisung" },
  { value: "twint", label: "TWINT" },
  { value: "stripe", label: "Stripe / Karte" },
  { value: "sonstiges", label: "Sonstiges" },
];

export const methodLabel = (m?: string | null) =>
  PAYMENT_METHODS.find((x) => x.value === m)?.label ?? (m || "–");

/** Zahlungsart-Text der Buchung (frei, aus dem Buchungsformular) -> Kategorie */
export const normalizeMethod = (pm?: string | null): PaymentMethod => {
  const v = (pm || "").toLowerCase();
  if (v.includes("stripe") || v.includes("karte") || v.includes("card") || v.includes("online")) return "stripe";
  if (v.includes("twint")) return "twint";
  if (v.includes("bar") || v.includes("cash")) return "bar";
  if (v.includes("berweis") || v.includes("bank") || v.includes("rechnung")) return "ueberweisung";
  return "sonstiges";
};

export const chf = (n: number) =>
  new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(n);

export const sumPaid = (payments: BookingPayment[]) =>
  payments.reduce((s, p) => s + Number(p.amount || 0), 0);

export async function fetchPayments(bookingId: string): Promise<BookingPayment[]> {
  const { data, error } = await (supabase as any)
    .from("booking_payments")
    .select("*")
    .eq("booking_id", bookingId)
    .order("paid_at", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BookingPayment[];
}

export async function addPayment(p: {
  booking_id: string; amount: number; method: PaymentMethod | string; paid_at: string; note?: string | null;
}): Promise<void> {
  const { error } = await (supabase as any).from("booking_payments").insert({
    booking_id: p.booking_id, amount: p.amount, method: p.method, paid_at: p.paid_at, note: p.note || null,
  });
  if (error) throw error;
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await (supabase as any).from("booking_payments").delete().eq("id", id);
  if (error) throw error;
}

/** Status-Label aus bookings.payment_status */
export const paymentStatusLabel = (s?: string | null) =>
  s === "paid" ? "Bezahlt" : s === "partial" ? "Teilbezahlt" : "Offen";
