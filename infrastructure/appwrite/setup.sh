#!/bin/bash
set -e

VPS_IP="186.240.156.89"
APP_DOMAIN="api.fahrschule-me.ch"
APP_DOMAIN_FUNCTIONS="functions.api.fahrschule-me.ch"

 echo "=== Appwrite Setup auf Hostinger VPS ==="
echo "IP: $VPS_IP"
echo "Domain: $APP_DOMAIN"

# 1. System-Updates
sudo apt-get update && sudo apt-get upgrade -y

# 2. Swap anlegen (sicherer Betrieb bei 2–4 GB RAM)
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "Swap aktiviert."
fi

# 3. Firewall härten
if command -v ufw &> /dev/null; then
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable
  echo "Firewall konfiguriert."
fi

# 4. Docker installieren
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  echo "Docker installiert."
fi

# 5. Docker Compose installieren
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# 6. Appwrite-Verzeichnis vorbereiten
INSTALL_DIR="/opt/appwrite"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# 7. Dateien aus dem Projektordner kopieren, falls vorhanden
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
  cp "$SCRIPT_DIR/docker-compose.yml" "$INSTALL_DIR/docker-compose.yml"
fi
if [ -f "$SCRIPT_DIR/.env.example" ]; then
  cp "$SCRIPT_DIR/.env.example" "$INSTALL_DIR/.env.example"
fi

# 8. .env aus Vorlage erzeugen
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Generiere sichere Zufallswerte in .env..."

  sed -i "s|_APP_DOMAIN=.*|_APP_DOMAIN=$APP_DOMAIN|" .env
  sed -i "s|_APP_DOMAIN_TARGET=.*|_APP_DOMAIN_TARGET=$APP_DOMAIN|" .env
  sed -i "s|_APP_DOMAIN_FUNCTIONS=.*|_APP_DOMAIN_FUNCTIONS=$APP_DOMAIN_FUNCTIONS|" .env
  sed -i "s|_APP_OPENSSL_KEY_V1=CHANGE_ME|_APP_OPENSSL_KEY_V1=$(openssl rand -base64 32)|" .env
  sed -i "s|_APP_EXECUTOR_SECRET=CHANGE_ME|_APP_EXECUTOR_SECRET=$(openssl rand -hex 32)|" .env
  sed -i "s|_APP_DB_PASS=CHANGE_ME_DB_USER|_APP_DB_PASS=$(openssl rand -hex 16)|" .env
  sed -i "s|_APP_DB_ROOT_PASS=CHANGE_ME_DB_ROOT|_APP_DB_ROOT_PASS=$(openssl rand -hex 16)|" .env
  sed -i "s|_APP_REDIS_PASS=CHANGE_ME_REDIS|_APP_REDIS_PASS=$(openssl rand -hex 16)|" .env

  echo "=== WICHTIG ==="
  echo "Bitte .env bearbeiten und mindestens folgende Werte setzen:"
  echo "  - _APP_CONSOLE_WHITELIST_EMAILS"
  echo "  - _APP_SYSTEM_EMAIL_ADDRESS"
  echo "  - _APP_SMTP_PASSWORD"
  echo "==============="
fi

# 9. Docker Compose starten
if command -v docker-compose &> /dev/null; then
  docker-compose up -d
else
  docker compose up -d
fi

# 10. Zusammenfassung
echo ""
echo "=== Appwrite startet. Das kann 1–2 Minuten dauern. ==="
echo "Console: https://$APP_DOMAIN"
echo "Installationsverzeichnis: $INSTALL_DIR"
echo ""
echo "Status prüfen mit:"
echo "  cd $INSTALL_DIR && docker-compose ps"
echo "  cd $INSTALL_DIR && docker-compose logs -f appwrite"
