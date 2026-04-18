# DESIGN SYSTEM — Trackr AI Hub
# Source de vérité pour tous les travaux de design du daemon AnDy
# Respecter STRICTEMENT ces règles dans chaque fichier touché

## Identité Visuelle
- **Nom de l'app** : Trackr AI Hub
- **Concept** : Terminal financier premium / Bloomberg mobile dark
- **Feeling** : Dense, rapide, vivant — comme un terminal de trading pro
- **Cible** : Mobile-first (375px → 430px), aussi tablette (768px)

## Palette de Couleurs
```
--bg              : #080808   → fond de page (noir profond)
--surface         : #0f0f0f   → surface cards
--surface-low     : #111111   → surface légèrement élevée
--surface-high    : #1a1a1a   → card hover / accent surface
--neon            : #00ff88   → couleur principale — vert terminal
--neon-dim        : #00cc66   → neon atténué (labels, badges)
--neon-glow       : rgba(0,255,136,0.15)  → halo glow large
--neon-glow-soft  : rgba(0,255,136,0.08)  → glow très subtil
--text-primary    : #e0e0e0   → texte principal
--text-secondary  : #aaaaaa   → texte secondaire
--text-muted      : #555555   → texte inactif
--border          : rgba(0,255,136,0.08)  → bordure par défaut
--border-bright   : rgba(0,255,136,0.18) → bordure hover/active
```

## Typographie
- **Font principale** : `'JetBrains Mono', monospace` — TOUJOURS
- **Hiérarchie** :
  - Titre page : 18-20px / weight 700 / letter-spacing -0.02em
  - Label card  : 11-12px / weight 600 / uppercase / letter-spacing 0.08em
  - Valeur      : 16-24px / weight 700 / tabular-nums
  - Corps       : 13-14px / weight 400
  - Muted       : 11-12px / weight 400 / text-muted

## Composants de Base

### Card
```css
background: var(--surface);
border: 1px solid var(--border);
border-radius: 12px;
padding: 14px 16px;
transition: border-color 0.2s, box-shadow 0.2s;
&:hover { border-color: var(--border-bright); box-shadow: var(--glow-primary); }
```

### Bouton primaire
```css
background: var(--neon);
color: #000;
border: none;
border-radius: 8px;
padding: 10px 18px;
font-weight: 700;
font-family: 'JetBrains Mono', monospace;
```

### Bouton ghost
```css
background: transparent;
border: 1px solid var(--border-bright);
color: var(--neon);
border-radius: 8px;
```

### Badge/Pill
```css
background: var(--neon-glow-soft);
border: 1px solid var(--border-bright);
color: var(--neon);
border-radius: 999px;
padding: 2px 8px;
font-size: 11px;
font-weight: 600;
```

### Valeur positive (haussier)
```css
color: var(--neon); /* vert */
```

### Valeur négative (baissier)
```css
color: #ff4444;
```

## Patterns UI Obligatoires

### Headers de page
- Fond `--bg` collant (sticky)
- Titre + icon lucide à gauche
- Action (refresh/filter) à droite
- Séparateur : `border-bottom: 1px solid var(--border)`
- Hauteur : 52-56px

### Listes de données (scores, prix, news)
- Items séparés par `border-bottom: 1px solid var(--border)` (PAS de cards)
- Padding : 12px 16px
- Tap target minimum : 48px height
- Hover : `background: var(--surface-low)`

### Skeletons de chargement
- `background: var(--surface-high)`
- Animation shimmer : opacity 0.4 → 0.8 → 0.4, durée 1.4s
- Jamais de spinner, toujours skeleton

### États vides
- Icon lucide centré, 32px, color: --text-muted
- Message 2 lignes max, 13px, --text-muted
- PAS de bouton sauf si action directe

## Animations
- **Micro-interactions** : `transition: all 0.15s ease`
- **Entrée de page** : `opacity 0 → 1, translateY(8px → 0)`, 200ms
- **Pull-to-refresh** : indicateur vert neon en haut
- **PAS** de framer-motion, PAS de GSAP — CSS pur uniquement
- **PAS** de `animation-duration > 400ms` sauf skeleton

## Mobile (Règles Strictes)
- Padding horizontal page : `16px` toujours
- Bottom padding : `calc(72px + env(safe-area-inset-bottom))` (BottomNav)
- Touch target min : 44x44px
- Font size min : 11px (jamais en dessous)
- Overflow-x : hidden sur tous les containers
- Scroll : `-webkit-overflow-scrolling: touch`

## BottomNav (NE PAS MODIFIER la structure)
- 5 onglets : Hub / Sports / Markets / Pulse / More
- Pill indicator vert animé qui glisse entre onglets
- Background : glass `rgba(8,8,8,0.95)` + blur

## Ce qu'on AMÉLIORE en priorité
1. **Dashboard** — cards crypto trop basiques, vouloir un vrai feed "terminal"
2. **Sports** — scores doivent être denses comme une app de paris  
3. **News/Pulse** — lecteur fluide type Reeder avec swipe
4. **Markets** — watchlist compacte + sparklines sur chaque ligne
5. **More** — grid de modules avec icons grandes et labels courts
6. **Transitions** — page enter/exit smooth (slide ou fade)
7. **Typography** — cohérence des tailles partout (audit complet)
8. **Skeleton loaders** — tous les états de chargement manquants

## Interdits
- Couleurs bright (rouge flashy, bleu royal, jaune pétant) comme couleur principale
- Backgrounds blancs ou light
- Border-radius > 16px sur les cards principales
- Fonts serif ou sans-serif (que monospace)
- Gradients dégradés multicolores
- Ombres portées colorées (sauf neon glow subtil)
- Animations bounce/elastic
