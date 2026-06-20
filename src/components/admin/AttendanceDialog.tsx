import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PenLine, FileDown, RefreshCw, Check, ChevronDown, ArrowRightLeft, Clock, BadgeCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SignaturePad from "./SignaturePad";
import { generateParticipantList, downloadPdf, type Participant, type ParticipantFilter } from "@/lib/pdf-generator";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type CourseDate = Tables<"course_dates">;

interface AttendanceRow {
  booking_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  birth_date: string;
  fa_number: string;
  payment_method: string;
  payment_status: string;
  signature_id?: string;
  signature_data?: string | null;
  present: boolean;
}

interface Props {
  course: CourseDate | null;
  open: boolean;
  onClose: () => void;
}

const AttendanceDialog = ({ course, open, onClose }: Props) => {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [signFor, setSignFor] = useState<AttendanceRow | null>(null);

  // Move-participant state
  const [moveFor, setMoveFor] = useState<AttendanceRow | null>(null);
  const [moveTargets, setMoveTargets] = useState<CourseDate[]>([]);
  const [moveTargetId, setMoveTargetId] = useState<string>("");
  const [moveReason, setMoveReason] = useState<string>("");
  const [moving, setMoving] = useState(false);

  const load = async () => {
    if (!course) return;
    setLoading(true);
    const { data: items, error } = await supabase
      .from("booking_items")
      .select("booking_id, bookings!inner(id, first_name, last_name, phone, email, birth_date, fa_number, payment_method, payment_status, status)")
      .eq("course_date_id", course.id);
    if (error) { toast.error("Fehler beim Laden"); setLoading(false); return; }

    const bookings = (items || [])
      .map((it: any) => it.bookings)
      .filter((b: any) => b && b.status === "confirmed");

    const bookingIds = bookings.map((b: any) => b.id);
    let sigs: any[] = [];
    if (bookingIds.length > 0) {
      const { data } = await supabase
        .from("course_signatures")
        .select("*")
        .eq("course_date_id", course.id)
        .in("booking_id", bookingIds);
      sigs = data || [];
    }
    const sigMap = new Map(sigs.map((s) => [s.booking_id, s]));

    setRows(bookings.map((b: any) => {
      const s = sigMap.get(b.id);
      return {
        booking_id: b.id,
        first_name: b.first_name, last_name: b.last_name,
        phone: b.phone, email: b.email,
        birth_date: b.birth_date,
        fa_number: b.fa_number, payment_method: b.payment_method,
        payment_status: b.payment_status || "pending",
        signature_id: s?.id, signature_data: s?.signature_data,
        present: s?.present ?? false,
      };
    }));
    setLoading(false);
  };

  useEffect(() => { if (open) load(); /* eslint-disable-next-line */ }, [open, course?.id]);

  const upsert = async (row: AttendanceRow, patch: Partial<AttendanceRow>) => {
    if (!course) return;
    const next = { ...row, ...patch };
    const payload: any = {
      course_date_id: course.id,
      booking_id: row.booking_id,
      present: next.present,
      signature_data: next.signature_data ?? null,
      signed_at: next.signature_data ? new Date().toISOString() : null,
    };
    const { data, error } = await supabase
      .from("course_signatures")
      .upsert(payload, { onConflict: "course_date_id,booking_id" })
      .select()
      .single();
    if (error) { toast.error("Speichern fehlgeschlagen: " + error.message); return; }
    setRows((rs) => rs.map((r) => r.booking_id === row.booking_id
      ? { ...r, ...patch, signature_id: data.id }
      : r));
  };

  const togglePresent = (row: AttendanceRow, present: boolean) => upsert(row, { present });

  const togglePayment = async (row: AttendanceRow) => {
    const next = row.payment_status === "paid" ? "pending" : "paid";
    const { error } = await supabase
      .from("bookings")
      .update({ payment_status: next })
      .eq("id", row.booking_id);
    if (error) { toast.error("Fehler: " + error.message); return; }
    setRows((rs) => rs.map((r) => r.booking_id === row.booking_id ? { ...r, payment_status: next } : r));
    toast.success(next === "paid" ? "Als bezahlt markiert" : "Zurück auf Pending");
  };


  const saveSig = async (dataUrl: string) => {
    if (!signFor) return;
    await upsert(signFor, { signature_data: dataUrl, present: true });
    setSignFor(null);
    toast.success("Unterschrift gespeichert");
  };

  const clearSig = async (row: AttendanceRow) => {
    if (!row.signature_id) return;
    await upsert(row, { signature_data: null });
    toast.success("Unterschrift entfernt");
  };

  const openMove = async (row: AttendanceRow) => {
    if (!course) return;
    setMoveFor(row); setMoveTargetId(""); setMoveReason("");
    const { data, error } = await supabase
      .from("course_dates")
      .select("*")
      .eq("part", course.part)
      .neq("id", course.id)
      .gt("spots_available", 0)
      .order("date");
    if (error) { toast.error("Fehler beim Laden der Zielkurse"); return; }
    // Only future dates (course.date format: "dd.mm.yyyy")
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const toIso = (d: string) => {
      const [dd, mm, yyyy] = (d || "").split(".");
      return yyyy && mm && dd ? new Date(`${yyyy}-${mm}-${dd}`) : null;
    };
    const future = ((data as CourseDate[]) || []).filter((c) => {
      const dt = toIso(c.date);
      return dt && dt.getTime() >= today.getTime();
    }).sort((a, b) => {
      const da = toIso(a.date)?.getTime() ?? 0;
      const db = toIso(b.date)?.getTime() ?? 0;
      return da - db;
    });
    setMoveTargets(future);
  };

  const confirmMove = async () => {
    if (!moveFor || !course || !moveTargetId) return;
    setMoving(true);
    const { data, error } = await supabase.functions.invoke("move-booking-participant", {
      body: {
        booking_id: moveFor.booking_id,
        from_course_date_id: course.id,
        to_course_date_id: moveTargetId,
        reason: moveReason || null,
      },
    });
    setMoving(false);
    if (error || (data as any)?.error) {
      toast.error("Verschieben fehlgeschlagen: " + (error?.message || (data as any)?.error));
      return;
    }
    toast.success("Teilnehmer verschoben – Bestätigung per E-Mail versendet.");
    setMoveFor(null);
    await load();
  };

  const exportPdf = (filter: ParticipantFilter = "all") => {
    if (!course) return;
    const participants: (Participant & { signature?: string | null; present?: boolean })[] = rows.map((r) => ({
      first_name: r.first_name, last_name: r.last_name,
      phone: r.phone, birth_date: r.birth_date,
      fa_number: r.fa_number, payment_method: r.payment_method,
      paid: r.payment_status === "paid",
      signature: r.signature_data,
      present: r.present,
    }));
    const pdf = generateParticipantList(
      { part: course.part, date: course.date, day: course.day, time: course.time,
        location: course.location, instructor: course.instructor,
        instructor_number: (course as any).instructor_number },
      participants,
      filter
    );
    const suffix = filter === "paid" ? "_bezahlt" : filter === "unpaid" ? "_offen" : "";
    downloadPdf(pdf, `Anwesenheit_MGK${course.part}_${course.date.replace(/\./g, "-")}${suffix}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase">
            Anwesenheit & Verwaltung – Teil {course?.part} · {course?.day}, {course?.date}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <p className="text-sm text-muted-foreground font-body">
            {rows.length} bestätigte Teilnehmer · Verschieben nur innerhalb gleicher Teil-Nummer möglich.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading} className="font-body">
              <RefreshCw className="w-4 h-4 mr-1" /> Aktualisieren
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" disabled={rows.length === 0} className="font-body">
                  <FileDown className="w-4 h-4 mr-1" /> Liste als PDF <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportPdf("all")}>Alle Teilnehmer</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportPdf("paid")}>Nur bezahlte</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportPdf("unpaid")}>Nur offene</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-center text-muted-foreground font-body">Laden...</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground font-body">Noch keine bestätigten Teilnehmer.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Anw.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Geb.</TableHead>
                <TableHead>FA-Nr.</TableHead>
                <TableHead>Zahlung</TableHead>
                <TableHead>Zahlung</TableHead>
                <TableHead>Unterschrift</TableHead>
                <TableHead className="text-right">Verschieben</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.booking_id}>
                  <TableCell>
                    <Checkbox checked={r.present} onCheckedChange={(v) => togglePresent(r, !!v)} />
                  </TableCell>
                  <TableCell className="font-medium font-body">{r.first_name} {r.last_name}</TableCell>
                  <TableCell className="font-body">{r.phone || "–"}</TableCell>
                  <TableCell className="font-body">{r.birth_date || "–"}</TableCell>
                  <TableCell className="font-body">{r.fa_number || "–"}</TableCell>
                  <TableCell>
                    <Button
                      variant={r.payment_status === "paid" ? "default" : "outline"}
                      size="sm"
                      className={r.payment_status === "paid"
                        ? "h-7 px-2 bg-green-600 hover:bg-green-700 text-white font-body"
                        : "h-7 px-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-body"}
                      onClick={() => togglePayment(r)}
                      title={r.payment_status === "paid" ? "Klicken: zurück auf Pending" : "Klicken: Zahlung bestätigen"}
                    >
                      {r.payment_status === "paid"
                        ? <><BadgeCheck className="w-3.5 h-3.5 mr-1" /> Bezahlt</>
                        : <><Clock className="w-3.5 h-3.5 mr-1" /> Pending</>}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {r.signature_data ? (
                      <div className="flex items-center gap-2">
                        <img src={r.signature_data} alt="Unterschrift" className="h-10 bg-white border border-border" style={{ borderRadius: "3px" }} />
                        <Check className="w-4 h-4 text-primary" />
                        <Button variant="ghost" size="sm" onClick={() => setSignFor(r)} className="font-body text-xs">Neu</Button>
                        <Button variant="ghost" size="sm" onClick={() => clearSig(r)} className="font-body text-xs text-destructive">Löschen</Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setSignFor(r)} className="font-body">
                        <PenLine className="w-4 h-4 mr-1" /> Unterschreiben
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openMove(r)} className="font-body">
                      <ArrowRightLeft className="w-4 h-4 mr-1" /> Verschieben
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Sign sub-dialog */}
        <Dialog open={!!signFor} onOpenChange={(v) => !v && setSignFor(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="font-heading uppercase">
                Unterschrift – {signFor?.first_name} {signFor?.last_name}
              </DialogTitle>
            </DialogHeader>
            {signFor && (
              <SignaturePad
                initial={signFor.signature_data}
                onSave={saveSig}
                onCancel={() => setSignFor(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Move sub-dialog */}
        <Dialog open={!!moveFor} onOpenChange={(v) => !v && setMoveFor(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading uppercase">
                Teilnehmer verschieben – {moveFor?.first_name} {moveFor?.last_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-body">
                Aktueller Kurs: <strong>Teil {course?.part} · {course?.day}, {course?.date} · {course?.time}</strong>
              </p>

              <div className="space-y-2">
                <Label className="font-body">Neuer Termin (nur Teil {course?.part})</Label>
                {moveTargets.length === 0 ? (
                  <p className="text-sm text-destructive font-body">
                    Kein anderer Teil-{course?.part}-Kurs mit freien Plätzen gefunden.
                  </p>
                ) : (
                  <Select value={moveTargetId} onValueChange={setMoveTargetId}>
                    <SelectTrigger><SelectValue placeholder="Zielkurs wählen..." /></SelectTrigger>
                    <SelectContent>
                      {moveTargets.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.day}, {c.date} · {c.time} · {c.location}
                          {c.instructor ? ` · ${c.instructor}` : ""} · {c.spots_available} frei
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-body">Hinweis für die E-Mail (optional)</Label>
                <Textarea
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  placeholder="z.B. Termin musste aus organisatorischen Gründen verschoben werden."
                  rows={3}
                />
              </div>

              <p className="text-xs text-muted-foreground font-body">
                Der Teilnehmer wird automatisch per E-Mail über den neuen Termin informiert.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMoveFor(null)} className="font-body">Abbrechen</Button>
              <Button onClick={confirmMove} disabled={!moveTargetId || moving} className="font-body">
                {moving ? "Verschiebe..." : "Verschieben & benachrichtigen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDialog;
