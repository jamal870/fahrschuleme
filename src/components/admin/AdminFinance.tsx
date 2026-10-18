import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw, Wallet, Download, BadgeCheck } from "lucide-react";
import PaymentDialog from "./PaymentDialog";
import {
  chf, methodLabel, normalizeMethod, paymentStatusLabel, addPayment, PAYMENT_METHODS, type BookingPayment,
} from "@/lib/payments";

interface BookingRow {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  booking_type: string;
  total_price: number;
  status: string;
  payment_method: string;
  payment_status: string;
}

type Row = BookingRow & { paid: number; remaining: number; methods: string[] };

const statusBadge = (s: string) =>
  s === "paid" ? "bg-green-600 text-white" : s === "partial" ? "bg-amber-500 text-white" : "bg-muted text-foreground";

const AdminFinance = () => {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [payFor, setPayFor] = useState<BookingRow | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  // Schnellbestätigung: offener Restbetrag ist eingegangen (Überweisung / TWINT / Bar)
  const confirmReceived = async (r: Row) => {
    if (r.remaining <= 0) return;
    const method = normalizeMethod(r.payment_method);
    if (!confirm(`${chf(r.remaining)} von ${r.first_name} ${r.last_name} als eingegangen (${methodLabel(method)}) bestätigen?`)) return;
    setConfirming(r.id);
    try {
      await addPayment({
        booking_id: r.id, amount: r.remaining, method,
        paid_at: new Date().toISOString().slice(0, 10),
        note: method === "ueberweisung" ? "Zahlungseingang bestätigt" : null,
      });
      toast.success(`${chf(r.remaining)} erfasst – Buchung ist bezahlt`);
      await load();
    } catch (e) {
      toast.error("Bestätigen fehlgeschlagen: " + (e as Error).message);
    } finally {
      setConfirming(null);
    }
  };

  const load = async () => {
    setLoading(true);
    const [{ data: b, error: be }, { data: p, error: pe }] = await Promise.all([
      supabase.from("bookings")
        .select("id, created_at, first_name, last_name, email, booking_type, total_price, status, payment_method, payment_status")
        .order("created_at", { ascending: false }),
      (supabase as any).from("booking_payments").select("*"),
    ]);
    if (be) toast.error("Buchungen konnten nicht geladen werden: " + be.message);
    if (pe) toast.error("Zahlungen konnten nicht geladen werden: " + pe.message + " (Migration booking_payments ausgeführt?)");
    setBookings((b as BookingRow[]) ?? []);
    setPayments((p as BookingPayment[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const rows = useMemo<Row[]>(() => {
    const byBooking = new Map<string, BookingPayment[]>();
    payments.forEach((p) => {
      const list = byBooking.get(p.booking_id) ?? [];
      list.push(p);
      byBooking.set(p.booking_id, list);
    });
    return bookings.map((b) => {
      const list = byBooking.get(b.id) ?? [];
      const paid = list.reduce((s, p) => s + Number(p.amount || 0), 0);
      const methods = Array.from(new Set(list.map((p) => String(p.method))));
      return { ...b, paid, remaining: Math.max(0, Math.round((Number(b.total_price) - paid) * 100) / 100), methods };
    });
  }, [bookings, payments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!includeCancelled && r.status === "cancelled") return false;
      if (statusFilter !== "all" && r.payment_status !== statusFilter) return false;
      if (methodFilter !== "all") {
        // Zahlungsart: entweder eine erfasste Zahlung mit dieser Art oder die gewählte Art der Buchung
        const booked = normalizeMethod(r.payment_method);
        if (!r.methods.includes(methodFilter) && booked !== methodFilter) return false;
      }
      if (q && !(`${r.first_name} ${r.last_name} ${r.email}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, statusFilter, methodFilter, search, includeCancelled]);

  const totals = useMemo(() => {
    const t = { total: 0, paid: 0, remaining: 0 };
    filtered.forEach((r) => { t.total += Number(r.total_price); t.paid += r.paid; t.remaining += r.remaining; });
    return t;
  }, [filtered]);

  // Einnahmen nach Zahlungsart (nur erfasste Zahlungen, unabhängig vom Filter "Status")
  const byMethod = useMemo(() => {
    const ids = new Set(filtered.map((r) => r.id));
    const m = new Map<string, number>();
    payments.filter((p) => ids.has(p.booking_id)).forEach((p) => {
      m.set(String(p.method), (m.get(String(p.method)) ?? 0) + Number(p.amount || 0));
    });
    return m;
  }, [filtered, payments]);

  const exportCsv = () => {
    const head = ["Datum", "Name", "E-Mail", "Typ", "Betrag", "Bezahlt", "Offen", "Status", "Zahlungsart (Buchung)", "Zahlungsarten (erfasst)"];
    const lines = filtered.map((r) => [
      new Date(r.created_at).toLocaleDateString("de-CH"),
      `${r.first_name} ${r.last_name}`, r.email, r.booking_type,
      Number(r.total_price).toFixed(2), r.paid.toFixed(2), r.remaining.toFixed(2),
      paymentStatusLabel(r.payment_status), methodLabel(normalizeMethod(r.payment_method)),
      r.methods.map(methodLabel).join(" / "),
    ]);
    const csv = [head, ...lines].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Finanzen_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-heading font-bold flex items-center gap-2"><Wallet className="w-5 h-5" /> Finanzen</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="w-4 h-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1" /> Aktualisieren
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card><CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Gesamtbetrag (Auswahl)</div>
          <div className="text-2xl font-semibold">{chf(totals.total)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Eingenommen</div>
          <div className="text-2xl font-semibold text-green-700">{chf(totals.paid)}</div>
          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3">
            {PAYMENT_METHODS.map((m) => byMethod.get(m.value) ? (
              <span key={m.value}>{m.label}: {chf(byMethod.get(m.value)!)}</span>
            ) : null)}
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Offen</div>
          <div className="text-2xl font-semibold text-amber-700">{chf(totals.remaining)}</div>
        </CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Name oder E-Mail suchen…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Zahlungsart" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Zahlungsarten</SelectItem>
            {PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="pending">Offen</SelectItem>
            <SelectItem value="partial">Teilbezahlt</SelectItem>
            <SelectItem value="paid">Bezahlt</SelectItem>
          </SelectContent>
        </Select>
        <label className="text-sm flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={includeCancelled} onChange={(e) => setIncludeCancelled(e.target.checked)} />
          Stornierte anzeigen
        </label>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} Buchungen</span>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-center text-muted-foreground">Laden…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">Keine Buchungen für diese Auswahl.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Zahlungsart</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead className="text-right">Bezahlt</TableHead>
                  <TableHead className="text-right">Offen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className={r.status === "cancelled" ? "opacity-60" : ""}>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("de-CH")}</TableCell>
                    <TableCell>
                      <div className="font-medium">{r.first_name} {r.last_name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{r.booking_type}</Badge></TableCell>
                    <TableCell className="text-sm">
                      {r.methods.length ? r.methods.map(methodLabel).join(" / ") : methodLabel(normalizeMethod(r.payment_method))}
                    </TableCell>
                    <TableCell className="text-right">{chf(Number(r.total_price))}</TableCell>
                    <TableCell className="text-right text-green-700">{chf(r.paid)}</TableCell>
                    <TableCell className={`text-right ${r.remaining > 0 ? "text-amber-700 font-medium" : ""}`}>{chf(r.remaining)}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-0.5 rounded ${statusBadge(r.payment_status)}`}>{paymentStatusLabel(r.payment_status)}</span></TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        {r.remaining > 0 && r.status !== "cancelled" && normalizeMethod(r.payment_method) !== "stripe" && (
                          <Button size="sm" variant="outline" disabled={confirming === r.id}
                            className="h-7 px-2 border-green-600 text-green-700 hover:bg-green-50"
                            title={`${chf(r.remaining)} als eingegangen bestätigen`}
                            onClick={() => confirmReceived(r)}>
                            <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Eingang bestätigen
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setPayFor(r)}>Zahlungen</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaymentDialog booking={payFor} open={!!payFor} onClose={() => setPayFor(null)} onChanged={load} />
    </div>
  );
};

export default AdminFinance;
