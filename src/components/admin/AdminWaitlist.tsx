import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw, Trash2 } from "lucide-react";

type WaitlistRow = {
  id: string;
  course_date_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string | null;
  status: string;
  notified_at: string | null;
  created_at: string;
  course_dates: { part: number; date: string; day: string; time: string; location: string; spots_available: number } | null;
};

const statusColors: Record<string, string> = {
  waiting: "bg-amber-100 text-amber-800",
  notified: "bg-blue-100 text-blue-800",
  converted: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-700",
};

const AdminWaitlist = () => {
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("waitlist")
      .select("*, course_dates(part, date, day, time, location, spots_available)")
      .order("created_at", { ascending: false });
    if (error) toast.error("Fehler beim Laden");
    else setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "notified") patch.notified_at = new Date().toISOString();
    const { error } = await supabase.from("waitlist").update(patch).eq("id", id);
    if (error) toast.error("Fehler: " + error.message);
    else { toast.success("Status aktualisiert"); fetchRows(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Eintrag wirklich löschen?")) return;
    const { error } = await supabase.from("waitlist").delete().eq("id", id);
    if (error) toast.error("Fehler: " + error.message);
    else { toast.success("Gelöscht"); fetchRows(); }
  };

  // Group by course
  const grouped: Record<string, WaitlistRow[]> = {};
  rows.forEach((r) => {
    const key = r.course_date_id;
    (grouped[key] ||= []).push(r);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl font-[Outfit]">Warteliste</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchRows}>
          <RefreshCw className="w-4 h-4 mr-1" /> Aktualisieren
        </Button>
      </div>

      {loading ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">Laden...</CardContent></Card>
      ) : rows.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Keine Wartelisten-Einträge vorhanden.</CardContent></Card>
      ) : (
        Object.entries(grouped).map(([courseId, entries]) => {
          const c = entries[0].course_dates;
          return (
            <Card key={courseId}>
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                  <div>
                    <span className="font-semibold">
                      {c ? `MGK Teil ${c.part} · ${c.day}, ${c.date} · ${c.time}` : `Kurs ${courseId}`}
                    </span>
                    {c && (
                      <span className="ml-3 text-sm text-muted-foreground">
                        {c.spots_available > 0 ? `${c.spots_available} Plätze frei` : "Ausgebucht"}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline">{entries.length} auf Warteliste</Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Kontakt</TableHead>
                      <TableHead>Notiz</TableHead>
                      <TableHead>Eingetragen</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((r, i) => (
                      <TableRow key={r.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-medium">{r.first_name} {r.last_name}</TableCell>
                        <TableCell className="text-sm">
                          <div>{r.email}</div>
                          <div className="text-muted-foreground">{r.phone}</div>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{r.notes || "–"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("de-CH")}
                        </TableCell>
                        <TableCell>
                          <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                            <SelectTrigger className={`h-7 w-32 text-xs ${statusColors[r.status] || ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="waiting">Wartend</SelectItem>
                              <SelectItem value="notified">Benachrichtigt</SelectItem>
                              <SelectItem value="converted">Gebucht</SelectItem>
                              <SelectItem value="cancelled">Abgesagt</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default AdminWaitlist;
