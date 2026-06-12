/**
 * PDF Generator – Drive Me Fahrschule
 * Generates branded PDFs (invoice, confirmation, reminder, receipt)
 * using tenant config for White-Label support.
 */

import jsPDF from "jspdf";
import { tenantConfig } from "@/config/tenant";

// ── Brand Colors (from CSS vars: --primary: 18 80% 50% ≈ #E8501A) ──
const ORANGE = [232, 80, 26] as const;
const DARK = [26, 26, 26] as const;
const GRAY = [100, 110, 120] as const;
const LIGHT_GRAY = [200, 205, 210] as const;
const WHITE = [255, 255, 255] as const;
const BG_WARM = [252, 250, 247] as const;

interface BookingData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  fa_number: string;
  booking_type: string;
  total_price: number;
  status: string;
  payment_method: string;
  created_at: string;
  items?: string[];
}

// ── Shared Helpers ──

function addLogo(doc: jsPDF) {
  const { logoText, name } = tenantConfig.brand;
  // "DRIVE" in bold
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...DARK);
  doc.text(logoText.main.toUpperCase(), 20, 25);

  // "me" in orange (italic simulation)
  const mainWidth = doc.getTextWidth(logoText.main.toUpperCase());
  doc.setFont("helvetica", "normal");
  doc.setFontSize(20);
  doc.setTextColor(...ORANGE);
  doc.text(logoText.accent, 20 + mainWidth + 1, 25);

  // "Fahrschule" subtitle
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(logoText.sub, 20, 31);

  return 35;
}

function addOrangeBar(doc: jsPDF, y: number, width: number = 170) {
  doc.setFillColor(...ORANGE);
  doc.rect(20, y, width, 1.5, "F");
  return y + 6;
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ORANGE);
  doc.text(title.toUpperCase(), 20, y);
  return y + 7;
}

function addKeyValue(doc: jsPDF, key: string, value: string, y: number, xKey = 20, xVal = 75): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(key, xKey, y);
  doc.setTextColor(...DARK);
  doc.text(value, xVal, y);
  return y + 5.5;
}

function addFooter(doc: jsPDF) {
  const pageH = doc.internal.pageSize.getHeight();
  const { contact, brand } = tenantConfig;

  // Footer bar
  doc.setFillColor(...ORANGE);
  doc.rect(0, pageH - 18, 210, 18, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...WHITE);
  doc.text(
    `${brand.name} · ${contact.address.street}, ${contact.address.city} · ${contact.phone} · ${contact.email}`,
    105, pageH - 10, { align: "center" }
  );
  doc.text(tenantConfig.footer.copyright, 105, pageH - 5, { align: "center" });
}

function addBankDetails(doc: jsPDF, y: number): number {
  const bank = tenantConfig.booking.bankDetails;
  if (!bank) return y;

  y = addSectionTitle(doc, "Bankverbindung", y);
  y = addKeyValue(doc, "Kontoinhaber:", bank.accountHolder, y);
  y = addKeyValue(doc, "Bank:", bank.bank, y);
  y = addKeyValue(doc, "IBAN:", bank.iban, y);
  y = addKeyValue(doc, "BIC:", bank.bic, y);
  return y + 4;
}

