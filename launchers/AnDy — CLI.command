#!/bin/bash
# ── AnDy CLI — double-clique pour ouvrir le terminal IA ──────────────────────
clear
cd "$(dirname "$0")/.."
echo ""
echo "  ┌────────────────────────────────────────────────────┐"
echo "  │           AnDy CLI — Intelligence Artificielle     │"
echo "  │           claude-sonnet-4-6 · streaming            │"
echo "  └────────────────────────────────────────────────────┘"
echo ""
node cli/andy.js
