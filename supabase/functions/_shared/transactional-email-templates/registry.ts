/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as bookingConfirmation } from './booking-confirmation.tsx'
import { template as fahrstundenConfirmation } from './fahrstunden-confirmation.tsx'
import { template as adminBookingNotification } from './admin-booking-notification.tsx'
import { template as courseReminder } from './course-reminder.tsx'
import { template as waitlistAdminNotification } from './waitlist-admin-notification.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'booking-confirmation': bookingConfirmation,
  'fahrstunden-confirmation': fahrstundenConfirmation,
  'admin-booking-notification': adminBookingNotification,
  'course-reminder': courseReminder,
  'waitlist-admin-notification': waitlistAdminNotification,
}
