# 301 Redirect Map: l-me.ch (WordPress) → neue Lovable-App

Quelle: https://l-me.ch/sitemap_index.xml (Stand Juni 2026)
Ziel-Domain: https://l-me.ch (HashRouter → `/#/...`)

## Direkte Mappings (relevante Inhaltsseiten)

| Alte URL (WP)                                  | Neue URL (App)         | Status |
|------------------------------------------------|------------------------|--------|
| `/`                                            | `/#/`                  | 301    |
| `/grundkurs/`                                  | `/#/grundkurs`         | 301    |
| `/grundkurs-buchen/`                           | `/#/grundkurs-buchen`  | 301    |
| `/motorrad/` , `/motorrad-2/`                  | `/#/grundkurs`         | 301    |
| `/motorrad-fuhrerschein-wettingen/`            | `/#/grundkurs`         | 301    |
| `/fahrstunden/` , `/fahrstunden-2/`            | `/#/` (Abschnitt Fahrstunden) | 301 |
| `/buchen-sie-eine-fahrstunde/`                 | `/#/`                  | 301    |
| `/nothelfer/` , `/nothelfer-2/` , `/nothelfer-3/` | `/#/` (Nothelfer-Sektion) | 301 |
| `/verkehrskunde/`                              | `/#/` (VKU-Sektion)    | 301    |
| `/unterrichtspakete/` , `/preise/`             | `/#/` (Preise-Sektion) | 301    |
| `/unser-team/` , `/team/`                      | `/#/` (Team-Sektion)   | 301    |
| `/fahrschule-drive-me-wettingen/`              | `/#/`                  | 301    |
| `/kontakt/` , `/kontakt-2/` , `/kontakt-3/`    | `/#/` (Kontakt-Sektion)| 301    |
| `/impressum/`                                  | `/#/impressum` *(noch zu erstellen)* | 301 |
| `/datenschutz/` , `/privacy-policy-terms-of-use/` | `/#/datenschutz` *(noch zu erstellen)* | 301 |
| `/agb/` , `/term_conditions/`                  | `/#/agb` *(noch zu erstellen)* | 301 |

## Wegwerf-Seiten (→ Startseite, kein Mehrwert)

Diese WP-Plugin-/Demo-Seiten existieren nicht mehr → alle auf `/#/`:

`/hello-world/`, `/startseit-2/`, `/301-2/`, `/demo/`, `/cart/`, `/cart-2/`,
`/checkout/`, `/checkout-2/`, `/shop/`, `/product/*`, `/courses/*`,
`/book-appointment/`, `/my-bookings/`, `/thank-you/`, `/cancel-appointment/`,
`/cancel-payment/`, `/appointment-cancellation-confirmation/`, `/formulare/`,
`/event-directory/`, `/etn_category/`, `/etn-tags/`, `/veranstaltungen/`,
`/edit-profile/`, `/password-reset/`, `/instructor-registration/`,
`/membership-pricing/`, `/student-registration/`, `/tutor-login/`,
`/lms-course/`, `/login/`, `/admin-dashboard/`, `/user-dashboard/`,
`/booking-course/`, `/lp-checkout/`, `/lp-profile/`, `/lp_*`,
`/instructors/`, `/instructor/`, `/become_a_teacher/`, `/my-account/`,
`/kundenpanel/`, `/mitarbeiterpanel/`

## Technische Umsetzung (sobald Domain verbunden)

Lovable-Hosting hat keine `_redirects`/`.htaccess`-Unterstützung.
Lösung: Erweiterung des bestehenden Hash-Fallback-Scripts in `index.html`
um eine Mapping-Tabelle + `history.replaceState` mit `<meta name="robots">`-Hinweis.
Für Google: zusätzlich `<link rel="canonical">` auf der Zielseite – Google
behandelt JS-Redirects ≥1s als Soft-301 (funktioniert für SPA gut).

Sobald `l-me.ch` in den Project-Settings verbunden ist, sage Bescheid –
dann aktiviere ich Mapping + SEO-Tags in einem Rutsch.
