/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Drive me Fahrschule"
const LOGO_URL = "https://drive-me.ch/logo-lme.png"

interface AdminPaymentFailedProps {
  bookingId?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string | null
  paymentMethod?: string | null
  totalPrice?: string
  createdAt?: string
  courses?: Array<{ part: number; day?: string | null; date: string; time: string; location: string }>
  reason?: 'abgebrochen' | 'abgelaufen' | 'fehlgeschlagen'
}

const REASON_LABEL: Record<NonNullable<AdminPaymentFailedProps['reason']>, string> = {
  abgebrochen: 'Vom Kunden abgebrochen',
  abgelaufen: 'Zahlungsseite abgelaufen (keine Zahlung eingegangen)',
  fehlgeschlagen: 'Zahlung fehlgeschlagen',
}

const Email = ({ bookingId, firstName, lastName, email, phone, paymentMethod, totalPrice, createdAt, courses = [], reason = 'abgebrochen' }: AdminPaymentFailedProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Online-Zahlung nicht abgeschlossen – Plätze freigegeben</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_URL} alt={SITE_NAME} width="180" style={logoStyle} />
        </Section>
        <Section style={accentBar} />

        <Heading style={h1}>⚠️ Online-Zahlung nicht abgeschlossen</Heading>
        <Section style={banner}>
          <Text style={bannerText}>
            {REASON_LABEL[reason]}. Die Buchung wurde auf „storniert" gesetzt und die Kursplätze wurden automatisch
            wieder freigegeben. Der Kunde wurde per E-Mail informiert.
          </Text>
        </Section>

        <Section style={card}>
          <Heading style={cardTitle}>Kunde</Heading>
          {(firstName || lastName) && <Text style={detailRow}><strong>Name:</strong> {firstName} {lastName}</Text>}
          {email && <Text style={detailRow}><strong>E-Mail:</strong> {email}</Text>}
          {phone && <Text style={detailRow}><strong>Telefon:</strong> {phone}</Text>}
        </Section>

        <Section style={card}>
          <Heading style={cardTitle}>Buchungsversuch</Heading>
          {bookingId && <Text style={detailRow}><strong>Referenz:</strong> {bookingId}</Text>}
          {createdAt && <Text style={detailRow}><strong>Gestartet:</strong> {new Date(createdAt).toLocaleString('de-CH', { timeZone: 'Europe/Zurich' })}</Text>}
          {paymentMethod && <Text style={detailRow}><strong>Zahlungsmethode:</strong> {paymentMethod}</Text>}
          {totalPrice && <Text style={detailRow}><strong>Betrag:</strong> CHF {totalPrice}</Text>}
        </Section>

        {courses.length > 0 && (
          <Section style={card}>
            <Heading style={cardTitle}>Freigegebene Kursplätze</Heading>
            {[...courses].sort((a, b) => Number(a.part ?? 0) - Number(b.part ?? 0)).map((c, i) => (
              <Text key={i} style={detailRow}>
                <strong>MGK Teil {c.part}</strong> · {c.day ? `${c.day}, ` : ''}{c.date} · {c.time} · {c.location}
              </Text>
            ))}
          </Section>
        )}

        <Hr style={divider} />
        <Text style={footer}>Diese E-Mail wurde automatisch generiert.</Text>
        <Text style={footerBrand}>{SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `⚠️ Zahlung nicht abgeschlossen: ${data.firstName || ''} ${data.lastName || ''} – Plätze freigegeben`,
  displayName: 'Admin: Zahlung fehlgeschlagen',
  previewData: {
    bookingId: '1DAADFB4',
    firstName: 'Anna',
    lastName: 'Muster',
    email: 'anna.muster@example.ch',
    phone: '079 000 00 00',
    paymentMethod: 'Online-Zahlung (Stripe)',
    totalPrice: '329.60',
    createdAt: new Date().toISOString(),
    courses: [
      { part: 1, day: 'Freitag', date: '25.09.2026', time: '13:00 – 17:00', location: 'Wettingen' },
      { part: 1, day: 'Freitag', date: '02.10.2026', time: '13:00 – 17:00', location: 'Wettingen' },
    ],
    reason: 'abgelaufen',
  },
} satisfies TemplateEntry

const CYAN = '#25c0f4'
const main = { backgroundColor: '#f4f4f5', fontFamily: "'Manrope', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px' }
const headerSection = { backgroundColor: '#ffffff', padding: '16px 25px', borderRadius: '8px 8px 0 0', marginBottom: '4px', textAlign: 'center' as const }
const logoStyle = { margin: '0 auto' }
const accentBar = { backgroundColor: CYAN, height: '3px', borderRadius: '2px', margin: '0 0 24px' }
const h1 = { fontFamily: "'Sora', Arial, sans-serif", fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '0 0 12px' }
const banner = { backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', padding: '12px 16px', margin: '0 0 20px' }
const bannerText = { fontSize: '13px', color: '#856404', lineHeight: '1.5', margin: '0', fontWeight: '600' as const }
const card = { backgroundColor: '#fafafa', borderRadius: '6px', padding: '16px 18px', margin: '0 0 12px', border: '1px solid #eeeeee' }
const cardTitle = { fontFamily: "'Sora', Arial, sans-serif", fontSize: '14px', fontWeight: '700' as const, color: CYAN, margin: '0 0 10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const detailRow = { fontSize: '13px', color: '#3a3a3a', lineHeight: '1.6', margin: '0 0 4px' }
const divider = { borderColor: '#e5e5e5', margin: '20px 0 16px' }
const footer = { fontSize: '11px', color: '#999999', margin: '0', textAlign: 'center' as const }
const footerBrand = { fontSize: '11px', color: CYAN, margin: '2px 0 0', textAlign: 'center' as const, fontWeight: '600' as const }
