import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Drive me Fahrschule"

interface BookingConfirmationProps {
  firstName?: string
  lastName?: string
  courses?: Array<{ part: number; date: string; time: string; location: string }>
  totalPrice?: string
  paymentMethod?: string
  bookingId?: string
}

const BookingConfirmationEmail = ({
  firstName,
  lastName,
  courses = [],
  totalPrice,
  paymentMethod,
  bookingId,
}: BookingConfirmationProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Buchungsbestätigung – {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={brandText}>🏍️ {SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>
          Buchungsbestätigung
        </Heading>

        <Text style={text}>
          {firstName ? `Hallo ${firstName}${lastName ? ` ${lastName}` : ''},` : 'Hallo,'}
        </Text>

        <Text style={text}>
          Vielen Dank für deine Buchung! Hier sind deine Kursdaten:
        </Text>

        {courses.length > 0 && (
          <Section style={coursesSection}>
            {courses.map((course, i) => (
              <Section key={i} style={courseItem}>
                <Text style={courseTitle}>MGK Teil {course.part}</Text>
                <Text style={courseDetail}>📅 {course.date}</Text>
                <Text style={courseDetail}>🕐 {course.time}</Text>
                <Text style={courseDetail}>📍 {course.location}</Text>
              </Section>
            ))}
          </Section>
        )}

        <Hr style={divider} />

        <Section style={summarySection}>
          {totalPrice && (
            <Text style={totalText}>
              Gesamtbetrag: <strong>CHF {totalPrice}</strong>
            </Text>
          )}
          {paymentMethod && (
            <Text style={detailText}>
              Zahlungsmethode: {paymentMethod}
            </Text>
          )}
          {bookingId && (
            <Text style={detailText}>
              Buchungsnummer: {bookingId.slice(0, 8).toUpperCase()}
            </Text>
          )}
        </Section>

        <Hr style={divider} />

        <Text style={text}>
          <strong>Wichtig:</strong> Bitte erscheine pünktlich zum Kursort. Bei Fragen erreichst du uns jederzeit.
        </Text>

        <Text style={footer}>
          Freundliche Grüsse,{'\n'}
          Das {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingConfirmationEmail,
  subject: 'Buchungsbestätigung – Drive me Fahrschule',
  displayName: 'Buchungsbestätigung',
  previewData: {
    firstName: 'Max',
    lastName: 'Muster',
    courses: [
      { part: 1, date: '15.04.2026', time: '08:00 – 12:00', location: 'Wettingen' },
      { part: 2, date: '22.04.2026', time: '08:00 – 12:00', location: 'Wettingen' },
      { part: 3, date: '29.04.2026', time: '08:00 – 12:00', location: 'Wettingen' },
    ],
    totalPrice: '480.00',
    paymentMethod: 'Kreditkarte / Debitkarte',
    bookingId: 'a1b2c3d4-e5f6-7890',
  },
} satisfies TemplateEntry

// Styles — brand color: hsl(195, 85%, 42%) ≈ #1098b8
const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { marginBottom: '10px' }
const brandText = { fontSize: '20px', fontWeight: '700' as const, color: '#1098b8', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a2b3c', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#3a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const coursesSection = { margin: '0 0 16px' }
const courseItem = { backgroundColor: '#f0f8fa', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px' }
const courseTitle = { fontSize: '15px', fontWeight: '700' as const, color: '#1098b8', margin: '0 0 4px' }
const courseDetail = { fontSize: '13px', color: '#3a4a5a', margin: '0', lineHeight: '1.6' }
const divider = { borderColor: '#e0eaef', margin: '20px 0' }
const summarySection = { margin: '0 0 8px' }
const totalText = { fontSize: '16px', color: '#1a2b3c', margin: '0 0 6px' }
const detailText = { fontSize: '13px', color: '#6a7a8a', margin: '0 0 4px' }
const footer = { fontSize: '13px', color: '#8a9aaa', margin: '24px 0 0', whiteSpace: 'pre-line' as const }
