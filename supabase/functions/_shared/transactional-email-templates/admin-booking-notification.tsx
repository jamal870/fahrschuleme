import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Drive me Fahrschule"

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
}: AdminBookingNotificationProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Neue Buchung eingegangen – {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📋 Neue Buchung eingegangen</Heading>

        <Text style={text}>
          Es ist eine neue Buchung über die Website eingegangen.
        </Text>

        <Hr style={divider} />

        <Heading style={h2}>Kundendaten</Heading>
        <Section style={detailsSection}>
          {firstName && lastName && <Text style={detailRow}><strong>Name:</strong> {firstName} {lastName}</Text>}
          {email && <Text style={detailRow}><strong>E-Mail:</strong> {email}</Text>}
          {phone && <Text style={detailRow}><strong>Telefon:</strong> {phone}</Text>}
          {address && <Text style={detailRow}><strong>Adresse:</strong> {address}</Text>}
          {birthDate && <Text style={detailRow}><strong>Geburtstag:</strong> {birthDate}</Text>}
          {faNumber && <Text style={detailRow}><strong>FABER Nr.:</strong> {faNumber}</Text>}
        </Section>

        <Hr style={divider} />

        <Heading style={h2}>Buchungsdetails</Heading>
        <Section style={detailsSection}>
          {bookingId && <Text style={detailRow}><strong>Bestellnummer:</strong> {bookingId.slice(0, 8).toUpperCase()}</Text>}
          {bookingDate && <Text style={detailRow}><strong>Datum:</strong> {bookingDate}</Text>}
          {bookingType && <Text style={detailRow}><strong>Typ:</strong> {bookingType === 'grundkurs' ? 'Motorrad-Grundkurs (MGK)' : 'Fahrstunde'}</Text>}
          {paymentMethod && <Text style={detailRow}><strong>Zahlungsmethode:</strong> {paymentMethod}</Text>}
          {totalPrice && <Text style={detailRow}><strong>Betrag:</strong> CHF {totalPrice}</Text>}
        </Section>

        {items && (
          <>
            <Hr style={divider} />
            <Heading style={h2}>Gebuchte Leistungen</Heading>
            <Text style={text}>{items}</Text>
          </>
        )}

        <Hr style={divider} />

        <Text style={footer}>
          Diese E-Mail wurde automatisch generiert.{'\n'}
          {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminBookingNotificationEmail,
  subject: (data: Record<string, any>) =>
    `Neue Buchung: ${data.firstName || ''} ${data.lastName || ''} – ${data.bookingType === 'grundkurs' ? 'MGK' : 'Fahrstunde'}`,
  displayName: 'Admin-Buchungsbenachrichtigung',
  to: 'info@drive-me.ch',
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
    items: 'MGK Teil 1 | 27.09.2024 @ 17:00 | Wettingen, MGK Teil 2 | 28.09.2024 @ 13:00 | Wettingen',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '600px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a2b3c', margin: '0 0 16px' }
const h2 = { fontSize: '16px', fontWeight: '700' as const, color: '#1a2b3c', margin: '0 0 10px' }
const text = { fontSize: '14px', color: '#3a4a5a', lineHeight: '1.7', margin: '0 0 16px', whiteSpace: 'pre-line' as const }
const detailsSection = { margin: '0 0 8px' }
const detailRow = { fontSize: '13px', color: '#3a4a5a', lineHeight: '1.6', margin: '0 0 4px' }
const divider = { borderColor: '#e0eaef', margin: '18px 0' }
const footer = { fontSize: '12px', color: '#8a9aaa', margin: '20px 0 0', whiteSpace: 'pre-line' as const }
