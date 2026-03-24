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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const part2Ref = useRef<HTMLDivElement>(null);
  const part3Ref = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Load part 1 on mount
  useEffect(() => {
    loadCourseDates(1);
  }, []);

  const loadCourseDates = async (part: number) => {
    setLoadingPart(part);
    const { data, error } = await supabase
      .from('course_dates')
      .select('*')
      .eq('part', part)
      .gt('spots_available', 0)
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
    setSelections(prev => ({ ...prev, [part]: course }));

    // Auto-load and scroll to next part
    const nextPart = part + 1;
    if (nextPart <= 3) {
      if (!coursesData[nextPart]) {
        await loadCourseDates(nextPart);
      }
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

    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_type: 'grundkurs',
          first_name: firstName, last_name: lastName, email, phone, address,
          fa_number: faNumber, birth_date: birthDate,
          payment_method: "stripe",
          total_price: total, status: 'pending',
        })
        .select('id').single();

      if (bookingError) throw bookingError;

      for (const course of selectedCourses) {
        await supabase.from('booking_items').insert({ booking_id: booking.id, course_date_id: course.id });
        await supabase.rpc('decrement_spots', { course_id: course.id });
      }

      // Create Stripe checkout session
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-course-payment', {
        body: {
          bookingId: booking.id,
          email,
          customerName: `${firstName} ${lastName}`,
          courses: selectedCoursesWithParts.map(({ part, course }) => ({
            part, date: course.date, time: course.time, price: course.price,
          })),
          totalPrice: total,
        },
      });

      if (stripeError || !stripeData?.url) {
        throw new Error(stripeError?.message || "Stripe-Zahlung konnte nicht gestartet werden.");
      }

      // Redirect to Stripe checkout
      window.location.href = stripeData.url;
    } catch (err) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex flex-col leading-tight">
            <span className="flex items-baseline gap-0.5">
              <span className="text-[22px] font-heading font-bold text-foreground" style={{ letterSpacing: "0.05em" }}>Drive</span>
              <span className="text-[28px] text-primary" style={{ fontFamily: "'Kaushan Script', cursive" }}>me</span>
            </span>
            <span className="text-[10px] font-body text-muted-foreground -mt-1">Fahrschule</span>
          </div>
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        {/* Title */}
        <div className="text-center mb-2">
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
          courses={coursesData[1] || []}
          selected={selections[1]}
          onSelect={(course) => selectCourse(1, course)}
          loading={loadingPart === 1}
        />

        {/* Part 2 - Shown after Part 1 selected */}
        <AnimatePresence>
          {selections[1] && (
            <motion.div
              ref={part2Ref}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mt-10">
                <CourseSection
                  partNum={2}
                  courses={coursesData[2] || []}
                  selected={selections[2]}
                  onSelect={(course) => selectCourse(2, course)}
                  loading={loadingPart === 2}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Part 3 - Shown after Part 2 selected */}
        <AnimatePresence>
          {selections[2] && (
            <motion.div
              ref={part3Ref}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mt-10">
                <CourseSection
                  partNum={3}
                  courses={coursesData[3] || []}
                  selected={selections[3]}
                  onSelect={(course) => selectCourse(3, course)}
                  loading={loadingPart === 3}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                      <Label className="text-sm font-medium">FA-Nummer <span className="text-destructive">*</span></Label>
                      <Input value={faNumber} onChange={(e) => setFaNumber(e.target.value)} placeholder="z.B. CH-1234567890" maxLength={30} className="mt-1" />
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

                  <div className="mt-6 bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
                    <p className="text-sm text-foreground flex items-start gap-2">
                      <CreditCard className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span>
                        <strong>Zahlungshinweis:</strong> Die Zahlung erfolgt bar vor Ort am Kurstag.
                      </span>
                    </p>
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
                    Jetzt Buchen
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
}: {
  partNum: number;
  courses: CourseDate[];
  selected: CourseDate | null;
  onSelect: (course: CourseDate) => void;
  loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold font-[Outfit] text-primary mb-1 flex items-center gap-2">
        🏍️ MGK Teil {partNum} – Datum wählen
        {selected && <Check className="w-5 h-5 text-accent" />}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {partNum === 1 ? "Wählen Sie Ihren Wunschtermin für den ersten Kursteil." :
         `Teil ${partNum} muss nach Teil ${partNum - 1} stattfinden.`}
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
            return (
              <motion.button
                key={course.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(course)}
                className={`text-left bg-card rounded-xl border-2 p-4 transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
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
                  {course.spotsAvailable} Plätze frei
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
