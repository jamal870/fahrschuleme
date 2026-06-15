import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw, Eye, FileText, Receipt, AlertTriangle, CheckCircle, Pencil, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import {
  generateInvoice,
  generateBookingConfirmation,
  generateReminder,
  generateReceipt,
  downloadPdf,
} from "@/lib/pdf-generator";

interface Booking {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  booking_type: string;
  total_price: number;
  status: string;
  created_at: string;
  fa_number: string;
  birth_date: string;
  address: string;
  postal_code: string | null;
  city: string | null;
  payment_method: string;
}

interface BookingItem {
  id: string;
  booking_id: string;
  course_date_id: string | null;
  fahrstunden_service_id: string | null;
  fahrstunden_package_id: string | null;
  instructor: string | null;
}

interface CourseDateInfo {
  id: string;
  part: number;
  date: string;
  time: string | null;
  location: string | null;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);
  const [courseDates, setCourseDates] = useState<Record<string, CourseDateInfo>>({});
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Fehler beim Laden");
    else setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const viewDetails = async (booking: Booking) => {
    setSelectedBooking(booking);
    setEditing(false);
    setEditData(null);
    const { data } = await supabase.from("booking_items").select("*").eq("booking_id", booking.id);
    const items = (data || []) as BookingItem[];
    setBookingItems(items);
    const courseIds = items.map(i => i.course_date_id).filter(Boolean) as string[];
    if (courseIds.length > 0) {
      const { data: cd } = await supabase
        .from("course_dates")
        .select("id, part, date, time, location")
        .in("id", courseIds);
      const map: Record<string, CourseDateInfo> = {};
      (cd || []).forEach((c: any) => { map[c.id] = c; });
      setCourseDates(map);
    } else {
      setCourseDates({});
    }
  };

  const startEdit = () => {
    if (!selectedBooking) return;
    setEditData({ ...selectedBooking });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditData(null);
  };

  const saveEdit = async () => {
    if (!editData) return;
    setSaving(true);
    const { id, ...updates } = editData;
    const { error } = await supabase
      .from("bookings")
      .update({
        first_name: updates.first_name,
        last_name: updates.last_name,
        email: updates.email,
        phone: updates.phone,
        address: updates.address,
        birth_date: updates.birth_date,
        fa_number: updates.fa_number,
        payment_method: updates.payment_method,
        total_price: Number(updates.total_price),
        status: updates.status,
      })
      .eq("id", id);
    setSaving(false);
    if (error) {
      toast.error("Speichern fehlgeschlagen: " + error.message);
      return;
    }
    toast.success("Buchung aktualisiert");
    setSelectedBooking({ ...editData });
    setEditing(false);
    setEditData(null);
    fetchBookings();
  };

  const handlePdf = (type: string, b: Booking) => {
    const data = { ...b, items: [] as string[] };
    const suffix = `${b.last_name}_${b.id.slice(0, 6)}`;
    let doc;
    switch (type) {
      case "invoice":
        doc = generateInvoice(data);
        downloadPdf(doc, `Rechnung_${suffix}.pdf`);
        break;
      case "confirmation":
        doc = generateBookingConfirmation(data);
        downloadPdf(doc, `Bestaetigung_${suffix}.pdf`);
        break;
      case "receipt":
        doc = generateReceipt(data);
        downloadPdf(doc, `Quittung_${suffix}.pdf`);
        break;
      case "reminder1":
        doc = generateReminder(data, 1);
        downloadPdf(doc, `Erinnerung_${suffix}.pdf`);
        break;
      case "reminder2":
        doc = generateReminder(data, 2);
        downloadPdf(doc, `Mahnung2_${suffix}.pdf`);
        break;
      case "reminder3":
        doc = generateReminder(data, 3);
        downloadPdf(doc, `LetzteMahnung_${suffix}.pdf`);
        break;
    }
    toast.success("PDF wurde erstellt");
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed": return "default";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl font-[Outfit]">Buchungen</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchBookings}>
          <RefreshCw className="w-4 h-4 mr-1" /> Aktualisieren
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-center">Laden...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(b.created_at).toLocaleDateString("de-CH")}
                    </TableCell>
                    <TableCell className="font-medium">{b.first_name} {b.last_name}</TableCell>
                    <TableCell className="text-sm">{b.email}</TableCell>
                    <TableCell><Badge variant="outline">{b.booking_type}</Badge></TableCell>
                    <TableCell>CHF {b.total_price}</TableCell>
                    <TableCell><Badge variant={statusColor(b.status) as any}>{b.status}</Badge></TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => viewDetails(b)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel className="text-xs">PDF erstellen</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handlePdf("invoice", b)}>
                            <FileText className="w-3.5 h-3.5 mr-2" /> Rechnung
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePdf("confirmation", b)}>
                            <CheckCircle className="w-3.5 h-3.5 mr-2" /> Buchungsbestätigung
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePdf("receipt", b)}>
                            <Receipt className="w-3.5 h-3.5 mr-2" /> Quittung
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handlePdf("reminder1", b)}>
                            <AlertTriangle className="w-3.5 h-3.5 mr-2" /> 1. Zahlungserinnerung
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePdf("reminder2", b)}>
                            <AlertTriangle className="w-3.5 h-3.5 mr-2" /> 2. Mahnung
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePdf("reminder3", b)} className="text-destructive">
                            <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Letzte Mahnung
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {bookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Keine Buchungen vorhanden</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedBooking} onOpenChange={() => { setSelectedBooking(null); setEditing(false); setEditData(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle>Buchungsdetails</DialogTitle>
              {!editing && selectedBooking && (
                <Button size="sm" variant="outline" onClick={startEdit}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Bearbeiten
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedBooking && !editing && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Name:</span> <strong>{selectedBooking.first_name} {selectedBooking.last_name}</strong></div>
                <div><span className="text-muted-foreground">E-Mail:</span> {selectedBooking.email}</div>
                <div><span className="text-muted-foreground">Telefon:</span> {selectedBooking.phone}</div>
                <div><span className="text-muted-foreground">Geburtsdatum:</span> {selectedBooking.birth_date}</div>
                <div><span className="text-muted-foreground">FA-Nummer:</span> {selectedBooking.fa_number}</div>
                <div><span className="text-muted-foreground">Adresse:</span> {selectedBooking.address}</div>
                <div><span className="text-muted-foreground">Zahlung:</span> {selectedBooking.payment_method}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={statusColor(selectedBooking.status) as any}>{selectedBooking.status}</Badge></div>
                <div><span className="text-muted-foreground">Betrag:</span> <strong>CHF {selectedBooking.total_price}</strong></div>
              </div>

              {bookingItems.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">Gebuchte Leistungen:</p>
                  <ul className="space-y-1 text-xs">
                    {bookingItems.map((item) => (
                      <li key={item.id} className="bg-muted/50 p-2 rounded">
                        {item.course_date_id && <span>Kurs: {item.course_date_id}</span>}
                        {item.fahrstunden_service_id && <span>Fahrstunde: {item.fahrstunden_service_id}</span>}
                        {item.fahrstunden_package_id && <span>Paket: {item.fahrstunden_package_id}</span>}
                        {item.instructor && <span> · Fahrlehrer: {item.instructor}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {editData && editing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Vorname</Label>
                  <Input value={editData.first_name ?? ""} onChange={(e) => setEditData({ ...editData, first_name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Nachname</Label>
                  <Input value={editData.last_name ?? ""} onChange={(e) => setEditData({ ...editData, last_name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>E-Mail</Label>
                  <Input type="email" value={editData.email ?? ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Telefon</Label>
                  <Input value={editData.phone ?? ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Adresse</Label>
                  <Input value={editData.address ?? ""} onChange={(e) => setEditData({ ...editData, address: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Geburtsdatum</Label>
                  <Input value={editData.birth_date ?? ""} onChange={(e) => setEditData({ ...editData, birth_date: e.target.value })} placeholder="TT.MM.JJJJ" />
                </div>
                <div className="space-y-1">
                  <Label>FA-Nummer</Label>
                  <Input value={editData.fa_number ?? ""} onChange={(e) => setEditData({ ...editData, fa_number: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Zahlungsmethode</Label>
                  <Input value={editData.payment_method ?? ""} onChange={(e) => setEditData({ ...editData, payment_method: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Betrag (CHF)</Label>
                  <Input type="number" step="0.01" value={editData.total_price ?? 0} onChange={(e) => setEditData({ ...editData, total_price: Number(e.target.value) })} />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Status</Label>
                  <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">pending</SelectItem>
                      <SelectItem value="pending_payment">pending_payment</SelectItem>
                      <SelectItem value="confirmed">confirmed</SelectItem>
                      <SelectItem value="paid">paid</SelectItem>
                      <SelectItem value="cancelled">cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                  <X className="w-4 h-4 mr-1" /> Abbrechen
                </Button>
                <Button onClick={saveEdit} disabled={saving}>
                  <Save className="w-4 h-4 mr-1" /> {saving ? "Speichern..." : "Speichern"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
