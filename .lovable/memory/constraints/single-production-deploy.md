---
name: Single production deploy path
description: Nur Netlify + VPS ist Produktion - kein zweiter Deploy-Pfad, keine Cloud-DB
type: constraint
---
Produktion ist ausschliesslich: GitHub main -> Netlify (Frontend) + VPS self-hosted Supabase (Backend/DB/Edge Functions). Deploy-Workflows: deploy-netlify.yml + deploy-vps-functions.yml. Verboten: Lovable-Publish als Produktion, Lovable-Cloud-DB-Aenderungen fuer Live-Daten, zusaetzliche Deploy-Targets. Why: User will keine doppelte Arbeit durch 2 Deploys und keine falsche DB.
