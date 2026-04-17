#!/bin/bash
# ── AnDy Serveur — accès SSH + dashboard ─────────────────────────────────────
clear
echo ""
echo "  ┌────────────────────────────────────────────────────┐"
echo "  │   TRACKR SERVER  62.238.12.221  Hetzner CX22       │"
echo "  └────────────────────────────────────────────────────┘"
echo ""
echo "  → Ouverture du dashboard..."
open "http://62.238.12.221:4000" 2>/dev/null &
echo "  → Connexion SSH..."
echo ""
ssh -t root@62.238.12.221 '
clear
echo ""
echo "  ╔══ TRACKR SERVER ══════════════════════════════════╗"
echo "  ║  Dashboard : http://62.238.12.221:4000            ║"
echo "  ║  Chat      : http://62.238.12.221:4000/chat       ║"
echo "  ╚════════════════════════════════════════════════════╝"
echo ""
pm2 status
echo ""
exec bash
'
