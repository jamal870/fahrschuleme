import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, UserPlus, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type CourseDate = Tables<"course_dates">;

interface Props {
  course: CourseDate | null;
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const empty = {
  firstName: "", lastName: "", email: "", phone: "",
  address: "", postalCode: "", city: "",
  birthDate: "", faNumber: "",
  paymentMethod: "Bar vor Ort",
  price: 0,
  sendEmail: false,
};

const ManualParticipantDialog = ({ course, open, onClose, onAdded }: Props) => {
  const [form, setForm] = useState({ ...empty });
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);

  useEffect(() => {
    if (course) setForm((f) => ({ ...f, price: f.price || course.price }));
  }, [course]);

  // Debounced search over existing bookings
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id,first_name,last_name,email,phone,address,postal_code,city,birth_date,fa_number,created_at")
        .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!error && data) {
        // de-dupe by email
        const seen = new Set<string>();
        const uniq = data.filter((r: any) => {
          const k = (r.email || "").toLowerCase();
          if (!k || seen.has(k)) return false;
          seen.add(k); return true;
        });
        setResults(uniq);
      }
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const pick = (r: any) => {
    setForm((f) => ({
      ...f,
      firstName: r.first_name || "",
      lastName: r.last_name || "",
      email: r.email || "",
      phone: r.phone || "",
      address: r.address || "",
      postalCode: r.postal_code || "",
      city: r.city || "",
      birthDate: r.birth_date || "",
      faNumber: r.fa_number || "",
    }));
    setPickedId(r.id);
    setSearch("");
    setResults([]);
    toast.success("Daten übernommen – bitte prüfen");
  };

  const reset = () => {
    setForm({ ...empty, price: course?.price ?? 0 });
    setSearch(""); setResults([]); setPickedId(null);
  };

  const submit = async () => {
    if (!course) return;
    const required = ["firstName", "lastName", "email", "phone", "address", "birthDate", "faNumber"] as const;
    for (const k of required) {
      if (!String((form as any)[k]).trim()) { toast.error("Bitte alle Pflichtfelder ausfüllen"); return; }
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-add-participant", {
        body: {
          courseDateId: course.id,
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, phone: form.phone,
          address: form.address, postalCode: form.postalCode, city: form.city,
          birthDate: form.birthDate, faNumber: form.faNumber,
          paymentMethod: form.paymentMethod,
          price: form.price,
          sendEmail: form.sendEmail,
        },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message || "Fehler");
      toast.success(`Teilnehmer hinzugefügt${form.sendEmail ? " · E-Mail versendet" : ""}`);
      reset();
      onAdded();
      onClose();
    } catch (e: any) {
      toast.error("Fehler: " + (e?.message || String(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase">
            Teilnehmer manuell hinzufügen
          </DialogTitle>
          {course && (
            <p className="text-sm text-muted-foreground font-body">
              Teil {course.part} · {course.day}, {course.date} · {course.time} · {course.location}
              {" · "}<span className={course.spots_available <= 1 ? "text-destructive font-semibold" : ""}>{course.spots_available} Plätze frei</span>
            </p>
          )}
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label>Vorname *</Label>
            <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div className="space-y-1"><Label>Nachname *</Label>
            <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div className="space-y-1"><Label>E-Mail *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1"><Label>Telefon *</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1 col-span-2"><Label>Adresse *</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="space-y-1"><Label>PLZ</Label>
            <Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          </div>
          <div className="space-y-1"><Label>Ort</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="space-y-1"><Label>Geburtsdatum *</Label>
            <Input placeholder="TT.MM.JJJJ" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          </div>
          <div className="space-y-1"><Label>FA-Nummer *</Label>
            <Input value={form.faNumber} onChange={(e) => setForm({ ...form, faNumber: e.target.value })} />
          </div>
          <div className="space-y-1"><Label>Zahlungsart</Label>
            <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Bar vor Ort">Bar vor Ort</SelectItem>
                <SelectItem value="Bereits bezahlt (extern)">Bereits bezahlt (extern)</SelectItem>
                <SelectItem value="Rechnung">Rechnung</SelectItem>
                <SelectItem value="TWINT">TWINT</SelectItem>
                <SelectItem value="Überweisung">Überweisung</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Preis (CHF)</Label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
        </div>

        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <Checkbox checked={form.sendEmail} onCheckedChange={(v) => setForm({ ...form, sendEmail: !!v })} />
          <span className="font-body text-sm">Bestätigungs-E-Mail an Teilnehmer senden</span>
        </label>

        <Button onClick={submit} disabled={busy} className="w-full mt-4 font-body">
          {busy ? "Speichern..." : "Teilnehmer hinzufügen"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ManualParticipantDialog;
