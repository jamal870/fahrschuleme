---
name: Google Calendar Sync via Lovable Connector
description: GCal sync uses Lovable connector gateway (not OAuth refresh token)
type: integration
---

# Google Calendar Sync

**Edge Function:** `supabase/functions/sync-course-to-gcal/index.ts`

## Architecture (Final, Working)

Uses **Lovable Connector Gateway** instead of manual Google OAuth.

- Base URL: `https://connector-gateway.lovable.dev/google_calendar/calendar/v3`
- Auth header: `X-Connection-Api-Key: ${GOOGLE_CALENDAR_API_KEY}`
- Bearer: `Authorization: Bearer ${LOVABLE_API_KEY}`

## Required Secrets
- `LOVABLE_API_KEY` (managed)
- `GOOGLE_CALENDAR_API_KEY` (connector key from standard_connectors)
- `GCAL_CALENDAR_ID` (target calendar)

## Do NOT
- Do NOT reintroduce manual OAuth (`GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN`) — refresh tokens expire and break sync with `invalid_grant`.
- Do NOT call `googleapis.com` directly.

## Why
Refresh tokens repeatedly expired (Google rotates / revokes after 7 days for testing apps). Connector gateway handles token lifecycle automatically.