function addCustomerBlock(doc: jsPDF, data: BookingData, y: number): number {
  y = addSectionTitle(doc, "Rechnungsadresse", y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(`${data.first_name} ${data.last_name}`, 20, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  if (data.address) { doc.text(data.address, 20, y); y += 5; }
  if (data.email) { doc.text(data.email, 20, y); y += 5; }
  if (data.phone) { doc.text(data.phone, 20, y); y += 5; }
  return y + 4;
}

function addItemsTable(doc: jsPDF, data: BookingData, y: number): number {
  // Table header
  doc.setFillColor(...ORANGE);
  doc.roundedRect(20, y, 170, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text("Beschreibung", 24, y + 5.5);
  doc.text("Betrag", 170, y + 5.5, { align: "right" });
  y += 12;

  // Table row
  doc.setFillColor(...BG_WARM);
  doc.rect(20, y - 3, 170, 8, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);

  const typeLabel = data.booking_type === "grundkurs" ? "Motorrad Grundkurs" :
    data.booking_type === "fahrstunden" ? "Fahrstunde" : data.booking_type;
  doc.text(typeLabel, 24, y + 2);
  doc.text(`CHF ${data.total_price.toFixed(2)}`, 170, y + 2, { align: "right" });
  y += 10;

  // Items
  if (data.items && data.items.length > 0) {
    data.items.forEach((item) => {
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text(`· ${item}`, 28, y + 2);
      y += 6;
    });
  }

  // Total line
  doc.setDrawColor(...LIGHT_GRAY);
  doc.line(20, y, 190, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text("Gesamt:", 120, y);
  doc.setTextColor(...ORANGE);
  doc.text(`CHF ${data.total_price.toFixed(2)}`, 170, y, { align: "right" });

  return y + 10;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-CH", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function docNumber(prefix: string, id: string, date: string): string {
  const d = new Date(date);
  const yy = d.getFullYear().toString().slice(2);
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${prefix}-${yy}${mm}-${id.slice(0, 6).toUpperCase()}`;
}

// ═══════════════════════════════════════════════════════════════
// ── 1. Rechnung (Invoice) ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export function generateInvoice(data: BookingData): jsPDF {
  const doc = new jsPDF();
  let y = addLogo(doc);
  y = addOrangeBar(doc, y);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text("RECHNUNG", 20, y + 4);
  y += 12;

  // Meta
  const invoiceNr = docNumber("RE", data.id, data.created_at);
  y = addKeyValue(doc, "Rechnungsnr.:", invoiceNr, y);
  y = addKeyValue(doc, "Datum:", formatDate(data.created_at), y);
  y = addKeyValue(doc, "Zahlungsart:", data.payment_method, y);
  y += 4;

  y = addCustomerBlock(doc, data, y);
  y = addItemsTable(doc, data, y);
  y = addBankDetails(doc, y);

  // Payment note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Zahlbar innert 10 Tagen. Bei Fragen kontaktieren Sie uns unter " + tenantConfig.contact.email, 20, y);

  addFooter(doc);
  return doc;
}

// ═══════════════════════════════════════════════════════════════
// ── 2. Buchungsbestätigung (Booking Confirmation PDF) ────────
// ═══════════════════════════════════════════════════════════════

export function generateBookingConfirmation(data: BookingData): jsPDF {
  const doc = new jsPDF();
  let y = addLogo(doc);
  y = addOrangeBar(doc, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text("BUCHUNGSBESTÄTIGUNG", 20, y + 4);
  y += 12;

  const nr = docNumber("BK", data.id, data.created_at);
  y = addKeyValue(doc, "Bestätigungs-Nr.:", nr, y);
  y = addKeyValue(doc, "Datum:", formatDate(data.created_at), y);
  y = addKeyValue(doc, "Status:", data.status === "confirmed" ? "Bestätigt ✓" : data.status, y);
  y += 4;

  y = addCustomerBlock(doc, data, y);
  y = addItemsTable(doc, data, y);

  // Meeting point
  y = addSectionTitle(doc, "Treffpunkt", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text("Bahnhof Wettingen", 20, y);
  y += 8;

  // Important note
  doc.setFillColor(255, 245, 245);
  doc.roundedRect(20, y, 170, 16, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(197, 48, 48);
  doc.text("⚠ WICHTIG", 24, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Stornierungen/Umbuchungen bis 24h vorher schriftlich an " + tenantConfig.contact.email, 24, y + 11);

  addFooter(doc);
  return doc;
}

// ═══════════════════════════════════════════════════════════════
// ── 3. Mahnung (Payment Reminder) ────────────────────────────
// ═══════════════════════════════════════════════════════════════

export function generateReminder(data: BookingData, reminderLevel: 1 | 2 | 3 = 1): jsPDF {
  const doc = new jsPDF();
  let y = addLogo(doc);
  y = addOrangeBar(doc, y);

  const levelText = reminderLevel === 1 ? "1. ZAHLUNGSERINNERUNG" :
    reminderLevel === 2 ? "2. MAHNUNG" : "LETZTE MAHNUNG";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(reminderLevel >= 2 ? 197 : DARK[0], reminderLevel >= 2 ? 48 : DARK[1], reminderLevel >= 2 ? 48 : DARK[2]);
  doc.text(levelText, 20, y + 4);
  y += 12;

  const nr = docNumber("MA", data.id, data.created_at);
  y = addKeyValue(doc, "Mahnung-Nr.:", nr, y);
  y = addKeyValue(doc, "Urspr. Rechnung:", docNumber("RE", data.id, data.created_at), y);
  y = addKeyValue(doc, "Rechnungsdatum:", formatDate(data.created_at), y);
  y = addKeyValue(doc, "Mahndatum:", formatDate(new Date().toISOString()), y);
  y += 4;

  y = addCustomerBlock(doc, data, y);

  // Reminder text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  const reminderTexts = [
    `Guten Tag ${data.first_name} ${data.last_name},`,
    "",
    reminderLevel === 1
      ? "wir möchten Sie freundlich daran erinnern, dass die folgende Rechnung noch offen ist."
      : reminderLevel === 2
        ? "trotz unserer Zahlungserinnerung ist die folgende Rechnung weiterhin unbezahlt."
        : "dies ist unsere letzte Mahnung. Bei ausbleibender Zahlung behalten wir uns weitere Schritte vor.",
  ];
  reminderTexts.forEach((line) => {
    doc.text(line, 20, y);
    y += line === "" ? 3 : 5.5;
  });
  y += 4;

  y = addItemsTable(doc, data, y);

  const fees = reminderLevel === 1 ? 0 : reminderLevel === 2 ? 10 : 25;
  if (fees > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(`Mahngebühr: CHF ${fees.toFixed(2)}`, 120, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...ORANGE);
    doc.text(`Fällig: CHF ${(data.total_price + fees).toFixed(2)}`, 170, y, { align: "right" });
    y += 10;
  }

  y = addBankDetails(doc, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Bitte überweisen Sie den Betrag innert ${reminderLevel === 3 ? "5" : "10"} Tagen.`, 20, y);

  addFooter(doc);
  return doc;
}

// ═══════════════════════════════════════════════════════════════
// ── 4. Quittung (Receipt for cash payments) ──────────────────
// ═══════════════════════════════════════════════════════════════

export function generateReceipt(data: BookingData): jsPDF {
  const doc = new jsPDF();
  let y = addLogo(doc);
  y = addOrangeBar(doc, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text("QUITTUNG", 20, y + 4);
  y += 12;

  const nr = docNumber("QU", data.id, data.created_at);
  y = addKeyValue(doc, "Quittungs-Nr.:", nr, y);
  y = addKeyValue(doc, "Datum:", formatDate(data.created_at), y);
  y = addKeyValue(doc, "Zahlungsart:", "Barzahlung", y);
  y += 4;

  y = addCustomerBlock(doc, data, y);
  y = addItemsTable(doc, data, y);

  // Paid stamp effect
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(34, 139, 34);
  doc.text("BEZAHLT ✓", 105, y + 5, { align: "center" });
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Diese Quittung bestätigt den Erhalt der oben genannten Zahlung.", 20, y);
  y += 5;
  doc.text(`Ausgestellt von ${tenantConfig.brand.name}`, 20, y);

  addFooter(doc);
  return doc;
}

// ═══════════════════════════════════════════════════════════════
// ── 5. Teilnehmerliste (Course Participant List) ─────────────
// ═══════════════════════════════════════════════════════════════

export interface ParticipantCourseInfo {
  part: number;
  date: string;
  day: string;
  time: string;
  location: string;
  instructor?: string | null;
  instructor_number?: string | null;
}

export interface Participant {
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  fa_number: string;
  payment_method: string;
  paid: boolean;
  signature?: string | null;
  present?: boolean;
}

export type ParticipantFilter = "all" | "paid" | "unpaid";

export function generateParticipantList(
  course: ParticipantCourseInfo,
  participants: Participant[],
  filter: ParticipantFilter = "all"
): jsPDF {
  const filtered =
    filter === "paid" ? participants.filter((p) => p.paid)
    : filter === "unpaid" ? participants.filter((p) => !p.paid)
    : participants;
  const filterLabel =
    filter === "paid" ? "Nur bezahlte" :
    filter === "unpaid" ? "Nur offene" : "Alle";

  const doc = new jsPDF({ orientation: "landscape" });
  let y = addLogo(doc);
  y = addOrangeBar(doc, y, 257);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text("TEILNEHMERLISTE / ANWESENHEIT", 20, y + 4);
  y += 12;

  // Two-column header
  const leftX = 20;
  const rightX = 160;
  let ly = y;
  let ry = y;
  ly = addKeyValue(doc, "Kurs:", `MGK Teil ${course.part}`, ly, leftX, leftX + 25);
  ly = addKeyValue(doc, "Datum:", `${course.day}, ${course.date}`, ly, leftX, leftX + 25);
  ly = addKeyValue(doc, "Zeit:", course.time, ly, leftX, leftX + 25);
  ry = addKeyValue(doc, "Ort:", course.location, ry, rightX, rightX + 30);
  if (course.instructor) ry = addKeyValue(doc, "Fahrlehrer:", course.instructor, ry, rightX, rightX + 30);
  if (course.instructor_number) ry = addKeyValue(doc, "Fahrlehrer-Nr.:", course.instructor_number, ry, rightX, rightX + 30);
  ry = addKeyValue(doc, "Anzahl:", `${filtered.length} von ${participants.length} Teilnehmer`, ry, rightX, rightX + 30);
  ry = addKeyValue(doc, "Filter:", filterLabel, ry, rightX, rightX + 30);
  y = Math.max(ly, ry) + 4;

  // Landscape page width ~ 297, usable 20..277 (w=257)
  const cols = [
    { label: "#", x: 20, w: 8 },
    { label: "Name", x: 28, w: 54 },
    { label: "Telefon", x: 82, w: 28 },
    { label: "Geb.", x: 110, w: 20 },
    { label: "FA-Nr.", x: 130, w: 24 },
    { label: "Zahlart", x: 154, w: 22 },
    { label: "Status", x: 176, w: 18 },
    { label: "Anw.", x: 194, w: 12 },
    { label: "Unterschrift", x: 206, w: 71 },
  ];

  // Header bar
  doc.setFillColor(...ORANGE);
  doc.rect(20, y, 257, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  cols.forEach((c) => doc.text(c.label, c.x + 1, y + 5.5));
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  const formatPaymentMethod = (pm: string): string => {
    const v = (pm || "").toLowerCase();
    if (v.includes("bar")) return "Bar";
    if (v.includes("twint")) return "TWINT";
    if (v.includes("stripe") || v.includes("karte") || v.includes("card")) return "Karte";
    if (v.includes("überweis") || v.includes("uberweis") || v.includes("rechnung") || v.includes("bank")) return "Überw.";
    return pm || "–";
  };

  const MIN_ROW_H = 16;
  const LINE_H = 3.6;
  const PAGE_BOTTOM = 195; // landscape A4 = 210mm, leave room for footer

  // Wrap text safely; jsPDF splitTextToSize requires the current font set
  const wrap = (text: string, maxW: number): string[] => {
    if (!text) return [""];
    return doc.splitTextToSize(text, maxW - 2) as string[];
  };

  filtered.forEach((p, i) => {
    // Pre-compute wrapped text per text-column so we know the row height
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const wrapped: Record<number, string[]> = {
      1: wrap(`${p.first_name} ${p.last_name}`.trim(), cols[1].w),
      2: wrap(p.phone || "–", cols[2].w),
      3: wrap(p.birth_date || "–", cols[3].w),
      4: wrap(p.fa_number || "–", cols[4].w),
      5: wrap(formatPaymentMethod(p.payment_method), cols[5].w),
      6: wrap(p.paid ? "Bezahlt" : "Offen", cols[6].w),
    };
    const maxLines = Math.max(1, ...Object.values(wrapped).map((l) => l.length));
    const rowH = Math.max(MIN_ROW_H, 6 + maxLines * LINE_H + 4);

    // Page break before drawing this row
    if (y + rowH > PAGE_BOTTOM) {
      addFooter(doc);
      doc.addPage();
      y = 20;
      // redraw column header on new page
      doc.setFillColor(...ORANGE);
      doc.rect(20, y, 257, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...WHITE);
      cols.forEach((c) => doc.text(c.label, c.x + 1, y + 5.5));
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
    }

    // Zebra background
    if (i % 2 === 0) {
      doc.setFillColor(...BG_WARM);
      doc.rect(20, y, 257, rowH, "F");
    }
    // Column separators + bottom border
    doc.setDrawColor(...LIGHT_GRAY);
    cols.forEach((c) => doc.line(c.x, y, c.x, y + rowH));
    doc.line(277, y, 277, y + rowH);
    doc.line(20, y + rowH, 277, y + rowH);

    // Vertical centering: start at top with padding, account for line count
    const textBlockH = maxLines * LINE_H;
    const topPad = (rowH - textBlockH) / 2 + 2.8;

    const drawLines = (colIdx: number, lines: string[], color: readonly [number, number, number], bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...color);
      lines.forEach((ln, k) => {
        doc.text(ln, cols[colIdx].x + 1, y + topPad + k * LINE_H);
      });
    };

    // # (single line, vertically centered)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text(String(i + 1), cols[0].x + 2, y + rowH / 2 + 1.5);

    drawLines(1, wrapped[1], DARK);
    drawLines(2, wrapped[2], DARK);
    drawLines(3, wrapped[3], DARK);
    drawLines(4, wrapped[4], DARK);
    drawLines(5, wrapped[5], DARK);
    drawLines(6, wrapped[6], p.paid ? [34, 139, 34] as const : [197, 48, 48] as const, true);

    // Attendance checkbox (vertically centered)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    const boxSize = 5;
    const boxX = cols[7].x + (cols[7].w - boxSize) / 2;
    const boxY = y + (rowH - boxSize) / 2;
    doc.setDrawColor(...DARK);
    doc.rect(boxX, boxY, boxSize, boxSize);
    if (p.present) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(34, 139, 34);
      doc.text("X", boxX + 0.8, boxY + 4.4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...DARK);
    }

    // Signature image
    if (p.signature) {
      try {
        doc.addImage(p.signature, "PNG", cols[8].x + 2, y + 1.5, cols[8].w - 4, rowH - 3);
      } catch (_e) { /* ignore invalid image */ }
    }

    y += rowH;
  });

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Mit der Unterschrift wird die Teilnahme am o.g. Kurstag bestätigt.", 20, y);

  addFooter(doc);
  return doc;
}

// ── Download Helper ──

export function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename);
}
