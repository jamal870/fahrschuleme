import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bike, Calendar, HelpCircle, ChevronRight, MessageCircle, User, Mail, Hash, Phone, MapPin, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { faqData, motorradGrundkurse } from "@/data/courses";
import type { CourseDate } from "@/data/courses";
import { toast } from "sonner";

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

const PAYMENT_METHODS = [
  { id: "bank", label: "Direkte Banküberweisung", desc: "Bitte überweisen Sie den Betrag direkt auf unser Bankkonto. Verwenden Sie Ihren Vor- und Nachnamen als Zahlungsreferenz." },
  { id: "cash", label: "Barzahlung am Kurstag", desc: "Bei Barzahlung erhalten Sie eine Buchungsbestätigung. Die Zahlung erfolgt am ersten Kurstag." },
  { id: "card", label: "Kreditkarte / Debitkarte", desc: "Bezahlung mit Kredit- oder Debitkarte." },
];

const mainMenu: QuickButton[] = [
  { label: "Kurs buchen", icon: <Calendar className="w-3.5 h-3.5" />, action: "start_booking" },
  { label: "FAQ", icon: <HelpCircle className="w-3.5 h-3.5" />, action: "show_faq" },
  { label: "Kontakt", icon: <MessageCircle className="w-3.5 h-3.5" />, action: "contact" },
];

