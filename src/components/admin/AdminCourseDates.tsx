import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type CourseDate = Tables<"course_dates">;

interface CourseForm {
  id: string;
  date: string;
  day: string;
  time: string;
  part: number;
  location: string;
  instructor: string;
  price: number;
  spots_available: number;
}

const emptyForm: CourseForm = {
  id: "", date: "", day: "", time: "13:00 – 17:00", part: 1, location: "Wettingen", instructor: "", price: 160, spots_available: 5,
};

const dayOptions = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

const AdminCourseDates = () => {
  const [courses, setCourses] = useState<CourseDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("course_dates").select("*").order("date").order("part");
    if (error) { toast.error("Fehler beim Laden"); } 
    else setCourses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const generateId = (form: CourseForm) => {
    return `mgk${form.part}-${Date.now()}`;
  };

  const handleSave = async () => {
    if (!form.date || !form.day || !form.time) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    if (editing) {
      const { error } = await supabase.from("course_dates").update({
        date: form.date, day: form.day, time: form.time, part: form.part,
        location: form.location, instructor: form.instructor || null,
        price: form.price, spots_available: form.spots_available,
      }).eq("id", form.id);
      if (error) toast.error("Fehler: " + error.message);
      else { toast.success("Kurstermin aktualisiert"); setDialogOpen(false); fetchCourses(); }
    } else {
      const id = generateId(form);
      const { error } = await supabase.from("course_dates").insert({
        id, date: form.date, day: form.day, time: form.time, part: form.part,
        location: form.location, instructor: form.instructor || null,
        price: form.price, spots_available: form.spots_available,
      });
      if (error) toast.error("Fehler: " + error.message);
      else { toast.success("Kurstermin erstellt"); setDialogOpen(false); fetchCourses(); }
    }
  };

  const handleEdit = (course: CourseDate) => {
    setForm({
      id: course.id, date: course.date, day: course.day, time: course.time,
      part: course.part, location: course.location, instructor: course.instructor || "",
      price: course.price, spots_available: course.spots_available,
    });
    setEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Kurstermin wirklich löschen?")) return;
    const { error } = await supabase.from("course_dates").delete().eq("id", id);
    if (error) toast.error("Fehler: " + error.message);
    else { toast.success("Gelöscht"); fetchCourses(); }
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditing(false);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl font-[Outfit]">Kurstermine verwalten</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCourses}>
            <RefreshCw className="w-4 h-4 mr-1" /> Aktualisieren
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleNew}>
                <Plus className="w-4 h-4 mr-1" /> Neuer Termin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Termin bearbeiten" : "Neuer Kurstermin"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Teil</Label>
                  <Select value={String(form.part)} onValueChange={(v) => setForm({ ...form, part: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((p) => <SelectItem key={p} value={String(p)}>Teil {p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tag</Label>
                  <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
                    <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
                    <SelectContent>
                      {dayOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Datum (z.B. 28.03.2026)</Label>
                  <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="TT.MM.JJJJ" />
                </div>
                <div className="space-y-2">
                  <Label>Zeit</Label>
                  <Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="13:00 – 17:00" />
                </div>
                <div className="space-y-2">
                  <Label>Ort</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Fahrlehrer (optional)</Label>
                  <Input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="z.B. JL" />
                </div>
                <div className="space-y-2">
                  <Label>Preis (CHF)</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Plätze</Label>
                  <Input type="number" value={form.spots_available} onChange={(e) => setForm({ ...form, spots_available: Number(e.target.value) })} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full mt-4">
                {editing ? "Speichern" : "Erstellen"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-center">Laden...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teil</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Zeit</TableHead>
                  <TableHead>Ort</TableHead>
                  <TableHead>Fahrlehrer</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead>Plätze</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">Teil {c.part}</TableCell>
                    <TableCell>{c.day}</TableCell>
                    <TableCell>{c.date}</TableCell>
                    <TableCell>{c.time}</TableCell>
                    <TableCell>{c.location}</TableCell>
                    <TableCell>{c.instructor || "–"}</TableCell>
                    <TableCell>CHF {c.price}</TableCell>
                    <TableCell>
                      <span className={c.spots_available <= 1 ? "text-destructive font-semibold" : ""}>
                        {c.spots_available}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">Keine Kurstermine vorhanden</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCourseDates;
