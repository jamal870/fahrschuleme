# Schema-Mapping: Supabase → Appwrite

## Auth & Rollen

| Supabase | Appwrite |
|----------|----------|
| `auth.users` | Appwrite Auth (Users) |
| `public.user_roles` | Collection `user_roles` |
| `has_role(user_id, role)` | Appwrite Function oder Permission-Query |

**Collection `user_roles`**
- `userId` (string, required) – Appwrite User ID
- `role` (string, enum: `admin`, `user`)

## Kerntabellen

### `bookings` → Collection `bookings`
| Supabase-Spalte | Appwrite-Attribut | Typ |
|-----------------|-------------------|-----|
| `id` | `$id` | string (UUID) |
| `booking_type` | `bookingType` | string |
| `first_name` | `firstName` | string |
| `last_name` | `lastName` | string |
| `address` | `address` | string |
| `postal_code` | `postalCode` | string |
| `city` | `city` | string |
| `birth_date` | `birthDate` | string |
| `fa_number` | `faNumber` | string |
| `email` | `email` | string |
| `phone` | `phone` | string |
| `payment_method` | `paymentMethod` | string |
| `total_price` | `totalPrice` | double |
| `payment_status` | `paymentStatus` | string |
| `status` | `status` | string |
| `created_at` | `$createdAt` | datetime |
| `updated_at` | `$updatedAt` | datetime |

### `booking_items` → Collection `booking_items`
| Supabase-Spalte | Appwrite-Attribut | Typ |
|-----------------|-------------------|-----|
| `id` | `$id` | string |
| `booking_id` | `bookingId` | string (Relation) |
| `course_date_id` | `courseDateId` | string (Relation) |
| `fahrstunden_service_id` | `fahrstundenServiceId` | string |
| `fahrstunden_package_id` | `fahrstundenPackageId` | string |
| `instructor` | `instructor` | string |

### `course_dates` → Collection `course_dates`
| Supabase-Spalte | Appwrite-Attribut | Typ |
|-----------------|-------------------|-----|
| `id` | `$id` | string |
| `part` | `part` | integer |
| `day` | `day` | string |
| `date` | `date` | string |
| `time` | `time` | string |
| `location` | `location` | string |
| `instructor` | `instructor` | string |
| `instructor_number` | `instructorNumber` | string |
| `price` | `price` | double |
| `spots_available` | `spotsAvailable` | integer |
| `gcal_event_id` | `gcalEventId` | string |

### `course_signatures` → Collection `course_signatures`
| Supabase-Spalte | Appwrite-Attribut | Typ |
|-----------------|-------------------|-----|
| `id` | `$id` | string |
| `course_date_id` | `courseDateId` | string |
| `booking_id` | `bookingId` | string |
| `signature_data` | `signatureData` | string |
| `present` | `present` | boolean |
| `signed_at` | `signedAt` | datetime |

### `email_settings` → Collection `email_settings`
| Supabase-Spalte | Appwrite-Attribut | Typ |
|-----------------|-------------------|-----|
| `id` | `$id` | string |
| `from_name` | `fromName` | string |
| `reply_to_email` | `replyToEmail` | string |
| `footer_signature` | `footerSignature` | string |
| `bank_info` | `bankInfo` | string |
| `mgk_greeting_extra` | `mgkGreetingExtra` | string |
| `mgk_meeting_point` | `mgkMeetingPoint` | string |
| `mgk_important_notes` | `mgkImportantNotes` | string |
| `mgk_cancellation_policy` | `mgkCancellationPolicy` | string |
| `fahrstunden_greeting_extra` | `fahrstundenGreetingExtra` | string |
| `fahrstunden_meeting_point` | `fahrstundenMeetingPoint` | string |
| `fahrstunden_important_notes` | `fahrstundenImportantNotes` | string |
| `reminder_extra_note` | `reminderExtraNote` | string |

### `waitlist` → Collection `waitlist`
| Supabase-Spalte | Appwrite-Attribut | Typ |
|-----------------|-------------------|-----|
| `id` | `$id` | string |
| `course_date_id` | `courseDateId` | string |
| `first_name` | `firstName` | string |
| `last_name` | `lastName` | string |
| `email` | `email` | string |
| `phone` | `phone` | string |
| `notes` | `notes` | string |
| `status` | `status` | string |
| `notified_at` | `notifiedAt` | datetime |

### `promotions`, `site_content`, `team_members`, `fahrstunden_services`, `fahrstunden_packages`
Analog als Collections anlegen, Attribute 1:1 übertragen.

## Storage

| Supabase | Appwrite |
|----------|----------|
| Bucket `email-assets` | Bucket `email-assets` (öffentlich) |

## Functions-Mapping

| Supabase Edge Function | Appwrite Function |
|------------------------|-------------------|
| `create-booking` | `create-booking` |
| `create-course-payment` | `create-course-payment` |
| `stripe-webhook` | `stripe-webhook` |
| `send-transactional-email` | `send-transactional-email` |
| `process-email-queue` | `process-email-queue` |
| `send-course-reminders` | `send-course-reminders` |
| `sync-course-to-gcal` | `sync-course-to-gcal` |
| `ical-feed` | `ical-feed` |
| `get-google-reviews` | `get-google-reviews` |
| `add-to-waitlist` | `add-to-waitlist` |
| `admin-cancel-booking` | `admin-cancel-booking` |
| `admin-add-participant` | `admin-add-participant` |
| `move-booking-participant` | `move-booking-participant` |
| `parse-course-photo` | `parse-course-photo` |
| `handle-email-unsubscribe` | `handle-email-unsubscribe` |
| `handle-email-suppression` | `handle-email-suppression` |

## Cron-Jobs

| Supabase | Appwrite |
|----------|----------|
| Datenbank-Trigger + Cron für E-Mail-Queue | Appwrite-Cron oder externer Scheduler |
