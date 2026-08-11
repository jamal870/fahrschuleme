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
import { FunctionsHttpError } from "@supabase/supabase-js";
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

const toIso = (swiss: string) => {
  const m = swiss.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
};

const AsaImportDialog = ({ open, onClose, onImported }: Props) => {
  const [section, setSection] = useState<"pgs" | "vku">("pgs");
  const [price, setPrice] = useState(160);
  const [items, setItems] = useState<AsaItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const inRange = (i: AsaItem) => {
    const iso = toIso(i.date);
    if (!iso) return true;
    if (dateFrom && iso < dateFrom) return false;
    if (dateTo && iso > dateTo) return false;
    return true;
  };
  const visibleItems = items.filter(inRange);
  const visibleSelected = visibleItems.filter((i) => selected.has(i.id)).map((i) => i.id);


  // Liest die Fehlermeldung aus der Function-Antwort (invoke liefert sonst nur "non-2xx")
  const readError = async (error: any, data: any) => {
    const ctx = error?.context;
    if (ctx?.status === 404) return "Function 'import-asa-courses' ist auf dem Server nicht deployed.";
    try {
      const body = ctx && typeof ctx.json === "function" ? await ctx.json() : null;
      if (body?.error) return body.error;
    } catch { /* ignore */ }
    return (data as any)?.error || error?.message || "Unbekannter Fehler";
  };

  const loadPreview = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("import-asa-courses", {
      body: { mode: "preview", section },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast.error("Abruf fehlgeschlagen: " + (await readError(error, data)));
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
    const ids = visibleSelected;
    if (ids.length === 0) { toast.info("Nichts ausgewählt"); return; }
    setApplying(true);
    const { data, error } = await supabase.functions.invoke("import-asa-courses", {
      body: { mode: "apply", section, defaultPrice: price, ids },
    });
    setApplying(false);
    if (error || (data as any)?.error) {
      toast.error("Import fehlgeschlagen: " + (await readError(error, data)));
      return;

    }
    const r = data as any;
    toast.success(`${r.created} neu, ${r.updated} aktualisiert`);
    if (r.errors?.length) toast.warning(r.errors.join(" | "));

    // Importierte Termine direkt in den Google Kalender schreiben
    let gcalOk = 0, gcalFail = 0;
    const gcalErrors = new Set<string>();
    for (const id of ids) {
      try {
        const { data: gData, error: gErr } = await supabase.functions.invoke("sync-course-to-gcal", {
          body: { courseDateId: id, action: "upsert" },
        });
        if (gErr) throw gErr;
        if (!(gData as any)?.ok) throw new Error((gData as any)?.error || "Unbekannte Kalender-Antwort");
        gcalOk++;
      } catch (error) {
        gcalFail++;
        if (error instanceof FunctionsHttpError) {
          try {
            const payload = await error.context.clone().json();
            gcalErrors.add(String(payload?.error || error.message));
          } catch { gcalErrors.add(error.message); }
        } else {
          gcalErrors.add(error instanceof Error ? error.message : String(error));
        }
      }
    }
    if (gcalOk) toast.success(`${gcalOk} Termine in Google Kalender übertragen`);
    if (gcalFail) toast.warning(`${gcalFail} Kalender-Fehler: ${Array.from(gcalErrors).slice(0, 2).join(" | ")}`, { duration: 10000 });

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <Label>Datum von</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Datum bis</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              disabled={!dateFrom && !dateTo}
            >
              Filter zurücksetzen
            </Button>
            {loaded && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelected(new Set(visibleItems.filter((i) => i.action !== "unchanged").map((i) => i.id)))
                }
              >
                Alle im Zeitraum
              </Button>
            )}
          </div>
        </div>

        {loaded && (
          <div className="space-y-2">
            {visibleItems.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {items.length === 0 ? "Keine Einträge." : "Keine Termine im gewählten Zeitraum."}
              </p>
            )}
            {visibleItems.map((i) => (
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
          <Button onClick={apply} disabled={applying || !loaded || visibleSelected.length === 0}>
            <Download className="w-4 h-4 mr-1" />
            {applying ? "Importiere..." : `${visibleSelected.length} übernehmen`}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default AsaImportDialog;
