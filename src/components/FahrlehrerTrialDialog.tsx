import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const schema = z.object({
  contactName: z.string().trim().min(1, "Name erforderlich").max(120),
  schoolName: z.string().trim().min(1, "Fahrschulname erforderlich").max(160),
  schoolAddress: z.string().trim().min(1, "Adresse erforderlich").max(300),
  phone: z.string().trim().min(5, "Telefon erforderlich").max(40),
  email: z.string().trim().email("Ungültige E-Mail").max(200),
  message: z.string().trim().max(1000).optional(),
});

export function FahrlehrerTrialDialog({ open, onOpenChange }: Props) {
  const [contactName, setContactName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setContactName(""); setSchoolName(""); setSchoolAddress("");
    setPhone(""); setEmail(""); setMessage("");
  };

  const submit = async () => {
    const parsed = schema.safeParse({ contactName, schoolName, schoolAddress, phone, email, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Bitte Eingaben prüfen");
      return;
    }
    setSubmitting(true);
    const data = parsed.data;
    const idBase = `trial-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      // 1. Auto-reply to customer with download links
      const userPromise = supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "fahrlehrer-trial-confirmation",
          recipientEmail: data.email,
          idempotencyKey: `${idBase}-user`,
          templateData: { contactName: data.contactName, schoolName: data.schoolName },
        },
      });
      // 2. Admin notification
      const adminPromise = supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "fahrlehrer-trial-admin",
          recipientEmail: "info@l-me.ch",
          idempotencyKey: `${idBase}-admin`,
          templateData: data,
        },
      });

      const [userRes, adminRes] = await Promise.all([userPromise, adminPromise]);
      if (userRes.error || adminRes.error) throw userRes.error || adminRes.error;

      toast.success("Vielen Dank! Wir melden uns umgehend bei dir. Check deinen Posteingang für die App-Downloadlinks.");
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error("Trial submit failed", err);
      toast.error("Senden fehlgeschlagen. Bitte später erneut versuchen oder per E-Mail an info@fahrschule-me.ch.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !submitting) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">30 Tage gratis starten</DialogTitle>
          <DialogDescription>
            Trage deine Fahrschuldaten ein – wir richten deinen persönlichen Trial-Zugang ein und melden uns umgehend bei dir. Du erhältst sofort eine E-Mail mit den Links zum App-Download.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 mt-2">
          <div className="space-y-1">
            <Label className="text-xs">Dein Name *</Label>
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Vor- und Nachname" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Name der Fahrschule *</Label>
            <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="z.B. Fahrschule Müller" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Adresse der Fahrschule *</Label>
            <Input value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} placeholder="Strasse, PLZ, Ort" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Telefon *</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="079 123 45 67" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">E-Mail *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="du@fahrschule.ch" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nachricht (optional)</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="z.B. beste Erreichbarkeit, Fragen…" />
          </div>
        </div>
        <Button onClick={submit} disabled={submitting} className="w-full mt-3 bg-primary text-primary-foreground hover:opacity-90 font-heading font-bold uppercase tracking-wide" style={{ borderRadius: "3px" }}>
          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Wird gesendet...</> : "30 Tage gratis starten"}
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          Keine Kreditkarte · Kündigung jederzeit · Daten in der Schweiz
        </p>
      </DialogContent>
    </Dialog>
  );
}
