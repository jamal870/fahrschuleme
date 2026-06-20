/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "L me Fahrschule"
const LOGO_URL = "https://dspspshgnointeqxgnrw.supabase.co/storage/v1/object/public/email-assets/logo-lme-light.png"

interface BookingCancelledProps {
  firstName?: string
  courses?: Array<{ part: number; day?: string; date: string; time: string; location: string }>
  reason?: string | null
  bookingId?: string
}

const Email = ({ firstName, courses = [], reason, bookingId }: BookingCancelledProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Deine Buchung wurde storniert</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_URL} alt={SITE_NAME} width="180" style={logoStyle} />
        </Section>
        <Section style={orangeBar} />

        <Heading style={h1}>Buchung storniert</Heading>
        <Text style={text}>{firstName ? `Hallo ${firstName},` : 'Hallo,'}</Text>
        <Text style={text}>
          deine Buchung bei {SITE_NAME} wurde storniert. Folgende Termine sind davon betroffen:
        </Text>

        {courses.length > 0 && (
          <Section style={card}>
            {courses.map((c, i) => (
              <Text key={i} style={detailRow}>
                <strong>Teil {c.part}</strong> · {c.day ? `${c.day}, ` : ''}{c.date} · {c.time} · {c.location}
              </Text>
            ))}
          </Section>
        )}

        {reason && (
          <Text style={text}><strong>Grund:</strong> {reason}</Text>
        )}

        <Text style={text}>
          Möchtest du einen neuen Termin buchen? Melde dich gern bei uns unter{' '}
          <a href="mailto:info@l-me.ch" style={link}>info@l-me.ch</a> oder 076 779 03 83.
        </Text>

        <Hr style={divider} />
        {bookingId && <Text style={footer}>Referenz: {bookingId}</Text>}
        <Text style={footer}>Diese E-Mail wurde automatisch generiert.</Text>
        <Text style={footerBrand}>{SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Deine Buchung wurde storniert',
  displayName: 'Buchung storniert (Teilnehmer)',
  previewData: {
    firstName: 'Anna',
    courses: [{ part: 1, day: 'Freitag', date: '01.05.2026', time: '13:00 – 17:00', location: 'Wettingen' }],
    reason: 'Auf Wunsch des Teilnehmers.',
    bookingId: 'abc-123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px' }
const headerSection = { backgroundColor: '#1a2344', padding: '24px 25px', borderRadius: '8px 8px 0 0', marginBottom: '4px', textAlign: 'center' as const }
const logoStyle = { margin: '0 auto' }
const orangeBar = { backgroundColor: '#e8501a', height: '4px', borderRadius: '2px', margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 16px' }
const link = { color: '#e8501a', textDecoration: 'none' }
const card = { backgroundColor: '#fafafa', borderRadius: '6px', padding: '12px 16px', margin: '0 0 16px', border: '1px solid #eeeeee' }
const detailRow = { fontSize: '13px', color: '#1a1a1a', lineHeight: '1.6', margin: '0 0 4px' }
const divider = { borderColor: '#e5e5e5', margin: '20px 0 16px' }
const footer = { fontSize: '11px', color: '#999999', margin: '0', textAlign: 'center' as const }
const footerBrand = { fontSize: '11px', color: '#e8501a', margin: '2px 0 0', textAlign: 'center' as const, fontWeight: '600' as const }
