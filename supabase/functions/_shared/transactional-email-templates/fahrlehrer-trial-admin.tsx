/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "fahrschule me"
const LOGO_URL = "https://dspspshgnointeqxgnrw.supabase.co/storage/v1/object/public/email-assets/logo-lme-light.png"

interface Props {
  contactName?: string
  schoolName?: string
  schoolAddress?: string
  email?: string
  phone?: string
  message?: string
}

const Email = (p: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Neue 30-Tage-Trial Anfrage: {p.schoolName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_URL} alt="fahrschule me" width="180" style={logoStyle} />
        </Section>
        <Section style={orangeBar} />

        <Heading style={h1}>🎯 Neue 30-Tage-Trial Anfrage</Heading>
        <Text style={text}>Ein Fahrlehrer hat den 30-Tage-Test angefragt. Bitte umgehend kontaktieren.</Text>

        <Section style={card}>
          <Heading style={cardTitle}>Fahrschule</Heading>
          <Text style={detailRow}><strong>Name:</strong> {p.schoolName}</Text>
          <Text style={detailRow}><strong>Adresse:</strong> {p.schoolAddress}</Text>
        </Section>

        <Section style={card}>
          <Heading style={cardTitle}>Kontakt</Heading>
          {p.contactName && <Text style={detailRow}><strong>Ansprechpartner:</strong> {p.contactName}</Text>}
          <Text style={detailRow}><strong>E-Mail:</strong> {p.email}</Text>
          <Text style={detailRow}><strong>Telefon:</strong> {p.phone}</Text>
          {p.message && <Text style={detailRow}><strong>Nachricht:</strong> {p.message}</Text>}
        </Section>

        <Hr style={divider} />
        <Text style={footer}>Diese E-Mail wurde automatisch generiert.</Text>
        <Text style={footerBrand}>{SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `🎯 Trial-Anfrage: ${d.schoolName || d.contactName || d.email}`,
  displayName: 'Fahrlehrer Trial-Anfrage (Admin)',
  to: 'info@l-me.ch',
  previewData: {
    contactName: 'Thomas Keller',
    schoolName: 'Fahrschule Keller',
    schoolAddress: 'Bahnhofstrasse 12, 5430 Wettingen',
    email: 'thomas@example.com',
    phone: '079 123 45 67',
    message: 'Bitte am Vormittag anrufen.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '600px', margin: '0 auto' }
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
