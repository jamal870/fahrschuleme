#!/bin/bash
set -e

echo "=== Appwrite Setup auf Hostinger VPS ==="

# 1. System-Updates
sudo apt-get update && sudo apt-get upgrade -y

# 2. Docker & Docker Compose installieren
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  echo "Docker installiert. Bitte aus- und wieder einloggen, damit die Gruppenänderung wirksam wird."
fi

if ! command -v docker-compose &> /dev/null; then
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# 3. Verzeichnis anlegen
mkdir -p ~/appwrite
cd ~/appwrite

# 4. .env aus Vorlage kopieren, falls noch nicht vorhanden
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Bitte .env bearbeiten und sichere Passwörter/Keys eintragen."
  echo "Generiere automatisch OpenSSL- und Executor-Secrets..."
  sed -i "s|_APP_OPENSSL_KEY_V1=CHANGE_ME|_APP_OPENSSL_KEY_V1=$(openssl rand -base64 32)|" .env
  sed -i "s|_APP_EXECUTOR_SECRET=CHANGE_ME|_APP_EXECUTOR_SECRET=$(openssl rand -hex 32)|" .env
  sed -i "s|_APP_DB_PASS=CHANGE_ME_DB_USER|_APP_DB_PASS=$(openssl rand -hex 16)|" .env
  sed -i "s|_APP_DB_ROOT_PASS=CHANGE_ME_DB_ROOT|_APP_DB_ROOT_PASS=$(openssl rand -hex 16)|" .env
  sed -i "s|_APP_REDIS_PASS=CHANGE_ME_REDIS|_APP_REDIS_PASS=$(openssl rand -hex 16)|" .env
fi

# 5. Docker Compose starten
docker-compose up -d

echo "=== Appwrite startet. Das kann 1–2 Minuten dauern. ==="
echo "Danach erreichbar unter: https://api.fahrschule-me.ch"
echo "Erstelle im Appwrite-Console ein Projekt namens 'fahrschule-me-prod'."
