import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { PenLine, FileDown, RefreshCw, Check, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SignaturePad from "./SignaturePad";
import { generateParticipantList, downloadPdf, type Participant, type ParticipantFilter } from "@/lib/pdf-generator";
import type { Tables } from "@/integrations/supabase/types";

type CourseDate = Tables<"course_dates">;

interface AttendanceRow {
  booking_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  fa_number: string;
  payment_method: string;
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

  const load = async () => {
    if (!course) return;
    setLoading(true);
    const { data: items, error } = await supabase
      .from("booking_items")
      .select("booking_id, bookings!inner(id, first_name, last_name, phone, birth_date, fa_number, payment_method, status)")
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
        phone: b.phone, birth_date: b.birth_date,
        fa_number: b.fa_number, payment_method: b.payment_method,
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

  const exportPdf = (filter: ParticipantFilter = "all") => {
    if (!course) return;
    const participants: (Participant & { signature?: string | null; present?: boolean })[] = rows.map((r) => ({
      first_name: r.first_name, last_name: r.last_name,
      phone: r.phone, birth_date: r.birth_date,
      fa_number: r.fa_number, payment_method: r.payment_method,
      paid: !(r.payment_method || "").toLowerCase().includes("bar"),
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase">
            Anwesenheit & Unterschriften – Teil {course?.part} · {course?.day}, {course?.date}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground font-body">
            {rows.length} bestätigte Teilnehmer · Tippe in der Spalte „Unterschrift" auf das Feld, um zu unterschreiben.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading} className="font-body">
              <RefreshCw className="w-4 h-4 mr-1" /> Aktualisieren
            </Button>
            <Button size="sm" onClick={exportPdf} disabled={rows.length === 0} className="font-body">
              <FileDown className="w-4 h-4 mr-1" /> Liste als PDF
            </Button>
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
                <TableHead>Unterschrift</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

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
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDialog;
