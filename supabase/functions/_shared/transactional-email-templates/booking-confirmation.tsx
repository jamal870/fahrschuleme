import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Drive me Fahrschule"
const LOGO_URL = "https://dspspshgnointeqxgnrw.supabase.co/storage/v1/object/public/email-assets/logo-lme-light.png"

interface EmailSettings {
  footer_signature?: string
  bank_info?: string
  mgk_greeting_extra?: string
  mgk_meeting_point?: string
  mgk_important_notes?: string
  mgk_cancellation_policy?: string
}

interface BookingConfirmationProps {
  firstName?: string
  lastName?: string
  address?: string
  birthDate?: string
  faNumber?: string
  phone?: string
  email?: string
  category?: string
  courses?: Array<{ part: number; date: string; time: string; location: string; price?: number }>
  totalPrice?: string
  paymentMethod?: string
  bookingId?: string
  bookingDate?: string
  settings?: EmailSettings
}

function formatCourseDate(d?: string) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString('de-CH', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch { return d }
}

const BookingConfirmationEmail = ({
  firstName,
  lastName,
  address,
  birthDate,
  faNumber,
  phone,
  email,
  category,
  courses = [],
  totalPrice,
  paymentMethod,
  bookingId,
  bookingDate,
  settings,
}: BookingConfirmationProps) => {
  // Sort ascending by Kursteil (Teil 1, 2, 3, ...) so the order is always
  // predictable for the customer, independent of the order the caller supplied.
  const sortedCourses = [...courses].sort((a, b) => Number(a.part ?? 0) - Number(b.part ?? 0))

  return (
    <Html lang="de" dir="ltr">
      <Head />
      <Preview>Buchungsbestätigung – {SITE_NAME}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Img src={LOGO_URL} alt="L me Fahrschule Wettingen" width="180" style={logoStyle} />
          </Section>
          <Section style={orangeBar} />

          <Heading style={h1}>Buchungsbestätigung</Heading>

          <Text style={text}>
            {firstName ? `Hallo ${firstName},` : 'Hallo,'}
          </Text>
          <Text style={text}>
            {settings?.mgk_greeting_extra || 'Danke für deine Bestellung!'}
          </Text>

          {/* --- Bestelldetails --- */}
          <Section style={card}>
            <Heading style={cardTitle}>Bestelldetails</Heading>
            {bookingId && <Text style={detailRow}><strong>Bestellnummer:</strong> {bookingId.slice(0, 8).toUpperCase()}</Text>}
            {bookingDate && <Text style={detailRow}><strong>Bestelldatum:</strong> {bookingDate}</Text>}
            {paymentMethod && <Text style={detailRow}><strong>Zahlungsmethode:</strong> {paymentMethod}</Text>}
            {totalPrice && <Text style={priceRow}><strong>Gesamt:</strong> CHF {totalPrice}</Text>}
          </Section>

          {/* --- Gebuchte Kurse --- */}
          {sortedCourses.length > 0 && (
            <Section style={card}>
              <Heading style={cardTitle}>Gebuchte Kurse</Heading>
              {sortedCourses.map((course, i) => (
                <Section key={i} style={courseBlock}>
                  <Text style={courseTitle}>MGK Teil {course.part}</Text>
                  <Text style={detailRow}><strong>Datum:</strong> {formatCourseDate(course.date)}</Text>
                  {course.time && <Text style={detailRow}><strong>Uhrzeit:</strong> {course.time}</Text>}
                  {course.location && <Text style={detailRow}><strong>Ort:</strong> {course.location}</Text>}
                  {course.price !== undefined && course.price !== null && (
                    <Text style={detailRow}><strong>Preis:</strong> CHF {Number(course.price).toFixed(2)}</Text>
                  )}
                </Section>
              ))}
            </Section>
          )}

          <Text style={smallText}>
            Sie erhalten Ihre Karten in einem separaten E-Mail.
          </Text>

          <Hr style={divider} />

          {/* --- Teilnahme-Informationen --- */}
          <Section style={card}>
            <Heading style={cardTitle}>Informationen für die Teilnahme am Motorradkurs</Heading>
            <Text style={bulletText}>• Sämtliche Fahrlektionen und Kurse müssen mit dem eigenen Motorrad absolviert werden</Text>
            <Text style={bulletText}>• Das eigene Motorrad muss in einem technisch einwandfreien Zustand sein</Text>
            <Text style={bulletText}>• Profiltiefe der Reifen: mehr als 1,6 mm über die gesamte Lauffläche</Text>
            <Text style={bulletText}>• Motorrad muss aufgetankt sein</Text>
            <Text style={bulletText}>• Bekleidung muss einer üblichen Motorradbekleidung entsprechen (inkl. Protektoren für Knie, Ellenbogen und Schulter) sowie geeignete Schuhe/Stiefel, Handschuhe und Helm</Text>
            <Text style={bulletText}>• Zusätzlich ist eine Regenschutzbekleidung (z.B. Overall) für schlechtes Wetter mitzuführen</Text>
            <Text style={bulletText}>• L-Schild muss am Motorrad angebracht sein</Text>
            <Text style={bulletText}>• Fahrschüler muss sich sicher im Verkehr bewegen können</Text>
          </Section>

          <Text style={text}>
            Der Kurs wird von der Fahrschule Drive Me durchgeführt.{'\n'}
            Den Kursleiter findest du in der separaten Karten-E-Mail.
          </Text>

          {/* --- Treffpunkt --- */}
          <Section style={card}>
            <Heading style={cardTitle}>Treffpunkt</Heading>
            <Text style={detailRow}>
              {settings?.mgk_meeting_point || 'Für Kurse in Wettingen:\nLandstrasse 99\nCenterpassage\nOttos Rampe\n5430 Wettingen'}
            </Text>
          </Section>

          {/* --- Wichtig --- */}
          <Section style={importantCard}>
            <Heading style={cardTitleImportant}>⚠️ Wichtig</Heading>
            <Text style={importantText}>
              {settings?.mgk_important_notes || 'Am ersten Kurstag den Personalausweis (ID, Pass) und Lernfahrausweis mitbringen!\nKursgebühren sind am ersten Tag zu bezahlen.\nZahle Bar oder mit Karte vor Ort.'}
            </Text>
          </Section>

          <Text style={smallText}>
            {settings?.mgk_cancellation_policy || 'Diese Anmeldung ist verbindlich: Umbuchungen bzw. Stornierungen sind bis 5 Tage vor Kursbeginn schriftlich an info@l-me.ch möglich, danach wird die volle Kursgebühr in Rechnung gestellt.'}
          </Text>

          {/* --- Bankverbindung --- */}
          <Section style={card}>
            <Heading style={cardTitle}>Unsere Bankverbindung</Heading>
            <Text style={detailRow}>
              {settings?.bank_info || 'Jamal Ettanaghmalti\nBank: PostFinance\nIBAN: CH5009000000167884324\nBIC: POFICHBEXXX'}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* --- Rechnungsadresse --- */}
          <Section style={card}>
            <Heading style={cardTitle}>Rechnungsadresse</Heading>
            {firstName && lastName && <Text style={detailRow}><strong>Name:</strong> {firstName} {lastName}</Text>}
            {address && <Text style={detailRow}><strong>Adresse:</strong> {address}</Text>}
            {birthDate && <Text style={detailRow}><strong>Geburtstag:</strong> {birthDate}</Text>}
            {category && <Text style={detailRow}><strong>Kategorie:</strong> {category}</Text>}
            {faNumber && <Text style={detailRow}><strong>FABER Nr.:</strong> {faNumber}</Text>}
            {phone && <Text style={detailRow}><strong>Telefon:</strong> {phone}</Text>}
            {email && <Text style={detailRow}><strong>E-Mail:</strong> {email}</Text>}
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            {settings?.footer_signature || `Freundliche Grüsse,\nDas ${SITE_NAME} Team`}
          </Text>
          <Text style={footerBrand}>{SITE_NAME}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BookingConfirmationEmail,
  subject: 'Buchungsbestätigung – Drive me Fahrschule',
  displayName: 'Buchungsbestätigung',
  previewData: {
    firstName: 'Alana',
    lastName: 'Shania',
    address: 'Schulstrasse 6, 5412 Vogelsang AG',
    birthDate: '16.03.1999',
    faNumber: '0008.272.931',
    phone: '0786006004',
    email: 'alana.shania@gmx.ch',
    category: 'A2',
    courses: [
      { part: 3, date: '2026-10-27', time: '13:00', location: 'Wettingen', price: 150 },
      { part: 1, date: '2026-09-27', time: '17:00', location: 'Wettingen', price: 150 },
      { part: 2, date: '2026-09-28', time: '13:00', location: 'Wettingen', price: 150 },
    ],
    totalPrice: '450.00',
    paymentMethod: 'Direkte Banküberweisung oder Bar vor Ort',
    bookingId: 'a1b2c3d4-e5f6-7890',
    bookingDate: '24. September 2024',
  },
} satisfies TemplateEntry

