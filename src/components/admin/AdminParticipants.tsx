import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw, Mail, Phone, MapPin, Calendar, BadgeCheck, Clock, ChevronDown, ChevronRight, Search, Pencil, Save, X, Send, Ban, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Booking {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string | null;
  city: string | null;
  birth_date: string;
  fa_number: string;
  booking_type: string;
  total_price: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
}

interface CourseInfo {
  id: string;
  part: number;
  day: string;
  date: string;
  time: string;
  location: string;
  instructor: string | null;
}

interface Row extends Booking {
  courses: CourseInfo[];
}

const toIso = (d: string) => {
  const [dd, mm, yyyy] = (d || "").split(".");
  return yyyy && mm && dd ? new Date(`${yyyy}-${mm}-${dd}`) : null;
};

const AdminParticipants = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "unpaid">("upcoming");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Row>>({});
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  const startEdit = (r: Row) => {
    setEditId(r.id);
    setEditData({
      email: r.email, phone: r.phone, address: r.address,
      postal_code: r.postal_code, city: r.city,
    });
  };
  const cancelEdit = () => { setEditId(null); setEditData({}); };

  const saveEdit = async (r: Row) => {
    setSaving(true);
    const { error } = await supabase.from("bookings").update({
      email: (editData.email || "").trim().toLowerCase(),
      phone: (editData.phone || "").trim(),
      address: (editData.address || "").trim(),
      postal_code: editData.postal_code ? String(editData.postal_code).trim() : null,
      city: editData.city ? String(editData.city).trim() : null,
    }).eq("id", r.id);
    setSaving(false);
    if (error) { toast.error("Speichern fehlgeschlagen: " + error.message); return; }
    setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, ...editData } as Row : x));
    cancelEdit();
    toast.success("Daten aktualisiert");
  };

  const resendConfirmation = async (r: Row) => {
    setResending(r.id);
    const now = new Date();
    const bookingDateStr = now.toLocaleDateString("de-CH", { day: "numeric", month: "long", year: "numeric" });
    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "booking-confirmation",
        recipientEmail: r.email,
        idempotencyKey: `resend-confirm-${r.id}-${Date.now()}`,
        templateData: {
          firstName: r.first_name, lastName: r.last_name,
          address: r.address, postalCode: r.postal_code, city: r.city,
          birthDate: r.birth_date, faNumber: r.fa_number,
          phone: r.phone, email: r.email,
          courses: r.courses.map((c) => ({
            part: c.part, date: c.date, time: c.time, location: c.location,
            price: Math.round(r.total_price / Math.max(1, r.courses.length)),
          })),
          totalPrice: Number(r.total_price).toFixed(2),
          paymentMethod: r.payment_method,
          bookingId: r.id,
          bookingDate: bookingDateStr,
        },
      },
    });
    setResending(null);
    if (error) { toast.error("Senden fehlgeschlagen: " + error.message); return; }
    toast.success("Buchungsbestätigung erneut gesendet an " + r.email);
  };

  // Cancel/Delete state
  const [confirmAction, setConfirmAction] = useState<null | { row: Row; mode: "cancel" | "delete" }>(null);
  const [confirmReason, setConfirmReason] = useState("");
  const [confirmNotify, setConfirmNotify] = useState(true);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const openConfirm = (row: Row, mode: "cancel" | "delete") => {
    setConfirmAction({ row, mode });
    setConfirmReason("");
    setConfirmNotify(true);
  };

  const runConfirm = async () => {
    if (!confirmAction) return;
    setConfirmBusy(true);
    const { row, mode } = confirmAction;
    const { data, error } = await supabase.functions.invoke("admin-cancel-booking", {
      body: { bookingId: row.id, mode, reason: confirmReason || null, notify: confirmNotify },
    });
    setConfirmBusy(false);
    if (error || (data as any)?.error) {
      toast.error("Fehlgeschlagen: " + (error?.message || (data as any)?.error));
      return;
    }
    toast.success(mode === "cancel"
      ? (confirmNotify ? "Storniert · Teilnehmer per E-Mail informiert" : "Storniert")
      : "Buchung gelöscht");
    setConfirmAction(null);
    await load();
  };



  const load = async () => {
    setLoading(true);
    const { data: bks, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Fehler beim Laden"); setLoading(false); return; }

    const ids = (bks || []).map((b: any) => b.id);
    let items: any[] = [];
    if (ids.length) {
      const { data } = await supabase
        .from("booking_items")
        .select("booking_id, course_date_id, course_dates(id, part, day, date, time, location, instructor)")
        .in("booking_id", ids);
      items = data || [];
    }
    const byBooking = new Map<string, CourseInfo[]>();
    items.forEach((it: any) => {
      if (!it.course_dates) return;
      const arr = byBooking.get(it.booking_id) || [];
      arr.push(it.course_dates);
      byBooking.set(it.booking_id, arr);
    });

    const merged: Row[] = (bks || []).map((b: any) => ({
      ...b,
      courses: (byBooking.get(b.id) || []).sort((a, b) =>
        (toIso(a.date)?.getTime() ?? 0) - (toIso(b.date)?.getTime() ?? 0)),
    }));
    setRows(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q) {
        const hay = `${r.first_name} ${r.last_name} ${r.email} ${r.phone} ${r.fa_number}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filter === "unpaid") return r.payment_status !== "paid";
      if (filter === "all") return true;
      const hasFuture = r.courses.some((c) => {
        const dt = toIso(c.date); return dt && dt.getTime() >= today.getTime();
      });
      if (filter === "upcoming") return hasFuture || r.courses.length === 0;
      if (filter === "past") return !hasFuture && r.courses.length > 0;
      return true;
    });
  }, [rows, search, filter]);

  const togglePayment = async (r: Row) => {
    const next = r.payment_status === "paid" ? "pending" : "paid";
    const { error } = await supabase.from("bookings").update({ payment_status: next }).eq("id", r.id);
    if (error) { toast.error("Fehler: " + error.message); return; }
    setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, payment_status: next } : x));
    toast.success(next === "paid" ? "Als bezahlt markiert" : "Zurück auf Pending");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-xl font-heading uppercase">Teilnehmerliste</CardTitle>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Suchen (Name, E-Mail, FA-Nr.)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-64 font-body"
            />
          </div>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-44 font-body"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Anstehende Kurse</SelectItem>
              <SelectItem value="past">Vergangene Kurse</SelectItem>
              <SelectItem value="unpaid">Offene Zahlungen</SelectItem>
              <SelectItem value="all">Alle</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} className="font-body">
            <RefreshCw className="w-4 h-4 mr-1" /> Aktualisieren
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-center text-muted-foreground font-body">Laden...</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground font-body">Keine Teilnehmer.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Kurse</TableHead>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Zahlung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const isOpen = openId === r.id;
                  return (
                    <Fragment key={r.id}>
                      <TableRow key={r.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setOpenId(isOpen ? null : r.id)}>
                        <TableCell>
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </TableCell>
                        <TableCell className="font-medium font-body">{r.first_name} {r.last_name}</TableCell>
                        <TableCell className="text-xs font-body">
                          <div>{r.email}</div>
                          <div className="text-muted-foreground">{r.phone}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{r.booking_type}</Badge></TableCell>
                        <TableCell className="font-body text-sm">
                          {r.courses.length === 0
                            ? <span className="text-muted-foreground">–</span>
                            : r.courses.map((c) => `T${c.part}`).join(", ")}
                        </TableCell>
                        <TableCell className="font-body">CHF {r.total_price}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant={r.payment_status === "paid" ? "default" : "outline"}
                            size="sm"
                            className={r.payment_status === "paid"
                              ? "h-7 px-2 bg-green-600 hover:bg-green-700 text-white font-body"
                              : "h-7 px-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-body"}
                            onClick={() => togglePayment(r)}
                          >
                            {r.payment_status === "paid"
                              ? <><BadgeCheck className="w-3.5 h-3.5 mr-1" /> Bezahlt</>
                              : <><Clock className="w-3.5 h-3.5 mr-1" /> Pending</>}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow key={r.id + "-d"} className="bg-muted/20">
                          <TableCell colSpan={7} className="p-4">
                            <div className="flex justify-end gap-2 mb-3">
                              {editId === r.id ? (
                                <>
                                  <Button size="sm" variant="outline" onClick={cancelEdit} className="font-body">
                                    <X className="w-3.5 h-3.5 mr-1" /> Abbrechen
                                  </Button>
                                  <Button size="sm" onClick={() => saveEdit(r)} disabled={saving} className="font-body">
                                    <Save className="w-3.5 h-3.5 mr-1" /> {saving ? "Speichern..." : "Speichern"}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => startEdit(r)} className="font-body">
                                    <Pencil className="w-3.5 h-3.5 mr-1" /> Bearbeiten
                                  </Button>
                                  <Button size="sm" onClick={() => resendConfirmation(r)} disabled={resending === r.id} className="font-body">
                                    <Send className="w-3.5 h-3.5 mr-1" /> {resending === r.id ? "Senden..." : "Bestätigung erneut senden"}
                                  </Button>
                                </>
                              )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm font-body">
                              <div className="space-y-2">
                                <div className="font-heading uppercase text-xs text-muted-foreground mb-1">Persönlich</div>
                                <div><strong>{r.first_name} {r.last_name}</strong></div>
                                <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Geb.: {r.birth_date || "–"}</div>
                                <div>FA-Nr.: {r.fa_number || "–"}</div>
                                {editId === r.id ? (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-xs">E-Mail</Label>
                                      <Input value={editData.email ?? ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Telefon</Label>
                                      <Input value={editData.phone ?? ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Strasse & Nr.</Label>
                                      <Input value={editData.address ?? ""} onChange={(e) => setEditData({ ...editData, address: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="space-y-1">
                                        <Label className="text-xs">PLZ</Label>
                                        <Input value={editData.postal_code ?? ""} onChange={(e) => setEditData({ ...editData, postal_code: e.target.value })} />
                                      </div>
                                      <div className="space-y-1 col-span-2">
                                        <Label className="text-xs">Ort</Label>
                                        <Input value={editData.city ?? ""} onChange={(e) => setEditData({ ...editData, city: e.target.value })} />
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {r.email}</div>
                                    <div className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {r.phone}</div>
                                    <div className="flex items-start gap-1">
                                      <MapPin className="w-3.5 h-3.5 mt-0.5" />
                                      <span>{[r.address, [r.postal_code, r.city].filter(Boolean).join(" ")].filter(Boolean).join(", ") || "–"}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="font-heading uppercase text-xs text-muted-foreground mb-1">Zahlung</div>
                                <div>Methode: <strong>{r.payment_method}</strong></div>
                                <div>Status: <strong className={r.payment_status === "paid" ? "text-green-700" : "text-amber-700"}>{r.payment_status}</strong></div>
                                <div>Betrag: <strong>CHF {r.total_price}.–</strong></div>
                                <div className="text-xs text-muted-foreground">Gebucht: {new Date(r.created_at).toLocaleString("de-CH")}</div>
                              </div>
                              <div className="md:col-span-2">
                                <div className="font-heading uppercase text-xs text-muted-foreground mb-1">Termine</div>
                                {r.courses.length === 0 ? (
                                  <p className="text-muted-foreground">Keine Kurstermine.</p>
                                ) : (
                                  <ul className="space-y-1">
                                    {r.courses.map((c) => (
                                      <li key={c.id} className="bg-card border border-border px-2 py-1" style={{ borderRadius: "3px" }}>
                                        <strong>Teil {c.part}</strong> · {c.day}, {c.date} · {c.time} · {c.location}
                                        {c.instructor ? ` · ${c.instructor}` : ""}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminParticipants;
