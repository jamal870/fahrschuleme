/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "L me Fahrschule"
const LOGO_URL = "https://dspspshgnointeqxgnrw.supabase.co/storage/v1/object/public/email-assets/drive-me-logo-new.png"

interface CourseMovedProps {
  firstName?: string
  coursePart?: number
  oldDay?: string
  oldDate?: string
  oldTime?: string
  oldLocation?: string
  newDay?: string
  newDate?: string
  newTime?: string
  newLocation?: string
  newInstructor?: string | null
  reason?: string | null
}

const CourseMovedEmail = ({
  firstName,
  coursePart,
  oldDay, oldDate, oldTime, oldLocation,
  newDay, newDate, newTime, newLocation, newInstructor,
  reason,
}: CourseMovedProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Neuer Termin für deinen MGK Teil {coursePart}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_URL} alt={SITE_NAME} width="180" style={logoStyle} />
        </Section>
        <Section style={orangeBar} />

        <Heading style={h1}>📅 Dein Kurstermin wurde verschoben</Heading>
        <Text style={text}>
          {firstName ? `Hallo ${firstName},` : 'Hallo,'}
        </Text>
        <Text style={text}>
          dein Motorrad-Grundkurs <strong>Teil {coursePart}</strong> wurde auf einen neuen Termin verschoben.
          Bitte beachte die folgenden Angaben:
        </Text>

        <Section style={cardOld}>
          <Heading style={cardTitleOld}>Alter Termin</Heading>
          <Text style={detailRow}>{oldDay}, {oldDate} · {oldTime}</Text>
          <Text style={detailRow}>{oldLocation}</Text>
        </Section>

        <Section style={cardNew}>
          <Heading style={cardTitleNew}>✅ Neuer Termin</Heading>
          <Text style={detailRowNew}><strong>{newDay}, {newDate}</strong></Text>
          <Text style={detailRowNew}><strong>Zeit:</strong> {newTime}</Text>
          <Text style={detailRowNew}><strong>Ort:</strong> {newLocation}</Text>
          {newInstructor && <Text style={detailRowNew}><strong>Fahrlehrer:</strong> {newInstructor}</Text>}
        </Section>

        {reason && (
          <Text style={text}>
            <strong>Hinweis:</strong> {reason}
          </Text>
        )}

        <Text style={text}>
          Bei Fragen erreichst du uns jederzeit unter <a href="mailto:info@l-me.ch" style={link}>info@l-me.ch</a> oder telefonisch unter 076 779 03 83.
        </Text>

        <Hr style={divider} />
        <Text style={footer}>Diese E-Mail wurde automatisch generiert.</Text>
        <Text style={footerBrand}>{SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CourseMovedEmail,
  subject: (data: Record<string, any>) =>
    `📅 Neuer Termin: MGK Teil ${data.coursePart} am ${data.newDate}`,
  displayName: 'Kurs verschoben (Teilnehmer)',
  previewData: {
    firstName: 'Anna',
    coursePart: 1,
    oldDay: 'Freitag', oldDate: '01.05.2026', oldTime: '13:00 – 17:00', oldLocation: 'Wettingen',
    newDay: 'Mittwoch', newDate: '15.05.2026', newTime: '13:00 – 17:00', newLocation: 'Wettingen',
    newInstructor: 'JE',
    reason: 'Termin auf Wunsch verschoben.',
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
const cardOld = { backgroundColor: '#fafafa', borderRadius: '6px', padding: '12px 16px', margin: '0 0 12px', border: '1px solid #eeeeee' }
const cardNew = { backgroundColor: '#fff5ef', borderRadius: '6px', padding: '14px 18px', margin: '0 0 16px', border: '1px solid #e8501a' }
const cardTitleOld = { fontSize: '12px', fontWeight: '700' as const, color: '#888', margin: '0 0 6px', textTransform: 'uppercase' as const, letterSpacing: '0.5px', textDecoration: 'line-through' as const }
const cardTitleNew = { fontSize: '13px', fontWeight: '700' as const, color: '#e8501a', margin: '0 0 8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const detailRow = { fontSize: '13px', color: '#888', lineHeight: '1.6', margin: '0 0 2px', textDecoration: 'line-through' as const }
const detailRowNew = { fontSize: '14px', color: '#1a1a1a', lineHeight: '1.6', margin: '0 0 4px' }
const divider = { borderColor: '#e5e5e5', margin: '20px 0 16px' }
const footer = { fontSize: '11px', color: '#999999', margin: '0', textAlign: 'center' as const }
const footerBrand = { fontSize: '11px', color: '#e8501a', margin: '2px 0 0', textAlign: 'center' as const, fontWeight: '600' as const }
