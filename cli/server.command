#!/bin/bash
# ── Trackr Server — double-clique pour tout gérer ────────────────────────────
clear
echo ""
echo "  ┌────────────────────────────────────────────────────┐"
echo "  │         TRACKR SERVER                              │"
echo "  │   62.238.12.221  •  Hetzner CX22  •  €3.79/mois  │"
echo "  └────────────────────────────────────────────────────┘"
echo ""

# Ouvre le dashboard dans le navigateur
echo "  → Ouverture du dashboard..."
open "http://62.238.12.221:4000" 2>/dev/null &

echo "  → Connexion SSH..."
echo ""
ssh -t root@62.238.12.221 '
clear
echo ""
echo "  ╔══ TRACKR SERVER ══════════════════════════════════╗"
echo "  ║  Dashboard web : http://62.238.12.221:4000        ║"
echo "  ╚════════════════════════════════════════════════════╝"
echo ""
pm2 status
echo ""
echo "  pm2 logs andy-daemon    — logs IA"
echo "  pm2 logs discord-bot    — logs Discord"
echo "  pm2 restart all         — tout redémarrer"
echo "  cd /root/trackr         — aller dans le projet"
echo ""
exec bash
'
