/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Img, Preview, Text, Section, Hr, Link } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "fahrschule me"
const LOGO_URL = "https://dspspshgnointeqxgnrw.supabase.co/storage/v1/object/public/email-assets/logo-lme-light.png"
const PLAY_URL = "https://play.google.com/store/apps/details?id=com.driveme.fahrschule"
const APPSTORE_URL = "https://apps.apple.com/ch/app/fahrschule-me/id6762010003"

interface Props {
  contactName?: string
  schoolName?: string
}

const Email = ({ contactName, schoolName }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Willkommen bei fahrschule me – dein 30-Tage Test startet</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Img src={LOGO_URL} alt="fahrschule me" width="200" style={logoStyle} />
        </Section>
        <Section style={orangeBar} />

        <Heading style={h1}>Vielen Dank für dein Interesse{contactName ? `, ${contactName}` : ''}!</Heading>

        <Text style={text}>
          Schön, dass du <strong>fahrschule me</strong> 30 Tage gratis testen möchtest{schoolName ? ` – willkommen, ${schoolName}!` : '!'}
        </Text>

        <Text style={text}>
          Wir melden uns <strong>umgehend persönlich</strong> bei dir, um deinen Trial-Zugang einzurichten und alle offenen Fragen zu beantworten.
        </Text>

        <Hr style={divider} />

        <Heading style={h2}>App jetzt herunterladen</Heading>
        <Text style={text}>
          Damit du sofort loslegen kannst, lade dir die App direkt aus deinem Store:
        </Text>

        <Section style={buttonRow}>
          <Button href={APPSTORE_URL} style={btnPrimary}>Apple App Store</Button>
        </Section>
        <Section style={buttonRow}>
          <Button href={PLAY_URL} style={btnSecondary}>Google Play Store</Button>
        </Section>

        <Text style={smallText}>
          Direktlinks:<br />
          App Store: <Link href={APPSTORE_URL} style={linkStyle}>{APPSTORE_URL}</Link><br />
          Google Play: <Link href={PLAY_URL} style={linkStyle}>{PLAY_URL}</Link>
        </Text>

        <Hr style={divider} />

        <Heading style={h2}>Was passiert als Nächstes?</Heading>
        <Text style={text}>
          • Wir kontaktieren dich innerhalb von 24 Stunden telefonisch oder per E-Mail<br />
          • Wir richten deinen persönlichen Trial-Zugang ein<br />
          • Du kannst die App 30 Tage gratis & unverbindlich testen – ohne Kreditkarte
        </Text>

        <Text style={text}>
          Bei dringenden Fragen erreichst du uns unter <Link href="mailto:info@fahrschule-me.ch" style={linkStyle}>info@fahrschule-me.ch</Link>.
        </Text>

        <Hr style={divider} />
        <Text style={footer}>Freundliche Grüsse</Text>
        <Text style={footerBrand}>Dein {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Willkommen bei fahrschule me – App-Downloads & nächste Schritte',
  displayName: 'Fahrlehrer Trial – Bestätigung',
  previewData: { contactName: 'Thomas Keller', schoolName: 'Fahrschule Keller' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#1a2344', padding: '24px 25px', borderRadius: '8px 8px 0 0', marginBottom: '4px', textAlign: 'center' as const }
const logoStyle = { margin: '0 auto' }
const orangeBar = { backgroundColor: '#e8501a', height: '4px', borderRadius: '2px', margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '0 0 16px' }
const h2 = { fontSize: '17px', fontWeight: '700' as const, color: '#1a2344', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#3a3a3a', lineHeight: '1.7', margin: '0 0 16px' }
const smallText = { fontSize: '12px', color: '#777777', lineHeight: '1.6', margin: '8px 0 0' }
const divider = { borderColor: '#e5e5e5', margin: '24px 0' }
const buttonRow = { textAlign: 'center' as const, margin: '0 0 10px' }
const btnPrimary = { backgroundColor: '#e8501a', color: '#ffffff', padding: '12px 24px', borderRadius: '3px', fontSize: '14px', fontWeight: '700' as const, textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const btnSecondary = { backgroundColor: '#1a2344', color: '#ffffff', padding: '12px 24px', borderRadius: '3px', fontSize: '14px', fontWeight: '700' as const, textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const linkStyle = { color: '#e8501a', textDecoration: 'underline' }
const footer = { fontSize: '13px', color: '#555555', margin: '24px 0 0' }
const footerBrand = { fontSize: '13px', color: '#e8501a', margin: '4px 0 0', fontWeight: '600' as const }
