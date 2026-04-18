# Audit Technique - Trackr AI Hub

## 1. Trackr (React 19 + Vite)
**Repo:** andrea-ai992/trackr-ai-hub
**URL:** https://trackr-app-nu.vercel.app

### Pages Existantes (`src/pages/*.jsx`)

| Page | État Design | Bugs Visuels | Notes |
|------|-------------|--------------|-------|
| Dashboard | ✅ Cohérent | ❌ Texte `JetBrains Mono` non appliqué | Utilise `font-family: monospace` au lieu de `JetBrains Mono` |
| Sports | ✅ Cohérent | ✅ Aucun | - |
| Markets | ✅ Cohérent | ❌ Overflow horizontal sur tableaux | `overflow-x: auto` nécessaire |
| News | ✅ Cohérent | ✅ Aucun | - |
| Andy | ✅ Cohérent | ❌ Texte trop petit sur messages | `font-size: 0.875rem` trop petit |
| Agents | ✅ Cohérent | ✅ Aucun | - |
| Portfolio | ✅ Cohérent | ❌ Contraste faible sur liens | `--text-primary` vs `--text-secondary` mal utilisés |
| CryptoTrader | ❌ **Stub** | - | Voir section 2 |
| Signals | ✅ Cohérent | ✅ Aucun | - |
| BrainExplorer | ✅ Cohérent | ✅ Aucun | - |
| FlightTracker | ✅ Cohérent | ❌ Texte coupé sur mobile | `white-space: nowrap` nécessaire |
| Sneakers | ✅ Cohérent | ✅ Aucun | - |
| Watches | ✅ Cohérent | ✅ Aucun | - |
| RealEstate | ✅ Cohérent | ❌ Overflow sur cartes | `overflow: hidden` nécessaire |
| BusinessPlan | ✅ Cohérent | ❌ Contraste faible sur boutons | `--surface-low` vs `--surface-high` mal contrastés |
| Patterns | ✅ Cohérent | ✅ Aucun | - |
| ChartAnalysis | ✅ Cohérent | ❌ Texte illisible sur graphiques | `--text-muted` trop sombre |

### Problèmes Design Systèmes
- **Police:** Toutes les pages utilisent `monospace` au lieu de `JetBrains Mono`.
- **Contraste:** Plusieurs pages utilisent `--text-secondary` (#aaa) qui est trop clair sur `--surface-low` (#111).
- **Overflow:** Tables et cartes débordent sans `overflow-x: auto`.
- **Mobile:** Plusieurs pages ont des textes trop petits (`font-size: 0.875rem`).

---

## 2. CryptoTrader (`src/pages/CryptoTrader.jsx`)

**État:** ❌ **Stub non développé**
- Fichier présent mais vide (sauf imports).
- Contenu minimal :