import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Drive me Fahrschule"
const LOGO_URL = "https://dspspshgnointeqxgnrw.supabase.co/storage/v1/object/public/email-assets/drive-me-logo-new.png"

interface CourseDetail {
  part?: number | string
  date?: string
  time?: string
  location?: string
  price?: number | string
}

interface AdminBookingNotificationProps {
  bookingId?: string
  bookingType?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  birthDate?: string
  faNumber?: string
  paymentMethod?: string
  totalPrice?: string
  bookingDate?: string
  items?: string
  courses?: CourseDetail[]
}

function formatCourseDate(d?: string) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString('de-CH', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch { return d }
}

const AdminBookingNotificationEmail = ({
  bookingId,
  bookingType,
  firstName,
  lastName,
  email,
  phone,
  address,
  birthDate,
  faNumber,
  paymentMethod,
  totalPrice,
  bookingDate,
  items,
  courses,
}: AdminBookingNotificationProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Neue Buchung eingegangen – {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with logo and orange accent bar */}
        <Section style={headerSection}>
          <Img src={LOGO_URL} alt="Drive me Fahrschule" width="180" style={logoStyle} />
        </Section>
        <Section style={orangeBar} />

        <Heading style={h1}>📋 Neue Buchung eingegangen</Heading>

        {paymentMethod && paymentMethod.toLowerCase().includes('stripe') || paymentMethod && paymentMethod.toLowerCase().includes('online') ? (
          <Section style={pendingPaymentBanner}>
            <Text style={pendingPaymentText}>⏳ Zahlung ausstehend – Kunde wurde zur Online-Zahlung weitergeleitet. Buchung wird erst nach erfolgreicher Zahlung bestätigt.</Text>
          </Section>
        ) : (
          <Text style={text}>
            Es ist eine neue Buchung über die Website eingegangen.
          </Text>
        )}

        {/* Kundendaten Card */}
        <Section style={card}>
          <Heading style={cardTitle}>Kundendaten</Heading>
          {firstName && lastName && <Text style={detailRow}><strong>Name:</strong> {firstName} {lastName}</Text>}
          {email && <Text style={detailRow}><strong>E-Mail:</strong> {email}</Text>}
          {phone && <Text style={detailRow}><strong>Telefon:</strong> {phone}</Text>}
          {address && <Text style={detailRow}><strong>Adresse:</strong> {address}</Text>}
          {birthDate && <Text style={detailRow}><strong>Geburtstag:</strong> {birthDate}</Text>}
          {faNumber && <Text style={detailRow}><strong>FABER Nr.:</strong> {faNumber}</Text>}
        </Section>

        {/* Buchungsdetails Card */}
        <Section style={card}>
          <Heading style={cardTitle}>Buchungsdetails</Heading>
          {bookingId && <Text style={detailRow}><strong>Bestellnummer:</strong> {bookingId.slice(0, 8).toUpperCase()}</Text>}
          {bookingDate && <Text style={detailRow}><strong>Datum:</strong> {bookingDate}</Text>}
          {bookingType && <Text style={detailRow}><strong>Typ:</strong> {bookingType === 'grundkurs' ? 'Motorrad-Grundkurs (MGK)' : 'Fahrstunde'}</Text>}
          {paymentMethod && <Text style={detailRow}><strong>Zahlungsmethode:</strong> {paymentMethod}</Text>}
          {totalPrice && <Text style={priceRow}><strong>Betrag:</strong> CHF {totalPrice}</Text>}
        </Section>

        {/* Gebuchte Kurse (Detail) */}
        {courses && courses.length > 0 && (
          <Section style={card}>
            <Heading style={cardTitle}>Gebuchte Kurse</Heading>
            {courses.map((c, i) => (
              <Section key={i} style={courseBlock}>
                <Text style={courseTitle}>
                  {bookingType === 'grundkurs' ? `MGK Teil ${c.part ?? ''}` : `Teil ${c.part ?? ''}`}
                </Text>
                {c.date && <Text style={detailRow}><strong>Datum:</strong> {formatCourseDate(c.date)}</Text>}
                {c.time && <Text style={detailRow}><strong>Uhrzeit:</strong> {c.time}</Text>}
                {c.location && <Text style={detailRow}><strong>Ort:</strong> {c.location}</Text>}
                {c.price !== undefined && c.price !== null && c.price !== '' && (
                  <Text style={detailRow}><strong>Preis:</strong> CHF {Number(c.price).toFixed(2)}</Text>
                )}
              </Section>
            ))}
          </Section>
        )}

        {/* Gebuchte Leistungen (Fallback / Zusammenfassung) */}
        {items && (!courses || courses.length === 0) && (
          <Section style={card}>
            <Heading style={cardTitle}>Gebuchte Leistungen</Heading>
            <Text style={detailRow}>{items}</Text>
          </Section>
        )}

        <Hr style={divider} />

        {/* Footer */}
        <Text style={footer}>
          Diese E-Mail wurde automatisch generiert.
        </Text>
        <Text style={footerBrand}>{SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminBookingNotificationEmail,
  subject: (data: Record<string, any>) => {
    const isOnline = data.paymentMethod && (data.paymentMethod.toLowerCase().includes('stripe') || data.paymentMethod.toLowerCase().includes('online'));
    const prefix = isOnline ? '⏳ Zahlung ausstehend' : 'Neue Buchung';
    return `${prefix}: ${data.firstName || ''} ${data.lastName || ''} – ${data.bookingType === 'grundkurs' ? 'MGK' : 'Fahrstunde'}`;
  },
  displayName: 'Admin-Buchungsbenachrichtigung',
  // Admin recipients are passed explicitly by the caller (see create-booking / stripe-webhook)
  previewData: {
    bookingId: 'a1b2c3d4-e5f6-7890',
    bookingType: 'grundkurs',
    firstName: 'Alana',
    lastName: 'Shania',
    email: 'alana.shania@gmx.ch',
    phone: '0786006004',
    address: 'Schulstrasse 6, 5412 Vogelsang AG',
    birthDate: '16.03.1999',
    faNumber: '0008.272.931',
    paymentMethod: 'Direkte Banküberweisung oder Bar vor Ort',
    totalPrice: '450.00',
    bookingDate: '24. September 2024',
    items: 'MGK Teil 1, MGK Teil 2',
    courses: [
      { part: 1, date: '2024-09-27', time: '17:00', location: 'Wettingen', price: 225 },
      { part: 2, date: '2024-09-28', time: '13:00', location: 'Wettingen', price: 225 },
    ],
  },
} satisfies TemplateEntry

// ── Styles ──
const main = { backgroundColor: '#f4f4f5', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px' }
const headerSection = { backgroundColor: '#1a2344', padding: '24px 25px', borderRadius: '8px 8px 0 0', marginBottom: '4px', textAlign: 'center' as const }
const logoStyle = { margin: '0 auto' }
const orangeBar = { backgroundColor: '#e8501a', height: '4px', borderRadius: '2px', margin: '0 0 24px' }

const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '0 0 8px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 20px' }

const card = { backgroundColor: '#fafafa', borderRadius: '6px', padding: '16px 18px', margin: '0 0 12px', border: '1px solid #eeeeee' }
const cardTitle = { fontSize: '14px', fontWeight: '700' as const, color: '#e8501a', margin: '0 0 10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const detailRow = { fontSize: '13px', color: '#3a3a3a', lineHeight: '1.6', margin: '0 0 4px' }
const priceRow = { fontSize: '15px', color: '#1a1a1a', lineHeight: '1.6', margin: '4px 0 0', fontWeight: '600' as const }

const pendingPaymentBanner = { backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', padding: '12px 16px', margin: '0 0 20px' }
const pendingPaymentText = { fontSize: '13px', color: '#856404', lineHeight: '1.5', margin: '0', fontWeight: '600' as const }

const divider = { borderColor: '#e5e5e5', margin: '20px 0 16px' }
const footer = { fontSize: '11px', color: '#999999', margin: '0', textAlign: 'center' as const }
const footerBrand = { fontSize: '11px', color: '#e8501a', margin: '2px 0 0', textAlign: 'center' as const, fontWeight: '600' as const }
