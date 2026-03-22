import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bike, Calendar, HelpCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { faqData, motorradGrundkurse } from "@/data/courses";
import type { CourseDate } from "@/data/courses";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  buttons?: QuickButton[];
  courseCards?: CourseDate[];
  coursePartTitle?: string;
}

interface QuickButton {
  label: string;
  icon?: React.ReactNode;
  action: string;
}

const mainMenu: QuickButton[] = [
  { label: "Kurse anzeigen", icon: <Calendar className="w-3.5 h-3.5" />, action: "show_courses" },
  { label: "FAQ", icon: <HelpCircle className="w-3.5 h-3.5" />, action: "show_faq" },
  { label: "Kontakt", icon: <MessageCircle className="w-3.5 h-3.5" />, action: "contact" },
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !initialized) {
      setMessages([
        {
          id: "welcome",
          role: "bot",
          content: "Hoi! 👋 Willkommen bei **Drive me Fahrschule**. Ich bin dein Assistent für Motorrad Grundkurse. Wie kann ich dir helfen?",
          buttons: mainMenu,
        },
      ]);
      setInitialized(true);
    }
  }, [open, initialized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() }]);
  };

  const handleAction = (action: string) => {
    if (action === "show_courses") {
      addMessage({ role: "user", content: "Kurse anzeigen" });
      setTimeout(() => {
        addMessage({
          role: "bot",
          content: "Hier sind unsere **Motorrad Grundkurse**. Welchen Teil möchtest du buchen?",
          buttons: motorradGrundkurse.map((c) => ({
            label: `Teil ${c.part}`,
            icon: <Bike className="w-3.5 h-3.5" />,
            action: `course_part_${c.part}`,
          })),
        });
      }, 400);
    } else if (action.startsWith("course_part_")) {
      const partNum = parseInt(action.split("_")[2]);
      const part = motorradGrundkurse.find((c) => c.part === partNum);
      if (!part) return;
      addMessage({ role: "user", content: `Teil ${partNum} anzeigen` });
      setTimeout(() => {
        addMessage({
          role: "bot",
          content: `🏍️ **${part.title}**\n\n${part.description}`,
          courseCards: part.dates,
          coursePartTitle: part.title,
        });
      }, 400);
    } else if (action.startsWith("book_")) {
      const courseId = action.replace("book_", "");
      const allDates = motorradGrundkurse.flatMap((c) => c.dates);
      const course = allDates.find((d) => d.id === courseId);
      if (!course) return;
      addMessage({ role: "user", content: `${course.date} buchen` });
      setTimeout(() => {
        addMessage({
          role: "bot",
          content: `✅ Toll! Du möchtest den Kurs am **${course.date}** um **${course.time}** in **${course.location}** buchen.\n\nBitte kontaktiere uns zur Bestätigung:\n\n📞 Telefon oder ✉️ E-Mail an info@drive-me.ch\n\nWir freuen uns auf dich!`,
          buttons: [{ label: "Zurück zum Menü", icon: <ChevronRight className="w-3.5 h-3.5" />, action: "main_menu" }],
        });
      }, 400);
    } else if (action === "show_faq") {
      addMessage({ role: "user", content: "FAQ anzeigen" });
      setTimeout(() => {
        addMessage({
          role: "bot",
          content: "Hier sind die häufigsten Fragen. Wähle eine aus:",
          buttons: faqData.map((f, i) => ({
            label: f.question,
            action: `faq_${i}`,
          })),
        });
      }, 400);
    } else if (action.startsWith("faq_")) {
      const idx = parseInt(action.split("_")[1]);
      const faq = faqData[idx];
      if (!faq) return;
      addMessage({ role: "user", content: faq.question });
      setTimeout(() => {
        addMessage({
          role: "bot",
          content: faq.answer,
          buttons: [
            { label: "Weitere Fragen", icon: <HelpCircle className="w-3.5 h-3.5" />, action: "show_faq" },
            { label: "Kurse buchen", icon: <Calendar className="w-3.5 h-3.5" />, action: "show_courses" },
          ],
        });
      }, 400);
    } else if (action === "contact") {
      addMessage({ role: "user", content: "Kontakt" });
      setTimeout(() => {
        addMessage({
          role: "bot",
          content: "📞 Du erreichst uns unter:\n\n**Drive me Fahrschule**\n📍 Wettingen\n✉️ info@drive-me.ch\n\nWir freuen uns auf deine Nachricht!",
          buttons: [{ label: "Zurück zum Menü", icon: <ChevronRight className="w-3.5 h-3.5" />, action: "main_menu" }],
        });
      }, 400);
    } else if (action === "main_menu") {
      setTimeout(() => {
        addMessage({
          role: "bot",
          content: "Was möchtest du als nächstes tun?",
          buttons: mainMenu,
        });
      }, 300);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMessage({ role: "user", content: text });

    const lower = text.toLowerCase();
    setTimeout(() => {
      if (lower.includes("kurs") || lower.includes("buchen") || lower.includes("termin") || lower.includes("datum")) {
        handleAction("show_courses");
        // remove the duplicate user msg
        setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("faq") || lower.includes("frage") || lower.includes("hilfe")) {
        handleAction("show_faq");
        setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("kontakt") || lower.includes("telefon") || lower.includes("email") || lower.includes("anruf")) {
        handleAction("contact");
        setMessages((prev) => prev.slice(0, -1));
      } else if (lower.includes("preis") || lower.includes("kosten") || lower.includes("chf")) {
        addMessage({
          role: "bot",
          content: faqData[1].answer,
          buttons: [
            { label: "Kurse anzeigen", icon: <Calendar className="w-3.5 h-3.5" />, action: "show_courses" },
            { label: "Weitere Fragen", icon: <HelpCircle className="w-3.5 h-3.5" />, action: "show_faq" },
          ],
        });
      } else {
        addMessage({
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
            className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-2rem)] rounded-2xl bg-card shadow-2xl border border-border flex flex-col overflow-hidden"
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

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] space-y-2`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          }`}
                        >
                          <MessageContent content={msg.content} />
                        </div>

                        {/* Course Cards */}
                        {msg.courseCards && (
                          <div className="grid grid-cols-1 gap-2">
                            {msg.courseCards.map((course) => (
                              <CourseCard key={course.id} course={course} onBook={() => handleAction(`book_${course.id}`)} />
                            ))}
                          </div>
                        )}

                        {/* Quick Buttons */}
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
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

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering for bold text and newlines
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

function CourseCard({ course, onBook }: { course: CourseDate; onBook: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:border-primary/40 transition-colors"
      onClick={onBook}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{course.day}</p>
          <p className="font-bold text-sm">{course.date}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">🕐 {course.time}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">📍 {course.location}</p>
          {course.instructor && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">👤 {course.instructor}</p>
          )}
        </div>
        <div className="text-right space-y-1">
          <p className="font-bold text-sm">CHF {course.price.toFixed(2)}</p>
          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent">
            {course.spotsAvailable} Plätze frei
          </span>
        </div>
      </div>
    </motion.div>
  );
}
