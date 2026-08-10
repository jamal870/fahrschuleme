import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, RefreshCw } from "lucide-react";

interface AsaItem {
  id: string;
  part: number;
  date: string;
  day: string;
  time: string;
  location: string;
  spots: number | null;
  action: "new" | "update" | "unchanged";
  changes: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

const AsaImportDialog = ({ open, onClose, onImported }: Props) => {
  const [section, setSection] = useState<"pgs" | "vku">("pgs");
  const [price, setPrice] = useState(160);
  const [items, setItems] = useState<AsaItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadPreview = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("import-asa-courses", {
      body: { mode: "preview", section },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast.error("Abruf fehlgeschlagen: " + (error?.message || (data as any)?.error));
      return;
    }
    const list = ((data as any).items || []) as AsaItem[];
    setItems(list);
    setSelected(new Set(list.filter((i) => i.action !== "unchanged").map((i) => i.id)));
    setLoaded(true);
    if (list.length === 0) toast.info("Keine Kurse im asa-Portal gefunden");
  };

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const apply = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) { toast.info("Nichts ausgewählt"); return; }
    setApplying(true);
    const { data, error } = await supabase.functions.invoke("import-asa-courses", {
      body: { mode: "apply", section, defaultPrice: price, ids },
    });
    setApplying(false);
    if (error || (data as any)?.error) {
      toast.error("Import fehlgeschlagen: " + (error?.message || (data as any)?.error));
      return;
    }
    const r = data as any;
    toast.success(`${r.created} neu, ${r.updated} aktualisiert`);
    if (r.errors?.length) toast.warning(r.errors.join(" | "));
    onImported();
    onClose();
    setLoaded(false);
    setItems([]);
  };

  const badge = (a: AsaItem["action"]) =>
    a === "new" ? <Badge>neu</Badge>
      : a === "update" ? <Badge variant="secondary">geändert</Badge>
      : <Badge variant="outline">unverändert</Badge>;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase">Kurse aus asa importieren</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Liest die im asa/SARI-Portal erfassten Kurse. Bestehende Buchungen, Preise und freie Plätze
          gebuchter Kurse bleiben unverändert – es wird nichts gelöscht.
        </p>

        <div className="grid grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <Label>Bereich</Label>
            <Select value={section} onValueChange={(v) => { setSection(v as "pgs" | "vku"); setLoaded(false); setItems([]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pgs">PGS (Motorrad-Grundkurs)</SelectItem>
                <SelectItem value="vku">VKU</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Preis für neue Kurse (CHF)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <Button variant="outline" onClick={loadPreview} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Lade..." : "Kurse abrufen"}
          </Button>
        </div>

        {loaded && (
          <div className="space-y-2">
            {items.length === 0 && <p className="text-sm text-muted-foreground">Keine Einträge.</p>}
            {items.map((i) => (
              <div key={i.id} className="flex items-start gap-3 rounded border p-2 text-sm">
                <Checkbox
                  checked={selected.has(i.id)}
                  disabled={i.action === "unchanged"}
                  onCheckedChange={() => toggle(i.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <strong>Teil {i.part}</strong>
                    <span>{i.day}, {i.date} · {i.time}</span>
                    {badge(i.action)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {i.location}{i.spots != null && <> · {i.spots} freie Plätze (asa)</>}
                  </div>
                  {i.changes.length > 0 && (
                    <div className="text-xs text-amber-700">{i.changes.join(" · ")}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={applying}>Abbrechen</Button>
          <Button onClick={apply} disabled={applying || !loaded || selected.size === 0}>
            <Download className="w-4 h-4 mr-1" />
            {applying ? "Importiere..." : `${selected.size} übernehmen`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AsaImportDialog;