// ── Styles — shared design system (navy header, orange accent, light cards) ──
// Kept in sync with admin-booking-notification.tsx / course-reminder.tsx so the
// customer-facing confirmation looks like every other transactional email.
const main = { backgroundColor: '#f4f4f5', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px' }
const headerSection = { backgroundColor: '#1a2344', padding: '24px 25px', borderRadius: '8px 8px 0 0', marginBottom: '4px', textAlign: 'center' as const }
const logoStyle = { margin: '0 auto' }
const orangeBar = { backgroundColor: '#e8501a', height: '4px', borderRadius: '2px', margin: '0 0 24px' }

const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '0 0 8px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 20px', whiteSpace: 'pre-line' as const }
const bulletText = { fontSize: '13px', color: '#3a3a3a', lineHeight: '1.5', margin: '0 0 4px' }
const smallText = { fontSize: '12px', color: '#777777', lineHeight: '1.6', margin: '0 0 16px', fontStyle: 'italic' as const }

const card = { backgroundColor: '#fafafa', borderRadius: '6px', padding: '16px 18px', margin: '0 0 12px', border: '1px solid #eeeeee' }
const cardTitle = { fontSize: '14px', fontWeight: '700' as const, color: '#e8501a', margin: '0 0 10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const detailRow = { fontSize: '13px', color: '#3a3a3a', lineHeight: '1.6', margin: '0 0 4px', whiteSpace: 'pre-line' as const }
const priceRow = { fontSize: '15px', color: '#1a1a1a', lineHeight: '1.6', margin: '4px 0 0', fontWeight: '600' as const }
const courseBlock = { padding: '10px 12px', margin: '0 0 8px', backgroundColor: '#ffffff', border: '1px solid #eeeeee', borderLeft: '3px solid #e8501a', borderRadius: '4px' }
const courseTitle = { fontSize: '13px', fontWeight: '700' as const, color: '#1a2344', margin: '0 0 6px', textTransform: 'uppercase' as const, letterSpacing: '0.3px' }

const importantCard = { backgroundColor: '#fff5f5', border: '1px solid #f5c6c6', borderRadius: '6px', padding: '16px 18px', margin: '0 0 12px' }
const cardTitleImportant = { fontSize: '14px', fontWeight: '700' as const, color: '#c53030', margin: '0 0 10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const importantText = { fontSize: '13px', color: '#c53030', lineHeight: '1.6', margin: '0', fontWeight: '600' as const, whiteSpace: 'pre-line' as const }

const divider = { borderColor: '#e5e5e5', margin: '20px 0 16px' }
const footer = { fontSize: '13px', color: '#8a9aaa', margin: '0', whiteSpace: 'pre-line' as const }
const footerBrand = { fontSize: '11px', color: '#e8501a', margin: '2px 0 0', fontWeight: '600' as const }
