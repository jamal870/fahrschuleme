# Project Memory

## Core
- Light theme, primary accent #e8501a. Fonts: Rajdhani (headings), DM Sans (body). 3px border-radius.
- Strictly use HashRouter for stable iframe embedding on main domain.
- Never hardcode branding/pricing. All tenant data centralized in `src/config/tenant.ts`.
- No direct public DB inserts. All bookings via `create-booking` edge function.
- Stripe: Open in blank tab to bypass popups, use DB polling. Webhook confirms payment.
- Unprotected admin setup scripts are permanently removed for security.
- DNS bleibt IMMER bei Netlify. Niemals DNS/Domains über Lovable verwalten oder vorschlagen.

## Memories
- [No DNS changes](mem://constraints/no-dns-changes) — DNS/Domain-Management strikt bei Netlify, nicht über Lovable
- [Chatbot Core](mem://features/chatbot/core) — `<ChatBot />` component logic, flows, and UX behavior
- [Lesson Booking Logic](mem://features/booking/fahrstunden-logic) — Lesson types and duration rules for cars and motorcycles
- [MGK Sequential Logic](mem://features/booking/mgk-sequential-logic) — Chronological requirements for basic motorcycle courses
- [Inventory & Booking Status](mem://architecture/database/inventory-management) — Database constraints and spot decrement logic
- [Admin Panel](mem://features/admin/panel) — Admin panel setup and security constraints
- [Security & Access Control](mem://architecture/security/access-control) — RLS, edge function logic, and internal auth
- [Email Configuration](mem://infrastructure/email/configuration) — Templates, sender details, and notification rules
- [Branding Guidelines](mem://style/branding-guidelines) — Colors, typography, and logo details
- [Stripe Payment Implementation](mem://integration/stripe/technical-implementation) — Stripe polling, popup handling, and webhook logic
- [White-Label Configuration](mem://architecture/white-label/tenant-configuration) — Centralized tenant config file structure
- [Document Generation](mem://features/admin/document-generation) — PDF generation for invoices and confirmations
- [HashRouter for iFrame](mem://architecture/routing/iframe-compatibility) — Routing requirements for iframe embedding
