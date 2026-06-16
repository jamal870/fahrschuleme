/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Drive me Fahrschule"
const LOGO_URL = "https://dspspshgnointeqxgnrw.supabase.co/storage/v1/object/public/email-assets/drive-me-logo-new.png"

interface Participant {
  firstName: string
  lastName: string
  phone: string
  paid: boolean
}

interface EmailSettings {
  reminder_extra_note?: string
}

interface CourseReminderProps {
  coursePart?: number
  courseDate?: string
  courseDay?: string
  courseTime?: string
  courseLocation?: string
  instructor?: string | null
  daysUntil?: number
  participantCount?: number
  participants?: Participant[]
  settings?: EmailSettings
}

const CourseReminderEmail = ({
  coursePart,
  courseDate,
  courseDay,
  courseTime,
  courseLocation,
  instructor,
  daysUntil,
  participantCount,
  participants = [],
  settings,
}: CourseReminderProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Kurs-Erinnerung: MGK Teil {coursePart} in {daysUntil} Tagen</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_URL} alt="Drive me Fahrschule" width="180" style={logoStyle} />
        </Section>
        <Section style={orangeBar} />

        <Heading style={h1}>📅 Kurs-Erinnerung</Heading>
        <Text style={text}>
          MGK Teil {coursePart} startet in <strong>{daysUntil} Tag{daysUntil === 1 ? '' : 'en'}</strong>.
        </Text>

        <Section style={card}>
          <Heading style={cardTitle}>Kurs-Details</Heading>
          <Text style={detailRow}><strong>Teil:</strong> MGK {coursePart}</Text>
          <Text style={detailRow}><strong>Datum:</strong> {courseDay}, {courseDate}</Text>
          <Text style={detailRow}><strong>Zeit:</strong> {courseTime}</Text>
          <Text style={detailRow}><strong>Ort:</strong> {courseLocation}</Text>
          {instructor && <Text style={detailRow}><strong>Fahrlehrer:</strong> {instructor}</Text>}
          <Text style={priceRow}><strong>Teilnehmer:</strong> {participantCount}</Text>
        </Section>

        <Section style={card}>
          <Heading style={cardTitle}>Teilnehmerliste</Heading>
          {participants.length === 0 ? (
            <Text style={detailRow}>Keine bestätigten Teilnehmer.</Text>
          ) : (
            participants.map((p, i) => (
              <Text key={i} style={detailRow}>
                {i + 1}. <strong>{p.firstName} {p.lastName}</strong> · {p.phone} · {p.paid ? '✓ bezahlt' : 'Bar vor Ort'}
              </Text>
            ))
          )}
        </Section>

        <Text style={text}>
          {settings?.reminder_extra_note || 'Die druckbare Teilnehmerliste kannst du im Admin-Portal unter „Kurstermine" herunterladen.'}
        </Text>

        <Hr style={divider} />
        <Text style={footer}>Diese E-Mail wurde automatisch generiert.</Text>
        <Text style={footerBrand}>{SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CourseReminderEmail,
  subject: (data: Record<string, any>) =>
    `📅 Kurs-Erinnerung: MGK Teil ${data.coursePart} am ${data.courseDate} (${data.participantCount} Teilnehmer)`,
  displayName: 'Kurs-Erinnerung (Admin)',
  to: 'info@l-me.ch',
  previewData: {
    coursePart: 1,
    courseDate: '28.03.2026',
    courseDay: 'Samstag',
    courseTime: '13:00 – 17:00',
    courseLocation: 'Wettingen',
    instructor: 'JE',
    daysUntil: 2,
    participantCount: 3,
    participants: [
      { firstName: 'Anna', lastName: 'Müller', phone: '079 123 45 67', paid: true },
      { firstName: 'Ben', lastName: 'Keller', phone: '078 234 56 78', paid: false },
      { firstName: 'Clara', lastName: 'Schmid', phone: '076 345 67 89', paid: true },
    ],
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
const priceRow = { fontSize: '15px', color: '#1a1a1a', lineHeight: '1.6', margin: '4px 0 0', fontWeight: '600' as const }
const divider = { borderColor: '#e5e5e5', margin: '20px 0 16px' }
const footer = { fontSize: '11px', color: '#999999', margin: '0', textAlign: 'center' as const }
const footerBrand = { fontSize: '11px', color: '#e8501a', margin: '2px 0 0', textAlign: 'center' as const, fontWeight: '600' as const }
