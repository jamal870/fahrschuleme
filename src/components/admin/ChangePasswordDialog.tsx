import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

const ChangePasswordDialog = () => {
  const [open, setOpen] = useState(false);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (pw1.length < 8) { toast.error("Passwort muss mindestens 8 Zeichen haben"); return; }
    if (pw1 !== pw2) { toast.error("Passwörter stimmen nicht überein"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setBusy(false);
    if (error) { toast.error("Fehlgeschlagen: " + error.message); return; }
    toast.success("Passwort geändert");
    setPw1(""); setPw2(""); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="font-body">
          <KeyRound className="w-4 h-4 mr-2" /> Passwort
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase">Passwort ändern</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Neues Passwort</Label>
            <Input type="password" autoComplete="new-password" value={pw1} onChange={(e) => setPw1(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Passwort wiederholen</Label>
            <Input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">Mindestens 8 Zeichen. Du bleibst nach der Änderung angemeldet.</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Abbrechen</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Speichern..." : "Speichern"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
