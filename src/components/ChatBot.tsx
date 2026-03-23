import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bike, Calendar, HelpCircle, ChevronRight, MessageCircle, User, Mail, Hash, Phone, MapPin, CreditCard, Check, Car, Clock, Gift, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { faqData, instructors } from "@/data/courses";
import type { CourseDate, FahrstundenService, FahrstundenPackage, Instructor } from "@/data/courses";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  buttons?: QuickButton[];
  courseCards?: { courses: CourseDate[]; partNum: number };
  studentForm?: boolean;
  paymentStep?: boolean;
  confirmationSummary?: BookingSummary;
  serviceSelector?: boolean;
  categorySelector?: boolean;
  instructorSelector?: boolean;
  packageSelector?: { packages: FahrstundenPackage[]; service: FahrstundenService };
  fahrstundenConfirmation?: FahrstundenSummary;
}

interface QuickButton {
  label: string;
  icon?: React.ReactNode;
  action: string;
}

interface StudentFormData {
  firstName: string;
  lastName: string;
  address: string;
  birthDate: string;
  faNumber: string;
  email: string;
  phone: string;
}

interface BookingSummary {
  selections: { part: number; course: CourseDate }[];
  student: StudentFormData;
  paymentMethod: string;
}

interface FahrstundenSummary {
  service: FahrstundenService;
  selectedPackage?: FahrstundenPackage;
  instructor?: Instructor;
  student: StudentFormData;
  paymentMethod: string;
}

const PAYMENT_METHODS = [
  { id: "cash", label: "Barzahlung am Kurstag", desc: "Schüler hat bar bezahlt. Guthaben bleibt gleich oder wird aufgeladen.", icon: "💵" },
  { id: "card", label: "Online bezahlen (Stripe/Twint)", desc: "Sofort bezahlen per Karte oder Twint. Stripe Checkout öffnet sich.", icon: "💳" },
];

const mainMenu: QuickButton[] = [
  { label: "Grundkurs buchen", icon: <Bike className="w-3.5 h-3.5" />, action: "start_booking" },
  { label: "Fahrstunde buchen", icon: <Car className="w-3.5 h-3.5" />, action: "start_fahrstunde" },
  { label: "FAQ", icon: <HelpCircle className="w-3.5 h-3.5" />, action: "show_faq" },
  { label: "Kontakt", icon: <MessageCircle className="w-3.5 h-3.5" />, action: "contact" },
];

// ─── Main Component ──────────────────────────────────────────

