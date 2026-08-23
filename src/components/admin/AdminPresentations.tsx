import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Film, Play, Trash2, Upload, Presentation } from "lucide-react";
import PresentationViewer from "./PresentationViewer";
import PresentationVideosDialog from "./PresentationVideosDialog";
import { parseVideos, type SlideVideo } from "@/lib/presentation-videos";

type Presentation = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  pptx_path: string | null;
  pdf_path: string | null;
  videos: SlideVideo[];
};

const BUCKET = "presentations";

const sanitize = (name: string) =>
  name.normalize("NFKD").replace(/[^\w.\-]+/g, "_").slice(-80);

const AdminPresentations = () => {
  const [items, setItems] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pptxFile, setPptxFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [viewer, setViewer] = useState<{ url: string; title: string; videos: SlideVideo[] } | null>(null);
  const [videoEditor, setVideoEditor] = useState<Presentation | null>(null);


  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("presentations")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error("Laden fehlgeschlagen: " + error.message);
    else
      setItems(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((data as any[]) ?? []).map((row) => ({
          ...(row as Omit<Presentation, "videos">),
          videos: parseVideos(row.videos),
        })),
      );

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async () => {
    if (!title.trim()) return toast.error("Bitte einen Titel eingeben");
    if (!pptxFile && !pdfFile) return toast.error("Bitte mindestens eine Datei wählen (PPTX oder PDF)");
    setUploading(true);
    try {
      const folder = crypto.randomUUID();
      let pptx_path: string | null = null;
      let pdf_path: string | null = null;

      if (pptxFile) {
        pptx_path = `${folder}/${sanitize(pptxFile.name)}`;
        const { error } = await supabase.storage.from(BUCKET).upload(pptx_path, pptxFile, { upsert: true });
        if (error) throw error;
      }
      if (pdfFile) {
        pdf_path = `${folder}/${sanitize(pdfFile.name)}`;
        const { error } = await supabase.storage.from(BUCKET).upload(pdf_path, pdfFile, { upsert: true });
        if (error) throw error;
      }

      const { error: insErr } = await supabase.from("presentations").insert({
        title: title.trim(),
        description: description.trim() || null,
        sort_order: items.length,
        pptx_path,
        pdf_path,
      });
      if (insErr) throw insErr;

      toast.success("Präsentation hochgeladen");
      setTitle("");
      setDescription("");
      setPptxFile(null);
      setPdfFile(null);
      (document.getElementById("pptx-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("pptx-input") as HTMLInputElement).value = "");
      (document.getElementById("pdf-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("pdf-input") as HTMLInputElement).value = "");
      load();
    } catch (e) {
      toast.error("Upload fehlgeschlagen: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const signedUrl = async (path: string, download = false) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60, download ? { download: true } : undefined);
    if (error || !data) {
      toast.error("Datei nicht verfügbar: " + (error?.message ?? "unbekannt"));
      return null;
    }
    return data.signedUrl;
  };

  const present = async (p: Presentation) => {
    if (!p.pdf_path) return toast.error("Für die Anzeige im Browser wird eine PDF-Version benötigt.");
    const url = await signedUrl(p.pdf_path);
    if (url) setViewer({ url, title: p.title, videos: p.videos ?? [] });
  };

  const download = async (path: string) => {
    const url = await signedUrl(path, true);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const remove = async (p: Presentation) => {
    if (!confirm(`„${p.title}" wirklich löschen?`)) return;
    const paths = [p.pptx_path, p.pdf_path].filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    const { error } = await supabase.from("presentations").delete().eq("id", p.id);
    if (error) toast.error("Löschen fehlgeschlagen: " + error.message);
    else {
      toast.success("Gelöscht");
      load();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-card border border-border p-6 space-y-4 card-glow" style={{ borderRadius: "3px" }}>
        <h2 className="font-heading font-bold text-xl">Neue Präsentation hochladen</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pres-title" className="font-body">Titel</Label>
            <Input id="pres-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Grundkurs Teil 1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pres-desc" className="font-body">Beschreibung (optional)</Label>
            <Textarea id="pres-desc" rows={1} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pptx-input" className="font-body">PowerPoint-Datei (.pptx)</Label>
            <Input id="pptx-input" type="file" accept=".pptx,.ppt" onChange={(e) => setPptxFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pdf-input" className="font-body">PDF-Version (für Anzeige im Browser)</Label>
            <Input id="pdf-input" type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          Tipp: In PowerPoint über „Speichern unter → PDF" eine PDF-Version erzeugen. Nur damit lässt sich die
          Präsentation direkt im Browser im Vollbild zeigen; die PPTX-Datei bleibt zum Download und Bearbeiten hinterlegt.
        </p>
        <Button onClick={upload} disabled={uploading} className="font-body sheen">
          <Upload className="w-4 h-4 mr-2" /> {uploading ? "Wird hochgeladen…" : "Hochladen"}
        </Button>
      </div>

      {loading ? (
        <p className="font-body text-muted-foreground">Laden…</p>
      ) : items.length === 0 ? (
        <p className="font-body text-muted-foreground">Noch keine Präsentationen hinterlegt.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((p) => (
            <div key={p.id} className="bg-card border border-border p-5 space-y-3 card-glow" style={{ borderRadius: "3px" }}>
              <div className="flex items-start gap-3">
                <Presentation className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-lg truncate">{p.title}</h3>
                  {p.description && <p className="font-body text-sm text-muted-foreground">{p.description}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => present(p)} disabled={!p.pdf_path} className="font-body">
                  <Play className="w-4 h-4 mr-1" /> Präsentieren
                </Button>
                {p.pdf_path && (
                  <Button size="sm" variant="outline" onClick={() => download(p.pdf_path!)} className="font-body">
                    <Download className="w-4 h-4 mr-1" /> PDF
                  </Button>
                )}
                {p.pptx_path && (
                  <Button size="sm" variant="outline" onClick={() => download(p.pptx_path!)} className="font-body">
                    <Download className="w-4 h-4 mr-1" /> PPTX
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => remove(p)} className="font-body text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewer && <PresentationViewer url={viewer.url} title={viewer.title} onClose={() => setViewer(null)} />}
    </div>
  );
};

export default AdminPresentations;
