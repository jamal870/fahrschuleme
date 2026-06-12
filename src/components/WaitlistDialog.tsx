import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  courseDateId: string;
  courseLabel: string;
}

export function WaitlistDialog({ open, onOpenChange, courseDateId, courseLabel }: WaitlistDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setNotes("");
  };

  const submit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("add-to-waitlist", {
      body: { courseDateId, firstName, lastName, email, phone, notes },
    });
    setSubmitting(false);

    if (error || (data && (data as any).error)) {
      const msg = (data as any)?.error || error?.message || "Fehler";
      toast.error(msg);
      return;
    }
    toast.success("Du wurdest auf die Warteliste gesetzt. Wir melden uns, sobald ein Platz frei wird.");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Warteliste – {courseLabel}</DialogTitle>
          <DialogDescription>
            Dieser Kurs ist leider ausgebucht. Trage dich auf die Warteliste ein – wir benachrichtigen dich, sobald ein Platz frei wird.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="space-y-1">
            <Label className="text-xs">Vorname *</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nachname *</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">E-Mail *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Telefon *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs">Notiz (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="z.B. auch andere Termine möglich" />
          </div>
        </div>
        <Button onClick={submit} disabled={submitting} className="w-full mt-2">
          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Wird gesendet...</> : "Auf Warteliste setzen"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
