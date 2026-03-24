/**
 * ─── Beispiel-Konfiguration: Fahrschule Müller Zürich ────────
 * 
 * Diese Datei zeigt, wie einfach eine neue Fahrschule eingerichtet wird.
 * Einfach kopieren, anpassen und in tenant.ts als aktive Config setzen.
 */

import type { TenantConfig } from "./tenant";

export const tenantMueller: TenantConfig = {
  brand: {
    name: "Fahrschule Müller",
    tagline: "Dein Weg zum Führerschein · Seit 1998",
    logoText: { main: "Fahr", accent: "Müller", sub: "Fahrschule" },
  },

  contact: {
    phone: "044 123 45 67",
    email: "info@fahrschule-mueller.ch",
    whatsappUrl: "https://wa.me/41441234567",
    address: {
      street: "Bahnhofstrasse 42",
      detail: "3. OG, Büro 301",
      city: "8001 Zürich",
    },
    openingHours: "Mo–Fr 08:00–20:00, Sa 09:00–16:00",
  },

  location: {
    city: "Zürich",
    region: "Zürich / Winterthur",
  },

  instructors: [
    { id: "sm", name: "Stefan Müller", initials: "SM", popular: true },
    { id: "lk", name: "Laura Keller", initials: "LK" },
    { id: "mb", name: "Marco Brunner", initials: "MB" },
  ],

  booking: {
    paymentMethods: [
      { id: "card", label: "Online bezahlen (Stripe/Twint)", desc: "Sichere Onlinezahlung via Stripe Checkout.", icon: "💳" },
      { id: "cash", label: "Barzahlung am Kurstag", desc: "Zahlung bar vor Ort am Kurstag.", icon: "💵" },
      { id: "invoice", label: "Rechnung (10 Tage)", desc: "Zahlung per Überweisung innert 10 Tagen.", icon: "🧾" },
    ],
    bankDetails: {
      accountHolder: "Fahrschule Müller GmbH",
      bank: "ZKB – Zürcher Kantonalbank",
      accountNumber: "1100-1234.567",
      iban: "CH93 0070 0110 0012 3456 7",
      bic: "ZKBKCHZZ80A",
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
      { name: "Admin Beitrag einmalig", price: "150.-", note: "Inkl. Versicherung & Unterlagen" },
      { name: "Einzellektion (45min)", price: "98.-" },
      { name: "Doppellektion (2x45Min)", price: "190.-" },
    ],
    autoAbos: [
      { name: "10er Abo", price: "930.-", note: "Spare CHF 50.- auf den Gesamtpreis" },
      { name: "20er Abo", price: "1800.-", note: "Spare CHF 160.- auf den Gesamtpreis" },
    ],
    motorrad: [
      { name: "Einzellektion (60Min)", price: "140.-" },
      { name: "Doppellektion (2x45Min)", price: "190.-" },
    ],
    motorradGrundkurs: [
      { name: "M1 (4h)", price: "170.-" },
      { name: "M2 (4h)", price: "170.-" },
      { name: "M3 (4h)", price: "170.-" },
    ],
    extras: [
      { title: "Verkehrskunde", name: "VKU (4 Abende)", price: "200.-", note: "Inkl. Unterlagen" },
      { title: "Nothelfer", name: "Nothelferkurs", price: "140.-", note: "Inkl. Ausweis (6 Jahre gültig)" },
    ],
  },

  safetyPoints: [
    { title: "Passive Sicherheit", desc: "Vollständige Schutzausrüstung mit Protektoren, Handschuhen, Stiefeln und geprüftem Helm." },
    { title: "Aktive Sicherheit", desc: "Fahrtechnik und präzise Fahrzeugbeherrschung, vermittelt durch unsere erfahrenen Instruktoren." },
    { title: "Training", desc: "12-Stunden-Grundkurs und individuelle Fahrstunden – massgeschneidert auf dein Level." },
  ],

  chatbot: {
    welcomeMessage: "Grüezi! 👋 Willkommen bei **Fahrschule Müller** in Zürich.\nWie kann ich dir helfen?",
    grundkursIntro: "Super! Der Motorrad-Grundkurs bei uns dauert 12 Stunden (3 Teile à 4h).\n\nWelche Kategorie interessiert dich?",
    fahrstundenIntro: "Fahrstunden bei Fahrschule Müller – flexibel Mo–Sa.\n\nWas möchtest du buchen?",
    autoOpenDelayMs: 10000,
  },

  footer: {
    copyright: "© 2026 Fahrschule Müller GmbH. Alle Rechte vorbehalten.",
  },
};
