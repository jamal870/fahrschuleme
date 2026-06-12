/**
 * ─── Tenant Configuration ────────────────────────────────────
 * 
 * Zentrale Konfigurationsdatei für alle fahrschulspezifischen Einstellungen.
 * Um dieses Projekt für eine andere Fahrschule zu verwenden, 
 * musst du nur diese Datei anpassen.
 */

export interface TenantConfig {
  // ── Branding ──
  brand: {
    name: string;
    tagline: string;
    /** Display-Name im Logo (z.B. "Drive" + "me") */
    logoText: { main: string; accent: string; sub: string };
    /** Falls ein Bild-Logo verwendet wird */
    logoUrl?: string;
  };

  // ── Kontakt ──
  contact: {
    phone: string;
    email: string;
    whatsappUrl: string;
    address: {
      street: string;
      detail: string;
      city: string;
    };
    openingHours: string;
  };

  // ── Standort ──
  location: {
    city: string;
    region: string;
  };

  // ── Instruktoren ──
  instructors: {
    id: string;
    name: string;
    initials: string;
    popular?: boolean;
  }[];

  // ── Buchung ──
  booking: {
    externalBookingUrl?: string;
    /** Bezahlmethoden */
    paymentMethods: {
      id: string;
      label: string;
      desc: string;
      icon: string;
    }[];
    /** Bankverbindung für Rechnung/Überweisung */
    bankDetails?: {
      accountHolder: string;
      bank: string;
      accountNumber: string;
      iban: string;
      bic: string;
    };
  };

  // ── Kurskategorien (Motorrad) ──
  categories: {
    id: string;
    title: string;
    age: string;
    desc: string;
  }[];

  // ── Preisliste ──
  pricing: {
    auto: { name: string; price: string; note?: string }[];
    autoAbos: { name: string; price: string; note?: string }[];
    motorrad: { name: string; price: string }[];
    motorradGrundkurs: { name: string; price: string }[];
    extras: { title: string; name: string; price: string; note?: string }[];
  };

  // ── Sicherheits-Section ──
  safetyPoints: {
    title: string;
    desc: string;
  }[];

  // ── Chatbot ──
  chatbot: {
    welcomeMessage: string;
    grundkursIntro: string;
    fahrstundenIntro: string;
    autoOpenDelayMs: number;
  };

  // ── Footer ──
  footer: {
    copyright: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// ── Drive Me Fahrschule – Standardkonfiguration ──────────────
// ═══════════════════════════════════════════════════════════════

export const tenantConfig: TenantConfig = {
  brand: {
    name: "Fahrschule me",
    tagline: "Erfahrene Instruktoren · Kleine Gruppen",
    logoText: { main: "Fahrschule", accent: "me", sub: "Wettingen" },
    logoUrl: "",
  },

  contact: {
    phone: "078 974 44 74",
    email: "info@l-me.ch",
    whatsappUrl: "https://wa.me/41789744474",
    address: {
      street: "Bahnhofstrasse 56",
      detail: "",
      city: "5430 Wettingen",
    },
    openingHours: "Mo–Sa 08:00–22:00",
  },

  location: {
    city: "Wettingen",
    region: "Wettingen / Baden",
  },

  instructors: [
    { id: "je", name: "Jamal Ettana", initials: "JE", popular: true },
  ],

  booking: {
    externalBookingUrl: "https://buchen.drive-me.ch/grundkurs-buchen",
    paymentMethods: [
      { id: "cash", label: "Barzahlung am Kurstag", desc: "Zahlung bar vor Ort am Kurstag.", icon: "💵" },
      { id: "card", label: "Online bezahlen (Twint/Karte)", desc: "Sichere Zahlung via Stripe.", icon: "💳" },
    ],
    bankDetails: {
      accountHolder: "Jamal Ettanaghmalti",
      bank: "PostFinance",
      accountNumber: "",
      iban: "CH5009000000167884324",
      bic: "POFICHBEXXX",
    },
  },

  categories: [
    { id: "am", title: "AM – Mofa", age: "Ab 15 Jahren", desc: "Mofa & Roller bis 50cm³, max. 45 km/h" },
    { id: "a1", title: "A1 – 125cc", age: "Ab 16 Jahren", desc: "125cm³, max. 11 kW – perfekter Einstieg" },
    { id: "a2", title: "A2 – 35kW", age: "Ab 18 Jahren", desc: "Bis 35 kW – nächste Stufe nach A1" },
    { id: "a", title: "A – Unbegrenzt", age: "Ab 20 Jahren", desc: "Unbegrenzte Leistung – Direktzugang" },
  ],

  pricing: {
    auto: [
      { name: "Admin Beitrag einmalig", price: "130.-", note: "Beinhaltet Administrationsgebühren und Vollkaskoversicherung" },
      { name: "Einzellektion (45min)", price: "95.-" },
      { name: "Doppellektion (2x45Min)", price: "190.-" },
      { name: "Auf Rechnung (45min)", price: "95.-" },
    ],
    autoAbos: [
      { name: "10er Abo", price: "900.-", note: "Kaufe 10 Fahrstunden und spare 50.- auf den Gesamtpreis" },
      { name: "20er Abo", price: "1760.-", note: "Kaufe 20 Fahrstunden und spare 150.- auf den Gesamtpreis" },
    ],
    motorrad: [
      { name: "Einzellektion (60Min)", price: "130.-" },
      { name: "Doppellektion (2x45Min)", price: "180.-" },
      { name: "Motorrad Vorschulung Doppellektion", price: "180.-" },
      { name: "Vor-Prüfungsfahrt inkl. Prüfung (120min)", price: "180.-" },
    ],
    motorradGrundkurs: [
      { name: "M1 (4h)", price: "160.-" },
      { name: "M2 (4h)", price: "160.-" },
      { name: "M3 (4h)", price: "160.-" },
      { name: "Motorrad Tageskurs (4h)", price: "200.-" },
    ],
    extras: [
      { title: "Verkehrskunde", name: "Verkehrskunde", price: "130.-", note: "Inkl. der obligatorischen VKU-Unterlagen" },
      { title: "Nothelfer", name: "Nothelfer", price: "130.-", note: "Inkl. Kursdokumentation und Nothelferausweis (6 Jahre gültig)" },
    ],
  },

  safetyPoints: [
    { title: "Passive Sicherheit", desc: "Technisch einwandfreies Motorrad, vollständige Schutzausrüstung mit Protektoren, Handschuhen, Stiefeln und geprüftem Helm." },
    { title: "Aktive Sicherheit", desc: "Entsteht durch deine Fahrtechnik, präzise Fahrzeugbeherrschung und die in unseren Kursen vermittelten Fähigkeiten." },
    { title: "Training", desc: "Diese Fahrtechniken trainieren wir im 12-Stunden-Grundkurs und in individuell abgestimmten Motorrad Fahrstunden." },
  ],

  chatbot: {
    welcomeMessage: "Hoi! 👋 Willkommen bei **Fahrschule me** in Wettingen.\nWie kann ich dir helfen?",
    grundkursIntro: "Super! Der Motorrad-Grundkurs bei Fahrschule me dauert 12 Stunden (3 Teile). Er ist gesetzlich vorgeschrieben für alle Kategorien.\n\nWelche Kategorie interessiert dich?",
    fahrstundenIntro: "Fahrstunden bei Fahrschule me – flexibel Mo–Sa von 08–22 Uhr.\n\nWas möchtest du buchen?",
    autoOpenDelayMs: 8000,
  },

  footer: {
    copyright: "© 2026 Fahrschule me. Alle Rechte vorbehalten.",
  },
};
