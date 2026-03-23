import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, Check, ChevronLeft, ChevronRight, MapPin, Clock, User, AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motorradGrundkurse, type CourseDate } from "@/data/courses";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const STEPS = [
  { label: "MGK Teil 1", part: 1 },
  { label: "MGK Teil 2", part: 2 },
  { label: "MGK Teil 3", part: 3 },
  { label: "Bestätigen", part: 0 },
];

const bookingSchema = z.object({
  faNumber: z.string().trim().min(1, "FA-Nummer ist ein Pflichtfeld").max(30, "FA-Nummer darf maximal 30 Zeichen haben"),
  birthDate: z.string().trim().min(1, "Geburtsdatum ist ein Pflichtfeld"),
  category: z.string().min(1, "Kategorie ist ein Pflichtfeld"),
});

export default function GrundkursBuchen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, CourseDate | null>>({
    1: null,
    2: null,
    3: null,
  });
  const [faNumber, setFaNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [category, setCategory] = useState("A (Motorrad)");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectCourse = (part: number, course: CourseDate) => {
    setSelections((prev) => ({ ...prev, [part]: course }));
  };

  const canGoNext = () => {
    if (currentStep < 3) {
      const part = STEPS[currentStep].part;
      return selections[part] !== null;
    }
    return true;
  };

  const goNext = () => {
    if (currentStep < 3 && canGoNext()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = () => {
    const result = bookingSchema.safeParse({ faNumber, birthDate, category });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    const selectedCourses = Object.values(selections).filter(Boolean) as CourseDate[];
    const total = selectedCourses.reduce((sum, c) => sum + c.price, 0);

    toast.success("Buchung erfolgreich!", {
      description: `${selectedCourses.length} Kursteile für CHF ${total.toFixed(2)} gebucht. Wir senden dir eine Bestätigung per E-Mail.`,
    });
  };

  const selectedCourses = Object.entries(selections)
    .filter(([, v]) => v !== null)
    .map(([part, course]) => ({ part: parseInt(part), course: course! }));

  const totalPrice = selectedCourses.reduce((sum, { course }) => sum + course.price, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Bike className="w-7 h-7 text-primary" />
          <span className="text-xl font-bold font-[Outfit] text-foreground">Drive me</span>
          <span className="text-xs text-muted-foreground font-medium mt-1">Fahrschule</span>
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

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <div key={i} className="flex items-center">
                <button
                  onClick={() => {
                    if (i <= currentStep) setCurrentStep(i);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors shrink-0 ${
                    isDone
                      ? "bg-accent text-accent-foreground"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="w-5 h-5" /> : i + 1}
                </button>
                <span
                  className={`hidden sm:block text-xs font-medium mx-2 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-12 h-0.5 ${i < currentStep ? "bg-accent" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {currentStep < 3 ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CourseStepContent
                part={motorradGrundkurse[currentStep]}
                selected={selections[STEPS[currentStep].part]}
                onSelect={(course) => selectCourse(STEPS[currentStep].part, course)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ConfirmationStep
                selectedCourses={selectedCourses}
                totalPrice={totalPrice}
                faNumber={faNumber}
                setFaNumber={setFaNumber}
                birthDate={birthDate}
                setBirthDate={setBirthDate}
                category={category}
                setCategory={setCategory}
                errors={errors}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Zurück
          </Button>

          {currentStep < 3 ? (
            <Button onClick={goNext} disabled={!canGoNext()} className="gap-2">
              Weiter zu {STEPS[currentStep + 1]?.label}
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={selectedCourses.length === 0}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Jetzt Buchen & Zur Kasse
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseStepContent({
  part,
  selected,
  onSelect,
}: {
  part: (typeof motorradGrundkurse)[0];
  selected: CourseDate | null;
  onSelect: (course: CourseDate) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold font-[Outfit] text-primary mb-1 flex items-center gap-2">
        🏍️ {part.title}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">{part.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {part.dates.map((course) => {
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {course.day}
              </p>
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
              <span
                className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${
                  course.spotsAvailable <= 2
                    ? "bg-destructive/15 text-destructive"
                    : "bg-accent/15 text-accent"
                }`}
              >
                {course.spotsAvailable} Plätze frei
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ConfirmationStep({
  selectedCourses,
  totalPrice,
  faNumber,
  setFaNumber,
  birthDate,
  setBirthDate,
  category,
  setCategory,
  errors,
}: {
  selectedCourses: { part: number; course: CourseDate }[];
  totalPrice: number;
  faNumber: string;
  setFaNumber: (v: string) => void;
  birthDate: string;
  setBirthDate: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold font-[Outfit] text-primary mb-6 flex items-center gap-2">
        ✅ Buchung bestätigen
      </h2>

      {/* Selected courses summary */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Ihre gewählten Kurstermine:</h3>

        {selectedCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Keine Kurse ausgewählt. Bitte gehen Sie zurück und wählen Sie Ihre Termine.
          </p>
        ) : (
          <div className="space-y-4">
            {selectedCourses.map(({ part, course }) => (
              <div key={part}>
                <div className="bg-primary text-primary-foreground text-center py-1.5 rounded-lg text-sm font-semibold mb-2">
                  MGK Teil {part}
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground">M {part}</p>
                  <p className="text-sm text-muted-foreground">📅 {course.date} &nbsp; 🕐 {course.time}</p>
                  <p className="text-sm text-muted-foreground">📍 {course.location}</p>
                  <p className="font-bold text-primary">CHF {course.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border mt-4 pt-4 text-right">
          <p className="text-sm text-muted-foreground">
            Gesamtbetrag:{" "}
            <span className="text-2xl font-bold text-foreground">CHF {totalPrice.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Required Details */}
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="font-semibold text-primary mb-4">Pflichtangaben / Required Details</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fa-number" className="text-sm font-medium">
              FA-Nummer (Lernfahrausweis-Nummer) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fa-number"
              value={faNumber}
              onChange={(e) => setFaNumber(e.target.value)}
              placeholder="z.B. CH-1234567890"
              maxLength={30}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pflichtfeld – Buchung ohne FA-Nummer nicht möglich.
            </p>
            {errors.faNumber && (
              <p className="text-xs text-destructive mt-1">{errors.faNumber}</p>
            )}
          </div>

          <div>
            <Label htmlFor="birth-date" className="text-sm font-medium">
              Geburtsdatum <span className="text-destructive">*</span>
            </Label>
            <Input
              id="birth-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1"
            />
            {errors.birthDate && (
              <p className="text-xs text-destructive mt-1">{errors.birthDate}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium">Kategorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
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
              <strong>Zahlungshinweis:</strong> Bei Barzahlung erhalten Sie eine Buchungsbestätigung. Die Zahlung erfolgt am Kurstag.
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1 ml-6 italic">
            Payment notice: Cash payers receive confirmation. Payment is due on course day.
          </p>
        </div>
      </div>
    </div>
  );
}
