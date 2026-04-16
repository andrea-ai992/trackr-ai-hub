#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  Trackr Server Setup — Ubuntu 22.04
#  Run as root: bash setup.sh
#  Installe Node.js 22, PM2, clone le repo, configure .env, démarre tout
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "=== Trackr Server Setup ==="

# ── 1. Node.js 22 ─────────────────────────────────────────────────────────────
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs git

# ── 2. PM2 ────────────────────────────────────────────────────────────────────
npm install -g pm2
pm2 startup systemd -u root --hp /root

# ── 3. Logs ───────────────────────────────────────────────────────────────────
mkdir -p /root/logs

# ── 4. Clone repo ─────────────────────────────────────────────────────────────
cd /root
if [ -d "trackr" ]; then
  cd trackr && git pull
else
  git clone https://github.com/andrea-ai992/trackr-ai-hub.git trackr
  cd trackr
fi

# ── 5. Install deps ───────────────────────────────────────────────────────────
npm install --omit=dev

# ── 6. .env ───────────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  cat > .env << 'ENVEOF'
ANTHROPIC_API_KEY=REMPLACE_MOI
GITHUB_TOKEN=REMPLACE_MOI
GITHUB_REPO=andrea-ai992/trackr-ai-hub
DISCORD_BOT_TOKEN=REMPLACE_MOI
DISCORD_GUILD_ID=1492702672120447107
DISCORD_CH_MORNING=1494155455918903356
DISCORD_CH_MARKET_SCANNER=1492704464916713592
DISCORD_CH_CRYPTO=1492704469526511746
DISCORD_CH_BRAIN=1494155424746831922
DISCORD_CH_AGENT_FORGE=1494155430056956028
APP_URL=https://trackr-app-nu.vercel.app
CRON_SECRET=7628888d2b538733b76096ed5925d86330722d287e35d483580611d65297d4dc
ALPHA_VANTAGE_KEY=93AMHY972IJCOYV6
ENVEOF
  echo ""
  echo "⚠️  IMPORTANT: édite /root/trackr/.env et remplis les clés API !"
  echo "    nano /root/trackr/.env"
  echo ""
fi

# ── 7. bot/.env symlink ───────────────────────────────────────────────────────
ln -sf /root/trackr/.env /root/trackr/bot/.env 2>/dev/null || true

# ── 8. andy-tasks dir ────────────────────────────────────────────────────────
mkdir -p /root/trackr/andy-tasks

# ── 9. Start PM2 ─────────────────────────────────────────────────────────────
pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo "=== ✅ Setup terminé ==="
echo "  pm2 status          — voir les process"
echo "  pm2 logs            — voir les logs live"
echo "  pm2 logs andy-daemon — logs de l'IA seulement"
echo "  pm2 logs discord-bot — logs du bot Discord"
echo "  pm2 restart all     — redémarrer tout"
