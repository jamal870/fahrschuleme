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
      {
        id: "mgk1-1",
        day: "Samstag",
        date: "28.03.2026",
        time: "13:00 – 17:00",
        location: "Wettingen",
        price: 160,
        spotsAvailable: 5,
      },
      {
        id: "mgk1-2",
        day: "Samstag",
        date: "28.03.2026",
        time: "13:00 – 17:00",
        location: "Wettingen",
        instructor: "JL",
        price: 160,
        spotsAvailable: 5,
      },
      {
        id: "mgk1-3",
        day: "Mittwoch",
        date: "01.04.2026",
        time: "13:00 – 17:00",
        location: "Wettingen",
        price: 160,
        spotsAvailable: 5,
      },
      {
        id: "mgk1-4",
        day: "Samstag",
        date: "04.04.2026",
        time: "08:00 – 12:00",
        location: "Wettingen",
        price: 160,
        spotsAvailable: 4,
      },
    ],
  },
  {
    part: 2,
    title: "MGK Teil 2 – Datum wählen",
    description: "Wählen Sie Ihren Wunschtermin für den zweiten Kursteil.",
    dates: [
      {
        id: "mgk2-1",
        day: "Samstag",
        date: "11.04.2026",
        time: "13:00 – 17:00",
        location: "Wettingen",
        price: 160,
        spotsAvailable: 6,
      },
      {
        id: "mgk2-2",
        day: "Mittwoch",
        date: "15.04.2026",
        time: "13:00 – 17:00",
        location: "Wettingen",
        price: 160,
        spotsAvailable: 3,
      },
    ],
  },
  {
    part: 3,
    title: "MGK Teil 3 – Datum wählen",
    description: "Wählen Sie Ihren Wunschtermin für den dritten Kursteil.",
    dates: [
      {
        id: "mgk3-1",
        day: "Samstag",
        date: "25.04.2026",
        time: "08:00 – 12:00",
        location: "Wettingen",
        price: 160,
        spotsAvailable: 5,
      },
    ],
  },
  {
    part: 4,
    title: "MGK Teil 4 – Datum wählen",
    description: "Wählen Sie Ihren Wunschtermin für den vierten Kursteil.",
    dates: [
      {
        id: "mgk4-1",
        day: "Samstag",
        date: "09.05.2026",
        time: "13:00 – 17:00",
        location: "Wettingen",
        price: 160,
        spotsAvailable: 7,
      },
    ],
  },
];

export const faqData = [
  {
    question: "Was ist der Motorrad Grundkurs (MGK)?",
    answer: "Der Motorrad Grundkurs ist ein obligatorischer Kurs in der Schweiz, bestehend aus **4 Teilen** (je 4 Stunden). Er ist Voraussetzung für den Lernfahrausweis der Kategorie A1 oder A. Die Kursteile müssen **in der richtigen Reihenfolge** absolviert werden.",
  },
  {
    question: "Wie viel kostet der Grundkurs?",
    answer: "Jeder Kursteil kostet **CHF 160.00**. Der gesamte Grundkurs (4 Teile) kostet somit **CHF 640.00**.",
  },
  {
    question: "Wo finden die Kurse statt?",
    answer: "Unsere Motorrad Grundkurse finden in **Wettingen** statt.",
  },
  {
    question: "Welche Voraussetzungen brauche ich?",
    answer: "Du brauchst:\n- Einen gültigen **Lernfahrausweis** Kategorie A1 oder A\n- **Motorradhelm** (obligatorisch)\n- **Handschuhe und festes Schuhwerk**\n- Wetterangepasste Kleidung",
  },
  {
    question: "Kann ich einen Kursteil nachholen?",
    answer: "Ja, du kannst einzelne Kursteile an einem anderen Datum nachholen. Melde dich einfach bei uns und wir finden einen passenden Termin für dich.",
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
