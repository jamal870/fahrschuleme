import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Plus, BadgeCheck, Pencil, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import {
  addPayment, deletePayment, fetchPayments, chf, methodLabel, normalizeMethod, sumPaid,
  PAYMENT_METHODS, type BookingPayment, type PaymentMethod,
} from "@/lib/payments";

export interface PaymentDialogBooking {
  id: string;
  first_name: string;
  last_name: string;
  total_price: number;
  payment_method?: string | null;
  status?: string | null;
}

interface Props {
  booking: PaymentDialogBooking | null;
  open: boolean;
  onClose: () => void;
  /** Wird nach jeder Änderung aufgerufen (neuer Status in bookings.payment_status) */
  onChanged?: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const PaymentDialog = ({ booking, open, onClose, onChanged }: Props) => {
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("bar");
  const [paidAt, setPaidAt] = useState(today());
  const [note, setNote] = useState("");
  // Betrag der Buchung anpassen (z. B. Rabatt, A1-Preis)
  const [editingTotal, setEditingTotal] = useState(false);
  const [newTotal, setNewTotal] = useState("");
  const [totalReason, setTotalReason] = useState("");
  const [localTotal, setLocalTotal] = useState<number | null>(null);
  // Buchung stornieren
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNotify, setCancelNotify] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const total = localTotal ?? Number(booking?.total_price ?? 0);
  const isCancelled = booking?.status === "cancelled";
  const paid = sumPaid(payments);
  const remaining = Math.max(0, Math.round((total - paid) * 100) / 100);

