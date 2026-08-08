# Appwrite Deployment – Phase 1 Ausführung

## Status
- VPS **Fahrschule.me.prod** bei Hostinger ist bereit.
- **IPv4:** `186.240.156.89`
- **OS:** Ubuntu 24.04 LTS
- **Ressourcen:** KVM 2 (2 vCPU), ausreichend RAM/SSD sichtbar

## Ziel dieser Phase
Appwrite 1.5.7 auf dem VPS installieren, absichern und unter einer festen Subdomain erreichbar machen.

## Gewählte Subdomain
`api.fahrschule-me.ch`

## DNS-Einträge (bei Hostinger / Tajo)
| Typ | Host | Wert |
|-----|------|------|
| A | `api` | `186.240.156.89` |

Optional:
| Typ | Host | Wert |
|-----|------|------|
| A | `functions` | `186.240.156.89` |

## Ablauf
1. DNS-A-Record für `api.fahrschule-me.ch` setzen.
2. Auf dem VPS via SSH einloggen.
3. Repository-Dateien auf den VPS kopieren oder das bereitgestellte Setup-Skript ausführen.
4. `infrastructure/appwrite/.env` mit sicheren Werten füllen.
5. `docker-compose up -d` ausführen.
6. Appwrite-Console unter `https://api.fahrschule-me.ch` öffnen und Projekt `fahrschule-me-prod` anlegen.

## Sicherheit
- Firewall nur für Ports 22, 80, 443.
- Sichere Zufallspasswörter für DB, Redis, Executor-Secret und OpenSSL-Key.
- Root-Console-Zugang auf whitelistete E-Mail beschränken.

## Nächster Schritt nach dieser Phase
Datenbank-Schema und Daten von Supabase nach Appwrite migrieren (Phase 2).
