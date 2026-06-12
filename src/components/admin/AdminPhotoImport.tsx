import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, Camera, Check, X, Copy, Calendar } from "lucide-react";

interface ParsedCourse {
  date: string;
  day: string;
  time: string;
  part: number;
  location: string;
  instructor?: string;
  price: number;
  spots_available: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ICAL_URL = `${SUPABASE_URL}/functions/v1/ical-feed`;
const WEBCAL_URL = ICAL_URL.replace(/^https?:/, "webcal:");

const AdminPhotoImport = () => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [courses, setCourses] = useState<ParsedCourse[]>([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<{ base64: string; mime: string }> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => {
        const result = r.result as string;
        const [, base64] = result.split(",");
        res({ base64, mime: file.type });
      };
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  const handleFile = async (file: File) => {
    setLoading(true);
    setCourses([]);
    try {
      const { base64, mime } = await fileToBase64(file);
      setPreview(`data:${mime};base64,${base64}`);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Bitte einloggen"); return; }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/parse-course-photo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ imageBase64: base64, mimeType: mime }),
      });

      if (res.status === 429) { toast.error("AI-Limit erreicht. Bitte später erneut versuchen."); return; }
      if (res.status === 402) { toast.error("AI-Credits aufgebraucht. Bitte aufladen."); return; }
      const json = await res.json();
      if (!res.ok) { toast.error("Fehler: " + (json?.error || res.statusText)); return; }

      const list: ParsedCourse[] = (json.courses || []).map((c: any) => ({
        date: c.date || "",
        day: c.day || "",
        time: c.time || "13:00 – 17:00",
        part: Number(c.part) || 1,
        location: c.location || "Wettingen",
        instructor: c.instructor || "",
        price: Number(c.price) || 160,
        spots_available: Number(c.spots_available) || 5,
      }));
      if (list.length === 0) toast.warning("Keine Termine erkannt – bitte schärferes Foto.");
      else toast.success(`${list.length} Termine erkannt – bitte prüfen.`);
      setCourses(list);
    } catch (e: any) {
      toast.error("Fehler: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = (i: number, key: keyof ParsedCourse, val: any) => {
    setCourses((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: val } : c)));
  };
  const removeCourse = (i: number) => setCourses((prev) => prev.filter((_, idx) => idx !== i));

  const handleSaveAll = async () => {
    if (courses.length === 0) return;
    // Validate
    const invalid = courses.find((c) => !/^\d{2}\.\d{2}\.\d{4}$/.test(c.date) || !c.day || !c.time);
    if (invalid) { toast.error("Bitte Datum (TT.MM.JJJJ), Tag und Zeit für alle Einträge prüfen."); return; }

    setSaving(true);
    const rows = courses.map((c) => ({
      id: `mgk${c.part}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: c.date, day: c.day, time: c.time, part: c.part,
      location: c.location, instructor: c.instructor || null,
      price: c.price, spots_available: c.spots_available,
    }));
    const { error } = await supabase.from("course_dates").insert(rows);
    setSaving(false);
    if (error) toast.error("Fehler beim Speichern: " + error.message);
    else {
      toast.success(`${rows.length} Termine gespeichert – jetzt auch im Kalender-Feed verfügbar.`);
      setCourses([]); setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const copyIcal = () => {
    navigator.clipboard.writeText(ICAL_URL);
    toast.success("iCal-URL kopiert");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <CardTitle className="text-xl font-heading uppercase flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Kalender-Abo
          </CardTitle>
          <p className="font-body text-sm text-muted-foreground">
            Abonniere diesen Link einmalig in Google Calendar oder Apple Kalender – alle neuen Kurse erscheinen automatisch.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Input readOnly value={ICAL_URL} className="font-mono text-xs" />
            <Button variant="outline" size="sm" onClick={copyIcal} className="font-body">
              <Copy className="w-4 h-4 mr-1" /> Kopieren
            </Button>
            <Button asChild size="sm" className="font-body">
              <a href={WEBCAL_URL}>In Kalender abonnieren</a>
            </Button>
          </div>
          <p className="font-body text-xs text-muted-foreground">
            <strong>Google Calendar:</strong> Andere Kalender → Per URL hinzufügen → Link einfügen.<br/>
            <strong>Apple/iPhone:</strong> Tippe „In Kalender abonnieren".
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <CardTitle className="text-xl font-heading uppercase flex items-center gap-2">
            <Camera className="w-5 h-5" /> Kurse per Foto planen
          </CardTitle>
          <p className="font-body text-sm text-muted-foreground">
            Lade ein Foto deines Planungs-Zettels hoch. Die AI erkennt Datum, Zeit, Teil und Plätze. Du prüfst und bestätigst.
          </p>

          <div className="flex gap-2 flex-wrap">
            <Input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              disabled={loading}
              className="font-body max-w-md"
            />
            {loading && <span className="text-sm font-body text-muted-foreground self-center">AI analysiert Foto…</span>}
          </div>

          {preview && (
            <div className="border-2 border-border p-2 max-w-sm" style={{ borderRadius: "3px" }}>
              <img src={preview} alt="Hochgeladener Plan" className="w-full h-auto" />
            </div>
          )}

          {courses.length > 0 && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead><TableHead>Tag</TableHead><TableHead>Zeit</TableHead>
                      <TableHead>Teil</TableHead><TableHead>Ort</TableHead><TableHead>FL</TableHead>
                      <TableHead>Preis</TableHead><TableHead>Plätze</TableHead><TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell><Input value={c.date} onChange={(e) => updateCourse(i, "date", e.target.value)} className="w-28" placeholder="TT.MM.JJJJ" /></TableCell>
                        <TableCell><Input value={c.day} onChange={(e) => updateCourse(i, "day", e.target.value)} className="w-24" /></TableCell>
                        <TableCell><Input value={c.time} onChange={(e) => updateCourse(i, "time", e.target.value)} className="w-32" /></TableCell>
                        <TableCell><Input type="number" min={1} max={3} value={c.part} onChange={(e) => updateCourse(i, "part", Number(e.target.value))} className="w-16" /></TableCell>
                        <TableCell><Input value={c.location} onChange={(e) => updateCourse(i, "location", e.target.value)} className="w-28" /></TableCell>
                        <TableCell><Input value={c.instructor || ""} onChange={(e) => updateCourse(i, "instructor", e.target.value)} className="w-20" /></TableCell>
                        <TableCell><Input type="number" value={c.price} onChange={(e) => updateCourse(i, "price", Number(e.target.value))} className="w-20" /></TableCell>
                        <TableCell><Input type="number" value={c.spots_available} onChange={(e) => updateCourse(i, "spots_available", Number(e.target.value))} className="w-16" /></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeCourse(i)} title="Verwerfen">
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveAll} disabled={saving} className="font-body">
                  <Check className="w-4 h-4 mr-1" />
                  {saving ? "Speichern…" : `${courses.length} Termine bestätigen & speichern`}
                </Button>
                <Button variant="outline" onClick={() => { setCourses([]); setPreview(null); if (inputRef.current) inputRef.current.value = ""; }} className="font-body">
                  Verwerfen
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPhotoImport;
