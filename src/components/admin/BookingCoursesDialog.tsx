import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { dayNameFromDateStr } from "@/lib/utils";
import { chf, paymentStatusLabel } from "@/lib/payments";
import { CalendarDays, MapPin, Clock } from "lucide-react";

export interface BookingCoursesBooking {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  booking_type?: string | null;
  total_price?: number | null;
  status?: string | null;
  payment_status?: string | null;
  payment_method?: string | null;
}

interface CourseInfo {
  id: string;
  part: number;
  date: string;
  day: string | null;
  time: string | null;
  location: string | null;
  instructor: string | null;
  price: number | null;
}

interface Props {
  booking: BookingCoursesBooking | null;
  open: boolean;
  onClose: () => void;
}

const toTs = (d: string) => {
  const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime() : 0;
};

const BookingCoursesDialog = ({ booking, open, onClose }: Props) => {
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [other, setOther] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !booking) return;
    let active = true;
    (async () => {
      setLoading(true);
      setCourses([]); setOther([]);
      const { data: items } = await supabase
        .from("booking_items")
        .select("course_date_id, fahrstunden_service_id, fahrstunden_package_id")
        .eq("booking_id", booking.id);
      const courseIds = (items || []).map((i: any) => i.course_date_id).filter(Boolean) as string[];
      if (courseIds.length) {
        const { data: cd } = await supabase
          .from("course_dates")
          .select("id, part, date, day, time, location, instructor, price")
          .in("id", courseIds);
        if (active) setCourses(((cd || []) as CourseInfo[]).slice().sort((a, b) => Number(a.part) - Number(b.part) || toTs(a.date) - toTs(b.date)));
      }
      // Fahrstunden-Buchungen: Paket/Leistung benennen
      const names: string[] = [];
      for (const it of (items || []) as any[]) {
        if (it.fahrstunden_package_id) {
          const { data } = await supabase.from("fahrstunden_packages").select("name").eq("id", it.fahrstunden_package_id).maybeSingle();
          names.push(data?.name || "Fahrstunden-Paket");
        } else if (it.fahrstunden_service_id) {
          const { data } = await supabase.from("fahrstunden_services").select("name").eq("id", it.fahrstunden_service_id).maybeSingle();
          names.push(data?.name || "Fahrstunde");
        }
      }
      if (active) { setOther(names); setLoading(false); }
    })();
    return () => { active = false; };
  }, [open, booking?.id]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {booking?.first_name} {booking?.last_name}
          </DialogTitle>
        </DialogHeader>

        {booking && (
          <div className="text-sm space-y-1 text-muted-foreground">
            {booking.email && <div>{booking.email}</div>}
            {booking.phone && <div>{booking.phone}</div>}
            <div className="flex flex-wrap gap-2 pt-1">
              {booking.booking_type && <Badge variant="outline">{booking.booking_type}</Badge>}
              {booking.status && <Badge variant={booking.status === "cancelled" ? "destructive" : "secondary"}>{booking.status}</Badge>}
              {booking.payment_status && <Badge variant="outline">{paymentStatusLabel(booking.payment_status)}</Badge>}
              {booking.total_price != null && <Badge variant="outline">{chf(Number(booking.total_price))}</Badge>}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="font-medium text-sm">Gebuchte Kurse</div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Laden…</p>
          ) : courses.length === 0 && other.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Kurstermine verknüpft.</p>
          ) : (
            <div className="space-y-2">
              {courses.map((c) => (
                <div key={c.id} className="rounded-md border border-border p-3 text-sm">
                  <div className="font-semibold">MGK Teil {c.part}</div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <CalendarDays className="w-4 h-4" /> {dayNameFromDateStr(c.date, c.day)}, {c.date}
                  </div>
                  {c.time && (
                    <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /> {c.time}</div>
                  )}
                  {c.location && (
                    <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /> {c.location}</div>
                  )}
                  {c.instructor && <div className="text-muted-foreground">Fahrlehrer: {c.instructor}</div>}
                </div>
              ))}
              {other.map((n, i) => (
                <div key={i} className="rounded-md border border-border p-3 text-sm font-semibold">{n}</div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingCoursesDialog;
