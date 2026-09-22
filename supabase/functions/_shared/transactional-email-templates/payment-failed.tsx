/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Drive me Fahrschule"
const LOGO_URL = "https://drive-me.ch/logo-lme.png"
const REBOOK_URL = "https://www.fahrschule-me.ch/grundkurs"

interface PaymentFailedProps {
  firstName?: string
  courses?: Array<{ part: number; day?: string | null; date: string; time: string; location: string }>
  reason?: 'abgebrochen' | 'abgelaufen' | 'fehlgeschlagen'
  bookingId?: string
}

const REASON_TEXT: Record<NonNullable<PaymentFailedProps['reason']>, string> = {
  abgebrochen: 'Die Online-Zahlung wurde abgebrochen.',
  abgelaufen: 'Die Zahlungsseite ist abgelaufen, ohne dass eine Zahlung eingegangen ist.',
  fehlgeschlagen: 'Die Online-Zahlung ist fehlgeschlagen.',
}

const Email = ({ firstName, courses = [], reason = 'abgebrochen', bookingId }: PaymentFailedProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Zahlung nicht abgeschlossen – deine Kursplätze wurden wieder freigegeben</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_URL} alt={SITE_NAME} width="180" style={logoStyle} />
        </Section>
        <Section style={accentBar} />

        <Heading style={h1}>Zahlung nicht abgeschlossen</Heading>
        <Text style={text}>{firstName ? `Hallo ${firstName},` : 'Hallo,'}</Text>
        <Text style={text}>
          {REASON_TEXT[reason]} Deine Buchung wurde deshalb <strong>nicht</strong> abgeschlossen und es wurde
          nichts belastet. Die reservierten Kursplätze sind wieder frei.
        </Text>

        {courses.length > 0 && (
          <Section style={card}>
            <Heading style={cardTitle}>Betroffene Termine</Heading>
            {[...courses].sort((a, b) => Number(a.part ?? 0) - Number(b.part ?? 0)).map((c, i) => (
              <Text key={i} style={detailRow}>
                <strong>MGK Teil {c.part}</strong> · {c.day ? `${c.day}, ` : ''}{c.date} · {c.time} · {c.location}
              </Text>
            ))}
          </Section>
        )}

        <Text style={text}>
          Möchtest du die Termine trotzdem buchen? Du kannst es jederzeit erneut versuchen – solange die Plätze frei
          sind. Alternativ kannst du bei der Buchung auch <strong>Barzahlung / Überweisung</strong> wählen.
        </Text>

        <Section style={{ textAlign: 'center' as const, margin: '8px 0 24px' }}>
          <Button href={REBOOK_URL} style={button}>Erneut buchen</Button>
        </Section>

        <Text style={text}>
          Fragen? Melde dich gern unter <a href="mailto:info@l-me.ch" style={link}>info@l-me.ch</a> oder 076 779 03 83.
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
  subject: 'Zahlung nicht abgeschlossen – Kursplätze wieder freigegeben',
  displayName: 'Zahlung fehlgeschlagen (Teilnehmer)',
  previewData: {
    firstName: 'Anna',
    courses: [
      { part: 1, day: 'Freitag', date: '25.09.2026', time: '13:00 – 17:00', location: 'Wettingen' },
      { part: 2, day: 'Freitag', date: '02.10.2026', time: '13:00 – 17:00', location: 'Wettingen' },
    ],
    reason: 'abgebrochen',
    bookingId: '1DAADFB4',
  },
} satisfies TemplateEntry

const CYAN = '#25c0f4'
const main = { backgroundColor: '#f4f4f5', fontFamily: "'Manrope', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px' }
const headerSection = { backgroundColor: '#ffffff', padding: '16px 25px', borderRadius: '8px 8px 0 0', marginBottom: '4px', textAlign: 'center' as const }
const logoStyle = { margin: '0 auto' }
const accentBar = { backgroundColor: CYAN, height: '3px', borderRadius: '2px', margin: '0 0 24px' }
const h1 = { fontFamily: "'Sora', Arial, sans-serif", fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#555555', lineHeight: '1.6', margin: '0 0 16px' }
const link = { color: CYAN, textDecoration: 'none' }
const button = { backgroundColor: CYAN, color: '#ffffff', fontFamily: "'Sora', Arial, sans-serif", fontSize: '14px', fontWeight: '700' as const, padding: '12px 24px', borderRadius: '4px', textDecoration: 'none' }
const card = { backgroundColor: '#fafafa', borderRadius: '6px', padding: '16px 18px', margin: '0 0 16px', border: '1px solid #eeeeee' }
const cardTitle = { fontFamily: "'Sora', Arial, sans-serif", fontSize: '14px', fontWeight: '700' as const, color: CYAN, margin: '0 0 10px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const detailRow = { fontSize: '13px', color: '#1a1a1a', lineHeight: '1.6', margin: '0 0 4px' }
const divider = { borderColor: '#e5e5e5', margin: '20px 0 16px' }
const footer = { fontSize: '11px', color: '#999999', margin: '0', textAlign: 'center' as const }
const footerBrand = { fontSize: '11px', color: CYAN, margin: '2px 0 0', textAlign: 'center' as const, fontWeight: '600' as const }
