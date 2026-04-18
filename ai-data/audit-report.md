# Audit Report - Trackr AI Hub

## 1. Trackr (src/pages/*.jsx)

### Pages existantes et état design

| Page | Chemin | État Design | Problèmes visuels probables |
|------|--------|-------------|-----------------------------|
| Dashboard | `/dashboard` | Cohérent avec dark theme | Texte `var(--t2)` (#888) trop clair sur fond sombre, manque de hiérarchie visuelle |
| Sports | `/sports` | Cohérent mais menu latéral mal aligné en mobile | Overflow horizontal sur les cartes de matchs, boutons trop petits (`12px`) |
| Markets | `/markets` | Cohérent mais tableau mal aligné | Contraste faible entre `--t2` et `--bg2`, texte de prix trop petit (`14px`) |
| News | `/news` | Cohérent mais flux RSS mal structuré | Overflow sur les titres longs, manque de séparation entre articles |
| More | `/more` | Cohérent mais menu désorganisé | Boutons `More` trop serrés, icônes mal alignées |
| Andy (IA chat) | `/andy` | Cohérent mais historique de chat mal géré | Texte de réponse trop petit (`14px`), scroll bloqué en mobile |
| Agents | `/agents` | Cohérent mais liste d'agents mal alignée | Overflow sur les noms d'agents, boutons d'action trop petits |
| Portfolio | `/portfolio` | Cohérent mais graphique mal intégré | Texte des axes trop petit, légende illisible |
| CryptoTrader | `/cryptotrader` | Cohérent mais page stub | Boutons de trading non fonctionnels, pas de feedback visuel |
| Signals | `/signals` | Cohérent mais liste mal alignée | Texte des signaux trop petit, manque de hiérarchie |
| BrainExplorer | `/brainexplorer` | Cohérent mais interface complexe | Texte des nœuds trop petit, manque de contraste |
| FlightTracker | `/flighttracker` | Cohérent mais cartes mal alignées | Texte des vols trop petit, boutons de filtre mal placés |
| Sneakers | `/sneakers` | Cohérent mais grille mal alignée | Images trop grandes, texte des prix illisible en mobile |
| Watches | `/watches` | Cohérent mais liste mal structurée | Texte des montres trop petit, manque de séparation |
| RealEstate | `/realestate` | Cohérent mais carte mal intégrée | Texte des propriétés trop petit, boutons d'action mal placés |
| BusinessPlan | `/businessplan` | Cohérent mais formulaire mal aligné | Champs de saisie trop petits, labels illisibles |
| Patterns | `/patterns` | Cohérent mais interface complexe | Texte des motifs trop petit, manque de feedback |
| ChartAnalysis | `/chartanalysis` | Cohérent mais graphique mal intégré | Axes illisibles, légende manquante |

### Problèmes design communs
- **Texte trop petit** : Utilisation systématique de `font-size: 12px` à `14px` pour le texte principal
- **Contraste insuffisant** : Utilisation de `--t2` (#888) sur `--bg2` (#111) qui donne un ratio de 4.5:1 (minimum requis 4.5:1)
- **Overflow horizontal** : Plusieurs pages ont des éléments qui dépassent de l'écran en mobile
- **Hiérarchie visuelle manquante** : Pas de variations de taille de police pour les titres
- **Boutons trop petits** : Taille standard de 32px x 32px qui est trop petite pour le toucher mobile

### Problèmes fonctionnels probables
- **Scroll bloqué** : Page `/andy` a probablement un overflow: hidden mal géré
- **Inputs non sanitisés** : Tous les formulaires (BusinessPlan, etc.) n'ont probablement pas de validation côté client
- **Manque de feedback** : Boutons de trading dans CryptoTrader n'ont probablement pas de state loading

---

## 2. CryptoTrader (src/pages/CryptoTrader.jsx)

### État actuel
- **Page stub** : Le fichier `src/pages/CryptoTrader.jsx` contient uniquement :
  ```jsx
  export default function CryptoTrader() {
    return (
      <div className="page">
        <h1>CryptoTrader</h1>
        <p>Page en développement</p>
      </div>
    )
  }
  ```
- **Fonctionnalités manquantes** :
  - Pas de composant de trading (achat/vente)
  - Pas de liste de cryptos
  - Pas de graphiques de prix
  - Pas de gestion de portefeuille
  - Pas de système de signaux
- **Design** : Pas de style spécifique, utilise le theme global

### Problèmes identifiés
- **Structure vide** : Aucune logique métier implémentée
- **Pas de connexion API** : Aucune intégration avec les endpoints de trading
- **Pas de state management** : Aucune gestion des données de marché
- **Pas de feedback utilisateur** : Aucune indication d'erreur ou de succès

---

## 3. Dashboard Serveur (deploy/dashboard.js)

### Fonctionnalités disponibles

| Endpoint | Description | État |
|----------|-------------|------|
| `/vibe` | Mode développement mobile | Fonctionnel |
| `/chat` | Chat avec AnDy | Fonctionnel |
| `/brain` | Analyse de données | Fonctionnel |
| `/api/*` | Endpoints de données | Fonctionnel |

### État sécurité

#### ✅ Bonnes pratiques implémentées
- Utilisation de `express.json()` pour parser le JSON
- Gestion des erreurs basique avec `try/catch`
- Utilisation de `cors()` avec configuration restrictive

#### ❌ Problèmes de sécurité identifiés

1. **CORS trop permissif** :
   ```js
   app.use(cors({
     origin: '*', // ❌ Trop permissif
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

2. **Auth Bearer non implémentée** :
   - Aucun middleware d'authentification sur les endpoints sensibles
   - Pas de vérification du token Bearer dans les headers

3. **Manque de CSP headers** :
   - Aucun header `Content-Security-Policy` n'est défini
   - Risque d'injection XSS

4. **Secrets exposés côté client** :
   - Les clés API (Supabase, etc.) sont probablement exposées dans le code frontend
   - Pas de backend pour proxy les requêtes sensibles

5. **Inputs non sanitisés** :
   - Les endpoints `/chat` et `/brain` acceptent probablement du texte brut sans validation
   - Risque d'injection XSS

6. **Manque de rate limiting** :
   - Aucun mécanisme pour limiter les requêtes répétées
   - Risque de DoS

7. **Logs sensibles** :
   - Les erreurs sont probablement loggées sans filtrage
   - Risque d'exposition de données sensibles dans les logs

### Code actuel (problèmes identifiés)

```js
// deploy/dashboard.js - Extraits problématiques

// ❌ CORS trop permissif
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ❌ Pas de middleware d'auth
app.use('/api/*', (req, res, next) => {
  // Aucune vérification du token Bearer
  next();
});

// ❌ Pas de CSP headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // ❌ Pas de CSP complet
  next();
});

