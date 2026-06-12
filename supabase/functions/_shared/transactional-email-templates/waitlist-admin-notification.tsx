/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Drive me Fahrschule"
const LOGO_URL = "https://dspspshgnointeqxgnrw.supabase.co/storage/v1/object/public/email-assets/drive-me-logo-new.png"

interface Props {
  coursePart?: number
  courseDate?: string
  courseDay?: string
  courseTime?: string
  courseLocation?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  notes?: string
}

const WaitlistEmail = (p: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Neue Warteliste-Anmeldung: MGK Teil {p.coursePart}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_URL} alt="Drive me Fahrschule" width="180" style={logoStyle} />
        </Section>
        <Section style={orangeBar} />

        <Heading style={h1}>📝 Neue Warteliste-Anmeldung</Heading>
        <Text style={text}>
          Ein Interessent möchte auf die Warteliste für einen ausgebuchten Kurs.
        </Text>

        <Section style={card}>
          <Heading style={cardTitle}>Kurs</Heading>
          <Text style={detailRow}><strong>MGK Teil {p.coursePart}</strong></Text>
          <Text style={detailRow}>{p.courseDay}, {p.courseDate} · {p.courseTime}</Text>
          <Text style={detailRow}>{p.courseLocation}</Text>
        </Section>

        <Section style={card}>
          <Heading style={cardTitle}>Interessent</Heading>
          <Text style={detailRow}><strong>Name:</strong> {p.firstName} {p.lastName}</Text>
          <Text style={detailRow}><strong>E-Mail:</strong> {p.email}</Text>
          <Text style={detailRow}><strong>Telefon:</strong> {p.phone}</Text>
          {p.notes && <Text style={detailRow}><strong>Notiz:</strong> {p.notes}</Text>}
        </Section>

        <Text style={text}>Im Admin-Portal kannst du die komplette Warteliste einsehen und verwalten.</Text>

        <Hr style={divider} />
        <Text style={footer}>Diese E-Mail wurde automatisch generiert.</Text>
        <Text style={footerBrand}>{SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WaitlistEmail,
  subject: (d: Record<string, any>) => `📝 Warteliste: ${d.firstName} ${d.lastName} – MGK Teil ${d.coursePart} (${d.courseDate})`,
  displayName: 'Warteliste-Anmeldung (Admin)',
  to: 'info@drive-me.ch',
  previewData: {
    coursePart: 1, courseDate: '28.03.2026', courseDay: 'Samstag', courseTime: '13:00 – 17:00', courseLocation: 'Wettingen',
    firstName: 'Anna', lastName: 'Müller', email: 'anna@example.com', phone: '079 123 45 67', notes: 'Flexibel',
  },
} satisfies TemplateEntry

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
const divider = { borderColor: '#e5e5e5', margin: '20px 0 16px' }
const footer = { fontSize: '11px', color: '#999999', margin: '0', textAlign: 'center' as const }
const footerBrand = { fontSize: '11px', color: '#e8501a', margin: '2px 0 0', textAlign: 'center' as const, fontWeight: '600' as const }
