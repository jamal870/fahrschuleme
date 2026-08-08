#!/bin/bash
set -e

BACKUP_DIR="/opt/backups/appwrite"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR/$TIMESTAMP"

echo "=== Appwrite Backup $TIMESTAMP ==="

# Docker-Volumes sichern
cd /opt/appwrite || exit 1

# MariaDB-Datenbank
docker exec appwrite-mariadb mysqldump -u root -p"$(grep _APP_DB_ROOT_PASS .env | cut -d '=' -f2)" --all-databases --single-transaction \
  > "$BACKUP_DIR/$TIMESTAMP/mariadb.sql" 2>/dev/null || echo "DB-Backup übersprungen (Container noch nicht bereit)"

# Appwrite-Konfiguration und Uploads
tar czf "$BACKUP_DIR/$TIMESTAMP/appwrite-volumes.tgz" \
  /var/lib/docker/volumes/appwrite-uploads \
  /var/lib/docker/volumes/appwrite-config \
  /var/lib/docker/volumes/appwrite-certificates \
  2>/dev/null || echo "Volume-Backup teilweise übersprungen"

# .env sichern
cp .env "$BACKUP_DIR/$TIMESTAMP/.env"

# Alte Backups aufräumen (älter als 7 Tage)
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \;

echo "Backup gespeichert unter: $BACKUP_DIR/$TIMESTAMP"
