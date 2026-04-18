#!/bin/bash
# 🚀 Trackr Project Transfer Script
# This script syncs your local code to your remote server.

# Configuration (Defaults)
DEFAULT_USER="root"
DEFAULT_IP="62.238.12.221"
DEFAULT_DEST="/root/trackr"

echo "----------------------------------------------------"
echo "  🚀 Trackr Transfer Utility"
echo "----------------------------------------------------"

# 1. Gather info
read -p "👤 Server User [${DEFAULT_USER}]: " SERVER_USER
SERVER_USER=${SERVER_USER:-$DEFAULT_USER}

read -p "🌐 Server IP [${DEFAULT_IP}]: " SERVER_IP
SERVER_IP=${SERVER_IP:-$DEFAULT_IP}

read -p "📂 Remote Directory [${DEFAULT_DEST}]: " REMOTE_DIR
REMOTE_DIR=${REMOTE_DIR:-$DEFAULT_DEST}

echo ""
echo "Transfère vers: ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}"
echo "----------------------------------------------------"

# 2. Syncing with rsync
# Excluding node_modules, .git, .env (security), and local logs
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'logs' \
  --exclude '.next' \
  --exclude 'dist' \
  -e ssh ./ "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Transfert réussi !"
  echo "----------------------------------------------------"
  echo "Prochaines étapes sur le serveur :"
  echo "1. ssh ${SERVER_USER}@${SERVER_IP}"
  echo "2. cd ${REMOTE_DIR}"
  echo "3. npm install"
  echo "4. pm2 restart ecosystem.config.cjs --env production"
  echo "----------------------------------------------------"
else
  echo ""
  echo "❌ Échec du transfert. Vérifie ta connexion SSH."
fi
