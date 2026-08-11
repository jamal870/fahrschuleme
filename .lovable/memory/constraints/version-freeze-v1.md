---
name: Version Freeze v1.9.0
description: Stable production freeze 2026-08-11 (v1.9.0, self-hosted VPS backend). No changes without explicit approval.
type: constraint
---
**Version 1.9.0 ist eingefroren (2026-08-11).**

Stand: KI-Assistenten (ASK AI öffentlich + Admin-Assistent), BYOK-Keyverwaltung
(`ai_providers`, `ai_assistant_config`, Edge Function `ai-settings`), ASA-Import,
Google-Kalender-Sync per Service Account, Auto-Deploy der Edge Functions auf den VPS.
Backend läuft self-hosted auf dem Hostinger-VPS, Frontend auf Netlify.

Keine Code-Änderungen mehr ohne ausdrückliche Freigabe des Betreibers. Erlaubt sind nur:
1. Sicherheits-Hotfixes (Patch-Bump → 1.9.x + Eintrag in VERSION.md)
2. Inhaltsänderungen über das Admin-Panel (Preise, Kurstermine, Team, Promotions, KI-Keys)

Vor jeder Änderung: VERSION.md lesen, Bestätigung einholen, danach Version-Bump + Changelog-Eintrag.

**Why:** Produktion läuft stabil auf www.fahrschule-me.ch mit self-hosted Backend.
Ungeprüfte Refactors haben früher Regressionen erzeugt (White-Screen, Key-Mismatch,
fehlgeschlagene Deploys, doppelte Kalendereinträge).

**How to apply:** Bei jedem neuen Auftrag zuerst prüfen, ob er die Freeze-Regel berührt.
Wenn ja: nachfragen statt loslegen. Deploy-relevante Änderungen immer mit dem Hinweis
verbinden, dass Edge Functions und Migrationen auf dem VPS nachgezogen werden müssen.
