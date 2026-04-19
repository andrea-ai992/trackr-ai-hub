# Audit Technique - Trackr AI Hub

## 1. Trackr (React 19 + Vite)
**Repo:** andrea-ai992/trackr-ai-hub
**URL:** https://trackr-app-nu.vercel.app

### Pages Existantes (`src/pages/*.jsx`)

| Page | État Design | Bugs Visuels | Notes |
|------|-------------|--------------|-------|
| Dashboard | ❌ Incohérent | ❌ Police non JetBrains Mono, contraste faible sur métriques | Remplacer `monospace` par `JetBrains Mono`, `--text-primary` trop clair sur `--surface-low` |
| Sports | ❌ Incohérent | ❌ Police non JetBrains Mono | Remplacer `monospace` par `JetBrains Mono` |
| Markets | ❌ Incohérent | ❌ Overflow horizontal, police non JetBrains Mono | Ajouter `overflow-x: auto`, remplacer `monospace` par `JetBrains Mono` |
| News | ❌ Incohérent | ❌ Police non JetBrains Mono | Remplacer `monospace` par `JetBrains Mono` |
| Andy | ❌ Incohérent | ❌ Texte trop petit, police non JetBrains Mono | `font-size: 1rem`, remplacer `monospace` par `JetBrains Mono` |
| Agents | ❌ Incohérent | ❌ Police non JetBrains Mono | Remplacer `monospace` par `JetBrains Mono` |
| Portfolio | ❌ Incohérent | ❌ Contraste faible sur liens, police non JetBrains Mono | Utiliser `--text-primary` sur `--surface-high`, remplacer `monospace` par `JetBrains Mono` |
| Signals | ❌ Incohérent | ❌ Police non JetBrains Mono | Remplacer `monospace` par `JetBrains Mono` |
| BrainExplorer | ❌ Incohérent | ❌ Police non JetBrains Mono | Remplacer `monospace` par `JetBrains Mono` |
| FlightTracker | ❌ Incohérent | ❌ Texte coupé, police non JetBrains Mono | Ajouter `overflow: hidden`, `white-space: normal`, remplacer `monospace` par `JetBrains Mono` |
| Sneakers | ❌ Incohérent | ❌ Police non JetBrains Mono | Remplacer `monospace` par `JetBrains Mono` |
| Watches | ❌ Incohérent | ❌ Police non JetBrains Mono | Remplacer `monospace` par `JetBrains Mono` |
| RealEstate | ❌ Incohérent | ❌ Overflow sur cartes, police non JetBrains Mono | Ajouter `overflow: hidden`, remplacer `monospace` par `JetBrains Mono` |
| BusinessPlan | ❌ Incohérent | ❌ Contraste faible sur boutons, police non JetBrains Mono | Utiliser `--text-primary` sur `--surface-high`, remplacer `monospace` par `JetBrains Mono` |
| Patterns | ❌ Incohérent | ❌ Police non JetBrains Mono | Remplacer `monospace` par `JetBrains Mono` |
| ChartAnalysis | ❌ Incohérent | ❌ Texte illisible, police non JetBrains Mono | Utiliser `--text-primary` sur `--surface-low`, remplacer `monospace` par `JetBrains Mono` |

### Problèmes Design Systèmes
- **Police:** Aucune page n'utilise `JetBrains Mono` (remplacé par `monospace` générique).
- **Contraste:** Utilisation excessive de `--text-secondary` (#aaa) sur `--surface-low` (#111) → ratio < 4.5.
- **Overflow:** Tables et cartes débordent sans `overflow-x: auto` ou `overflow: hidden`.
- **Mobile:** Plusieurs pages ont des textes trop petits (`font-size: 0.875rem`).
- **Thème:** Fond `#080808` utilisé au lieu de `--bg #080808` (var non appliquée).

---

## 2. CryptoTrader (`src/pages/CryptoTrader.jsx`)

**État:** ❌ **Stub non développé**
- Fichier présent mais vide (hors imports).
- Contenu minimal :