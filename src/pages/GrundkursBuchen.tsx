import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, Check, MapPin, Clock, User, AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CourseDate } from "@/data/courses";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

import BrandLogo from "@/components/BrandLogo";
import SiteHeader from "@/components/SiteHeader";
import Seo from "@/components/Seo";
import lfaMuster from "@/assets/lernfahrausweis-muster.jpeg.asset.json";

// Parse "DD.MM.YYYY" to a comparable Date
function parseCourseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('.');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

const bookingSchema = z.object({
  firstName: z.string().trim().min(1, "Vorname ist ein Pflichtfeld"),
  lastName: z.string().trim().min(1, "Nachname ist ein Pflichtfeld"),
  email: z.string().trim().email("Ungültige E-Mail-Adresse"),
  phone: z.string().trim().min(1, "Telefonnummer ist ein Pflichtfeld"),
  address: z.string().trim().min(1, "Adresse ist ein Pflichtfeld"),
  faNumber: z.string().trim().min(1, "FA-Nummer ist ein Pflichtfeld").max(30, "FA-Nummer darf maximal 30 Zeichen haben"),
  birthDate: z.string().trim().min(1, "Geburtsdatum ist ein Pflichtfeld"),
  category: z.string().min(1, "Kategorie ist ein Pflichtfeld"),
});

