export interface CourseDate {
  id: string;
  day: string;
  date: string;
  time: string;
  location: string;
  instructor?: string;
  price: number;
  spotsAvailable: number;
}

export interface CoursePart {
  part: number;
  title: string;
  description: string;
  dates: CourseDate[];
}

export const motorradGrundkurse: CoursePart[] = [
  {
    part: 1,
    title: "MGK Teil 1 – Datum wählen",
    description: "Wählen Sie Ihren Wunschtermin für den ersten Kursteil.",
    dates: [
      { id: "mgk1-1", day: "Samstag", date: "28.03.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 5 },
      { id: "mgk1-2", day: "Samstag", date: "28.03.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 5 },
      { id: "mgk1-3", day: "Mittwoch", date: "01.04.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 5 },
      { id: "mgk1-4", day: "Samstag", date: "04.04.2026", time: "08:00 – 12:00", location: "Wettingen", price: 160, spotsAvailable: 4 },
      { id: "mgk1-5", day: "Samstag", date: "11.04.2026", time: "08:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 4 },
      { id: "mgk1-6", day: "Montag", date: "13.04.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 4 },
      { id: "mgk1-7", day: "Samstag", date: "18.04.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 5 },
      { id: "mgk1-8", day: "Montag", date: "20.04.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 5 },
      { id: "mgk1-9", day: "Samstag", date: "25.04.2026", time: "08:00 – 12:00", location: "Wettingen", price: 160, spotsAvailable: 3 },
      { id: "mgk1-10", day: "Montag", date: "27.04.2026", time: "08:00 – 12:00", location: "Wettingen", price: 160, spotsAvailable: 5 },
      { id: "mgk1-11", day: "Freitag", date: "01.05.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 5 },
      { id: "mgk1-12", day: "Montag", date: "04.05.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 5 },
      { id: "mgk1-13", day: "Samstag", date: "09.05.2026", time: "08:00 – 12:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 5 },
      { id: "mgk1-14", day: "Montag", date: "11.05.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 5 },
    ],
  },
  {
    part: 2,
    title: "MGK Teil 2 – Datum wählen",
    description: "Teil 2 muss nach Teil 1 stattfinden. Nur passende Termine werden angezeigt.",
    dates: [
      { id: "mgk2-1", day: "Freitag", date: "27.03.2026", time: "08:00 – 12:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 4 },
      { id: "mgk2-2", day: "Sonntag", date: "29.03.2026", time: "08:00 – 12:00", location: "Wettingen", price: 160, spotsAvailable: 5 },
      { id: "mgk2-3", day: "Sonntag", date: "29.03.2026", time: "08:00 – 12:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 2 },
      { id: "mgk2-4", day: "Donnerstag", date: "02.04.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 5 },
      { id: "mgk2-5", day: "Sonntag", date: "05.04.2026", time: "08:00 – 12:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 4 },
      { id: "mgk2-6", day: "Freitag", date: "10.04.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 4 },
      { id: "mgk2-7", day: "Sonntag", date: "12.04.2026", time: "08:00 – 12:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 4 },
      { id: "mgk2-8", day: "Mittwoch", date: "15.04.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 4 },
      { id: "mgk2-9", day: "Mittwoch", date: "22.04.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 5 },
      { id: "mgk2-10", day: "Samstag", date: "25.04.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 5 },
      { id: "mgk2-11", day: "Sonntag", date: "26.04.2026", time: "08:00 – 12:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 3 },
      { id: "mgk2-12", day: "Mittwoch", date: "29.04.2026", time: "08:00 – 12:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 2 },
      { id: "mgk2-13", day: "Mittwoch", date: "06.05.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 5 },
      { id: "mgk2-14", day: "Samstag", date: "09.05.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 5 },
      { id: "mgk2-15", day: "Sonntag", date: "10.05.2026", time: "08:00 – 12:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 5 },
      { id: "mgk2-16", day: "Mittwoch", date: "13.05.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 5 },
    ],
  },
  {
    part: 3,
    title: "MGK Teil 3 – Datum wählen",
    description: "Teil 3 muss nach Teil 2 stattfinden.",
    dates: [
      { id: "mgk3-1", day: "Freitag", date: "27.03.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 5 },
      { id: "mgk3-2", day: "Sonntag", date: "29.03.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 5 },
      { id: "mgk3-3", day: "Freitag", date: "03.04.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 4 },
      { id: "mgk3-4", day: "Sonntag", date: "05.04.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 3 },
      { id: "mgk3-5", day: "Montag", date: "06.04.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 2 },
      { id: "mgk3-6", day: "Sonntag", date: "12.04.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 3 },
      { id: "mgk3-7", day: "Freitag", date: "17.04.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 4 },
      { id: "mgk3-8", day: "Freitag", date: "24.04.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 5 },
      { id: "mgk3-9", day: "Freitag", date: "24.04.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 3 },
      { id: "mgk3-10", day: "Sonntag", date: "26.04.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 5 },
      { id: "mgk3-11", day: "Freitag", date: "01.05.2026", time: "08:00 – 12:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 3 },
      { id: "mgk3-12", day: "Freitag", date: "08.05.2026", time: "13:00 – 17:00", location: "Wettingen", price: 160, spotsAvailable: 3 },
      { id: "mgk3-13", day: "Sonntag", date: "10.05.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 4 },
      { id: "mgk3-14", day: "Freitag", date: "15.05.2026", time: "13:00 – 17:00", location: "Wettingen", instructor: "JL", price: 160, spotsAvailable: 4 },
    ],
  },
];

// ─── Fahrstunden (Driving Lessons) ────────────────────────────

export interface FahrstundenService {
  id: string;
  category: "auto" | "motorrad";
  name: string;
  duration: string;
  price: number;
}

export interface FahrstundenPackage {
  id: string;
  serviceId: string;
  name: string;
  lessons: number;
  discount: string;
  totalPrice: number;
  pricePerLesson: number;
}

export interface Instructor {
  id: string;
  name: string;
  initials: string;
  popular?: boolean;
}

export const fahrstundenServices: FahrstundenService[] = [
  { id: "auto-admin", category: "auto", name: "Admin Beitrag einmalig", duration: "einmalig", price: 130 },
  { id: "auto-45", category: "auto", name: "Einzellektion (45min)", duration: "45 Min", price: 95 },
  { id: "auto-90", category: "auto", name: "Doppellektion (2x45Min)", duration: "90 Min", price: 190 },
  { id: "auto-rechnung", category: "auto", name: "Auf Rechnung (45min)", duration: "45 Min", price: 95 },
  { id: "motorrad-60", category: "motorrad", name: "Einzellektion (60Min)", duration: "60 Min", price: 130 },
  { id: "motorrad-90", category: "motorrad", name: "Doppellektion (2x45Min)", duration: "90 Min", price: 180 },
  { id: "motorrad-vorschulung", category: "motorrad", name: "Motorrad Vorschulung Doppellektion", duration: "90 Min", price: 180 },
  { id: "motorrad-pruefung", category: "motorrad", name: "Vor-Prüfungsfahrt inkl. Prüfung (120min)", duration: "120 Min", price: 180 },
  { id: "motorrad-tageskurs", category: "motorrad", name: "Motorrad Tageskurs (4h)", duration: "4 Std", price: 200 },
];

export const fahrstundenPackages: FahrstundenPackage[] = [
  { id: "pkg-auto45-10", serviceId: "auto-45", name: "10er Abo", lessons: 10, discount: "Spare CHF 50.-", totalPrice: 900, pricePerLesson: 90 },
  { id: "pkg-auto45-20", serviceId: "auto-45", name: "20er Abo", lessons: 20, discount: "Spare CHF 150.-", totalPrice: 1760, pricePerLesson: 88 },
];

export const instructors: Instructor[] = [
  { id: "je", name: "Jamal Ettana", initials: "JE", popular: true },
];

export const faqData = [
  {
    question: "Was ist der Motorrad Grundkurs (MGK)?",
    answer: "Der Motorrad Grundkurs ist ein obligatorischer Kurs in der Schweiz, bestehend aus **3 Teilen** (je 4 Stunden). Er ist Voraussetzung für den Lernfahrausweis der Kategorie A1 oder A. Die Kursteile müssen **in der richtigen Reihenfolge** absolviert werden.",
  },
  {
    question: "Wie viel kostet der Grundkurs?",
    answer: "Jeder Kursteil kostet **CHF 160.00**. Der gesamte Grundkurs (3 Teile) kostet somit **CHF 480.00**.",
  },
  {
    question: "Wo finden die Kurse statt? (Treffpunkt)",
    answer: "Unsere Motorrad Grundkurse finden in **Wettingen** statt.\n\n📍 **Treffpunkt:**\nLandstrasse 99\nCenterpassage – Ottos Rampe\n5430 Wettingen",
  },
  {
    question: "Was muss ich zum Kurs mitbringen?",
    answer: "Du brauchst:\n- **Eigenes Motorrad** in technisch einwandfreiem Zustand (aufgetankt, Profiltiefe > 1.6 mm)\n- **L-Schild** am Motorrad angebracht\n- **Motorradbekleidung** mit Protektoren (Knie, Ellenbogen, Schulter)\n- **Helm, Handschuhe und geeignete Schuhe/Stiefel**\n- **Regenschutzbekleidung** (z.B. Overall) für schlechtes Wetter\n- **Personalausweis** (ID oder Pass) und **Lernfahrausweis** am ersten Kurstag!\n\n⚠️ Du musst dich sicher im Verkehr bewegen können.",
  },
  {
    question: "Brauche ich ein eigenes Motorrad?",
    answer: "Ja, **sämtliche Fahrlektionen und Kurse müssen mit dem eigenen Motorrad** absolviert werden. Das Motorrad muss in einem technisch einwandfreien Zustand sein, aufgetankt und mit einem **L-Schild** versehen sein.",
  },
  {
    question: "Brauche ich Fahrerfahrung für den Grundkurs?",
    answer: "Du musst dich **sicher im Verkehr bewegen können**. Grundlegende Fahrerfahrung ist empfohlen, damit du dem Kursinhalt gut folgen kannst. Falls du noch unsicher bist, empfehlen wir vorab ein paar **Fahrstunden** bei uns zu buchen. 🏍️",
  },
  {
    question: "Kann ich einen Kursteil nachholen?",
    answer: "Ja, du kannst einzelne Kursteile an einem anderen Datum nachholen. Melde dich einfach bei uns und wir finden einen passenden Termin für dich.",
  },
  {
    question: "Stornierung & Umbuchung",
    answer: "Die Anmeldung ist **verbindlich**. Umbuchungen bzw. Stornierungen sind bis **5 Arbeitstage** vor Kursbeginn schriftlich an **info@l-me.ch** möglich. Danach wird die volle Kursgebühr in Rechnung gestellt.\n\nFahrstunden müssen **24 Stunden** vorher abgesagt werden.",
  },
  {
    question: "Wie kann ich bezahlen?",
    answer: "Du kannst **bar oder mit Karte vor Ort** am ersten Kurstag bezahlen.\n\n🏦 **Banküberweisung:**\nJamal Ettanaghmalti\nBank: PostFinance\nIBAN: CH5009000000167884324\nBIC: POFICHBEXXX",
  },
  {
    question: "Wie kann ich mich anmelden?",
    answer: "Du kannst dich direkt hier über unseren Chatbot anmelden! Sag einfach **'Kurs buchen'** und ich führe dich durch den Buchungsprozess. Alternativ kannst du uns auch telefonisch oder per E-Mail kontaktieren.",
  },
  {
    question: "Keine passenden Kursdaten?",
    answer: "Kursteil 3 bis 50 cm³ auf Anfrage! Melde dich bei uns und wir versuchen, die für dich passenden Termine individuell zusammenzustellen. 📞 Ruf uns an oder schreib uns eine Nachricht.",
  },
];
