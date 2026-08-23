import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Film, Plus, Trash2, Upload } from "lucide-react";
import type { SlideVideo } from "@/lib/presentation-videos";

const BUCKET = "presentations";

const sanitize = (name: string) =>
  name.normalize("NFKD").replace(/[^\w.\-]+/g, "_").slice(-80);

type Props = {
  presentationId: string;
  presentationTitle: string;
  videos: SlideVideo[];
  onClose: () => void;
  onSaved: () => void;
};

const PresentationVideosDialog = ({
  presentationId,
  presentationTitle,
  videos,
  onClose,
  onSaved,
}: Props) => {
  const [list, setList] = useState<SlideVideo[]>(videos);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = (i: number, patch: Partial<SlideVideo>) =>
    setList((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const uploadFile = async (i: number, file: File) => {
    setUploading(true);
    try {
      const path = `${presentationId}/videos/${Date.now()}_${sanitize(file.name)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
      if (error) throw error;
      update(i, { path, url: undefined, title: list[i].title || file.name });
      toast.success("Video hochgeladen");
    } catch (e) {
      toast.error("Upload fehlgeschlagen: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    const cleaned = list
      .filter((v) => v.url || v.path)
      .map((v) => ({
        slide: Math.max(1, Number(v.slide) || 1),
        title: v.title?.trim() || null,
        url: v.url?.trim() || null,
        path: v.path || null,
      }));
    const { error } = await supabase
      .from("presentations")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ videos: cleaned } as any)
      .eq("id", presentationId);
    setSaving(false);
    if (error) return toast.error("Speichern fehlgeschlagen: " + error.message);
    toast.success("Videos gespeichert");
    onSaved();
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Videos – {presentationTitle}</DialogTitle>
          <DialogDescription className="font-body">
            Ordne jeder Folie ein Video zu. Während der Präsentation erscheint auf dieser Folie ein
            Play-Button. Erlaubt sind YouTube-/Vimeo-Links, direkte MP4-Links oder hochgeladene Dateien.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {list.length === 0 && (
            <p className="font-body text-sm text-muted-foreground">Noch keine Videos hinterlegt.</p>
          )}

          {list.map((v, i) => (
            <div key={i} className="border border-border p-4 space-y-3" style={{ borderRadius: "3px" }}>
              <div className="grid gap-3 sm:grid-cols-[110px_1fr_auto] items-end">
                <div className="space-y-1">
                  <Label className="font-body text-xs">Folie</Label>
                  <Input
                    type="number"
                    min={1}
                    value={v.slide}
                    onChange={(e) => update(i, { slide: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-body text-xs">Titel</Label>
                  <Input
                    value={v.title ?? ""}
                    placeholder="z. B. Bremsübung"
                    onChange={(e) => update(i, { title: e.target.value })}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setList((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Video entfernen"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-1">
                <Label className="font-body text-xs">Video-Link (YouTube, Vimeo oder MP4)</Label>
                <Input
                  value={v.url ?? ""}
                  placeholder="https://…"
                  onChange={(e) => update(i, { url: e.target.value, path: undefined })}
                />
              </div>

              <div className="space-y-1">
                <Label className="font-body text-xs">…oder Datei hochladen (MP4)</Label>
                <Input
                  type="file"
                  accept="video/*"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadFile(i, f);
                  }}
                />
                {v.path && (
                  <p className="font-body text-xs text-muted-foreground truncate">
                    Hochgeladen: {v.path.split("/").pop()}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              className="font-body"
              onClick={() => setList((prev) => [...prev, { slide: 1, title: "", url: "" }])}
            >
              <Plus className="w-4 h-4 mr-1" /> Video hinzufügen
            </Button>
            <Button onClick={save} disabled={saving || uploading} className="font-body sheen">
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 mr-1" /> Upload läuft…
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 mr-1" /> {saving ? "Speichern…" : "Speichern"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PresentationVideosDialog;