export default function GrundkursBuchen() {
  const [selections, setSelections] = useState<Record<number, CourseDate | null>>({ 1: null, 2: null, 3: null });
  const [coursesData, setCoursesData] = useState<Record<number, CourseDate[]>>({});
  const [loadingPart, setLoadingPart] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [faNumber, setFaNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [category, setCategory] = useState("A (Motorrad)");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "barzahlung" | "ueberweisung">("stripe");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const part2Ref = useRef<HTMLDivElement>(null);
  const part3Ref = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Load all 3 parts upfront so customers can browse M2/M3 before selecting M1
  useEffect(() => {
    loadCourseDates(1);
    loadCourseDates(2);
    loadCourseDates(3);
  }, []);

  const loadCourseDates = async (part: number) => {
    setLoadingPart(part);
    const { data, error } = await supabase
      .from('course_dates')
      .select('*')
      .eq('part', part)
      .order('date');
    if (!error && data) {
      setCoursesData(prev => ({
        ...prev,
        [part]: data.map((d: any) => ({
          id: d.id, day: d.day, date: d.date, time: d.time, location: d.location,
          instructor: d.instructor || undefined, price: Number(d.price), spotsAvailable: d.spots_available,
        })),
      }));
    }
    setLoadingPart(null);
  };

  const selectCourse = async (part: number, course: CourseDate) => {
    // Clear subsequent selections when changing a previous part
    const updated: Record<number, CourseDate | null> = { ...selections, [part]: course };
    for (let p = part + 1; p <= 3; p++) {
      updated[p] = null;
    }
    setSelections(updated);

    // Auto-load and scroll to next part
    const nextPart = part + 1;
    if (nextPart <= 3) {
      await loadCourseDates(nextPart);
      setTimeout(() => {
        const ref = nextPart === 2 ? part2Ref : part3Ref;
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } else {
      // All parts selected, scroll to form
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  };

  const handleSubmit = async () => {
    const result = bookingSchema.safeParse({ firstName, lastName, email, phone, address, faNumber, birthDate, category });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => { fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const selectedCoursesWithParts = Object.entries(selections)
      .filter(([, v]) => v !== null)
      .map(([part, course]) => ({ part: parseInt(part), course: course! }));
    const selectedCourses = selectedCoursesWithParts.map(({ course }) => course);
    const total = selectedCourses.reduce((sum, c) => sum + c.price, 0);
    const isOnline = paymentMethod === "stripe";
    const checkoutWindow = isOnline ? window.open("", "_blank") : null;

    if (isOnline && !checkoutWindow) {
      toast.error("Popup blockiert – bitte Popups erlauben und erneut versuchen.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create booking via server-side edge function
      const { data: bookingResult, error: bookingError } = await supabase.functions.invoke('create-booking', {
        body: {
          bookingType: 'grundkurs',
          firstName, lastName, email, phone, address,
          faNumber, birthDate,
          paymentMethod,
          totalPrice: total,
          courseDateIds: selectedCourses.map(c => c.id),
        },
      });

      if (bookingError || !bookingResult?.bookingId) throw new Error(bookingError?.message || bookingResult?.error || "Buchung fehlgeschlagen");

      if (!isOnline) {
        toast.success("Buchung erfolgreich! Du erhältst die Bestätigung per E-Mail mit Zahlungsinformationen.");
        // Redirect to success page
        window.location.hash = `#/buchung-erfolgreich?booking_id=${bookingResult.bookingId}`;
        return;
      }

      // Create Stripe checkout session
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-course-payment', {
        body: {
          bookingId: bookingResult.bookingId,
          email,
          customerName: `${firstName} ${lastName}`,
        },
      });

      if (stripeError || !stripeData?.url) {
        throw new Error(stripeError?.message || "Stripe-Zahlung konnte nicht gestartet werden.");
      }

      try {
        checkoutWindow!.location.replace(stripeData.url);
      } catch {
        checkoutWindow!.location.href = stripeData.url;
      }
      toast.success("Zahlungsseite geöffnet – bitte im neuen Tab bezahlen. Nach erfolgreicher Zahlung erhältst du die Bestätigung per E-Mail.");
    } catch (err) {
      try {
        checkoutWindow?.close();
      } catch {
        // no-op
      }
      console.error('Booking error:', err);
      toast.error("Buchung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCourses = Object.entries(selections)
    .filter(([, v]) => v !== null)
    .map(([part, course]) => ({ part: parseInt(part), course: course! }));
  const totalPrice = selectedCourses.reduce((sum, { course }) => sum + course.price, 0);
  const allPartsSelected = selections[1] && selections[2] && selections[3];

  // Filter courses: hide past dates, enforce chronological order, one course per day
  const getFilteredCourses = (part: number): CourseDate[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const courses = (coursesData[part] || [])
      .filter(c => parseCourseDate(c.date) >= today)
      .sort((a, b) => parseCourseDate(a.date).getTime() - parseCourseDate(b.date).getTime());

    // Collect already-selected dates from other parts (one course per day rule)
    const usedDates = new Set(
      Object.entries(selections)
        .filter(([p, v]) => v !== null && parseInt(p) !== part)
        .map(([, v]) => v!.date)
    );

    if (part === 1) {
      return courses.filter(c => !usedDates.has(c.date));
    }
    const prevSelected = selections[part - 1];
    if (!prevSelected) return courses.filter(c => !usedDates.has(c.date));
    const prevDate = parseCourseDate(prevSelected.date);
    return courses.filter(c => parseCourseDate(c.date) > prevDate && !usedDates.has(c.date));
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Motorrad-Grundkurs buchen Wettingen | Fahrschule me"
        description="Motorrad-Grundkurs (MGK) Teil 1, 2 und 3 direkt online buchen. Freie Plätze in Wettingen anzeigen und sofort reservieren."
        path="/grundkurs"
      />
      <SiteHeader />



      <div className="max-w-5xl mx-auto px-6 pb-20">
        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Motorrad-Grundkurs in Wettingen buchen
          </h1>
          <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">Motorrad Grundkursdaten / Anmeldung</p>
          <p className="text-sm text-muted-foreground">+++Die Kursteile müssen unbedingt in der richtigen Reihenfolge absolviert werden+++</p>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center mb-8">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Keine passenden Kursdaten gefunden???</strong> Kursteil 3 bis 50 cm³ auf Anfrage!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Melde dich bei uns, und wir versuchen die für dich passenden Termine individuell zusammenzustellen.
          </p>
        </div>

        {/* Part 1 - Always visible */}
        <CourseSection
          partNum={1}
          courses={getFilteredCourses(1)}
          selected={selections[1]}
          onSelect={(course) => selectCourse(1, course)}
          loading={loadingPart === 1}
        />

        {/* Part 2 - Always visible so customers can browse all dates */}
        <div ref={part2Ref} className="mt-10">
          <CourseSection
            partNum={2}
            courses={getFilteredCourses(2)}
            selected={selections[2]}
            onSelect={(course) => selectCourse(2, course)}
            loading={loadingPart === 2}
            requiresPrev={!selections[1]}
          />
        </div>

        {/* Part 3 - Always visible so customers can browse all dates */}
        <div ref={part3Ref} className="mt-10">
          <CourseSection
            partNum={3}
            courses={getFilteredCourses(3)}
            selected={selections[3]}
            onSelect={(course) => selectCourse(3, course)}
            loading={loadingPart === 3}
            requiresPrev={!selections[2]}
          />
        </div>



        {/* Confirmation form - Shown after all 3 parts selected */}
        <AnimatePresence>
          {allPartsSelected && (
            <motion.div
              ref={formRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mt-10">
                <h2 className="text-2xl font-bold font-[Outfit] text-primary mb-6 flex items-center gap-2">
                  ✅ Buchung bestätigen
                </h2>

                {/* Summary */}
                <div className="bg-card border border-border rounded-xl p-5 mb-6">
                  <h3 className="font-semibold text-foreground mb-4">Ihre gewählten Kurstermine:</h3>
                  <div className="space-y-4">
                    {selectedCourses.map(({ part, course }) => (
                      <div key={part}>
                        <div className="bg-primary text-primary-foreground text-center py-1.5 rounded-lg text-sm font-semibold mb-2">
                          MGK Teil {part}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm text-muted-foreground">📅 {course.date} &nbsp; 🕐 {course.time}</p>
                          <p className="text-sm text-muted-foreground">📍 {course.location}</p>
                          <p className="font-bold text-primary">CHF {course.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border mt-4 pt-4 text-right">
                    <p className="text-sm text-muted-foreground">
                      Gesamtbetrag: <span className="text-2xl font-bold text-foreground">CHF {totalPrice.toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="bg-muted/50 rounded-xl p-6">
                  <h3 className="font-semibold text-primary mb-4">Persönliche Daten</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Vorname <span className="text-destructive">*</span></Label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Max" className="mt-1" />
                      {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Nachname <span className="text-destructive">*</span></Label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Muster" className="mt-1" />
                      {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">E-Mail <span className="text-destructive">*</span></Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="max@example.com" className="mt-1" />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Telefon <span className="text-destructive">*</span></Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+41 79 123 45 67" className="mt-1" />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-sm font-medium">Adresse <span className="text-destructive">*</span></Label>
                      <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Musterstrasse 1, 5400 Baden" className="mt-1" />
                      {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Geburtsdatum <span className="text-destructive">*</span></Label>
                      <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-1" />
                      {errors.birthDate && <p className="text-xs text-destructive mt-1">{errors.birthDate}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">FA-Nummer (Lernfahrausweis-Nr.) <span className="text-destructive">*</span></Label>
                      <Input value={faNumber} onChange={(e) => setFaNumber(e.target.value)} placeholder="z.B. CH-1234567890" maxLength={30} className="mt-1" />
                      <details className="mt-2 group">
                        <summary className="text-xs text-primary cursor-pointer hover:underline list-none flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Wo finde ich die FA-Nummer?</span>
                        </summary>
                        <div className="mt-2 p-2 bg-muted/40 border border-border" style={{ borderRadius: "3px" }}>
                          <p className="text-xs text-muted-foreground mb-2">
                            Auf deinem Lernfahrausweis (LFA) oben rechts – gelb markiert im Beispiel.
                          </p>
                          <a href={lfaMuster.url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={lfaMuster.url}
                              alt="Muster Lernfahrausweis mit markierter FA-Nummer"
                              className="w-full max-w-md border border-border"
                              style={{ borderRadius: "3px" }}
                              loading="lazy"
                            />
                          </a>
                        </div>
                      </details>
                      {errors.faNumber && <p className="text-xs text-destructive mt-1">{errors.faNumber}</p>}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Kategorie</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A (Motorrad)">A (Motorrad)</SelectItem>
                          <SelectItem value="A1 (Leichtmotorrad)">A1 (Leichtmotorrad)</SelectItem>
                          <SelectItem value="A2">A2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Zahlungsart wählen
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {([
                        { id: "stripe", label: "Online bezahlen", desc: "Karte / TWINT / Klarna via Stripe" },
                        { id: "barzahlung", label: "Barzahlung", desc: "Vor Ort beim 1. Kurstag" },
                        { id: "ueberweisung", label: "Überweisung", desc: "Rechnung per E-Mail" },
                      ] as const).map((opt) => {
                        const active = paymentMethod === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setPaymentMethod(opt.id)}
                            className={`text-left border-2 p-3 transition-colors ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-card"}`}
                            style={{ borderRadius: "3px" }}
                          >
                            <p className="font-heading font-bold text-sm text-foreground uppercase">{opt.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                    {paymentMethod === "stripe" ? (
                      <p className="text-xs text-muted-foreground mt-3">Nach dem Absenden wirst du in einem neuen Tab zu Stripe weitergeleitet.</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-3">Deine Buchung wird sofort bestätigt. Die Zahlungsinformationen erhältst du per E-Mail.</p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end mt-8">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {paymentMethod === "stripe" ? "Weiter zur Zahlung" : "Jetzt verbindlich buchen"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CourseSection({
  partNum,
  courses,
  selected,
  onSelect,
  loading,
  requiresPrev = false,
}: {
  partNum: number;
  courses: CourseDate[];
  selected: CourseDate | null;
  onSelect: (course: CourseDate) => void;
  loading: boolean;
  requiresPrev?: boolean;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold font-[Outfit] text-primary mb-1 flex items-center gap-2">
        🏍️ MGK Teil {partNum} – {requiresPrev ? "Übersicht" : "Datum wählen"}
        {selected && <Check className="w-5 h-5 text-accent" />}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {partNum === 1
          ? "Wählen Sie Ihren Wunschtermin für den ersten Kursteil."
          : requiresPrev
            ? `Alle verfügbaren Termine für Teil ${partNum}. Bitte zuerst Teil ${partNum - 1} auswählen, um buchen zu können.`
            : `Teil ${partNum} muss nach Teil ${partNum - 1} stattfinden.`}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Kursdaten werden geladen...</span>
        </div>
      ) : courses.length === 0 ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2 py-8">
          <AlertCircle className="w-4 h-4" /> Keine verfügbaren Termine gefunden.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {courses.map((course) => {
            const isSelected = selected?.id === course.id;
            const isFull = course.spotsAvailable <= 0;

            if (isFull) {
              return (
                <div
                  key={course.id}
                  className="text-left bg-muted/40 rounded-xl border-2 border-dashed border-border p-4 opacity-90"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{course.day}</p>
                  <p className="font-bold text-muted-foreground text-lg font-[Outfit] line-through">{course.date}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {course.time}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {course.location}
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-3 bg-destructive/15 text-destructive">
                    Ausgebucht
                  </span>
                </div>
              );
            }

            const disabled = requiresPrev;
            return (
              <motion.button
                key={course.id}
                whileHover={disabled ? undefined : { scale: 1.02 }}
                whileTap={disabled ? undefined : { scale: 0.98 }}
                disabled={disabled}
                onClick={() => !disabled && onSelect(course)}
                title={disabled ? `Bitte zuerst Teil ${partNum - 1} auswählen` : undefined}
                className={`text-left bg-card rounded-xl border-2 p-4 transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : disabled
                      ? "border-border opacity-60 cursor-not-allowed"
                      : "border-border hover:border-primary/30"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{course.day}</p>
                <p className="font-bold text-foreground text-lg font-[Outfit]">{course.date}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {course.time}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> {course.location}
                  </p>
                  {course.instructor && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3 h-3" /> {course.instructor}
                    </p>
                  )}
                </div>
                <p className="font-bold text-primary mt-3">CHF {course.price.toFixed(2)}</p>
                <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${
                  course.spotsAvailable <= 2 ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"
                }`}>
                  {course.spotsAvailable} {course.spotsAvailable === 1 ? "Platz" : "Plätze"} frei
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}


