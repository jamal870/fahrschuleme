---
name: Routing – BrowserRouter
description: Ab v1.8.0 nutzt die App BrowserRouter statt HashRouter. Canonicals/Sitemap auf https://www.fahrschule-me.ch. Legacy-Hash-Redirect in main.tsx.
type: feature
---

# Routing (Stand v1.8.0, 08.08.2026)

- **`BrowserRouter`** in `src/App.tsx`. **HashRouter ist verboten.**
- Grund für den Wechsel: HashRouter lieferte serverseitig für jede URL dieselbe
  `index.html` (= Startseite). Google meldete „Alternative Seite mit richtigem
  kanonischen Tag" und indexierte keine Unterseite.
- **Kein iFrame-Zwang mehr:** Es gibt keine aktive Fremd-Einbettung.
  `netlify.toml` setzt `X-Frame-Options: SAMEORIGIN`, was Fremd-iFrames ohnehin
  blockiert. Der einzige iFrame im Projekt ist die Google-Maps-Karte in
  `src/pages/Kontakt.tsx` (umgekehrte Richtung, irrelevant).

## Regeln

1. Interne Links immer als echte Pfade (`/preise`), **nie** `#/preise`.
2. Kanonische Basis-URL überall: `https://www.fahrschule-me.ch` (mit `www`,
   das ist die Netlify Primary Domain). Gilt für `Seo.tsx`, `Breadcrumbs.tsx`,
   `LocalLandingPage.tsx`, Seiten-eigene `SITE_URL`-Konstanten, `index.html`
   und `public/sitemap.xml`.
3. `src/main.tsx` enthält eine Legacy-Weiterleitung: `/#/pfad` → `/pfad`.
   Nicht entfernen — alte Lesezeichen, E-Mail-Links und Google-Treffer
   verweisen noch auf Hash-URLs.
4. In `index.html` darf **kein** Hash-Deep-Link-Fallback-Skript stehen.
   Das alte Skript erzeugte mit BrowserRouter eine Redirect-Schleife
   (`/preise` → `/#/preise` → `/preise` → …).
5. Deep Links funktionieren über den SPA-Fallback in `netlify.toml`
   (`/* → /index.html`, Status 200). Der muss unterste Redirect-Regel bleiben.
6. Edge Functions, die URLs bauen, ebenfalls ohne Hash:
   `create-course-payment` (Stripe success/cancel), `process-email-queue`
   (List-Unsubscribe).