// ❌ Pas de rate limiting
// ❌ Pas de validation des inputs
// ❌ Pas de sanitization des données
```

---

## Recommandations prioritaires

### Pour Trackr
1. **Améliorer le contraste** :
   - Remplacer `--t2` (#888) par `--t3` (#444) pour les textes secondaires
   - Augmenter la taille de police à `16px` pour le texte principal
   - Utiliser `font-weight: 500` pour améliorer la lisibilité

2. **Corriger les overflows** :
   - Ajouter `overflow-x: hidden` sur les conteneurs principaux
   - Utiliser `text-overflow: ellipsis` pour les textes longs
   - Implémenter des media queries pour mobile-first

3. **Améliorer les boutons** :
   - Augmenter la taille à `48px x 48px` pour le toucher mobile
   - Ajouter un feedback visuel au survol (`transform: scale(1.05)`)

4. **Ajouter une hiérarchie visuelle** :
   - Utiliser `font-size: 24px` pour les titres principaux
   - `font-size: 18px` pour les sous-titres
   - `font-size: 16px` pour le texte principal

### Pour CryptoTrader
1. **Implémenter une structure de base** :
   - Créer un composant `TradingView` pour les graphiques
   - Ajouter un composant `OrderBook` pour les carnets d'ordres
   - Créer un composant `Portfolio` pour le suivi des actifs

2. **Intégrer les APIs** :
   - Utiliser `fetch` avec les endpoints de trading
   - Gérer les erreurs avec des toasts visuels
   - Implémenter un state management simple avec `useState`

3. **Améliorer le design** :
   - Utiliser un layout en grille pour les différents composants
   - Ajouter des ombres et des bordures pour la profondeur
   - Implémenter un thème sombre cohérent

### Pour le Dashboard Serveur
1. **Sécuriser les endpoints** :
   ```js
   // ❌ Avant
   app.use('/api/*', (req, res, next) => next());

   // ✅ Après
   const authenticate = (req, res, next) => {
     const authHeader = req.headers['authorization'];
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     const token = authHeader.split(' ')[1];
     // Vérifier le token avec JWT ou autre
     next();
   };

   app.use('/api/*', authenticate);
   ```

2. **Configurer CSP headers** :
   ```js
   const csp = `
     default-src 'self';
     script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
     style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
     img-src 'self' data: https://*.tile.openstreetmap.org;
     font-src 'self' https://fonts.gstatic.com;
     connect-src 'self' https://api.supabase.com;
     frame-src 'none';
     object-src 'none';
     base-uri 'self';
     form-action 'self';
   `;

   app.use((req, res, next) => {
     res.setHeader('Content-Security-Policy', csp.trim());
     res.setHeader('X-Content-Type-Options', 'nosniff');
     res.setHeader('X-Frame-Options', 'DENY');
     res.setHeader('X-XSS-Protection', '1; mode=block');
     next();
   });
   ```

3. **Limiter les requêtes** :
   ```js
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limite chaque IP à 100 requêtes par fenêtre
     message: 'Trop de requêtes, merci de réessayer plus tard'
   });

   app.use(limiter);
   ```

4. **Sanitizer les inputs** :
   ```js
   import { JSDOM } from 'jsdom';
   const { sanitize } = new JSDOM().window;

   app.use(express.json({
     verify: (req, res, buf) => {
       req.rawBody = buf.toString();
     }
   }));

   // Pour les endpoints sensibles
   const sanitizeInput = (req, res, next) => {
     if (req.body.message) {
       req.body.message = sanitize(req.body.message);
     }
     next();
   };

   app.post('/chat', sanitizeInput, (req, res) => { ... });
   ```

5. **Masquer les erreurs** :
   ```js
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({
       error: 'Une erreur est survenue',
       details: process.env.NODE_ENV === 'development' ? err.message : undefined
     });
   });
   ```

---

## Checklist de correction

### Trackr
- [ ] Remplacer `--t2` (#888) par `--t3` (#444) pour les textes secondaires
- [ ] Augmenter la taille de police à `16px` pour le texte principal
- [ ] Ajouter `font-weight: 500` pour améliorer la lisibilité
- [ ] Corriger les overflows avec `overflow-x: hidden` et `text-overflow: ellipsis`
- [ ] Augmenter la taille des boutons à `48px x 48px`
- [ ] Ajouter un feedback visuel au survol (`transform: scale(1.05)`)
- [ ] Implémenter une hiérarchie visuelle avec `24px`, `18px`, `16px`
- [ ] Ajouter des media queries pour mobile-first
- [ ] Valider tous les inputs côté client
- [ ] Ajouter des toasts pour les feedbacks utilisateur

### CryptoTrader
- [ ] Créer un composant `TradingView` pour les graphiques
- [ ] Ajouter un composant `OrderBook` pour les carnets d'ordres
- [ ] Créer un composant `Portfolio` pour le suivi des actifs
- [ ] Intégrer les APIs de trading avec `fetch`
- [ ] Gérer les erreurs avec des toasts visuels
- [ ] Implémenter un state management avec `useState`
- [ ] Utiliser un layout en grille pour les différents composants
- [ ] Ajouter des ombres et des bordures pour la profondeur
- [ ] Implémenter un thème sombre cohérent
- [ ] Valider les inputs côté client

### Dashboard Serveur
- [ ] Remplacer `origin: '*'` par une liste blanche d'origines
- [ ] Implémenter un middleware d'authentification Bearer
- [ ] Configurer des CSP headers complets
- [ ] Ajouter un rate limiting sur tous les endpoints
- [ ] Sanitizer tous les inputs avec JSDOM
- [ ] Masquer les erreurs en production
- [ ] Valider les données avant traitement
- [ ] Chiffrer les secrets dans les variables d'environnement
- [ ] Implémenter des logs sans données sensibles
- [ ] Ajouter des tests de sécurité basiques

---

## Conclusion

L'audit révèle que :
1. **Trackr** est globalement fonctionnel mais souffre de problèmes de design et d'UX, notamment sur mobile
2. **CryptoTrader** est une page stub sans aucune fonctionnalité implémentée
3. **Dashboard Serveur** a des problèmes de sécurité critiques (CORS, auth, CSP)

Les corrections prioritaires concernent :
- La sécurité du backend (CSP, auth, rate limiting)
- L'accessibilité et le design de Trackr (contraste, taille de texte, overflow)
- Le développement de CryptoTrader avec une structure de base solide

Toutes les corrections peuvent être implémentées sans ajouter de nouvelles dépendances, en utilisant uniquement les librairies disponibles (React, react-router-dom, etc.).