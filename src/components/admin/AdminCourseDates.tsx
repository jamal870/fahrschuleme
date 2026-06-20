import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RefreshCw, Users, Copy, CalendarPlus, ChevronLeft, ChevronRight, ClipboardCheck, FileDown, ChevronDown, UserPlus } from "lucide-react";
import { generateParticipantList, downloadPdf, type Participant } from "@/lib/pdf-generator";
import AttendanceDialog from "./AttendanceDialog";
import ManualParticipantDialog from "./ManualParticipantDialog";
import type { Tables } from "@/integrations/supabase/types";

type CourseDate = Tables<"course_dates"> & { instructor_number?: string | null };

interface CourseForm {
  id: string;
  date: string; day: string; time: string; part: number;
  location: string; instructor: string; instructor_number: string;
  price: number; spots_available: number;
}

const emptyForm: CourseForm = {
  id: "", date: "", day: "", time: "13:00 – 17:00", part: 1,
  location: "Wettingen", instructor: "", instructor_number: "",
  price: 160, spots_available: 5,
};

const dayOptions = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

// Parse "TT.MM.JJJJ" → Date
function parseDate(s: string): Date | null {
  const m = s?.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}
function fmtDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}
function dayName(d: Date): string {
  return ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][d.getDay()];
}

const AdminCourseDates = () => {
  const [courses, setCourses] = useState<CourseDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [attendanceCourse, setAttendanceCourse] = useState<CourseDate | null>(null);
  const [addParticipantCourse, setAddParticipantCourse] = useState<CourseDate | null>(null);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [showPast, setShowPast] = useState(false);
  const [partFilter, setPartFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("course_dates").select("*").order("date").order("part");
    if (error) toast.error("Fehler beim Laden");
    else setCourses((data as CourseDate[]) || []);
    setLoading(false);
  };
  useEffect(() => { fetchCourses(); }, []);

  const generateId = (f: CourseForm) => `mgk${f.part}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const syncGcal = async (courseDateId: string, action: "upsert" | "delete") => {
    try {
      const { error } = await supabase.functions.invoke("sync-course-to-gcal", {
        body: { courseDateId, action },
      });
      if (error) throw error;
    } catch (e: any) {
      console.warn("[gcal sync]", e?.message || e);
      toast.warning("Google-Kalender-Sync fehlgeschlagen (Termin gespeichert)");
    }
  };

  const handleSave = async () => {
    if (!form.date || !form.day || !form.time) { toast.error("Bitte alle Pflichtfelder ausfüllen"); return; }
    const payload = {
      date: form.date, day: form.day, time: form.time, part: form.part,
      location: form.location, instructor: form.instructor || null,
      instructor_number: form.instructor_number || null,
      price: form.price, spots_available: form.spots_available,
    };
    if (editing) {
      const { error } = await supabase.from("course_dates").update(payload).eq("id", form.id);
      if (error) toast.error("Fehler: " + error.message);
      else {
        toast.success("Kurstermin aktualisiert"); setDialogOpen(false); fetchCourses();
        syncGcal(form.id, "upsert");
      }
    } else {
      const newId = generateId(form);
      const { error } = await supabase.from("course_dates").insert({ id: newId, ...payload });
      if (error) toast.error("Fehler: " + error.message);
      else {
        toast.success("Kurstermin erstellt"); setDialogOpen(false); fetchCourses();
        syncGcal(newId, "upsert");
      }
    }
  };

  const handleEdit = (c: CourseDate) => {
    setForm({
      id: c.id, date: c.date, day: c.day, time: c.time, part: c.part,
      location: c.location, instructor: c.instructor || "",
      instructor_number: c.instructor_number || "",
      price: c.price, spots_available: c.spots_available,
    });
    setEditing(true); setDialogOpen(true);
  };

  const handleDuplicate = (c: CourseDate) => {
    setForm({
      id: "", date: "", day: c.day, time: c.time, part: c.part,
      location: c.location, instructor: c.instructor || "",
      instructor_number: c.instructor_number || "",
      price: c.price, spots_available: c.spots_available,
    });
    setEditing(false); setDialogOpen(true);
    toast.info("Datum eintragen und speichern – andere Felder sind übernommen.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Kurstermin wirklich löschen?")) return;
    await syncGcal(id, "delete");
    const { error } = await supabase.from("course_dates").delete().eq("id", id);
    if (error) toast.error("Fehler: " + error.message);
    else { toast.success("Gelöscht"); fetchCourses(); }
  };

  const handleNew = () => { setForm(emptyForm); setEditing(false); setDialogOpen(true); };

  const handleParticipantList = async (course: CourseDate, filter: "all" | "paid" | "unpaid" = "all") => {
    const { data: items, error } = await supabase
      .from("booking_items")
      .select("booking_id, bookings!inner(id, first_name, last_name, phone, birth_date, fa_number, payment_method, status)")
      .eq("course_date_id", course.id);
    if (error) { toast.error("Fehler beim Laden"); return; }

    const bookings = (items || []).map((it: any) => it.bookings).filter((b: any) => b && b.status === "confirmed");
    if (bookings.length === 0) { toast.info("Noch keine bestätigten Teilnehmer"); return; }

    const ids = bookings.map((b: any) => b.id);
    const { data: sigs } = await supabase.from("course_signatures").select("*").eq("course_date_id", course.id).in("booking_id", ids);
    const sigMap = new Map((sigs || []).map((s: any) => [s.booking_id, s]));

    const participants: Participant[] = bookings.map((b: any) => {
      const s: any = sigMap.get(b.id);
      return {
        first_name: b.first_name, last_name: b.last_name, phone: b.phone,
        birth_date: b.birth_date, fa_number: b.fa_number, payment_method: b.payment_method,
        paid: !(b.payment_method || "").toLowerCase().includes("bar"),
        signature: s?.signature_data ?? null,
        present: s?.present ?? false,
      };
    });

    const pdf = generateParticipantList(
      { part: course.part, date: course.date, day: course.day, time: course.time,
        location: course.location, instructor: course.instructor,
        instructor_number: course.instructor_number },
      participants,
      filter
    );
    const suffix = filter === "paid" ? "_bezahlt" : filter === "unpaid" ? "_offen" : "";
    downloadPdf(pdf, `Teilnehmerliste_MGK${course.part}_${course.date.replace(/\./g, "-")}${suffix}.pdf`);
  };

  // ── Calendar grid ──
  const calendarCells = useMemo(() => {
    const first = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
    const startWeekday = (first.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
    const cells: { date: Date | null }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(calMonth.getFullYear(), calMonth.getMonth(), d) });
    while (cells.length % 7 !== 0) cells.push({ date: null });
    return cells;
  }, [calMonth]);

  const coursesByDate = useMemo(() => {
    const map = new Map<string, CourseDate[]>();
    for (const c of courses) {
      const arr = map.get(c.date) || [];
      arr.push(c);
      map.set(c.date, arr);
    }
    return map;
  }, [courses]);

  // Nach Teil (M1/M2/M3/M4) gruppieren, mit Filter + Suche, zukünftig / vergangen aufteilen
  const { upcomingGroups, pastGroups } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const q = search.trim().toLowerCase();
    const filtered = courses.filter((c) => {
      if (partFilter !== "all" && c.part !== Number(partFilter)) return false;
      if (!q) return true;
      return [c.date, c.day, c.time, c.location, c.instructor, c.instructor_number, `m${c.part}`, `teil ${c.part}`]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
    const sorted = [...filtered].sort((a, b) => {
      if (a.part !== b.part) return a.part - b.part;
      const da = parseDate(a.date)?.getTime() ?? 0;
      const db = parseDate(b.date)?.getTime() ?? 0;
      return da - db;
    });
    const upMap = new Map<number, CourseDate[]>();
    const pastMap = new Map<number, CourseDate[]>();
    for (const c of sorted) {
      const d = parseDate(c.date);
      const target = d && d.getTime() >= today.getTime() ? upMap : pastMap;
      const arr = target.get(c.part) || [];
      arr.push(c);
      target.set(c.part, arr);
    }
    const toGroups = (m: Map<number, CourseDate[]>, reverse = false) =>
      [...m.entries()]
        .sort(([a], [b]) => a - b)
        .map(([part, items]) => ({ part, items: reverse ? [...items].reverse() : items }));
    return { upcomingGroups: toGroups(upMap), pastGroups: toGroups(pastMap, true) };
  }, [courses, partFilter, search]);

  const totalUpcoming = upcomingGroups.reduce((n, g) => n + g.items.length, 0);
  const totalPast = pastGroups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-xl font-heading uppercase">Kurstermine verwalten</CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={fetchCourses} className="font-body">
            <RefreshCw className="w-4 h-4 mr-1" /> Aktualisieren
          </Button>
          <Button variant="outline" size="sm" onClick={async () => {
            const today = new Date(); today.setHours(0,0,0,0);
            const future = courses.filter((c) => { const d = parseDate(c.date); return d && d.getTime() >= today.getTime(); });
            if (future.length === 0) { toast.info("Keine zukünftigen Termine zum Synchronisieren"); return; }
            toast.info(`Sync läuft für ${future.length} Termine...`);
            let ok = 0, fail = 0;
            for (const c of future) {
              try {
                const { error } = await supabase.functions.invoke("sync-course-to-gcal", { body: { courseDateId: c.id, action: "upsert" } });
                if (error) throw error; ok++;
              } catch (e) { console.warn(e); fail++; }
            }
            if (fail === 0) toast.success(`${ok} Termine in Google Kalender synchronisiert`);
            else toast.warning(`${ok} ok, ${fail} fehlgeschlagen`);
          }} className="font-body">
            <CalendarPlus className="w-4 h-4 mr-1" /> Google Sync
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)} className="font-body">
            <CalendarPlus className="w-4 h-4 mr-1" /> Mehrere anlegen
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleNew} className="font-body">
                <Plus className="w-4 h-4 mr-1" /> Neuer Termin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading uppercase">{editing ? "Termin bearbeiten" : "Neuer Kurstermin"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Teil</Label>
                  <Select value={String(form.part)} onValueChange={(v) => setForm({ ...form, part: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4].map((p) => <SelectItem key={p} value={String(p)}>Teil {p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Tag</Label>
                  <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
                    <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
                    <SelectContent>{dayOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Datum</Label>
                  <Input type="date" value={form.date ? (() => { const p = parseDate(form.date); return p ? p.toISOString().slice(0, 10) : ""; })() : ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) { setForm({ ...form, date: "" }); return; }
                      const d = new Date(v + "T00:00:00");
                      setForm({ ...form, date: fmtDate(d), day: dayName(d) });
                    }} />
                </div>
                <div className="space-y-2"><Label>Zeit</Label>
                  <Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="13:00 – 17:00" />
                </div>
                <div className="space-y-2"><Label>Ort</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="space-y-2"><Label>Fahrlehrer</Label>
                  <Input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="z.B. JL" />
                </div>
                <div className="space-y-2"><Label>Fahrlehrer-Nr.</Label>
                  <Input value={form.instructor_number} onChange={(e) => setForm({ ...form, instructor_number: e.target.value })} placeholder="z.B. 12345" />
                </div>
                <div className="space-y-2"><Label>Preis (CHF)</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-2"><Label>Plätze</Label>
                  <Input type="number" value={form.spots_available} onChange={(e) => setForm({ ...form, spots_available: Number(e.target.value) })} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full mt-4 font-body">{editing ? "Speichern" : "Erstellen"}</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list" className="font-heading uppercase text-xs">Liste</TabsTrigger>
          <TabsTrigger value="calendar" className="font-heading uppercase text-xs">Kalender</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center gap-2 p-3 border-b">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Suchen (Datum, Ort, Fahrlehrer …)"
                  className="max-w-xs h-9 font-body"
                />
                <Select value={partFilter} onValueChange={setPartFilter}>
                  <SelectTrigger className="w-[160px] h-9 font-body"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Kategorien</SelectItem>
                    {[1, 2, 3, 4].map((p) => <SelectItem key={p} value={String(p)}>Nur M {p}</SelectItem>)}
                  </SelectContent>
                </Select>
                {(search || partFilter !== "all") && (
                  <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setPartFilter("all"); }} className="font-body">
                    Filter zurücksetzen
                  </Button>
                )}
              </div>
              {loading ? <p className="p-6 text-muted-foreground text-center font-body">Laden...</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teil</TableHead><TableHead>Tag</TableHead><TableHead>Datum</TableHead><TableHead>Zeit</TableHead>
                      <TableHead>Ort</TableHead><TableHead>Fahrlehrer</TableHead><TableHead>FL-Nr.</TableHead>
                      <TableHead>Preis</TableHead><TableHead>Plätze</TableHead><TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const renderRow = (c: CourseDate, dim = false) => (
                        <TableRow key={c.id} className={dim ? "opacity-60" : ""}>
                          <TableCell className="font-medium">Teil {c.part}</TableCell>
                          <TableCell>{c.day}</TableCell><TableCell>{c.date}</TableCell><TableCell>{c.time}</TableCell>
                          <TableCell>{c.location}</TableCell><TableCell>{c.instructor || "–"}</TableCell>
                          <TableCell>{c.instructor_number || "–"}</TableCell>
                          <TableCell>CHF {c.price}</TableCell>
                          <TableCell><span className={c.spots_available <= 1 ? "text-destructive font-semibold" : ""}>{c.spots_available}</span></TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" title="Teilnehmer manuell hinzufügen" onClick={() => setAddParticipantCourse(c)}>
                                <UserPlus className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Anwesenheit & Unterschriften" onClick={() => setAttendanceCourse(c)}>
                                <ClipboardCheck className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" title="Teilnehmerliste (PDF)">
                                    <Users className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleParticipantList(c, "all")}>Alle Teilnehmer</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleParticipantList(c, "paid")}>Nur bezahlte</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleParticipantList(c, "unpaid")}>Nur offene</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button variant="ghost" size="icon" title="Duplizieren" onClick={() => handleDuplicate(c)}>
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Bearbeiten" onClick={() => handleEdit(c)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Löschen" onClick={() => handleDelete(c.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                      const groupHeader = (part: number, count: number) => (
                        <TableRow key={`hdr-${part}`} className="bg-primary/10 hover:bg-primary/10">
                          <TableCell colSpan={10} className="py-2 font-heading uppercase text-sm tracking-wide text-primary">
                            Kategorie M {part} <span className="text-muted-foreground font-body normal-case tracking-normal">· {count} Termin{count === 1 ? "" : "e"}</span>
                          </TableCell>
                        </TableRow>
                      );
                      return (
                        <>
                          {upcomingGroups.map((g) => (
                            <Fragment key={`up-${g.part}`}>
                              {groupHeader(g.part, g.items.length)}
                              {g.items.map((c) => renderRow(c))}
                            </Fragment>
                          ))}
                          {totalUpcoming === 0 && totalPast === 0 && (
                            <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">Keine Kurstermine vorhanden</TableCell></TableRow>
                          )}
                          {totalPast > 0 && (
                            <>
                              <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableCell colSpan={10} className="py-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPast((v) => !v)}
                                    className="font-body w-full justify-start"
                                  >
                                    <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showPast ? "rotate-0" : "-rotate-90"}`} />
                                    Vergangene Termine ({totalPast}) {showPast ? "ausblenden" : "anzeigen"}
                                  </Button>
                                </TableCell>
                              </TableRow>
                              {showPast && pastGroups.map((g) => (
                                <Fragment key={`past-${g.part}`}>
                                  {groupHeader(g.part, g.items.length)}
                                  {g.items.map((c) => renderRow(c, true))}
                                </Fragment>
                              ))}
                            </>
                          )}
                        </>
                      );
                    })()}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-heading uppercase text-lg">{monthNames[calMonth.getMonth()]} {calMonth.getFullYear()}</h3>
                <Button variant="ghost" size="sm" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs font-heading uppercase text-muted-foreground mb-1">
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => <div key={d} className="text-center py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((cell, i) => {
                  if (!cell.date) return <div key={i} className="min-h-[90px] bg-muted/30" style={{ borderRadius: "3px" }} />;
                  const ds = fmtDate(cell.date);
                  const dayCourses = coursesByDate.get(ds) || [];
                  const isToday = ds === fmtDate(new Date());
                  return (
                    <div key={i} className={`min-h-[90px] border ${isToday ? "border-primary border-2" : "border-border"} p-1 bg-card`} style={{ borderRadius: "3px" }}>
                      <div className="text-xs font-bold text-muted-foreground">{cell.date.getDate()}</div>
                      <div className="space-y-0.5 mt-1">
                        {dayCourses.map((c) => (
                          <button key={c.id} onClick={() => handleEdit(c)}
                            className="w-full text-left px-1 py-0.5 bg-primary/10 hover:bg-primary/20 text-[10px] font-body truncate"
                            style={{ borderRadius: "2px" }}
                            title={`Teil ${c.part} · ${c.time} · ${c.location} (${c.spots_available} Plätze)`}>
                            <span className="font-bold text-primary">T{c.part}</span> {c.time.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BulkCreateDialog open={bulkOpen} onClose={() => setBulkOpen(false)} onCreated={fetchCourses} />
      <AttendanceDialog course={attendanceCourse} open={!!attendanceCourse} onClose={() => setAttendanceCourse(null)} />
    </div>
  );
};

// ── Bulk-Anlage ──
const BulkCreateDialog = ({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) => {
  const [startDate, setStartDate] = useState("");
  const [count, setCount] = useState(4);
  const [intervalDays, setIntervalDays] = useState(7);
  const [part, setPart] = useState(1);
  const [time, setTime] = useState("13:00 – 17:00");
  const [location, setLocation] = useState("Wettingen");
  const [instructor, setInstructor] = useState("");
  const [instructorNumber, setInstructorNumber] = useState("");
  const [price, setPrice] = useState(160);
  const [spots, setSpots] = useState(5);
  const [busy, setBusy] = useState(false);

  const preview = useMemo(() => {
    if (!startDate) return [] as { date: string; day: string }[];
    const base = new Date(startDate + "T00:00:00");
    const out: { date: string; day: string }[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(base); d.setDate(base.getDate() + i * intervalDays);
      out.push({ date: fmtDate(d), day: dayName(d) });
    }
    return out;
  }, [startDate, count, intervalDays]);

  const create = async () => {
    if (!startDate || count < 1) { toast.error("Startdatum und Anzahl angeben"); return; }
    setBusy(true);
    const rows = preview.map((p, i) => ({
      id: `mgk${part}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
      date: p.date, day: p.day, time, part, location,
      instructor: instructor || null, instructor_number: instructorNumber || null,
      price, spots_available: spots,
    }));
    const { error } = await supabase.from("course_dates").insert(rows);
    setBusy(false);
    if (error) toast.error("Fehler: " + error.message);
    else {
      toast.success(`${rows.length} Kurstermine erstellt`); onCreated(); onClose();
      // Fire-and-forget GCal sync for each row
      rows.forEach((r) => {
        supabase.functions.invoke("sync-course-to-gcal", { body: { courseDateId: r.id, action: "upsert" } })
          .catch((e) => console.warn("[gcal sync]", e?.message || e));
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="font-heading uppercase">Mehrere Termine anlegen</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Startdatum</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2"><Label>Anzahl Termine</Label>
            <Input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </div>
          <div className="space-y-2"><Label>Abstand (Tage)</Label>
            <Select value={String(intervalDays)} onValueChange={(v) => setIntervalDays(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Täglich</SelectItem>
                <SelectItem value="7">Wöchentlich</SelectItem>
                <SelectItem value="14">Alle 2 Wochen</SelectItem>
                <SelectItem value="28">Alle 4 Wochen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Teil</Label>
            <Select value={String(part)} onValueChange={(v) => setPart(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[1, 2, 3, 4].map((p) => <SelectItem key={p} value={String(p)}>Teil {p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Zeit</Label><Input value={time} onChange={(e) => setTime(e.target.value)} /></div>
          <div className="space-y-2"><Label>Ort</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
          <div className="space-y-2"><Label>Fahrlehrer</Label><Input value={instructor} onChange={(e) => setInstructor(e.target.value)} /></div>
          <div className="space-y-2"><Label>Fahrlehrer-Nr.</Label><Input value={instructorNumber} onChange={(e) => setInstructorNumber(e.target.value)} /></div>
          <div className="space-y-2"><Label>Preis</Label><Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Plätze</Label><Input type="number" value={spots} onChange={(e) => setSpots(Number(e.target.value))} /></div>
        </div>

        {preview.length > 0 && (
          <div className="mt-2 p-3 bg-muted/40" style={{ borderRadius: "3px" }}>
            <p className="text-xs font-heading uppercase mb-1 text-muted-foreground">Vorschau ({preview.length})</p>
            <div className="flex flex-wrap gap-1">
              {preview.map((p, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-body" style={{ borderRadius: "3px" }}>
                  {p.day.slice(0, 2)} {p.date}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button onClick={create} disabled={busy || preview.length === 0} className="w-full mt-4 font-body">
          {busy ? "Erstellen..." : `${preview.length} Termine erstellen`}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCourseDates;