  const load = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      setPayments(await fetchPayments(booking.id));
    } catch (e) {
      toast.error("Zahlungen konnten nicht geladen werden: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && booking) {
      load();
      setAmount("");
      setMethod(normalizeMethod(booking.payment_method));
      setPaidAt(today());
      setNote("");
      setLocalTotal(null);
      setEditingTotal(false);
      setNewTotal("");
      setTotalReason("");
      setCancelOpen(false);
      setCancelReason("");
      setCancelNotify(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, booking?.id]);

  const submit = async (amt: number) => {
    if (!booking) return;
    if (!(amt > 0)) { toast.error("Bitte einen Betrag grösser 0 eingeben"); return; }
    setSaving(true);
    try {
      await addPayment({ booking_id: booking.id, amount: amt, method, paid_at: paidAt, note });
      toast.success(`Zahlung ${chf(amt)} erfasst`);
      setAmount(""); setNote("");
      await load();
      onChanged?.();
    } catch (e) {
      toast.error("Speichern fehlgeschlagen: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: BookingPayment) => {
    if (!confirm(`Zahlung ${chf(Number(p.amount))} vom ${p.paid_at} wirklich löschen?`)) return;
    try {
      await deletePayment(p.id);
      toast.success("Zahlung gelöscht");
      await load();
      onChanged?.();
    } catch (e) {
      toast.error("Löschen fehlgeschlagen: " + (e as Error).message);
    }
  };

  const saveTotal = async () => {
    if (!booking) return;
    const v = parseFloat(newTotal.replace(",", "."));
    if (!(v >= 0)) { toast.error("Bitte einen gültigen Betrag eingeben"); return; }
    if (v < paid) {
      toast.error(`Der neue Betrag (${chf(v)}) ist kleiner als die bereits bezahlte Summe (${chf(paid)}). Zuerst eine Zahlung löschen.`);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("bookings").update({ total_price: v }).eq("id", booking.id);
      if (error) throw error;
      setLocalTotal(v);
      setEditingTotal(false);
      // Zahlungsstatus wird in der DB per Trigger (bookings_total_recalc) neu abgeleitet
      toast.success(`Betrag auf ${chf(v)} geändert${totalReason.trim() ? ` (${totalReason.trim()})` : ""}`);
      onChanged?.();
    } catch (e) {
      toast.error("Betrag konnte nicht geändert werden: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const cancelBooking = async () => {
    if (!booking) return;
    setCancelling(true);
    const { data, error } = await supabase.functions.invoke("admin-cancel-booking", {
      body: { bookingId: booking.id, mode: "cancel", reason: cancelReason.trim() || null, notify: cancelNotify },
    });
    setCancelling(false);
    if (error || (data as any)?.error) {
      toast.error("Stornieren fehlgeschlagen: " + (error?.message || (data as any)?.error));
      return;
    }
    toast.success(cancelNotify ? "Buchung storniert – Kunde wurde per E-Mail informiert" : "Buchung storniert");
    setCancelOpen(false);
    onChanged?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Zahlungen – {booking?.first_name} {booking?.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-md border border-border p-3">
            <div className="text-muted-foreground flex items-center justify-between">
              <span>Betrag</span>
              {!isCancelled && !editingTotal && (
                <button type="button" className="text-xs underline flex items-center gap-1 hover:text-foreground"
                  onClick={() => { setNewTotal(total.toFixed(2)); setEditingTotal(true); }} title="Betrag anpassen">
                  <Pencil className="w-3 h-3" /> anpassen
                </button>
              )}
            </div>
            <div className="font-semibold text-lg">{chf(total)}</div>
          </div>
          <div className="rounded-md border border-border p-3">
            <div className="text-muted-foreground">Bezahlt</div>
            <div className="font-semibold text-lg text-green-700">{chf(paid)}</div>
          </div>
          <div className="rounded-md border border-border p-3">
            <div className="text-muted-foreground">Offen</div>
            <div className={`font-semibold text-lg ${remaining > 0 ? "text-amber-700" : "text-green-700"}`}>{chf(remaining)}</div>
          </div>
        </div>

        {editingTotal && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 space-y-2">
            <div className="font-medium text-sm">Betrag der Buchung anpassen</div>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="new-total" className="text-xs">Neuer Betrag (CHF)</Label>
                <Input id="new-total" type="number" inputMode="decimal" step="0.05" min="0"
                  value={newTotal} onChange={(e) => setNewTotal(e.target.value)} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="total-reason" className="text-xs">Grund (optional)</Label>
                <Input id="total-reason" value={totalReason} onChange={(e) => setTotalReason(e.target.value)} placeholder="z. B. Rabatt, nur Teil 3, Kulanz" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={saving} onClick={saveTotal}>Betrag speichern</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingTotal(false)}>Abbrechen</Button>
            </div>
            <p className="text-xs text-muted-foreground">Der Status (Offen / Teilbezahlt / Bezahlt) wird aus dem neuen Betrag neu berechnet.</p>
          </div>
        )}

        {isCancelled && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            Diese Buchung ist <strong>storniert</strong>. Zahlungen können nur noch eingesehen oder gelöscht werden.
          </div>
        )}

        {!isCancelled && (
        <div className="rounded-md border border-border p-3 space-y-3">
          <div className="font-medium text-sm">Zahlung erfassen</div>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="pay-amount" className="text-xs">Betrag (CHF)</Label>
              <Input id="pay-amount" type="number" inputMode="decimal" step="0.05" min="0"
                value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={remaining.toFixed(2)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Zahlungsart</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pay-date" className="text-xs">Datum</Label>
              <Input id="pay-date" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pay-note" className="text-xs">Notiz (optional)</Label>
              <Input id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Anzahlung Teil 1" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={saving} onClick={() => submit(parseFloat(amount.replace(",", ".")))}>
              <Plus className="w-4 h-4 mr-1" /> Teilzahlung erfassen
            </Button>
            {remaining > 0 && (
              <Button size="sm" variant="outline" disabled={saving} onClick={() => submit(remaining)}
                className="border-green-600 text-green-700 hover:bg-green-50">
                <BadgeCheck className="w-4 h-4 mr-1" /> Restbetrag {chf(remaining)} jetzt bezahlt
              </Button>
            )}
          </div>
        </div>
        )}

        <div>
          <div className="font-medium text-sm mb-1">Bisherige Zahlungen</div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Laden…</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Zahlung erfasst.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Zahlungsart</TableHead>
                  <TableHead>Notiz</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{new Date(p.paid_at).toLocaleDateString("de-CH")}</TableCell>
                    <TableCell className="text-sm font-medium">{chf(Number(p.amount))}</TableCell>
                    <TableCell className="text-sm">{methodLabel(p.method)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.note || (p.stripe_session_id ? "Stripe (automatisch)" : "")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive" onClick={() => remove(p)} title="Zahlung löschen">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        {!isCancelled && (
          <div className="border-t border-border pt-3">
            {!cancelOpen ? (
              <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => setCancelOpen(true)}>
                <Ban className="w-4 h-4 mr-1" /> Buchung stornieren
              </Button>
            ) : (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 space-y-2">
                <div className="font-medium text-sm">Buchung stornieren</div>
                <p className="text-xs text-muted-foreground">
                  Die Kursplätze werden wieder freigegeben, die Buchung bleibt als „storniert" sichtbar.
                  {paid > 0 && <> Bereits bezahlt: <strong>{chf(paid)}</strong> – eine Rückerstattung musst du separat vornehmen.</>}
                </p>
                <Textarea rows={2} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Grund für den Kunden (optional, steht in der E-Mail)" />
                <label className="text-sm flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={cancelNotify} onChange={(e) => setCancelNotify(e.target.checked)} />
                  Kunde per E-Mail informieren
                </label>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" disabled={cancelling} onClick={cancelBooking}>
                    {cancelling ? "Storniere…" : "Jetzt stornieren"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setCancelOpen(false)}>Abbrechen</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
