Création de `api/auth.js` pour la protection contre les attaques de brute-force :

```javascript
// Import des dépendances
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';

// Import des variables d'environnement
import { SUPABASE_URL, SUPABASE_KEY } from '../config';

// Création d'un client Supabase
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

// Définition des constantes pour la rate-limite
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Création d'un objet pour stocker les informations de rate-limite
const rateLimit = {};

// Fonction pour vérifier la rate-limite
function checkRateLimit(ip) {
    if (!rateLimit[ip]) {
        rateLimit[ip] = {
            attempts: 0,
            lastAttempt: Date.now(),
        };
    }

    const now = Date.now();
    const elapsed = now - rateLimit[ip].lastAttempt;
    if (elapsed < RATE_LIMIT_WINDOW) {
        const remaining = Math.floor(RATE_LIMIT_WINDOW / elapsed);
        if (rateLimit[ip].attempts + remaining > MAX_ATTEMPTS) {
            return false;
        }
        rateLimit[ip].attempts += remaining;
        rateLimit[ip].lastAttempt = now;
        return true;
    } else {
        rateLimit[ip].attempts = 1;
        rateLimit[ip].lastAttempt = now;
        return true;
    }
}

// Fonction pour gérer l'authentification
async function authenticate(req, res) {
    const ip = req.ip;
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Trop de tentatives' });
    }

    const { email, password } = req.body;
    try {
        const { user, session } = await supabase.auth.signIn({ email, password });
        const token = jwt.sign({ id: user.id, email }, process.env.SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token, user });
    } catch (error) {
        rateLimit[ip].attempts++;
        return res.status(401).json({ error: 'Identifiants incorrects' });
    }
}

// Fonction pour gérer la déconnexion
async function logout(req, res) {
    const ip = req.ip;
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Trop de tentatives' });
    }

    const { session } = req.body;
    try {
        await supabase.auth.signOut();
        return res.json({ message: 'Déconnecté' });
    } catch (error) {
        rateLimit[ip].attempts++;
        return res.status(401).json({ error: 'Déconnecté avec succès' });
    }
}

// Création de l'API
const router = express.Router();

router.post('/login', authenticate);
router.post('/logout', logout);

// Export de l'API
export default router;
```

Création de `api/auth.js` pour la protection contre les attaques de brute-force :

```javascript
// Import des dépendances
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';

// Import des variables d'environnement
import { SUPABASE_URL, SUPABASE_KEY } from '../config';

// Création d'un client Supabase
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

// Définition des constantes pour la rate-limite
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Création d'un objet pour stocker les informations de rate-limite
const rateLimit = {};

// Fonction pour vérifier la rate-limite
function checkRateLimit(ip) {
    if (!rateLimit[ip]) {
        rateLimit[ip] = {
            attempts: 0,
            lastAttempt: Date.now(),
        };
    }

    const now = Date.now();
    const elapsed = now - rateLimit[ip].lastAttempt;
    if (elapsed < RATE_LIMIT_WINDOW) {
        const remaining = Math.floor(RATE_LIMIT_WINDOW / elapsed);
        if (rateLimit[ip].attempts + remaining > MAX_ATTEMPTS) {
            return false;
        }
        rateLimit[ip].attempts += remaining;
        rateLimit[ip].lastAttempt = now;
        return true;
    } else {
        rateLimit[ip].attempts = 1;
        rateLimit[ip].lastAttempt = now;
        return true;
    }
}

// Fonction pour gérer l'authentification
async function authenticate(req, res) {
    const ip = req.ip;
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Trop de tentatives' });
    }

    const { email, password } = req.body;
    try {
        const { user, session } = await supabase.auth.signIn({ email, password });
        const token = jwt.sign({ id: user.id, email }, process.env.SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token, user });
    } catch (error) {
        rateLimit[ip].attempts++;
        return res.status(401).json({ error: 'Identifiants incorrects' });
    }
}

// Fonction pour gérer la déconnexion
async function logout(req, res) {
    const ip = req.ip;
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Trop de tentatives' });
    }

    const { session } = req.body;
    try {
        await supabase.auth.signOut();
        return res.json({ message: 'Déconnecté' });
    } catch (error) {
        rateLimit[ip].attempts++;
        return res.status(401).json({ error: 'Déconnecté avec succès' });
    }
}

// Création de l'API
const router = express.Router();

router.post('/login', authenticate);
router.post('/logout', logout);

// Export de l'API
export default router;
```

Pour utiliser cette API, vous devez importer la route `/api/auth` dans votre fichier `app.js` :

```javascript
// Import des dépendances
import express from 'express';
import authRouter from './api/auth';

// Création de l'application Express
const app = express();

// Import des routes
app.use('/api/auth', authRouter);

// Export de l'application
export default app;
```

Maintenant, vous pouvez utiliser la route `/api/auth` pour gérer l'authentification et la déconnexion.