---
name: Version Freeze v1.7.3
description: Stable production freeze 2026-06-22 (v1.7.3). No changes without explicit approval.
type: constraint
---
**Version 1.7.3 ist eingefroren (2026-06-22).**

Keine Code-Änderungen mehr ohne ausdrückliche Freigabe des Betreibers. Erlaubt sind nur:
1. Sicherheits-Hotfixes (mit Patch-Bump → 1.2.x + Eintrag in VERSION.md)
2. Inhaltsänderungen über das Admin-Panel (Preise, Kurstermine, Team, Promotions)

Vor jeder Änderung: VERSION.md lesen, Bestätigung einholen, danach Version-Bump + Changelog-Eintrag.

**Why:** Produktion läuft stabil auf www.fahrschule-me.ch. Spätere ungeprüfte Refactors haben in der Vergangenheit Regressionen erzeugt (White-Screen, Key-Mismatch, Netlify-Deploys).

**How to apply:** Bei jedem neuen Auftrag zuerst prüfen, ob er die Freeze-Regel berührt. Wenn ja: nachfragen statt loslegen.
