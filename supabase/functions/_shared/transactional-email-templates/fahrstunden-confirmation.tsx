import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Drive me Fahrschule"

interface FahrstundenConfirmationProps {
  firstName?: string
  lastName?: string
  address?: string
  birthDate?: string
  faNumber?: string
  phone?: string
  email?: string
  category?: string
  serviceName?: string
  packageName?: string
  duration?: string
  totalPrice?: string
  paymentMethod?: string
  bookingId?: string
  bookingDate?: string
}

const FahrstundenConfirmationEmail = ({
  firstName,
  lastName,
  address,
  birthDate,
  faNumber,
  phone,
  email,
  category,
  serviceName,
  packageName,
  duration,
  totalPrice,
  paymentMethod,
  bookingId,
  bookingDate,
}: FahrstundenConfirmationProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Buchungsbestätigung Fahrstunde – {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src="https://web-support-buddy.lovable.app/images/drive-me-logo.png" alt="Drive me Fahrschule" width="220" style={logoStyle} />
        </Section>

        <Heading style={h1}>Buchungsbestätigung</Heading>

        <Text style={text}>
          {firstName ? `Hallo ${firstName},` : 'Hallo,'}
        </Text>

        <Text style={text}>
          Danke für deine Buchung!
        </Text>

        <Hr style={divider} />

        {/* --- Treffpunkt --- */}
        <Heading style={h2}>Treffpunkt</Heading>
        <Text style={text}>
          Bahnhof Wettingen
        </Text>

        <Hr style={divider} />

        {/* --- Wichtig --- */}
        <Section style={importantSection}>
          <Heading style={h2Important}>⚠️ WICHTIG</Heading>
          <Text style={importantText}>
            Stornierungen oder Umbuchungen sind bis 24 Stunden vor der Fahrstunde schriftlich an info@drive-me.ch möglich, danach wird der volle Betrag in Rechnung gestellt.
          </Text>
        </Section>

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

        <Section style={coursesSection}>
          <Section style={tableHeader}>
            <Text style={tableHeaderCell}>Produkt</Text>
          </Section>
          <Section style={tableRow}>
            <Text style={tableCell}>
              {serviceName || 'Fahrstunde'}
              {packageName ? ` – ${packageName}` : ''}
              {duration ? ` (${duration})` : ''}
              {totalPrice ? ` — CHF ${totalPrice}` : ''}
            </Text>
          </Section>
        </Section>

        <Section style={totalSection}>
          {paymentMethod && (
            <Text style={detailText}>Zahlungsmethode: {paymentMethod}</Text>
          )}
          {totalPrice && (
            <Text style={totalText}>Gesamt: <strong>CHF {totalPrice}</strong></Text>
          )}
        </Section>

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
  component: FahrstundenConfirmationEmail,
  subject: 'Buchungsbestätigung Fahrstunde – Drive me Fahrschule',
  displayName: 'Fahrstunden-Bestätigung',
  previewData: {
    firstName: 'Max',
    lastName: 'Muster',
    address: 'Musterstrasse 12, 5400 Baden',
    birthDate: '01.05.1995',
    faNumber: '0008.123.456',
    phone: '0791234567',
    email: 'max.muster@example.ch',
    category: 'B',
    serviceName: 'Fahrstunde Auto',
    packageName: '10er-Abo',
    duration: '45 Min',
    totalPrice: '85.00',
    paymentMethod: 'Bar vor Ort',
    bookingId: 'f1e2d3c4-a5b6-7890',
    bookingDate: '24. September 2024',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '600px', margin: '0 auto' }
const headerSection = { marginBottom: '10px' }
const brandText = { fontSize: '20px', fontWeight: '700' as const, color: '#1098b8', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a2b3c', margin: '0 0 20px' }
const h2 = { fontSize: '18px', fontWeight: '700' as const, color: '#1a2b3c', margin: '0 0 12px' }
const h2Important = { fontSize: '18px', fontWeight: '700' as const, color: '#c53030', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#3a4a5a', lineHeight: '1.7', margin: '0 0 16px', whiteSpace: 'pre-line' as const }
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