// ─── Main Component ──────────────────────────────────────────

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Booking state
  const [bookingStep, setBookingStep] = useState<number>(0); // 0=idle, 1-3=selecting part, 4=form, 5=payment, 6=confirm
  const [selections, setSelections] = useState<Record<number, CourseDate>>({});
  const [studentData, setStudentData] = useState<StudentFormData | null>(null);

  useEffect(() => {
    if (open && !initialized) {
      setMessages([{
        id: "welcome",
        role: "bot",
        content: "Hoi! 👋 Willkommen bei **Drive me Fahrschule**.\n\nIch helfe dir bei der Buchung deiner Motorrad Grundkurse (Teil 1–3). Wie kann ich dir helfen?",
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

  // ── Start booking flow ──
  const startBooking = () => {
    setBookingStep(1);
    setSelections({});
    setStudentData(null);
    addMsg({ role: "user", content: "Kurs buchen" });
    setTimeout(() => {
      const part = motorradGrundkurse[0];
      addMsg({
        role: "bot",
        content: `**Schritt 1/5** – 🏍️ **${part.title}**\n\n${part.description}\n\nWähle deinen Wunschtermin:`,
        courseCards: { courses: part.dates, partNum: 1 },
      });
    }, 400);
  };

  // ── Select a course date ──
  const selectCourse = (partNum: number, course: CourseDate) => {
    setSelections((prev) => ({ ...prev, [partNum]: course }));
    addMsg({ role: "user", content: `${course.day}, ${course.date} – ${course.time}` });

    const nextPart = partNum + 1;
    if (nextPart <= 3) {
      setBookingStep(nextPart);
      setTimeout(() => {
        const part = motorradGrundkurse[nextPart - 1];
        addMsg({
          role: "bot",
          content: `✅ Teil ${partNum} gewählt!\n\n**Schritt ${nextPart}/5** – 🏍️ **${part.title}**\n\n${part.description}\n\nWähle deinen Wunschtermin:`,
          courseCards: { courses: part.dates, partNum: nextPart },
        });
      }, 400);
    } else {
      // All 3 parts selected → show form
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

  // ── Student form submitted ──
  const handleStudentSubmit = (data: StudentFormData) => {
    setStudentData(data);
    setBookingStep(5);
    addMsg({ role: "user", content: `${data.firstName} ${data.lastName}, ${data.email}` });
    setTimeout(() => {
      addMsg({
        role: "bot",
        content: `✅ Daten erfasst!\n\n**Schritt 5/5** – 💳 Wähle deine Bezahlmethode:`,
        paymentStep: true,
      });
    }, 400);
  };

  // ── Payment selected ──
  const handlePaymentSelect = (methodId: string) => {
    const method = PAYMENT_METHODS.find((m) => m.id === methodId);
    if (!method || !studentData) return;
    setBookingStep(6);

    const sels = Object.entries(selections).map(([p, c]) => ({ part: parseInt(p), course: c }));
    addMsg({ role: "user", content: method.label });

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
  };

  // ── Final confirm ──
  const handleFinalConfirm = () => {
    if (!studentData) return;
    const sels = Object.entries(selections).map(([p, c]) => ({ part: parseInt(p), course: c }));
    const total = sels.reduce((s, { course }) => s + course.price, 0);

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
  };

  // ── Generic actions ──
  const handleAction = (action: string) => {
    if (action === "start_booking") {
      startBooking();
    } else if (action === "show_courses") {
      addMsg({ role: "user", content: "Kurse anzeigen" });
      setTimeout(() => {
        addMsg({
          role: "bot",
          content: "Hier sind unsere **Motorrad Grundkurse**. Möchtest du gleich buchen?",
          buttons: [
            { label: "Jetzt buchen (Teil 1–3)", icon: <Calendar className="w-3.5 h-3.5" />, action: "start_booking" },
            ...mainMenu.filter((m) => m.action !== "start_booking"),
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
          content: "📞 Du erreichst uns unter:\n\n**Drive me Fahrschule**\n📍 Wettingen\n✉️ info@drive-me.ch\n\nWir freuen uns auf deine Nachricht!",
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
      if (lower.includes("kurs") || lower.includes("buchen") || lower.includes("termin")) {
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
            { label: "Kurs buchen", icon: <Calendar className="w-3.5 h-3.5" />, action: "start_booking" },
            { label: "Weitere Fragen", icon: <HelpCircle className="w-3.5 h-3.5" />, action: "show_faq" },
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
                  <p className="text-xs opacity-80">Motorrad Grundkurse</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-primary-foreground/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar during booking */}
            {bookingStep > 0 && bookingStep <= 6 && (
              <div className="px-4 py-2 bg-muted/50 border-b border-border shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-muted-foreground">Buchungsfortschritt</span>
                  <span className="text-[10px] font-bold text-primary">
                    {Math.min(bookingStep, 5)}/5
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        s <= bookingStep ? "bg-primary" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {["Teil 1", "Teil 2", "Teil 3", "Daten", "Zahlung"].map((label, i) => (
                    <span key={i} className={`text-[8px] ${i + 1 <= bookingStep ? "text-primary font-medium" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  ))}
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

                        {/* Student form */}
                        {msg.studentForm && (
                          <StudentForm onSubmit={handleStudentSubmit} />
                        )}

                        {/* Payment step */}
                        {msg.paymentStep && (
                          <PaymentSelector onSelect={handlePaymentSelect} />
                        )}

                        {/* Confirmation summary */}
                        {msg.confirmationSummary && (
                          <ConfirmationCard
                            summary={msg.confirmationSummary}
                            onConfirm={handleFinalConfirm}
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

      {/* Course summary */}
      <div className="space-y-2">
        {summary.selections.map(({ part, course }) => (
          <div key={part} className="bg-muted/50 rounded-lg p-2.5">
            <p className="text-[10px] font-bold text-primary uppercase">MGK Teil {part}</p>
            <p className="text-xs font-medium text-foreground">{course.date} – {course.time}</p>
            <p className="text-[10px] text-muted-foreground">📍 {course.location} · CHF {course.price.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Student info */}
      <div className="bg-muted/50 rounded-lg p-2.5 space-y-0.5">
        <p className="text-[10px] font-bold text-foreground uppercase">Schülerdaten</p>
        <p className="text-xs text-foreground">{summary.student.firstName} {summary.student.lastName}</p>
        <p className="text-[10px] text-muted-foreground">{summary.student.address}</p>
        <p className="text-[10px] text-muted-foreground">📧 {summary.student.email} · 📞 {summary.student.phone}</p>
        <p className="text-[10px] text-muted-foreground">🪪 {summary.student.faNumber}</p>
      </div>

      {/* Payment & Total */}
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
