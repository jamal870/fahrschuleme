import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bike, Calendar, HelpCircle, ChevronRight, MessageCircle, User, Mail, Hash, Phone, MapPin, CreditCard, Check, Car, Clock, Gift, Users, Loader2, DollarSign, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { faqData } from "@/data/courses";
import type { CourseDate, FahrstundenService, FahrstundenPackage, Instructor } from "@/data/courses";
import { tenantConfig } from "@/config/tenant";
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
  contactForm?: "callback" | "quote";
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

type ConfirmationResult = "confirmed" | "payment_started" | "failed";

const PAYMENT_METHODS = tenantConfig.booking.paymentMethods;

const mainMenu: QuickButton[] = [
  { label: "🏍️ Grundkurs buchen", action: "start_booking" },
  { label: "📅 Fahrstunden buchen", action: "start_fahrstunde" },
  { label: "ℹ️ Kategorien (A1/A2/A)", action: "show_categories" },
  { label: "💰 Preise & Kosten", action: "show_prices" },
  { label: "📞 Kontakt / Rückruf", action: "contact" },
  { label: "❓ FAQ", action: "show_faq" },
];

// ─── Main Component ──────────────────────────────────────────

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);
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

  // Auto-open after 8 seconds
  useEffect(() => {
    if (autoOpened) return;
    const timer = setTimeout(() => {
      if (!open) {
        setOpen(true);
        setAutoOpened(true);
      }
    }, tenantConfig.chatbot.autoOpenDelayMs);
    return () => clearTimeout(timer);
  }, [open, autoOpened]);

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
      id: d.id, day: d.day, date: d.date, time: d.time, location: d.location,
      instructor: d.instructor || undefined, price: Number(d.price), spotsAvailable: d.spots_available,
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
        content: tenantConfig.chatbot.welcomeMessage,
        buttons: mainMenu,
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
    addMsg({
      role: "bot",
      content: tenantConfig.chatbot.grundkursIntro,
      buttons: [
        { label: "A1 – 125cc", action: "cat_a1" },
        { label: "A2 – 35kW", action: "cat_a2" },
        { label: "A – Unbegrenzt", action: "cat_a" },
      ],
    });
  };

  const handleCategorySelect = async (cat: string) => {
    addMsg({ role: "user", content: cat });
    addMsg({
      role: "bot",
      content: `Perfekt! Möchtest du direkt einen Termin buchen oder erst mehr Infos zu **${cat}**?`,
      buttons: [
        { label: "Termin buchen", action: "book_course_dates" },
        { label: "Mehr Infos", action: `info_${cat.toLowerCase().replace(/[^a-z0-9]/g, '')}` },
      ],
    });
  };

  const showCourseStep = async (partNum: number) => {
    const courses = await loadCourseDates(partNum);
    setDbCourses(prev => ({ ...prev, [partNum]: courses }));
    addMsg({
      role: "bot",
      content: `**Schritt ${partNum}/5** – 🏍️ **MGK Teil ${partNum} – Datum wählen**\n\nWähle deinen Wunschtermin:`,
      courseCards: { courses, partNum },
    });
  };

  const selectCourse = async (partNum: number, course: CourseDate) => {
    setSelections((prev) => ({ ...prev, [partNum]: course }));
    addMsg({ role: "user", content: `${course.day}, ${course.date} – ${course.time}` });

    const nextPart = partNum + 1;
    if (nextPart <= 3) {
      setBookingStep(nextPart);
      await showCourseStep(nextPart);
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
          confirmationSummary: { selections: sels, student: studentData, paymentMethod: method.label },
        });
      }, 400);
    } else if (fsStep > 0) {
      setFsStep(7);
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: `Bitte überprüfe deine Buchung:`,
          fahrstundenConfirmation: {
            service: fsService!, selectedPackage: fsPackage || undefined,
            instructor: fsInstructor || undefined, student: studentData, paymentMethod: method.label,
          },
        });
      }, 400);
    }
  };

  const handleFinalConfirm = async (): Promise<ConfirmationResult> => {
    if (!studentData || isSubmitting) return "failed";
    setIsSubmitting(true);
    const sels = Object.entries(selections).map(([p, c]) => ({ part: parseInt(p), course: c }));
    const total = sels.reduce((s, { course }) => s + course.price, 0);
    const isOnlinePayment = selectedPaymentMethod === "Online bezahlen (Stripe/Twint)";
    const checkoutWindow = isOnlinePayment ? window.open("", "_blank") : null;

    if (isOnlinePayment && !checkoutWindow) {
      toast.error("Popup blockiert – bitte Popups erlauben und erneut versuchen.");
      setIsSubmitting(false);
      return "failed";
    }

    try {
      const { data: bookingResult, error: bookingError } = await supabase.functions.invoke('create-booking', {
        body: {
          bookingType: 'grundkurs',
          firstName: studentData.firstName, lastName: studentData.lastName,
          email: studentData.email, phone: studentData.phone,
          address: studentData.address, faNumber: studentData.faNumber,
          birthDate: studentData.birthDate,
          paymentMethod: selectedPaymentMethod,
          totalPrice: total, status: isOnlinePayment ? 'pending_payment' : 'confirmed',
          courseDateIds: sels.map(({ course }) => course.id),
        },
      });

      if (bookingError || !bookingResult?.bookingId) throw new Error(bookingError?.message || bookingResult?.error || "Buchung fehlgeschlagen");
      const booking = { id: bookingResult.bookingId };

      const sendConfirmationEmail = async () => {
        try {
          await supabase.functions.invoke('send-transactional-email', {
            body: {
              templateName: 'booking-confirmation', recipientEmail: studentData.email,
              idempotencyKey: `booking-confirm-${booking.id}`,
              templateData: {
                firstName: studentData.firstName, lastName: studentData.lastName,
                address: studentData.address, birthDate: studentData.birthDate,
                faNumber: studentData.faNumber, phone: studentData.phone, email: studentData.email,
                courses: sels.map(({ part, course }) => ({ part, date: course.date, time: course.time, location: course.location, price: course.price })),
                totalPrice: total.toFixed(2), paymentMethod: selectedPaymentMethod,
                bookingId: booking.id, bookingDate: new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }),
              },
            },
          });
        } catch (emailErr) { console.error('Email send error:', emailErr); }
      };

      if (isOnlinePayment) {
        const { data, error: fnError } = await supabase.functions.invoke('create-course-payment', {
          body: {
            bookingId: booking.id,
            email: studentData.email,
            customerName: `${studentData.firstName} ${studentData.lastName}`,
          },
        });

        if (fnError || !data?.url) {
          throw new Error(fnError?.message || 'Zahlung konnte nicht initialisiert werden');
        }

        try {
          checkoutWindow.location.replace(data.url);
        } catch {
          checkoutWindow.location.href = data.url;
        }

        addMsg({
          role: "bot",
          content: `💳 **Zahlung geöffnet** – bitte schliesse die Zahlung im neuen Tab ab.\n\nNach erfolgreicher Zahlung erhältst du die Bestätigung per E-Mail an **${studentData.email}**.`,
          buttons: [
            { label: "Neue Buchung", action: "start_booking" },
            { label: "Zurück zum Menü", action: "main_menu" },
          ],
        });
        toast.success("Zahlungsseite geöffnet – bitte im neuen Tab bezahlen.");
        setBookingStep(0);
        return "payment_started";
      }

      await sendConfirmationEmail();
      setBookingStep(0);
      addMsg({
        role: "bot",
        content: `🎉 **Buchung erfolgreich bestätigt!**\n\n👤 ${studentData.firstName} ${studentData.lastName}\n📧 Bestätigung an **${studentData.email}**\n💰 CHF ${total.toFixed(2)}\n\nVielen Dank und bis bald auf dem Motorrad! 🏍️`,
        buttons: [
          { label: "Neue Buchung", action: "start_booking" },
          { label: "Zurück zum Menü", action: "main_menu" },
        ],
      });
      toast.success("Buchung bestätigt!");
      return "confirmed";
    } catch (err) {
      if (checkoutWindow) {
        try {
          checkoutWindow.close();
        } catch {
          // no-op
        }
      }
      console.error('Booking error:', err);
      toast.error("Buchung fehlgeschlagen. Bitte versuche es erneut.");
      return "failed";
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Fahrstunden booking flow ──
  const startFahrstunde = async () => {
    setFsStep(1); setBookingStep(0); setFsCategory(null); setFsService(null); setFsPackage(null); setFsInstructor(null); setStudentData(null);
    const [services, packages] = await Promise.all([loadServices(), loadPackages()]);
    setDbServices(services); setDbPackages(packages);
    addMsg({ role: "user", content: "Fahrstunden buchen" });
    addMsg({
      role: "bot",
      content: tenantConfig.chatbot.fahrstundenIntro,
      buttons: [
        { label: "Einzelstunde", action: "fs_single" },
        { label: "Paket 5 Stunden", action: "fs_pkg5" },
        { label: "Paket 10 Stunden", action: "fs_pkg10" },
      ],
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
          content: `**Schritt 3/5** – 🎁 **Paket wählen (optional)**\n\nMit einem Paket sparst du!`,
          packageSelector: { packages: pkgs, service },
        });
      }, 400);
    } else {
      setFsStep(4); setFsPackage(null);
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: `**Schritt 3/4** – 👤 **Fahrlehrer wählen (optional)**`,
          instructorSelector: true,
        });
      }, 400);
    }
  };

  const selectFsPackage = (pkg: FahrstundenPackage | null) => {
    setFsPackage(pkg); setFsStep(4);
    addMsg({ role: "user", content: pkg ? `${pkg.name} – CHF ${pkg.totalPrice.toFixed(2)}` : "Einzellektion" });
    setTimeout(() => {
      addMsg({
        role: "bot",
        content: `**Schritt 4/5** – 👤 **Fahrlehrer wählen (optional)**`,
        instructorSelector: true,
      });
    }, 400);
  };

  const selectFsInstructor = (inst: Instructor | null) => {
    setFsInstructor(inst); setFsStep(5);
    addMsg({ role: "user", content: inst ? inst.name : "Keine Präferenz" });
    setTimeout(() => {
      addMsg({
        role: "bot",
        content: `✅ Auswahl getroffen!\n\n**Schritt 5/5** – 📝 Bitte fülle deine persönlichen Daten aus:`,
        studentForm: true,
      });
    }, 400);
  };

  const handleFsConfirm = async (): Promise<ConfirmationResult> => {
    if (!studentData || !fsService || isSubmitting) return "failed";
    setIsSubmitting(true);
    const price = fsPackage ? fsPackage.totalPrice : fsService.price;
    const isOnlinePayment = selectedPaymentMethod === "Online bezahlen (Stripe/Twint)";
    const checkoutWindow = isOnlinePayment ? window.open("", "_blank") : null;

    if (isOnlinePayment && !checkoutWindow) {
      toast.error("Popup blockiert – bitte Popups erlauben und erneut versuchen.");
      setIsSubmitting(false);
      return "failed";
    }

    try {
      const { data: bookingResult, error: bookingError } = await supabase.functions.invoke('create-booking', {
        body: {
          bookingType: 'fahrstunde',
          firstName: studentData.firstName, lastName: studentData.lastName,
          email: studentData.email, phone: studentData.phone,
          address: studentData.address, faNumber: studentData.faNumber,
          birthDate: studentData.birthDate,
          paymentMethod: selectedPaymentMethod,
          totalPrice: price, status: isOnlinePayment ? 'pending_payment' : 'confirmed',
          fahrstundenServiceId: fsService.id,
          fahrstundenPackageId: fsPackage?.id || null,
          instructor: fsInstructor?.name || null,
        },
      });

      if (bookingError || !bookingResult?.bookingId) throw new Error(bookingError?.message || bookingResult?.error || "Buchung fehlgeschlagen");
      const booking = { id: bookingResult.bookingId };

      const sendConfirmationEmail = async () => {
        try {
          await supabase.functions.invoke('send-transactional-email', {
            body: {
              templateName: 'fahrstunden-confirmation', recipientEmail: studentData.email,
              idempotencyKey: `fahrstunden-confirm-${booking.id}`,
              templateData: {
                firstName: studentData.firstName, lastName: studentData.lastName,
                address: studentData.address, birthDate: studentData.birthDate,
                faNumber: studentData.faNumber, phone: studentData.phone, email: studentData.email,
                category: fsService.category, serviceName: fsService.name,
                packageName: fsPackage?.name, duration: fsService.duration,
                totalPrice: price.toFixed(2), paymentMethod: selectedPaymentMethod,
                bookingId: booking.id, bookingDate: new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }),
              },
            },
          });
        } catch (emailErr) { console.error('Email send error:', emailErr); }
      };

      if (isOnlinePayment) {
        const { data, error: fnError } = await supabase.functions.invoke('create-course-payment', {
          body: {
            bookingId: booking.id, email: studentData.email,
            customerName: `${studentData.firstName} ${studentData.lastName}`,
          },
        });
        if (fnError || !data?.url) throw new Error('Zahlung konnte nicht initialisiert werden');
        try {
          checkoutWindow.location.replace(data.url);
        } catch {
          checkoutWindow.location.href = data.url;
        }
        addMsg({ role: "bot", content: `⏳ **Warte auf Zahlung...**\n\nStripe Checkout wurde geöffnet.` });

        const pollPayment = async () => {
          const maxAttempts = 60;
          for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 5000));
            const { data: statusData } = await supabase.rpc('get_booking_status', { booking_uuid: booking.id });
            if (statusData && statusData.length > 0 && statusData[0].status === 'confirmed') {
              setFsStep(0);
              addMsg({
                role: "bot",
                content: `✅ **Zahlung erfolgreich!**\n\n🎉 Buchung bestätigt!\n👤 ${studentData.firstName} ${studentData.lastName}\n📧 Bestätigung an **${studentData.email}**\n🏍️ ${fsService.name}\n💰 CHF ${price.toFixed(2)}`,
                buttons: [{ label: "Zurück zum Menü", action: "main_menu" }],
              });
              toast.success("Zahlung erfolgreich!");
              return;
            }
          }
          addMsg({ role: "bot", content: `⚠️ Zahlung nicht bestätigt. Bitte kontaktiere uns.`, buttons: [{ label: "📞 Kontakt", action: "contact" }] });
        };
        pollPayment();
        return "payment_started";
      }

      await sendConfirmationEmail();
      setFsStep(0);
      addMsg({
        role: "bot",
        content: `🎉 **Buchung bestätigt!**\n\n👤 ${studentData.firstName} ${studentData.lastName}\n📧 Bestätigung an **${studentData.email}**\n🏍️ ${fsService.name}${fsPackage ? ` (${fsPackage.name})` : ""}\n💰 CHF ${price.toFixed(2)}\n\nWir melden uns für die Terminbestätigung!`,
        buttons: [{ label: "Zurück zum Menü", action: "main_menu" }],
      });
      toast.success("Fahrstunde gebucht!");
      return "confirmed";
    } catch (err) {
      if (checkoutWindow) {
        try {
          checkoutWindow.close();
        } catch {
          // no-op
        }
      }
      console.error('Booking error:', err);
      toast.error("Buchung fehlgeschlagen.");
      return "failed";
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Generic actions ──
  const handleAction = (action: string) => {
    if (action === "start_booking") { startBooking(); }
    else if (action === "start_fahrstunde") { startFahrstunde(); }
    else if (action === "book_course_dates") {
      showCourseStep(1);
    }
    else if (action.startsWith("cat_")) {
      const catMap: Record<string, string> = { cat_a1: "A1 – 125cc", cat_a2: "A2 – 35kW", cat_a: "A – Unbegrenzt" };
      handleCategorySelect(catMap[action] || action);
    }
    else if (action.startsWith("info_")) {
      const infos: Record<string, string> = {
        info_a1125cc: "**A1 – 125cc**\n\nAb 16 Jahren · 125cm³ · max. 11 kW · Perfekter Einstieg in die Motorradwelt.\n\nGrundkurs (12h) + Praktische Prüfung erforderlich.",
        info_a235kw: "**A2 – 35kW**\n\nAb 18 Jahren · bis 35 kW · Nächste Stufe nach A1.\n\nGrundkurs (12h) + Praktische Prüfung erforderlich.",
        info_aunbegrenzt: "**A – Unbegrenzt**\n\nAb 20 Jahren (Direktzugang) oder 24 (Stufenzugang) · Unbegrenzte Leistung.\n\nGrundkurs (12h) + Praktische Prüfung erforderlich.",
      };
      addMsg({ role: "user", content: "Mehr Infos" });
      const key = Object.keys(infos).find(k => action.includes(k.replace("info_", "")));
      addMsg({
        role: "bot",
        content: infos[key || "info_a1125cc"] || "Details auf Anfrage.",
        buttons: [
          { label: "Termin buchen", action: "book_course_dates" },
          { label: "Zurück zum Menü", action: "main_menu" },
        ],
      });
    }
    // ── Flow 3: Kategorien ──
    else if (action === "show_categories") {
      addMsg({ role: "user", content: "Kategorien" });
      addMsg({
        role: "bot",
        content: "Welche Kategorie möchtest du kennenlernen?",
        buttons: [
          { label: "AM – Mofa", action: "cat_info_am" },
          { label: "A1 – 125cc", action: "cat_info_a1" },
          { label: "A2 – 35kW", action: "cat_info_a2" },
          { label: "A – Unbegrenzt", action: "cat_info_a" },
        ],
      });
    }
    else if (action.startsWith("cat_info_")) {
      const catInfos: Record<string, { label: string; text: string }> = {
        cat_info_am: { label: "AM – Mofa", text: "Ab 15 Jahren · Mofa & Roller bis 50cm³ · max. 45 km/h" },
        cat_info_a1: { label: "A1 – 125cc", text: "Ab 16 Jahren · 125cm³ · max. 11 kW · Perfekter Einstieg" },
        cat_info_a2: { label: "A2 – 35kW", text: "Ab 18 Jahren · bis 35 kW · Nächste Stufe nach A1" },
        cat_info_a: { label: "A – Unbegrenzt", text: "Ab 20 Jahren (Direktzugang) oder 24 (Stufenzugang) · Unbegrenzte Leistung" },
      };
      const info = catInfos[action];
      if (info) {
        addMsg({ role: "user", content: info.label });
        addMsg({
          role: "bot",
          content: `**${info.label}**\n\n${info.text}`,
          buttons: [
            { label: "Ja, buchen", action: "start_booking" },
            { label: "Andere Kategorie", action: "show_categories" },
            { label: "Zurück zum Start", action: "main_menu" },
          ],
        });
      }
    }
    // ── Flow 4: Preise ──
    else if (action === "show_prices") {
      addMsg({ role: "user", content: "Preise & Kosten" });
      addMsg({
        role: "bot",
        content: "Unsere Preise hängen von Kategorie und Stundenanzahl ab:\n\n🏍️ **Grundkurs Motorrad** – CHF 160.– pro Teil\n📅 **Fahrstunden** – siehe unsere Preisliste oder direkt anfragen",
        buttons: [
          { label: "Ja, Angebot anfragen", action: "request_quote" },
          { label: "Direkt anrufen: 078 974 44 74", action: "call_direct" },
        ],
      });
    }
    else if (action === "request_quote") {
      addMsg({ role: "user", content: "Angebot anfragen" });
      addMsg({
        role: "bot",
        content: "Gerne erstellen wir dir ein persönliches Angebot! Bitte gib deinen Namen und deine Telefonnummer an:",
        contactForm: "quote",
      });
    }
    else if (action === "call_direct") {
      addMsg({ role: "user", content: "Direkt anrufen" });
      addMsg({
        role: "bot",
        content: `📞 Du erreichst uns unter **${tenantConfig.contact.phone}**.\n\nÖffnungszeiten: ${tenantConfig.contact.openingHours}`,
        buttons: [{ label: "Zurück zum Menü", action: "main_menu" }],
      });
    }
    // ── Flow 5: Kontakt / Rückruf ──
    else if (action === "contact") {
      addMsg({ role: "user", content: "Kontakt / Rückruf" });
      addMsg({
        role: "bot",
        content: "Kein Problem! Jamal meldet sich persönlich bei dir.\n\nWie sollen wir dich erreichen?",
        buttons: [
          { label: "Rückruf gewünscht", action: "callback" },
          { label: "WhatsApp", action: "whatsapp" },
          { label: "E-Mail", action: "email_contact" },
        ],
      });
    }
    else if (action === "callback") {
      addMsg({ role: "user", content: "Rückruf gewünscht" });
      addMsg({
        role: "bot",
        content: "Super! Bitte gib deinen Namen und deine Telefonnummer an:",
        contactForm: "callback",
      });
    }
    else if (action === "whatsapp") {
      addMsg({ role: "user", content: "WhatsApp" });
      addMsg({
        role: "bot",
        content: `📱 Schreib uns direkt auf WhatsApp:\n\n👉 [WhatsApp öffnen](${tenantConfig.contact.whatsappUrl})`,
        buttons: [{ label: "Zurück zum Menü", action: "main_menu" }],
      });
    }
    else if (action === "email_contact") {
      addMsg({ role: "user", content: "E-Mail" });
      addMsg({
        role: "bot",
        content: `Schreib uns an **${tenantConfig.contact.email}** – wir antworten innerhalb von 24h.`,
        buttons: [{ label: "Zurück zum Menü", action: "main_menu" }],
      });
    }
    // ── Flow 6: FAQ ──
    else if (action === "show_faq") {
      addMsg({ role: "user", content: "FAQ" });
      addMsg({
        role: "bot",
        content: "Was möchtest du wissen?",
        buttons: [
          { label: "Mindestalter", action: "faq_age" },
          { label: "Dauer Führerschein", action: "faq_duration" },
          { label: "Kosten", action: "faq_costs" },
          { label: "Grundkurs Pflicht?", action: "faq_mandatory" },
          { label: "Intensivkurs?", action: "faq_intensive" },
        ],
      });
    }
    else if (action === "faq_age") {
      addMsg({ role: "user", content: "Mindestalter" });
      addMsg({
        role: "bot",
        content: "**Mindestalter:**\n\nAM ab 15 · A1 ab 16 · A2 ab 18 · A ab 20 Jahren (Direktzugang)",
        buttons: faqFollowUp,
      });
    }
    else if (action === "faq_duration") {
      addMsg({ role: "user", content: "Dauer Führerschein" });
      addMsg({
        role: "bot",
        content: "Mindestens **3 Monate Lernfahrausweis**. Mit Intensivkurs ist die Ausbildung in 6–8 Wochen möglich.",
        buttons: faqFollowUp,
      });
    }
    else if (action === "faq_costs") {
      addMsg({ role: "user", content: "Kosten" });
      addMsg({
        role: "bot",
        content: "Je nach Kategorie und Stundenanzahl. Wir erstellen gerne ein persönliches Angebot.",
        buttons: faqFollowUp,
      });
    }
    else if (action === "faq_mandatory") {
      addMsg({ role: "user", content: "Grundkurs Pflicht?" });
      addMsg({
        role: "bot",
        content: "**Ja** – der Grundkurs (12h in 3 Teilen) ist in der Schweiz gesetzlich vorgeschrieben für alle Motorradkategorien.",
        buttons: faqFollowUp,
      });
    }
    else if (action === "faq_intensive") {
      addMsg({ role: "user", content: "Intensivkurs?" });
      addMsg({
        role: "bot",
        content: "Ja! Bei uns kannst du die Ausbildung in **6–8 Wochen** abschliessen – dann 3 Monate Wartefrist, dann Prüfung.",
        buttons: faqFollowUp,
      });
    }
    else if (action.startsWith("faq_")) {
      const idx = parseInt(action.split("_")[1]);
      const faq = faqData[idx];
      if (faq) {
        addMsg({ role: "user", content: faq.question });
        addMsg({ role: "bot", content: faq.answer, buttons: faqFollowUp });
      }
    }
    // ── Fahrstunden sub-actions ──
    else if (action === "fs_single" || action === "fs_pkg5" || action === "fs_pkg10") {
      addMsg({ role: "user", content: action === "fs_single" ? "Einzelstunde" : action === "fs_pkg5" ? "Paket 5 Stunden" : "Paket 10 Stunden" });
      addMsg({
        role: "bot",
        content: "Für welche Kategorie?",
        categorySelector: true,
      });
    }
    else if (action === "main_menu") {
      setTimeout(() => {
        addMsg({ role: "bot", content: "Was möchtest du als nächstes tun?", buttons: mainMenu });
      }, 300);
    }
    else if (action === "show_courses") {
      addMsg({ role: "user", content: "Kurse anzeigen" });
      addMsg({
        role: "bot",
        content: "Was möchtest du buchen?",
        buttons: [
          { label: "🏍️ Grundkurs (Teil 1–3)", action: "start_booking" },
          { label: "📅 Fahrstunde", action: "start_fahrstunde" },
        ],
      });
    }
  };

  const faqFollowUp: QuickButton[] = [
    { label: "Weitere Frage", action: "show_faq" },
    { label: "Kurs buchen", action: "start_booking" },
    { label: "Zurück zum Start", action: "main_menu" },
  ];

  // ── Text input ──
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMsg({ role: "user", content: text });
    const lower = text.toLowerCase();
    setTimeout(() => {
      if (lower.includes("fahrstunde") || lower.includes("fahrlektion") || lower.includes("lektion")) {
        startFahrstunde(); setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("grundkurs") || lower.includes("kurs") || lower.includes("buchen") || lower.includes("termin")) {
        startBooking(); setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("faq") || lower.includes("frage") || lower.includes("hilfe")) {
        handleAction("show_faq"); setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("kontakt") || lower.includes("telefon") || lower.includes("rückruf")) {
        handleAction("contact"); setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("preis") || lower.includes("kosten") || lower.includes("chf")) {
        handleAction("show_prices"); setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("kategorie") || lower.includes("a1") || lower.includes("a2")) {
        handleAction("show_categories"); setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("email") || lower.includes("mail")) {
        handleAction("email_contact"); setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("whatsapp")) {
        handleAction("whatsapp"); setMessages((prev) => prev.slice(0, -1));
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground shadow-xl font-heading font-bold text-sm uppercase tracking-wide animate-pulse-orange"
            style={{ borderRadius: "3px" }}
          >
            <Bike className="w-5 h-5" />
            Kurs buchen
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
            className="fixed bottom-0 right-0 z-50 w-full h-full bg-card shadow-2xl border border-border flex flex-col overflow-hidden md:bottom-4 md:right-4 md:w-[440px] md:h-[680px] md:max-h-[calc(100vh-2rem)] md:rounded-xl"
            style={{
              // Mobile: full screen
            }}
          >
            {/* Header */}
            <div className="bg-card border-b border-border px-5 py-4 flex items-center justify-between shrink-0" style={{ borderLeft: "4px solid hsl(var(--primary))" }}>
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground flex items-baseline gap-0.5">
                    <span>DRIVE</span>
                    <span className="text-primary" style={{ fontFamily: "'Kaushan Script', cursive", fontSize: "16px", textTransform: "none" }}>me</span>
                    <span className="ml-1">FAHRSCHULE</span>
                  </h3>
                  <p className="text-xs text-muted-foreground font-body">Grundkurse & Fahrstunden</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Progress bar during booking */}
            {isBookingActive && activeStep <= 7 && (
              <div className="px-4 py-2 bg-muted/50 border-b border-border shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-muted-foreground font-body">Buchungsfortschritt</span>
                  <span className="text-[10px] font-bold text-primary font-heading">{Math.min(activeStep, 5)}/5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`h-1.5 flex-1 transition-colors ${s <= Math.min(activeStep, 5) ? "bg-primary" : "bg-border"}`} style={{ borderRadius: "2px" }} />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {bookingStep > 0
                    ? ["Teil 1", "Teil 2", "Teil 3", "Daten", "Zahlung"].map((label, i) => (
                        <span key={i} className={`text-[8px] font-body ${i + 1 <= bookingStep ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</span>
                      ))
                    : ["Kategorie", "Lektion", "Paket", "Daten", "Zahlung"].map((label, i) => (
                        <span key={i} className={`text-[8px] font-body ${i + 1 <= fsStep ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</span>
                      ))
                  }
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 px-5 py-4" ref={scrollRef}>
              <div className="space-y-5 pb-2">
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
                          className={`px-4 py-3 text-[13px] leading-relaxed font-body ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-lg rounded-br-sm"
                              : "bg-card text-foreground rounded-lg rounded-bl-sm shadow-sm border border-border"
                          }`}
                        >
                          <MessageContent content={msg.content} />
                        </div>

                        {msg.courseCards && (
                          selections[msg.courseCards.partNum] ? (
                            <div className="bg-primary/10 border border-primary/20 p-3" style={{ borderRadius: "3px" }}>
                              <p className="text-[10px] font-heading font-bold text-primary uppercase mb-1">✅ MGK Teil {msg.courseCards.partNum} gewählt</p>
                              <p className="text-xs font-medium text-foreground font-body">{selections[msg.courseCards.partNum].date} – {selections[msg.courseCards.partNum].time}</p>
                              <p className="text-[10px] text-muted-foreground font-body">📍 {selections[msg.courseCards.partNum].location} · CHF {selections[msg.courseCards.partNum].price.toFixed(2)}</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                              {msg.courseCards.courses.map((course) => (
                                <CourseCard key={course.id} course={course} onSelect={() => selectCourse(msg.courseCards!.partNum, course)} />
                              ))}
                            </div>
                          )
                        )}

                        {msg.categorySelector && <CategorySelector onSelect={selectFsCategory} />}
                        {msg.serviceSelector && fsCategory && <ServiceSelector category={fsCategory} onSelect={selectFsService} services={dbServices} />}
                        {msg.packageSelector && <PackageSelector packages={msg.packageSelector.packages} service={msg.packageSelector.service} onSelect={selectFsPackage} />}
                        {msg.instructorSelector && <InstructorSelector onSelect={selectFsInstructor} />}
                        {msg.studentForm && <StudentForm onSubmit={handleStudentSubmit} />}
                        {msg.paymentStep && <PaymentSelector onSelect={handlePaymentSelect} />}
                        {msg.confirmationSummary && <ConfirmationCard summary={msg.confirmationSummary} onConfirm={handleFinalConfirm} />}
                        {msg.fahrstundenConfirmation && <FahrstundenConfirmationCard summary={msg.fahrstundenConfirmation} onConfirm={handleFsConfirm} />}
                        {msg.contactForm && <ContactForm type={msg.contactForm} onDone={(name, time) => {
                          if (msg.contactForm === "callback") {
                            addMsg({ role: "bot", content: `Super ${name}! Jamal ruft dich ${time} an. 📞`, buttons: [{ label: "Zurück zum Menü", action: "main_menu" }] });
                          } else {
                            addMsg({ role: "bot", content: `Danke ${name}! Wir erstellen dir ein Angebot und melden uns. 📋`, buttons: [{ label: "Zurück zum Menü", action: "main_menu" }] });
                          }
                        }} />}

                        {msg.buttons && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {msg.buttons.map((btn, i) => (
                              <button
                                key={i}
                                onClick={() => handleAction(btn.action)}
                                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium font-body bg-card text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-colors"
                                style={{ borderRadius: "20px" }}
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
            <div className="px-5 py-4 border-t border-border bg-card shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Schreib eine Nachricht..."
                  className="flex-1 bg-muted border-0 text-[13px] h-11 font-body"
                  style={{ borderRadius: "22px" }}
                />
                <Button type="submit" size="icon" className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90" style={{ borderRadius: "22px" }}>
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

function ContactForm({ type, onDone }: { type: "callback" | "quote"; onDone: (name: string, time: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="bg-primary/10 border border-primary/20 p-3 text-center" style={{ borderRadius: "3px" }}>
        <p className="text-xs font-medium text-primary flex items-center justify-center gap-1 font-body"><Check className="w-3.5 h-3.5" /> Übermittelt</p>
      </div>
    );
  }

  if (type === "callback") {
    if (step === 0) {
      return (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-4 space-y-2" style={{ borderRadius: "3px" }}>
          <Label className="text-[10px] text-muted-foreground font-body">Wie heisst du?</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dein Name" className="h-8 text-xs font-body" />
          <Button size="sm" disabled={!name.trim()} onClick={() => setStep(1)} className="w-full h-8 text-xs font-heading uppercase">Weiter</Button>
        </motion.div>
      );
    }
    if (step === 1) {
      return (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-4 space-y-2" style={{ borderRadius: "3px" }}>
          <Label className="text-[10px] text-muted-foreground font-body">Deine Telefonnummer?</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+41 79 ..." className="h-8 text-xs font-body" />
          <Button size="sm" disabled={!phone.trim()} onClick={() => setStep(2)} className="w-full h-8 text-xs font-heading uppercase">Weiter</Button>
        </motion.div>
      );
    }
    return (
      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-4 space-y-2" style={{ borderRadius: "3px" }}>
        <Label className="text-[10px] text-muted-foreground font-body">Wann passt ein Anruf?</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {["Morgens 8–12", "Mittags 12–16", "Abends 16–22", "Samstag"].map((slot) => (
            <button key={slot} onClick={() => setTimeSlot(slot)} className={`px-2 py-1.5 text-xs font-body border transition-colors ${timeSlot === slot ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:border-primary/30"}`} style={{ borderRadius: "3px" }}>
              {slot}
            </button>
          ))}
        </div>
        <Button size="sm" disabled={!timeSlot} onClick={() => { setSubmitted(true); onDone(name, timeSlot); }} className="w-full h-8 text-xs font-heading uppercase">Absenden</Button>
      </motion.div>
    );
  }

  // Quote form
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-4 space-y-2" style={{ borderRadius: "3px" }}>
      <Label className="text-[10px] text-muted-foreground font-body">Name</Label>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dein Name" className="h-8 text-xs font-body" />
      <Label className="text-[10px] text-muted-foreground font-body">Telefon</Label>
      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+41 79 ..." className="h-8 text-xs font-body" />
      <Label className="text-[10px] text-muted-foreground font-body">Interesse (optional)</Label>
      <Input value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="z.B. A1, Paket 10h..." className="h-8 text-xs font-body" />
      <Button size="sm" disabled={!name.trim() || !phone.trim()} onClick={() => { setSubmitted(true); onDone(name, ""); }} className="w-full h-8 text-xs font-heading uppercase">Angebot anfragen</Button>
    </motion.div>
  );
}

function CategorySelector({ onSelect }: { onSelect: (cat: "auto" | "motorrad") => void }) {
  const [selected, setSelected] = useState(false);
  if (selected) {
    return <div className="bg-primary/10 border border-primary/20 p-3 text-center" style={{ borderRadius: "3px" }}><p className="text-xs font-medium text-primary flex items-center justify-center gap-1 font-body"><Check className="w-3.5 h-3.5" /> Kategorie gewählt</p></div>;
  }
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-2">
      {[
        { cat: "auto" as const, icon: <Car className="w-6 h-6" />, label: "Auto", desc: "Kat. B" },
        { cat: "motorrad" as const, icon: <Bike className="w-6 h-6" />, label: "Motorrad", desc: "A1/A2/A" },
      ].map((item) => (
        <button key={item.cat} onClick={() => { setSelected(true); onSelect(item.cat); }} className="flex flex-col items-center gap-2 p-4 bg-card border-2 border-border hover:border-primary/40 transition-colors" style={{ borderRadius: "3px" }}>
          <div className="text-primary">{item.icon}</div>
          <span className="text-xs font-heading font-bold text-foreground uppercase">{item.label}</span>
          <span className="text-[10px] text-muted-foreground font-body">{item.desc}</span>
        </button>
      ))}
    </motion.div>
  );
}

function ServiceSelector({ category, onSelect, services }: { category: "auto" | "motorrad"; onSelect: (s: FahrstundenService) => void; services: FahrstundenService[] }) {
  const [selected, setSelected] = useState(false);
  const filtered = services.filter((s) => s.category === category);
  if (selected) {
    return <div className="bg-primary/10 border border-primary/20 p-3 text-center" style={{ borderRadius: "3px" }}><p className="text-xs font-medium text-primary flex items-center justify-center gap-1 font-body"><Check className="w-3.5 h-3.5" /> Lektion gewählt</p></div>;
  }
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      {filtered.map((service) => (
        <button key={service.id} onClick={() => { setSelected(true); onSelect(service); }} className="w-full text-left bg-card border border-border p-3 hover:border-primary/40 transition-colors" style={{ borderRadius: "3px" }}>
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <p className="text-xs font-heading font-bold text-foreground uppercase">{service.name}</p>
              <p className="text-[10px] text-muted-foreground font-body flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration}</p>
            </div>
            <p className="font-heading font-bold text-sm text-primary">CHF {service.price.toFixed(2)}</p>
          </div>
        </button>
      ))}
    </motion.div>
  );
}

function PackageSelector({ packages, service, onSelect }: { packages: FahrstundenPackage[]; service: FahrstundenService; onSelect: (pkg: FahrstundenPackage | null) => void }) {
  const [selected, setSelected] = useState(false);
  if (selected) {
    return <div className="bg-primary/10 border border-primary/20 p-3 text-center" style={{ borderRadius: "3px" }}><p className="text-xs font-medium text-primary flex items-center justify-center gap-1 font-body"><Check className="w-3.5 h-3.5" /> Auswahl getroffen</p></div>;
  }
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      {packages.map((pkg) => (
        <button key={pkg.id} onClick={() => { setSelected(true); onSelect(pkg); }} className="w-full text-left bg-card border-2 border-primary/20 p-3 hover:border-primary/50 transition-colors" style={{ borderRadius: "3px" }}>
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Gift className="w-3 h-3 text-primary" />
                <p className="text-xs font-heading font-bold text-foreground uppercase">{pkg.name}</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-body">{service.name} × {pkg.lessons}</p>
            </div>
            <div className="text-right">
              <span className="inline-block text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 mb-0.5" style={{ borderRadius: "3px" }}>Spare {pkg.discount}</span>
              <p className="font-heading font-bold text-sm text-primary">CHF {pkg.totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </button>
      ))}
      <div className="relative flex items-center gap-2 py-1">
        <div className="flex-1 h-px bg-border" /><span className="text-[10px] text-muted-foreground font-body">Oder</span><div className="flex-1 h-px bg-border" />
      </div>
      <button onClick={() => { setSelected(true); onSelect(null); }} className="w-full text-left bg-card border border-border p-3 hover:border-primary/40 transition-colors" style={{ borderRadius: "3px" }}>
        <div className="flex justify-between items-center">
          <p className="text-xs font-medium text-foreground font-body">Einzellektion ohne Paket</p>
          <p className="font-heading font-bold text-sm text-primary">CHF {service.price.toFixed(2)}</p>
        </div>
      </button>
    </motion.div>
  );
}

function InstructorSelector({ onSelect }: { onSelect: (inst: Instructor | null) => void }) {
  const [selected, setSelected] = useState(false);
  if (selected) {
    return <div className="bg-primary/10 border border-primary/20 p-3 text-center" style={{ borderRadius: "3px" }}><p className="text-xs font-medium text-primary flex items-center justify-center gap-1 font-body"><Check className="w-3.5 h-3.5" /> Fahrlehrer gewählt</p></div>;
  }
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      {tenantConfig.instructors.map((inst) => (
        <button key={inst.id} onClick={() => { setSelected(true); onSelect(inst); }} className="w-full text-left bg-card border border-border p-3 hover:border-primary/40 transition-colors" style={{ borderRadius: "3px" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center" style={{ borderRadius: "3px" }}>
              <span className="text-xs font-heading font-bold text-primary">{inst.initials}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-heading font-bold text-foreground">{inst.name}</p>
              {inst.popular && <span className="text-[10px] text-primary font-medium font-body">⭐ Beliebt</span>}
            </div>
          </div>
        </button>
      ))}
      <button onClick={() => { setSelected(true); onSelect(null); }} className="w-full text-left bg-card border border-border p-3 hover:border-primary/40 transition-colors" style={{ borderRadius: "3px" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted flex items-center justify-center" style={{ borderRadius: "3px" }}>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xs font-medium text-foreground font-body">Keine Präferenz</p>
        </div>
      </button>
    </motion.div>
  );
}

function CourseCard({ course, onSelect }: { course: CourseDate; onSelect: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onSelect} className="w-full text-left bg-card border border-border p-3 hover:border-primary/40 transition-colors" style={{ borderRadius: "3px" }}>
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <p className="text-[10px] font-heading font-bold uppercase tracking-wider text-muted-foreground">{course.day}</p>
          <p className="font-heading font-bold text-sm text-foreground">{course.date}</p>
          <p className="text-xs text-muted-foreground font-body">🕐 {course.time}</p>
          <p className="text-xs text-muted-foreground font-body">📍 {course.location}</p>
          {course.instructor && <p className="text-xs text-muted-foreground font-body">👤 {course.instructor}</p>}
        </div>
        <div className="text-right space-y-1">
          <p className="font-heading font-bold text-sm text-primary">CHF {course.price.toFixed(2)}</p>
          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 ${course.spotsAvailable <= 2 ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"}`} style={{ borderRadius: "3px" }}>
            {course.spotsAvailable} Plätze
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function StudentForm({ onSubmit }: { onSubmit: (data: StudentFormData) => void }) {
  const [data, setData] = useState<StudentFormData>({ firstName: "", lastName: "", address: "", birthDate: "", faNumber: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof StudentFormData, val: string) => setData((d) => ({ ...d, [key]: val }));
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
    onSubmit({ firstName: data.firstName.trim(), lastName: data.lastName.trim(), address: data.address.trim(), birthDate: data.birthDate, faNumber: data.faNumber.trim(), email: data.email.trim(), phone: data.phone.trim() });
  };

  if (submitted) {
    return <div className="bg-primary/10 border border-primary/20 p-3 text-center" style={{ borderRadius: "3px" }}><p className="text-xs font-medium text-primary flex items-center justify-center gap-1 font-body"><Check className="w-3.5 h-3.5" /> Daten übermittelt</p></div>;
  }

  return (
    <motion.form initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="bg-card border border-border p-4 space-y-2.5" style={{ borderRadius: "3px" }}>
      <div className="flex items-center gap-2 mb-1">
        <User className="w-4 h-4 text-primary" />
        <p className="text-xs font-heading font-bold text-foreground uppercase">Persönliche Daten</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <FormField label="Vorname *" error={errors.firstName}><Input value={data.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Max" className="h-8 text-xs font-body" maxLength={50} /></FormField>
        <FormField label="Nachname *" error={errors.lastName}><Input value={data.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Muster" className="h-8 text-xs font-body" maxLength={50} /></FormField>
      </div>
      <FormField label="Adresse *" error={errors.address}><Input value={data.address} onChange={(e) => set("address", e.target.value)} placeholder="Musterstrasse 1, 5430 Wettingen" className="h-8 text-xs font-body" maxLength={150} /></FormField>
      <FormField label="Geburtsdatum *" error={errors.birthDate}><Input type="date" value={data.birthDate} onChange={(e) => set("birthDate", e.target.value)} className="h-8 text-xs font-body" /></FormField>
      <FormField label="FA-Nummer (Lernfahrausweis) *" error={errors.faNumber}><Input value={data.faNumber} onChange={(e) => set("faNumber", e.target.value)} placeholder="z.B. CH-1234567890" className="h-8 text-xs font-body" maxLength={30} /></FormField>
      <FormField label="E-Mail *" error={errors.email}><Input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="max@beispiel.ch" className="h-8 text-xs font-body" maxLength={100} /></FormField>
      <FormField label="Telefon *" error={errors.phone}><Input type="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+41 79 123 45 67" className="h-8 text-xs font-body" maxLength={20} /></FormField>
      <Button type="submit" size="sm" className="w-full h-9 text-xs gap-1.5 mt-1 font-heading uppercase" style={{ borderRadius: "3px" }}>
        <ChevronRight className="w-3 h-3" /> Weiter zur Bezahlmethode
      </Button>
    </motion.form>
  );
}

function FormField({ label, error, icon, children }: { label: string; error?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[10px] text-muted-foreground font-body flex items-center gap-1">{icon} {label}</Label>
      {children}
      {error && <p className="text-[10px] text-destructive mt-0.5 font-body">{error}</p>}
    </div>
  );
}

function PaymentSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return <div className="bg-primary/10 border border-primary/20 p-3 text-center" style={{ borderRadius: "3px" }}><p className="text-xs font-medium text-primary flex items-center justify-center gap-1 font-body"><CreditCard className="w-3.5 h-3.5" /> Bezahlmethode gewählt</p></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-4 space-y-2" style={{ borderRadius: "3px" }}>
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="w-4 h-4 text-primary" />
        <p className="text-xs font-heading font-bold text-foreground uppercase">Bezahlmethode</p>
      </div>
      {PAYMENT_METHODS.map((method) => (
        <button key={method.id} onClick={() => setSelected(method.id)} className={`w-full text-left p-3 border-2 transition-colors ${selected === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`} style={{ borderRadius: "3px" }}>
          <div className="flex items-center gap-2">
            <span className="text-xs">{method.icon}</span>
            <span className="text-xs font-medium text-foreground font-body">{method.label}</span>
            {selected === method.id && <Check className="w-3.5 h-3.5 text-primary ml-auto" />}
          </div>
          {selected === method.id && <p className="text-[10px] text-muted-foreground mt-1.5 ml-6 font-body">{method.desc}</p>}
        </button>
      ))}
      <Button size="sm" disabled={!selected} onClick={() => { setConfirmed(true); onSelect(selected!); }} className="w-full h-9 text-xs gap-1.5 mt-1 font-heading uppercase" style={{ borderRadius: "3px" }}>
        {selected === "card" ? <>💳 Jetzt bezahlen</> : <><ChevronRight className="w-3 h-3" /> Weiter zur Bestätigung</>}
      </Button>
    </motion.div>
  );
}

function ConfirmationCard({ summary, onConfirm }: { summary: BookingSummary; onConfirm: () => Promise<ConfirmationResult> }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "confirmed" | "payment_started">("idle");
  const total = summary.selections.reduce((s, { course }) => s + course.price, 0);

  if (status === "confirmed") {
    return <div className="bg-primary/10 border border-primary/20 p-3 text-center" style={{ borderRadius: "3px" }}><p className="text-xs font-medium text-primary flex items-center justify-center gap-1 font-body"><Check className="w-3.5 h-3.5" /> Buchung bestätigt</p></div>;
  }

  if (status === "payment_started") {
    return <div className="bg-primary/10 border border-primary/20 p-3 text-center" style={{ borderRadius: "3px" }}><p className="text-xs font-medium text-primary flex items-center justify-center gap-1 font-body"><CreditCard className="w-3.5 h-3.5" /> Zahlungsfenster geöffnet</p></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-4 space-y-3" style={{ borderRadius: "3px" }}>
      <p className="text-xs font-heading font-bold text-foreground flex items-center gap-2 uppercase"><Check className="w-4 h-4 text-primary" /> Buchungsübersicht</p>
      <div className="space-y-2">
        {summary.selections.map(({ part, course }) => (
          <div key={part} className="bg-muted/50 p-2.5" style={{ borderRadius: "3px" }}>
            <p className="text-[10px] font-heading font-bold text-primary uppercase">MGK Teil {part}</p>
            <p className="text-xs font-medium text-foreground font-body">{course.date} – {course.time}</p>
            <p className="text-[10px] text-muted-foreground font-body">📍 {course.location} · CHF {course.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="bg-muted/50 p-2.5 space-y-0.5" style={{ borderRadius: "3px" }}>
        <p className="text-[10px] font-heading font-bold text-foreground uppercase">Schülerdaten</p>
        <p className="text-xs text-foreground font-body">{summary.student.firstName} {summary.student.lastName}</p>
        <p className="text-[10px] text-muted-foreground font-body">{summary.student.address}</p>
        <p className="text-[10px] text-muted-foreground font-body">📧 {summary.student.email} · 📞 {summary.student.phone}</p>
        <p className="text-[10px] text-muted-foreground font-body">🪪 {summary.student.faNumber}</p>
      </div>
      <div className="flex justify-between items-center pt-1 border-t border-border">
        <div><p className="text-[10px] text-muted-foreground font-body">Bezahlung</p><p className="text-xs font-medium text-foreground font-body">{summary.paymentMethod}</p></div>
        <div className="text-right"><p className="text-[10px] text-muted-foreground font-body">Gesamt</p><p className="text-base font-heading font-bold text-primary">CHF {total.toFixed(2)}</p></div>
      </div>
      <Button
        size="sm"
        disabled={status === "submitting"}
        onClick={async () => {
          if (status === "submitting") return;
          setStatus("submitting");
          const result = await onConfirm();
          if (result === "confirmed") {
            setStatus("confirmed");
          } else if (result === "payment_started") {
            setStatus("payment_started");
          } else {
            setStatus("idle");
          }
        }}
        className="w-full h-9 text-xs gap-1.5 font-heading uppercase"
        style={{ borderRadius: "3px" }}
      >
        {status === "submitting" ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Wird verarbeitet…</>
        ) : (
          <><Check className="w-3.5 h-3.5" /> Gebührenpflichtig bestätigen</>
        )}
      </Button>
      <p className="text-[9px] text-muted-foreground text-center font-body">Mit der Bestätigung akzeptierst du unsere AGB und Datenschutzrichtlinien.</p>
    </motion.div>
  );
}

function FahrstundenConfirmationCard({ summary, onConfirm }: { summary: FahrstundenSummary; onConfirm: () => Promise<ConfirmationResult> }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "confirmed" | "payment_started">("idle");
  const price = summary.selectedPackage ? summary.selectedPackage.totalPrice : summary.service.price;

  if (status === "confirmed") {
    return <div className="bg-primary/10 border border-primary/20 p-3 text-center" style={{ borderRadius: "3px" }}><p className="text-xs font-medium text-primary flex items-center justify-center gap-1 font-body"><Check className="w-3.5 h-3.5" /> Buchung bestätigt</p></div>;
  }

  if (status === "payment_started") {
    return <div className="bg-primary/10 border border-primary/20 p-3 text-center" style={{ borderRadius: "3px" }}><p className="text-xs font-medium text-primary flex items-center justify-center gap-1 font-body"><CreditCard className="w-3.5 h-3.5" /> Zahlungsfenster geöffnet</p></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-4 space-y-3" style={{ borderRadius: "3px" }}>
      <p className="text-xs font-heading font-bold text-foreground flex items-center gap-2 uppercase"><Check className="w-4 h-4 text-primary" /> Buchungsübersicht – Fahrstunde</p>
      <div className="bg-muted/50 p-2.5 space-y-0.5" style={{ borderRadius: "3px" }}>
        <p className="text-[10px] font-heading font-bold text-primary uppercase">Fahrstunde</p>
        <p className="text-xs font-medium text-foreground font-body">{summary.service.name}</p>
        {summary.selectedPackage && <p className="text-[10px] text-muted-foreground font-body">📦 {summary.selectedPackage.name}</p>}
        {summary.instructor && <p className="text-[10px] text-muted-foreground font-body">👤 {summary.instructor.name}</p>}
      </div>
      <div className="bg-muted/50 p-2.5 space-y-0.5" style={{ borderRadius: "3px" }}>
        <p className="text-[10px] font-heading font-bold text-foreground uppercase">Schülerdaten</p>
        <p className="text-xs text-foreground font-body">{summary.student.firstName} {summary.student.lastName}</p>
        <p className="text-[10px] text-muted-foreground font-body">{summary.student.address}</p>
        <p className="text-[10px] text-muted-foreground font-body">📧 {summary.student.email} · 📞 {summary.student.phone}</p>
        <p className="text-[10px] text-muted-foreground font-body">🪪 {summary.student.faNumber}</p>
      </div>
      <div className="flex justify-between items-center pt-1 border-t border-border">
        <div><p className="text-[10px] text-muted-foreground font-body">Bezahlung</p><p className="text-xs font-medium text-foreground font-body">{summary.paymentMethod}</p></div>
        <div className="text-right"><p className="text-[10px] text-muted-foreground font-body">Gesamt</p><p className="text-base font-heading font-bold text-primary">CHF {price.toFixed(2)}</p></div>
      </div>
      <Button
        size="sm"
        disabled={status === "submitting"}
        onClick={async () => {
          if (status === "submitting") return;
          setStatus("submitting");
          const result = await onConfirm();
          if (result === "confirmed") {
            setStatus("confirmed");
          } else if (result === "payment_started") {
            setStatus("payment_started");
          } else {
            setStatus("idle");
          }
        }}
        className="w-full h-9 text-xs gap-1.5 font-heading uppercase"
        style={{ borderRadius: "3px" }}
      >
        {status === "submitting" ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Wird verarbeitet…</>
        ) : (
          <><Check className="w-3.5 h-3.5" /> Gebührenpflichtig bestätigen</>
        )}
      </Button>
      <p className="text-[9px] text-muted-foreground text-center font-body">Mit der Bestätigung akzeptierst du unsere AGB und Datenschutzrichtlinien.</p>
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
        // Handle links [text](url)
        const linkParts = part.split(/(\[[^\]]+\]\([^)]+\))/g);
        return linkParts.map((lp, j) => {
          const linkMatch = lp.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (linkMatch) {
            return <a key={`${i}-${j}`} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline">{linkMatch[1]}</a>;
          }
          return lp.split("\n").map((line, k, arr) => (
            <span key={`${i}-${j}-${k}`}>{line}{k < arr.length - 1 && <br />}</span>
          ));
        });
      })}
    </>
  );
}
