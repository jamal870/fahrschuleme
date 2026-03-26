import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Drive me Fahrschule"

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
}: BookingConfirmationProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Buchungsbestätigung – {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src="https://dspspshgnointeqxgnrw.supabase.co/storage/v1/object/public/email-assets/drive-me-logo-new.png" alt="Drive me Fahrschule" width="220" style={logoStyle} />
        </Section>

        <Heading style={h1}>Buchungsbestätigung</Heading>

        <Text style={text}>
          {firstName ? `Hallo ${firstName},` : 'Hallo,'}
        </Text>

        <Text style={text}>
          Danke für deine Bestellung!
        </Text>

        <Hr style={divider} />

        {/* --- Teilnahme-Informationen --- */}
        <Heading style={h2}>Informationen für die Teilnahme am Motorradkurs</Heading>

        <Section style={infoSection}>
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

        <Hr style={divider} />

        {/* --- Treffpunkt --- */}
        <Heading style={h2}>Treffpunkt</Heading>
        <Text style={text}>
          Für Kurse in Wettingen:{'\n'}
          Landstrasse 99{'\n'}
          Centerpassage{'\n'}
          Ottos Rampe{'\n'}
          5430 Wettingen
        </Text>

        <Hr style={divider} />

        {/* --- Wichtig --- */}
        <Section style={importantSection}>
          <Heading style={h2Important}>⚠️ WICHTIG</Heading>
          <Text style={importantText}>
            Am ersten Kurstag den Personalausweis (ID, Pass) und Lernfahrausweis mitbringen!
          </Text>
          <Text style={importantText}>
            Kursgebühren sind am ersten Tag zu bezahlen.
          </Text>
          <Text style={importantText}>
            Zahle Bar oder mit Karte vor Ort.
          </Text>
        </Section>

        <Hr style={divider} />

        {/* --- Stornierung --- */}
        <Text style={smallText}>
          Diese Anmeldung ist verbindlich: Umbuchungen bzw. Stornierungen sind bis 5 Tage vor Kursbeginn schriftlich an info@drive-me.ch möglich, danach wird die volle Kursgebühr in Rechnung gestellt.
        </Text>

        <Hr style={divider} />

        {/* --- Bankverbindung --- */}
        <Heading style={h2}>Unsere Bankverbindung</Heading>
        <Text style={text}>
          Fahrschule Drive me GmbH{'\n'}
          Bank: PostFinance{'\n'}
          Kontonummer: 15-263666-6{'\n'}
          IBAN: CH9509000000152636666{'\n'}
          BIC: POFICHBEXXX
        </Text>

        <Hr style={divider} />

        {/* --- Bestelldetails --- */}
        <Heading style={h2}>Bestelldetails</Heading>

        {bookingId && (
          <Text style={detailText}>
            Bestellnummer: {bookingId.slice(0, 8).toUpperCase()}
          </Text>
        )}
        {bookingDate && (
          <Text style={detailText}>
            Bestelldatum: {bookingDate}
          </Text>
        )}

        {courses.length > 0 && (
          <Section style={coursesSection}>
            {/* Table header */}
            <Section style={tableHeader}>
              <Text style={tableHeaderCell}>Produkt</Text>
            </Section>
            {courses.map((course, i) => (
              <Section key={i} style={tableRow}>
                <Text style={tableCell}>
                  MGK Teil {course.part} | {course.date} @ {course.time} | {course.location}
                  {course.price ? ` — CHF ${course.price.toFixed(2)}` : ''}
                </Text>
              </Section>
            ))}
          </Section>
        )}

        <Section style={totalSection}>
          {paymentMethod && (
            <Text style={detailText}>Zahlungsmethode: {paymentMethod}</Text>
          )}
          {totalPrice && (
            <Text style={totalText}>Gesamt: <strong>CHF {totalPrice}</strong></Text>
          )}
        </Section>

        <Text style={smallText}>
          Sie erhalten Ihre Karten in einem separaten E-Mail.
        </Text>

        <Hr style={divider} />

        {/* --- Rechnungsadresse --- */}
        <Heading style={h2}>Rechnungsadresse</Heading>
        <Text style={text}>
          {firstName && lastName ? `${firstName} ${lastName}` : ''}
          {address ? `\n${address}` : ''}
          {birthDate ? `\nGeburtstag: ${birthDate}` : ''}
          {category ? `\nKategorie: ${category}` : ''}
          {faNumber ? `\nFABER Nr.: ${faNumber}` : ''}
          {phone ? `\n${phone}` : ''}
          {email ? `\n${email}` : ''}
        </Text>

        <Hr style={divider} />

        <Text style={footer}>
          Freundliche Grüsse,{'\n'}
          Das {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

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
      { part: 1, date: '27.09.2024', time: '17:00', location: 'Wettingen', price: 150 },
      { part: 2, date: '28.09.2024', time: '13:00', location: 'Wettingen', price: 150 },
      { part: 3, date: '27.10.2024', time: '13:00', location: 'Wettingen', price: 150 },
    ],
    totalPrice: '450.00',
    paymentMethod: 'Direkte Banküberweisung oder Bar vor Ort',
    bookingId: 'a1b2c3d4-e5f6-7890',
    bookingDate: '24. September 2024',
  },
} satisfies TemplateEntry

// Styles — brand color: hsl(195, 85%, 42%) ≈ #1098b8
const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#1a2344', padding: '24px 25px', borderRadius: '8px 8px 0 0', marginBottom: '16px', textAlign: 'center' as const }
const logoStyle = { margin: '0 auto' }

const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a2b3c', margin: '0 0 20px' }
const h2 = { fontSize: '18px', fontWeight: '700' as const, color: '#1a2b3c', margin: '0 0 12px' }
const h2Important = { fontSize: '18px', fontWeight: '700' as const, color: '#c53030', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#3a4a5a', lineHeight: '1.7', margin: '0 0 16px', whiteSpace: 'pre-line' as const }
const bulletText = { fontSize: '13px', color: '#3a4a5a', lineHeight: '1.5', margin: '0 0 4px', paddingLeft: '4px' }
const smallText = { fontSize: '12px', color: '#6a7a8a', lineHeight: '1.6', margin: '0 0 16px', fontStyle: 'italic' as const }
const infoSection = { margin: '0 0 16px' }
const importantSection = { backgroundColor: '#fff5f5', borderRadius: '8px', padding: '16px', margin: '0 0 8px' }
const importantText = { fontSize: '14px', color: '#c53030', lineHeight: '1.5', margin: '0 0 8px', fontWeight: '600' as const }
const divider = { borderColor: '#e0eaef', margin: '20px 0' }
const coursesSection = { margin: '0 0 16px' }
const tableHeader = { backgroundColor: '#1098b8', borderRadius: '6px 6px 0 0', padding: '10px 14px' }
const tableHeaderCell = { fontSize: '13px', fontWeight: '700' as const, color: '#ffffff', margin: '0' }
const tableRow = { backgroundColor: '#f0f8fa', padding: '10px 14px', borderBottom: '1px solid #e0eaef' }
const tableCell = { fontSize: '13px', color: '#3a4a5a', margin: '0', lineHeight: '1.5' }
const totalSection = { margin: '0 0 16px' }
const totalText = { fontSize: '16px', color: '#1a2b3c', margin: '0 0 6px' }
const detailText = { fontSize: '13px', color: '#6a7a8a', margin: '0 0 4px' }
const footer = { fontSize: '13px', color: '#8a9aaa', margin: '24px 0 0', whiteSpace: 'pre-line' as const }
