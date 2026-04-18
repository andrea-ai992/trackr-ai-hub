Je vais créer un système de rate-limiting robuste pour `/api/auth` en ajoutant un middleware dédié. Voici les fichiers nécessaires :

src/server/middleware/rateLimiter.js
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rate_limit:${ip}`;

    // Vérifier si l'IP est bloquée
    const { data: blockData, error: blockError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip', ip)
      .eq('blocked', true)
      .single();

    if (blockError && blockError.code !== 'PGRST116') {
      console.error('Erreur Supabase:', blockError);
    }

    if (blockData) {
      const remainingTime = Math.max(0, Math.floor((blockData.expires_at - Date.now()) / 1000));
      res.set('X-RateLimit-Reset', remainingTime);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `IP bloquée pour ${remainingTime} secondes. Réessayez plus tard.`,
        retryAfter: remainingTime
      });
    }

    // Récupérer ou initialiser le compteur
    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip', ip)
      .single();

    const now = Date.now();
    const window = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100; // Limite de 100 requêtes par fenêtre

    if (data) {
      const requests = data.requests || 0;
      const lastRequest = data.last_request || now;

      if (requests >= maxRequests && now - lastRequest < window) {
        const remainingTime = Math.floor((window - (now - lastRequest)) / 1000);
        res.set('X-RateLimit-Reset', remainingTime);

        // Bloquer l'IP si elle dépasse la limite
        await supabase
          .from('rate_limits')
          .upsert({
            ip,
            requests: maxRequests,
            last_request: now,
            expires_at: now + 3600 * 1000, // 1 heure de blocage
            blocked: true
          });

        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Limite de ${maxRequests} requêtes atteinte. Réessayez dans ${Math.ceil(remainingTime / 60)} minutes.`,
          retryAfter: remainingTime
        });
      }

      // Mettre à jour le compteur
      await supabase
        .from('rate_limits')
        .upsert({
          ip,
          requests: Math.min(requests + 1, maxRequests),
          last_request: now,
          expires_at: now + window
        });
    } else {
      // Créer un nouvel enregistrement
      await supabase
        .from('rate_limits')
        .insert({
          ip,
          requests: 1,
          last_request: now,
          expires_at: now + window
        });
    }

    res.set('X-RateLimit-Limit', maxRequests);
    res.set('X-RateLimit-Remaining', maxRequests - (data?.requests || 0));
    res.set('X-RateLimit-Reset', Math.floor((now + window) / 1000));

    next();
  } catch (err) {
    console.error('Erreur dans rateLimiter:', err);
    next();
  }
};

export default rateLimiter;
```

src/server/routes/auth.js
```javascript
import express from 'express';
import rateLimiter from '../middleware/rateLimiter.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Route protégée par rate-limiting
router.post('/login', rateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ user: data.user, session: data.session });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.post('/register', rateLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ user: data.user });
  } catch (err) {
    console.error('Erreur register:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

router.post('/refresh', rateLimiter, async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Token de rafraîchissement requis' });
    }

    const { data, error } = await supabase.auth.refreshSession(refresh_token);

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ session: data.session });
  } catch (err) {
    console.error('Erreur refresh:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;