export default function ChatBot() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Grundkurs booking state
  const [bookingStep, setBookingStep] = useState<number>(0);
  const [selections, setSelections] = useState<Record<number, CourseDate>>({});
  const [studentData, setStudentData] = useState<StudentFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  // Fahrstunden booking state
  const [fsStep, setFsStep] = useState<number>(0);
  const [fsCategory, setFsCategory] = useState<"auto" | "motorrad" | null>(null);
  const [fsService, setFsService] = useState<FahrstundenService | null>(null);
  const [fsPackage, setFsPackage] = useState<FahrstundenPackage | null>(null);
  const [fsInstructor, setFsInstructor] = useState<Instructor | null>(null);

  // DB data
  const [dbCourses, setDbCourses] = useState<Record<number, CourseDate[]>>({});
  const [dbServices, setDbServices] = useState<FahrstundenService[]>([]);
  const [dbPackages, setDbPackages] = useState<FahrstundenPackage[]>([]);

  // Load course data from DB
  const loadCourseDates = useCallback(async (part: number): Promise<CourseDate[]> => {
    const { data, error } = await supabase
      .from('course_dates')
      .select('*')
      .eq('part', part)
      .gt('spots_available', 0)
      .order('date');
    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id,
      day: d.day,
      date: d.date,
      time: d.time,
      location: d.location,
      instructor: d.instructor || undefined,
      price: Number(d.price),
      spotsAvailable: d.spots_available,
    }));
  }, []);

  const loadServices = useCallback(async (): Promise<FahrstundenService[]> => {
    const { data } = await supabase.from('fahrstunden_services').select('*');
    if (!data) return [];
    return data.map((s: any) => ({
      id: s.id, category: s.category, name: s.name, duration: s.duration, price: Number(s.price),
    }));
  }, []);

  const loadPackages = useCallback(async (): Promise<FahrstundenPackage[]> => {
    const { data } = await supabase.from('fahrstunden_packages').select('*');
    if (!data) return [];
    return data.map((p: any) => ({
      id: p.id, serviceId: p.service_id, name: p.name, lessons: p.lessons,
      discount: p.discount, totalPrice: Number(p.total_price), pricePerLesson: Number(p.price_per_lesson),
    }));
  }, []);

  useEffect(() => {
    if (open && !initialized) {
      setMessages([{
        id: "welcome",
        role: "bot",
        content: "Hoi! 👋 Willkommen bei **Drive me Fahrschule**.\n\nWas möchtest du buchen?",
        buttons: [
          { label: "🏍️ Motorrad Grundkurs", icon: <Bike className="w-3.5 h-3.5" />, action: "start_booking" },
          { label: "🚗 Fahrstunde buchen", icon: <Car className="w-3.5 h-3.5" />, action: "start_fahrstunde" },
          { label: "❓ FAQ", icon: <HelpCircle className="w-3.5 h-3.5" />, action: "show_faq" },
          { label: "📞 Kontakt", icon: <MessageCircle className="w-3.5 h-3.5" />, action: "contact" },
        ],
      }]);
      setInitialized(true);
    }
  }, [open, initialized]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  }, [messages]);

  const addMsg = (msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() }]);
  };

  // ── Grundkurs booking flow ──
  const startBooking = async () => {
    setBookingStep(1);
    setFsStep(0);
    setSelections({});
    setStudentData(null);
    addMsg({ role: "user", content: "Grundkurs buchen" });
    const courses = await loadCourseDates(1);
    setDbCourses(prev => ({ ...prev, 1: courses }));
    addMsg({
      role: "bot",
      content: `**Schritt 1/5** – 🏍️ **MGK Teil 1 – Datum wählen**\n\nWähle deinen Wunschtermin:`,
      courseCards: { courses, partNum: 1 },
    });
  };

  const selectCourse = async (partNum: number, course: CourseDate) => {
    setSelections((prev) => ({ ...prev, [partNum]: course }));
    addMsg({ role: "user", content: `${course.day}, ${course.date} – ${course.time}` });

    const nextPart = partNum + 1;
    if (nextPart <= 3) {
      setBookingStep(nextPart);
      const courses = await loadCourseDates(nextPart);
      setDbCourses(prev => ({ ...prev, [nextPart]: courses }));
      addMsg({
        role: "bot",
        content: `✅ Teil ${partNum} gewählt!\n\n**Schritt ${nextPart}/5** – 🏍️ **MGK Teil ${nextPart} – Datum wählen**\n\nWähle deinen Wunschtermin:`,
        courseCards: { courses, partNum: nextPart },
      });
    } else {
      setBookingStep(4);
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: `✅ Alle 3 Kursteile gewählt!\n\n**Schritt 4/5** – 📝 Bitte fülle deine persönlichen Daten aus:`,
          studentForm: true,
        });
      }, 400);
    }
  };

  const handleStudentSubmit = (data: StudentFormData) => {
    setStudentData(data);
    // Check if we're in Grundkurs or Fahrstunden flow
    if (bookingStep > 0) {
      setBookingStep(5);
      addMsg({ role: "user", content: `${data.firstName} ${data.lastName}, ${data.email}` });
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: `✅ Daten erfasst!\n\n**Schritt 5/5** – 💳 Wähle deine Bezahlmethode:`,
          paymentStep: true,
        });
      }, 400);
    } else if (fsStep > 0) {
      setFsStep(6);
      addMsg({ role: "user", content: `${data.firstName} ${data.lastName}, ${data.email}` });
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: `✅ Daten erfasst!\n\n**Schritt 5/5** – 💳 Wähle deine Bezahlmethode:`,
          paymentStep: true,
        });
      }, 400);
    }
  };

  const handlePaymentSelect = (methodId: string) => {
    const method = PAYMENT_METHODS.find((m) => m.id === methodId);
    if (!method || !studentData) return;
    const paymentLabel = methodId === "card" ? "Online bezahlen (Stripe/Twint)" : "Barzahlung am Kurstag";
    setSelectedPaymentMethod(paymentLabel);
    addMsg({ role: "user", content: method.label });

    if (bookingStep > 0) {
      setBookingStep(6);
      const sels = Object.entries(selections).map(([p, c]) => ({ part: parseInt(p), course: c }));
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: `Bitte überprüfe deine Buchung:`,
          confirmationSummary: {
            selections: sels,
            student: studentData,
            paymentMethod: method.label,
          },
        });
      }, 400);
    } else if (fsStep > 0) {
      setFsStep(7);
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: `Bitte überprüfe deine Buchung:`,
          fahrstundenConfirmation: {
            service: fsService!,
            selectedPackage: fsPackage || undefined,
            instructor: fsInstructor || undefined,
            student: studentData,
            paymentMethod: method.label,
          },
        });
      }, 400);
    }
  };

  const handleFinalConfirm = async () => {
    if (!studentData || isSubmitting) return;
    setIsSubmitting(true);
    const sels = Object.entries(selections).map(([p, c]) => ({ part: parseInt(p), course: c }));
    const total = sels.reduce((s, { course }) => s + course.price, 0);

    try {
      const isOnlinePayment = selectedPaymentMethod === "Kreditkarte / Debitkarte";

      // Save booking to DB
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_type: 'grundkurs',
          first_name: studentData.firstName,
          last_name: studentData.lastName,
          address: studentData.address,
          birth_date: studentData.birthDate,
          fa_number: studentData.faNumber,
          email: studentData.email,
          phone: studentData.phone,
          payment_method: selectedPaymentMethod,
          total_price: total,
          status: isOnlinePayment ? 'pending_payment' : 'confirmed',
        })
        .select('id')
        .single();

      if (bookingError) throw bookingError;

      // Save booking items and decrement spots
      for (const { part, course } of sels) {
        await supabase.from('booking_items').insert({
          booking_id: booking.id,
          course_date_id: course.id,
        });
        await supabase.rpc('decrement_spots', { course_id: course.id });
      }

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'booking-confirmation',
            recipientEmail: studentData.email,
            idempotencyKey: `booking-confirm-${booking.id}`,
            templateData: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              address: studentData.address,
              birthDate: studentData.birthDate,
              faNumber: studentData.faNumber,
              phone: studentData.phone,
              email: studentData.email,
              courses: sels.map(({ part, course }) => ({
                part,
                date: course.date,
                time: course.time,
                location: course.location,
                price: course.price,
              })),
              totalPrice: total.toFixed(2),
              paymentMethod: selectedPaymentMethod,
              bookingId: booking.id,
              bookingDate: new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }),
            },
          },
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
      }

      // If online payment, redirect to Stripe
      if (isOnlinePayment) {
        const { data, error: fnError } = await supabase.functions.invoke('create-course-payment', {
          body: {
            bookingId: booking.id,
            email: studentData.email,
            customerName: `${studentData.firstName} ${studentData.lastName}`,
            courses: sels.map(({ part, course }) => ({
              part,
              date: course.date,
              time: course.time,
              price: course.price,
            })),
            totalPrice: total,
          },
        });

        if (fnError || !data?.url) {
          throw new Error('Zahlung konnte nicht initialisiert werden');
        }

        setBookingStep(0);
        addMsg({
          role: "bot",
          content: `💳 **Weiterleitung zur Zahlung...**\n\nDu wirst jetzt zur sicheren Zahlungsseite weitergeleitet.`,
        });

        window.open(data.url, '_blank');
        return;
      }

      setBookingStep(0);
      addMsg({
        role: "bot",
        content: `🎉 **Buchung erfolgreich bestätigt!**\n\n👤 ${studentData.firstName} ${studentData.lastName}\n📧 Eine Bestätigung wird an **${studentData.email}** gesendet.\n\n💰 Gesamtbetrag: **CHF ${total.toFixed(2)}**\n\nVielen Dank und bis bald auf dem Motorrad! 🏍️`,
        buttons: [
          { label: "Neue Buchung", icon: <Calendar className="w-3.5 h-3.5" />, action: "start_booking" },
          { label: "Zurück zum Menü", icon: <ChevronRight className="w-3.5 h-3.5" />, action: "main_menu" },
        ],
      });
      toast.success("Buchung bestätigt!", {
        description: `${sels.length} Kursteile für CHF ${total.toFixed(2)} – Bestätigung an ${studentData.email}`,
      });
    } catch (err) {
      console.error('Booking error:', err);
      toast.error("Buchung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Fahrstunden booking flow ──
  const startFahrstunde = async () => {
    setFsStep(1);
    setBookingStep(0);
    setFsCategory(null);
    setFsService(null);
    setFsPackage(null);
    setFsInstructor(null);
    setStudentData(null);
    // Pre-load services and packages from DB
    const [services, packages] = await Promise.all([loadServices(), loadPackages()]);
    setDbServices(services);
    setDbPackages(packages);
    addMsg({ role: "user", content: "Fahrstunde buchen" });
    addMsg({
      role: "bot",
      content: `**Schritt 1/5** – 🚗 **Fahrstunde buchen**\n\nWähle deine Kategorie:`,
      categorySelector: true,
    });
  };

  const selectFsCategory = (cat: "auto" | "motorrad") => {
    setFsCategory(cat);
    setFsStep(2);
    addMsg({ role: "user", content: cat === "auto" ? "Fahrstunden Auto" : "Fahrstunden Motorrad" });
    setTimeout(() => {
      addMsg({
        role: "bot",
        content: `**Schritt 2/5** – ⏱️ **Lektion wählen**\n\nWähle deine gewünschte Lektionsdauer:`,
        serviceSelector: true,
      });
    }, 400);
  };

  const selectFsService = async (service: FahrstundenService) => {
    setFsService(service);
    addMsg({ role: "user", content: `${service.name} – CHF ${service.price.toFixed(2)}` });

    const pkgs = dbPackages.filter((p) => p.serviceId === service.id);
    if (pkgs.length > 0) {
      setFsStep(3);
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: `**Schritt 3/5** – 🎁 **Paket wählen (optional)**\n\nMit einem Paket sparst du! Oder wähle eine Einzellektion:`,
          packageSelector: { packages: pkgs, service },
        });
      }, 400);
    } else {
      // No packages (e.g. Motorrad) → skip to instructor
      setFsStep(4);
      setFsPackage(null);
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: `**Schritt 3/4** – 👤 **Fahrlehrer wählen (optional)**\n\nWähle deinen bevorzugten Fahrlehrer oder lass dich zuteilen:`,
          instructorSelector: true,
        });
      }, 400);
    }
  };

  const selectFsPackage = (pkg: FahrstundenPackage | null) => {
    setFsPackage(pkg);
    setFsStep(4);
    addMsg({ role: "user", content: pkg ? `${pkg.name} – CHF ${pkg.totalPrice.toFixed(2)}` : "Einzellektion" });
    setTimeout(() => {
      addMsg({
        role: "bot",
        content: `**Schritt 4/5** – 👤 **Fahrlehrer wählen (optional)**\n\nWähle deinen bevorzugten Fahrlehrer oder lass dich zuteilen:`,
        instructorSelector: true,
      });
    }, 400);
  };

  const selectFsInstructor = (inst: Instructor | null) => {
    setFsInstructor(inst);
    setFsStep(5);
    addMsg({ role: "user", content: inst ? inst.name : "Keine Präferenz" });
    setTimeout(() => {
      addMsg({
        role: "bot",
        content: `✅ Auswahl getroffen!\n\n**Schritt 5/5** – 📝 Bitte fülle deine persönlichen Daten aus:`,
        studentForm: true,
      });
    }, 400);
  };

  const handleFsConfirm = async () => {
    if (!studentData || !fsService || isSubmitting) return;
    setIsSubmitting(true);
    const price = fsPackage ? fsPackage.totalPrice : fsService.price;

    try {
      const isOnlinePayment = selectedPaymentMethod === "Kreditkarte / Debitkarte";

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_type: 'fahrstunde',
          first_name: studentData.firstName,
          last_name: studentData.lastName,
          address: studentData.address,
          birth_date: studentData.birthDate,
          fa_number: studentData.faNumber,
          email: studentData.email,
          phone: studentData.phone,
          payment_method: selectedPaymentMethod,
          total_price: price,
          status: isOnlinePayment ? 'pending_payment' : 'confirmed',
        })
        .select('id')
        .single();

      if (bookingError) throw bookingError;

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'fahrstunden-confirmation',
            recipientEmail: studentData.email,
            idempotencyKey: `fahrstunden-confirm-${booking.id}`,
            templateData: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              address: studentData.address,
              birthDate: studentData.birthDate,
              faNumber: studentData.faNumber,
              phone: studentData.phone,
              email: studentData.email,
              category: fsService.category,
              serviceName: fsService.name,
              packageName: fsPackage?.name,
              duration: fsService.duration,
              totalPrice: price.toFixed(2),
              paymentMethod: selectedPaymentMethod,
              bookingId: booking.id,
              bookingDate: new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }),
            },
          },
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
      }

      // If online payment, redirect to Stripe
      if (isOnlinePayment) {
        const { data, error: fnError } = await supabase.functions.invoke('create-course-payment', {
          body: {
            bookingId: booking.id,
            email: studentData.email,
            customerName: `${studentData.firstName} ${studentData.lastName}`,
            courses: [{
              part: 0,
              date: fsService.name,
              time: fsService.duration,
              price,
            }],
            totalPrice: price,
          },
        });

        if (fnError || !data?.url) {
          throw new Error('Zahlung konnte nicht initialisiert werden');
        }

        setFsStep(0);
        addMsg({
          role: "bot",
          content: `💳 **Weiterleitung zur Zahlung...**\n\nDu wirst jetzt zur sicheren Zahlungsseite weitergeleitet.`,
        });

        window.open(data.url, '_blank');
        return;
      }

      setFsStep(0);
      addMsg({
        role: "bot",
        content: `🎉 **Buchung erfolgreich bestätigt!**\n\n👤 ${studentData.firstName} ${studentData.lastName}\n📧 Eine Bestätigung wird an **${studentData.email}** gesendet.\n\n🚗 ${fsService.name}${fsPackage ? ` (${fsPackage.name})` : ""}\n💰 Betrag: **CHF ${price.toFixed(2)}**\n\nVielen Dank! Wir melden uns für die Terminbestätigung. 🙌`,
        buttons: [
          { label: "Neue Buchung", icon: <Calendar className="w-3.5 h-3.5" />, action: "start_fahrstunde" },
          { label: "Zurück zum Menü", icon: <ChevronRight className="w-3.5 h-3.5" />, action: "main_menu" },
        ],
      });
      toast.success("Fahrstunde gebucht!", {
        description: `${fsService.name} für CHF ${price.toFixed(2)} – Bestätigung an ${studentData.email}`,
      });
    } catch (err) {
      console.error('Booking error:', err);
      toast.error("Buchung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Generic actions ──
  const handleAction = (action: string) => {
    if (action === "start_booking") {
      startBooking();
    } else if (action === "start_fahrstunde") {
      startFahrstunde();
    } else if (action === "show_courses") {
      addMsg({ role: "user", content: "Kurse anzeigen" });
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: "Was möchtest du buchen?",
          buttons: [
            { label: "Grundkurs (Teil 1–3)", icon: <Bike className="w-3.5 h-3.5" />, action: "start_booking" },
            { label: "Fahrstunde", icon: <Car className="w-3.5 h-3.5" />, action: "start_fahrstunde" },
          ],
        });
      }, 400);
    } else if (action === "show_faq") {
      addMsg({ role: "user", content: "FAQ anzeigen" });
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: "Hier sind die häufigsten Fragen. Wähle eine aus:",
          buttons: faqData.map((f, i) => ({ label: f.question, action: `faq_${i}` })),
        });
      }, 400);
    } else if (action.startsWith("faq_")) {
      const faq = faqData[parseInt(action.split("_")[1])];
      if (!faq) return;
      addMsg({ role: "user", content: faq.question });
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: faq.answer,
          buttons: [
            { label: "Weitere Fragen", icon: <HelpCircle className="w-3.5 h-3.5" />, action: "show_faq" },
            { label: "Kurs buchen", icon: <Calendar className="w-3.5 h-3.5" />, action: "start_booking" },
          ],
        });
      }, 400);
    } else if (action === "contact") {
      addMsg({ role: "user", content: "Kontakt" });
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: "📞 Du erreichst uns unter:\n\n**Drive me Fahrschule**\n📍 Wettingen\n✉️ info@drive-me.ch\n📞 +41 78 974 44 74\n\nWir freuen uns auf deine Nachricht!",
          buttons: [{ label: "Zurück zum Menü", icon: <ChevronRight className="w-3.5 h-3.5" />, action: "main_menu" }],
        });
      }, 400);
    } else if (action === "main_menu") {
      setTimeout(() => {
        addMsg({ role: "bot", content: "Was möchtest du als nächstes tun?", buttons: mainMenu });
      }, 300);
    }
  };

  // ── Text input ──
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMsg({ role: "user", content: text });
    const lower = text.toLowerCase();
    setTimeout(() => {
      if (lower.includes("fahrstunde") || lower.includes("fahrlektion") || lower.includes("lektion")) {
        startFahrstunde();
        setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("grundkurs") || lower.includes("kurs") || lower.includes("buchen") || lower.includes("termin")) {
        startBooking();
        setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("faq") || lower.includes("frage") || lower.includes("hilfe")) {
        handleAction("show_faq");
        setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("kontakt") || lower.includes("telefon") || lower.includes("email")) {
        handleAction("contact");
        setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("preis") || lower.includes("kosten") || lower.includes("chf")) {
        addMsg({
          role: "bot",
          content: faqData[1].answer,
          buttons: [
            { label: "Grundkurs buchen", icon: <Bike className="w-3.5 h-3.5" />, action: "start_booking" },
            { label: "Fahrstunde buchen", icon: <Car className="w-3.5 h-3.5" />, action: "start_fahrstunde" },
          ],
        });
      } else {
        addMsg({
          role: "bot",
          content: "Entschuldigung, das habe ich nicht ganz verstanden. Kann ich dir mit einem dieser Themen helfen?",
          buttons: mainMenu,
        });
      }
    }, 500);
  };

  const activeStep = bookingStep > 0 ? bookingStep : (fsStep > 0 ? fsStep : 0);
  const isBookingActive = bookingStep > 0 || fsStep > 0;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center"
          >
            <Bike className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 z-50 w-[390px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-2rem)] rounded-2xl bg-card shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm font-[Outfit]">Drive me Fahrschule</h3>
                  <p className="text-xs opacity-80">Grundkurse & Fahrstunden</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-primary-foreground/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar during booking */}
            {isBookingActive && activeStep <= 7 && (
              <div className="px-4 py-2 bg-muted/50 border-b border-border shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-muted-foreground">Buchungsfortschritt</span>
                  <span className="text-[10px] font-bold text-primary">
                    {Math.min(activeStep, 5)}/5
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        s <= Math.min(activeStep, 5) ? "bg-primary" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {bookingStep > 0
                    ? ["Teil 1", "Teil 2", "Teil 3", "Daten", "Zahlung"].map((label, i) => (
                        <span key={i} className={`text-[8px] ${i + 1 <= bookingStep ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                      ))
                    : ["Kategorie", "Lektion", "Paket", "Daten", "Zahlung"].map((label, i) => (
                        <span key={i} className={`text-[8px] ${i + 1 <= fsStep ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                      ))
                  }
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
              <div className="space-y-4 pb-2">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[90%] space-y-2">
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          }`}
                        >
                          <MessageContent content={msg.content} />
                        </div>

                        {/* Course date cards */}
                        {msg.courseCards && (
                          <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-1">
                            {msg.courseCards.courses.map((course) => (
                              <CourseCard
                                key={course.id}
                                course={course}
                                onSelect={() => selectCourse(msg.courseCards!.partNum, course)}
                              />
                            ))}
                          </div>
                        )}

                        {/* Category selector (Fahrstunden) */}
                        {msg.categorySelector && (
                          <CategorySelector onSelect={selectFsCategory} />
                        )}

                        {/* Service selector (Fahrstunden) */}
                        {msg.serviceSelector && fsCategory && (
                          <ServiceSelector category={fsCategory} onSelect={selectFsService} services={dbServices} />
                        )}

                        {/* Package selector (Fahrstunden) */}
                        {msg.packageSelector && (
                          <PackageSelector
                            packages={msg.packageSelector.packages}
                            service={msg.packageSelector.service}
                            onSelect={selectFsPackage}
                          />
                        )}

                        {/* Instructor selector */}
                        {msg.instructorSelector && (
                          <InstructorSelector onSelect={selectFsInstructor} />
                        )}

                        {/* Student form */}
                        {msg.studentForm && (
                          <StudentForm onSubmit={handleStudentSubmit} />
                        )}

                        {/* Payment step */}
                        {msg.paymentStep && (
                          <PaymentSelector onSelect={handlePaymentSelect} />
                        )}

                        {/* Grundkurs confirmation */}
                        {msg.confirmationSummary && (
                          <ConfirmationCard
                            summary={msg.confirmationSummary}
                            onConfirm={handleFinalConfirm}
                          />
                        )}

                        {/* Fahrstunden confirmation */}
                        {msg.fahrstundenConfirmation && (
                          <FahrstundenConfirmationCard
                            summary={msg.fahrstundenConfirmation}
                            onConfirm={handleFsConfirm}
                          />
                        )}

                        {/* Quick buttons */}
                        {msg.buttons && (
                          <div className="flex flex-wrap gap-1.5">
                            {msg.buttons.map((btn, i) => (
                              <button
                                key={i}
                                onClick={() => handleAction(btn.action)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                              >
                                {btn.icon}
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border bg-card shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Schreib eine Nachricht..."
                  className="flex-1 rounded-full bg-muted border-0 text-sm h-10"
                />
                <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Sub-Components ──────────────────────────────────────────

function CategorySelector({ onSelect }: { onSelect: (cat: "auto" | "motorrad") => void }) {
  const [selected, setSelected] = useState(false);

  if (selected) {
    return (
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
        <p className="text-xs font-medium text-accent flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Kategorie gewählt</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-2">
      {[
        { cat: "auto" as const, icon: <Car className="w-6 h-6" />, label: "Auto", desc: "Fahrstunden Auto" },
        { cat: "motorrad" as const, icon: <Bike className="w-6 h-6" />, label: "Motorrad", desc: "Fahrstunden Motorrad" },
      ].map((item) => (
        <button
          key={item.cat}
          onClick={() => { setSelected(true); onSelect(item.cat); }}
          className="flex flex-col items-center gap-2 p-4 bg-card border-2 border-border rounded-xl hover:border-primary/40 transition-colors"
        >
          <div className="text-primary">{item.icon}</div>
          <span className="text-xs font-semibold text-foreground">{item.label}</span>
          <span className="text-[10px] text-muted-foreground">{item.desc}</span>
        </button>
      ))}
    </motion.div>
  );
}

function ServiceSelector({ category, onSelect, services }: { category: "auto" | "motorrad"; onSelect: (s: FahrstundenService) => void; services: FahrstundenService[] }) {
  const [selected, setSelected] = useState(false);
  const filtered = services.filter((s) => s.category === category);

  if (selected) {
    return (
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
        <p className="text-xs font-medium text-accent flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Lektion gewählt</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      {filtered.map((service) => (
        <button
          key={service.id}
          onClick={() => { setSelected(true); onSelect(service); }}
          className="w-full text-left bg-card border border-border rounded-xl p-3 hover:border-primary/40 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">{service.name}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration}</p>
            </div>
            <p className="font-bold text-sm text-primary">CHF {service.price.toFixed(2)}</p>
          </div>
        </button>
      ))}
    </motion.div>
  );
}

function PackageSelector({ packages, service, onSelect }: { packages: FahrstundenPackage[]; service: FahrstundenService; onSelect: (pkg: FahrstundenPackage | null) => void }) {
  const [selected, setSelected] = useState(false);

  if (selected) {
    return (
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
        <p className="text-xs font-medium text-accent flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Auswahl getroffen</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      {packages.map((pkg) => (
        <button
          key={pkg.id}
          onClick={() => { setSelected(true); onSelect(pkg); }}
          className="w-full text-left bg-card border-2 border-primary/20 rounded-xl p-3 hover:border-primary/50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Gift className="w-3 h-3 text-primary" />
                <p className="text-xs font-bold text-foreground">{pkg.name}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{service.name} × {pkg.lessons}</p>
            </div>
            <div className="text-right">
              <span className="inline-block text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full mb-0.5">Spare {pkg.discount}</span>
              <p className="font-bold text-sm text-primary">CHF {pkg.totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </button>
      ))}

      <div className="relative flex items-center gap-2 py-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-muted-foreground">Oder</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button
        onClick={() => { setSelected(true); onSelect(null); }}
        className="w-full text-left bg-card border border-border rounded-xl p-3 hover:border-primary/40 transition-colors"
      >
        <div className="flex justify-between items-center">
          <p className="text-xs font-medium text-foreground">Einzellektion ohne Paket</p>
          <p className="font-bold text-sm text-primary">CHF {service.price.toFixed(2)}</p>
        </div>
      </button>
    </motion.div>
  );
}

function InstructorSelector({ onSelect }: { onSelect: (inst: Instructor | null) => void }) {
  const [selected, setSelected] = useState(false);

  if (selected) {
    return (
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
        <p className="text-xs font-medium text-accent flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Fahrlehrer gewählt</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      {instructors.map((inst) => (
        <button
          key={inst.id}
          onClick={() => { setSelected(true); onSelect(inst); }}
          className="w-full text-left bg-card border border-border rounded-xl p-3 hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{inst.initials}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground">{inst.name}</p>
              {inst.popular && <span className="text-[10px] text-primary font-medium">⭐ Beliebt</span>}
            </div>
          </div>
        </button>
      ))}
      <button
        onClick={() => { setSelected(true); onSelect(null); }}
        className="w-full text-left bg-card border border-border rounded-xl p-3 hover:border-primary/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xs font-medium text-foreground">Keine Präferenz</p>
        </div>
      </button>
    </motion.div>
  );
}

function CourseCard({ course, onSelect }: { course: CourseDate; onSelect: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="w-full text-left bg-card border border-border rounded-xl p-3 hover:border-primary/40 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{course.day}</p>
          <p className="font-bold text-sm text-foreground">{course.date}</p>
          <p className="text-xs text-muted-foreground">🕐 {course.time}</p>
          <p className="text-xs text-muted-foreground">📍 {course.location}</p>
          {course.instructor && <p className="text-xs text-muted-foreground">👤 {course.instructor}</p>}
        </div>
        <div className="text-right space-y-1">
          <p className="font-bold text-sm text-primary">CHF {course.price.toFixed(2)}</p>
          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
            course.spotsAvailable <= 2 ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"
          }`}>
            {course.spotsAvailable} Plätze
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function StudentForm({ onSubmit }: { onSubmit: (data: StudentFormData) => void }) {
  const [data, setData] = useState<StudentFormData>({
    firstName: "", lastName: "", address: "", birthDate: "", faNumber: "", email: "", phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof StudentFormData, val: string) =>
    setData((d) => ({ ...d, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.firstName.trim()) e.firstName = "Pflichtfeld";
    if (!data.lastName.trim()) e.lastName = "Pflichtfeld";
    if (!data.address.trim()) e.address = "Pflichtfeld";
    if (!data.birthDate) e.birthDate = "Pflichtfeld";
    if (!data.faNumber.trim()) e.faNumber = "Pflichtfeld";
    if (!data.email.trim()) e.email = "Pflichtfeld";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) e.email = "Ungültige E-Mail";
    if (!data.phone.trim()) e.phone = "Pflichtfeld";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitted || !validate()) return;
    setSubmitted(true);
    onSubmit({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      address: data.address.trim(),
      birthDate: data.birthDate,
      faNumber: data.faNumber.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
    });
  };

  if (submitted) {
    return (
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
        <p className="text-xs font-medium text-accent flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Daten übermittelt</p>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-4 space-y-2.5"
    >
      <div className="flex items-center gap-2 mb-1">
        <User className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold text-foreground">Persönliche Daten</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FormField label="Vorname *" error={errors.firstName}>
          <Input value={data.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Max" className="h-8 text-xs" maxLength={50} />
        </FormField>
        <FormField label="Nachname *" error={errors.lastName}>
          <Input value={data.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Muster" className="h-8 text-xs" maxLength={50} />
        </FormField>
      </div>

      <FormField label="Adresse *" error={errors.address} icon={<MapPin className="w-3 h-3" />}>
        <Input value={data.address} onChange={(e) => set("address", e.target.value)} placeholder="Musterstrasse 1, 5430 Wettingen" className="h-8 text-xs" maxLength={150} />
      </FormField>

      <FormField label="Geburtsdatum *" error={errors.birthDate}>
        <Input type="date" value={data.birthDate} onChange={(e) => set("birthDate", e.target.value)} className="h-8 text-xs" />
      </FormField>

      <FormField label="FA-Nummer (Lernfahrausweis) *" error={errors.faNumber} icon={<Hash className="w-3 h-3" />}>
        <Input value={data.faNumber} onChange={(e) => set("faNumber", e.target.value)} placeholder="z.B. CH-1234567890" className="h-8 text-xs" maxLength={30} />
      </FormField>

      <FormField label="E-Mail-Adresse *" error={errors.email} icon={<Mail className="w-3 h-3" />}>
        <Input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="max@beispiel.ch" className="h-8 text-xs" maxLength={100} />
      </FormField>

      <FormField label="Telefon (für Rückfragen) *" error={errors.phone} icon={<Phone className="w-3 h-3" />}>
        <Input type="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+41 79 123 45 67" className="h-8 text-xs" maxLength={20} />
      </FormField>

      <Button type="submit" size="sm" className="w-full h-9 text-xs gap-1.5 rounded-lg mt-1">
        <ChevronRight className="w-3 h-3" />
        Weiter zur Bezahlmethode
      </Button>
    </motion.form>
  );
}

function FormField({ label, error, icon, children }: { label: string; error?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
        {icon} {label}
      </Label>
      {children}
      {error && <p className="text-[10px] text-destructive mt-0.5">{error}</p>}
    </div>
  );
}

function PaymentSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
        <p className="text-xs font-medium text-accent flex items-center justify-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Bezahlmethode gewählt</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold text-foreground">Bezahlmethode</p>
      </div>
      {PAYMENT_METHODS.map((method) => (
        <button
          key={method.id}
          onClick={() => setSelected(method.id)}
          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
            selected === method.id
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/30"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selected === method.id ? "border-primary" : "border-muted-foreground/40"
            }`}>
              {selected === method.id && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <span className="text-xs font-medium text-foreground">{method.label}</span>
          </div>
          {selected === method.id && (
            <p className="text-[10px] text-muted-foreground mt-1.5 ml-6">{method.desc}</p>
          )}
        </button>
      ))}
      <Button
        size="sm"
        disabled={!selected}
        onClick={() => { setConfirmed(true); onSelect(selected!); }}
        className="w-full h-9 text-xs gap-1.5 rounded-lg mt-1"
      >
        <ChevronRight className="w-3 h-3" />
        Weiter zur Bestätigung
      </Button>
    </motion.div>
  );
}

function ConfirmationCard({ summary, onConfirm }: { summary: BookingSummary; onConfirm: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const total = summary.selections.reduce((s, { course }) => s + course.price, 0);

  if (confirmed) {
    return (
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
        <p className="text-xs font-medium text-accent flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Buchung bestätigt</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-foreground flex items-center gap-2">
        <Check className="w-4 h-4 text-primary" /> Buchungsübersicht
      </p>
      <div className="space-y-2">
        {summary.selections.map(({ part, course }) => (
          <div key={part} className="bg-muted/50 rounded-lg p-2.5">
            <p className="text-[10px] font-bold text-primary uppercase">MGK Teil {part}</p>
            <p className="text-xs font-medium text-foreground">{course.date} – {course.time}</p>
            <p className="text-[10px] text-muted-foreground">📍 {course.location} · CHF {course.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="bg-muted/50 rounded-lg p-2.5 space-y-0.5">
        <p className="text-[10px] font-bold text-foreground uppercase">Schülerdaten</p>
        <p className="text-xs text-foreground">{summary.student.firstName} {summary.student.lastName}</p>
        <p className="text-[10px] text-muted-foreground">{summary.student.address}</p>
        <p className="text-[10px] text-muted-foreground">📧 {summary.student.email} · 📞 {summary.student.phone}</p>
        <p className="text-[10px] text-muted-foreground">🪪 {summary.student.faNumber}</p>
      </div>
      <div className="flex justify-between items-center pt-1 border-t border-border">
        <div>
          <p className="text-[10px] text-muted-foreground">Bezahlung</p>
          <p className="text-xs font-medium text-foreground">{summary.paymentMethod}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">Gesamt</p>
          <p className="text-base font-bold text-primary">CHF {total.toFixed(2)}</p>
        </div>
      </div>
      <Button
        size="sm"
        onClick={() => { setConfirmed(true); onConfirm(); }}
        className="w-full h-9 text-xs gap-1.5 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        <Check className="w-3.5 h-3.5" />
        Gebührenpflichtig bestätigen
      </Button>
      <p className="text-[9px] text-muted-foreground text-center">
        Mit der Bestätigung akzeptierst du unsere AGB und Datenschutzrichtlinien.
      </p>
    </motion.div>
  );
}

function FahrstundenConfirmationCard({ summary, onConfirm }: { summary: FahrstundenSummary; onConfirm: () => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const price = summary.selectedPackage ? summary.selectedPackage.totalPrice : summary.service.price;

  if (confirmed) {
    return (
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
        <p className="text-xs font-medium text-accent flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Buchung bestätigt</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-foreground flex items-center gap-2">
        <Check className="w-4 h-4 text-primary" /> Buchungsübersicht – Fahrstunde
      </p>

      <div className="bg-muted/50 rounded-lg p-2.5 space-y-0.5">
        <p className="text-[10px] font-bold text-primary uppercase">Fahrstunde</p>
        <p className="text-xs font-medium text-foreground">{summary.service.name}</p>
        {summary.selectedPackage && (
          <p className="text-[10px] text-muted-foreground">📦 {summary.selectedPackage.name}</p>
        )}
        {summary.instructor && (
          <p className="text-[10px] text-muted-foreground">👤 Fahrlehrer: {summary.instructor.name}</p>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-2.5 space-y-0.5">
        <p className="text-[10px] font-bold text-foreground uppercase">Schülerdaten</p>
        <p className="text-xs text-foreground">{summary.student.firstName} {summary.student.lastName}</p>
        <p className="text-[10px] text-muted-foreground">{summary.student.address}</p>
        <p className="text-[10px] text-muted-foreground">📧 {summary.student.email} · 📞 {summary.student.phone}</p>
        <p className="text-[10px] text-muted-foreground">🪪 {summary.student.faNumber}</p>
      </div>

      <div className="flex justify-between items-center pt-1 border-t border-border">
        <div>
          <p className="text-[10px] text-muted-foreground">Bezahlung</p>
          <p className="text-xs font-medium text-foreground">{summary.paymentMethod}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">Gesamt</p>
          <p className="text-base font-bold text-primary">CHF {price.toFixed(2)}</p>
        </div>
      </div>

      <Button
        size="sm"
        onClick={() => { setConfirmed(true); onConfirm(); }}
        className="w-full h-9 text-xs gap-1.5 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        <Check className="w-3.5 h-3.5" />
        Gebührenpflichtig bestätigen
      </Button>
      <p className="text-[9px] text-muted-foreground text-center">
        Mit der Bestätigung akzeptierst du unsere AGB und Datenschutzrichtlinien.
      </p>
    </motion.div>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part.split("\n").map((line, j, arr) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ));
      })}
    </>
  );
}
