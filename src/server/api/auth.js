Je vais créer le fichier `src/server/api/auth.js` avec un système de rate-limiting côté serveur en utilisant une fenêtre glissante de 5 minutes et 10 tentatives max pour les endpoints d'authentification.

```javascript
import express from 'express';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache pour le rate-limiting (en mémoire pour développement)
// En production, utiliser Redis ou une base de données
const rateLimitCache = new Map();

// Fonction pour générer une clé unique par IP + endpoint
const getRateLimitKey = (ip, endpoint) => {
  return `${ip}:${endpoint}`;
};

// Middleware de rate-limiting avec fenêtre glissante
const createSlidingWindowLimiter = (windowMs, maxRequests) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const endpoint = req.path;
    const key = getRateLimitKey(ip, endpoint);

    const now = Date.now();
    const windowStart = now - windowMs;

    // Récupérer les timestamps des tentatives précédentes
    const timestamps = rateLimitCache.get(key) || [];

    // Filtrer les timestamps qui sont dans la fenêtre de 5 minutes
    const recentAttempts = timestamps.filter(timestamp => timestamp >= windowStart);

    // Si le nombre de tentatives récentes dépasse le maximum autorisé
    if (recentAttempts.length >= maxRequests) {
      const oldestAttempt = recentAttempts[0];
      const timeLeft = Math.ceil((oldestAttempt + windowMs - now) / 1000);

      res.status(429).json({
        error: 'Trop de tentatives',
        message: `Vous avez atteint la limite de ${maxRequests} tentatives en ${windowMs/60000} minutes. Veuillez réessayer dans ${timeLeft} secondes.`,
        retryAfter: timeLeft
      });
      return;
    }

    // Ajouter le timestamp actuel
    recentAttempts.push(now);
    rateLimitCache.set(key, recentAttempts);

    // Nettoyer les anciennes entrées (tous les 100ms pour éviter la croissance infinie)
    if (rateLimitCache.size > 1000) {
      for (const [cacheKey, cacheTimestamps] of rateLimitCache.entries()) {
        const filtered = cacheTimestamps.filter(timestamp => timestamp >= windowStart);
        if (filtered.length === 0) {
          rateLimitCache.delete(cacheKey);
        } else {
          rateLimitCache.set(cacheKey, filtered);
        }
      }
    }

    next();
  };
};

// Limiteur pour les endpoints d'authentification
const authLimiter = createSlidingWindowLimiter(5 * 60 * 1000, 10); // 5 minutes, 10 tentatives

// Router d'authentification
const router = express.Router();

// Middleware global pour les endpoints d'auth
router.use('/auth', authLimiter);

// Endpoint de login
router.post('/auth/login', express.json(), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Email et mot de passe sont requis'
      });
    }

    // Vérification des données
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Email invalide',
        message: 'Format d\'email incorrect'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    // Vérification dans Supabase
    const { data: { user }, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Authentification échouée',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérification du mot de passe (simplifiée pour l'exemple)
    // En production, utiliser une vérification sécurisée avec bcrypt
    const isPasswordValid = password === user.password_plain || // À remplacer par bcrypt.compare()
      crypto.createHash('sha256').update(password).digest('hex') === user.password_hash;

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentification échouée',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Génération d'un token JWT (simplifié pour l'exemple)
    const token = crypto.randomBytes(32).toString('hex');

    // Mise à jour du token dans la base de données
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString(), auth_token: token })
      .eq('id', user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        token
      }
    });

  } catch (err) {
    console.error('Erreur lors du login:', err);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'authentification'
    });
  }
});

// Endpoint de registration
router.post('/auth/register', express.json(), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Email, mot de passe et nom sont requis'
      });
    }

    // Validation des données
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Email invalide',
        message: 'Format d\'email incorrect'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        error: 'Nom invalide',
        message: 'Le nom doit contenir au moins 2 caractères'
      });
    }

    // Vérification si l'email existe déjà
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification de l\'email:', checkError);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Une erreur est survenue lors de la vérification de l\'email'
      });
    }

    if (existingUser) {
      return res.status(409).json({
        error: 'Email déjà utilisé',
        message: 'Cet email est déjà associé à un compte'
      });
    }

    // Hash du mot de passe (simplifié pour l'exemple)
    // En production, utiliser bcrypt avec un salt
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Création de l'utilisateur
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          name,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Erreur lors de la création du compte:', createError);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Une erreur est survenue lors de la création du compte'
      });
    }

    // Génération d'un token
    const token = crypto.randomBytes(32).toString('hex');

    // Mise à jour du token
    await supabase
      .from('users')
      .update({ auth_token: token })
      .eq('id', newUser.id);

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        token
      }
    });

  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'inscription'
    });
  }
});

// Endpoint de récupération de mot de passe
router.post('/auth/forgot-password', express.json(), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email manquant',
        message: 'L\'email est requis'
      });
    }

    // Validation de l'email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Email invalide',
        message: 'Format d\'email incorrect'
      });
    }

    // Vérification si l'email existe
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
      return res.json({
        success: true,
        message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé'
      });
    }

    // Génération d'un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Mise à jour du token de réinitialisation
    await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires.toISOString()
      })
      .eq('id', user.id);

    // En production, envoyer un email avec le lien de réinitialisation
    console.log(`[DEBUG] Lien de réinitialisation: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);

    res.json({
      success: true,
      message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé'
    });

  } catch (err) {
    console.error('Erreur lors de la récupération du mot de passe:', err);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du mot de passe'
    });
  }
});

// Endpoint de réinitialisation de mot de passe
router.post('/auth/reset-password', express.json(), async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Le token et le nouveau mot de passe sont requis'
      });
    }

    // Validation du mot de passe
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    // Vérification du token
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .gt('reset_token_expires', new Date().toISOString())
      .single();

    if (error || !user) {
      return res.status(400).json({
        error: 'Token invalide ou expiré',
        message: 'Le lien de réinitialisation est invalide ou a expiré'
      });
    }

    // Mise à jour du mot de passe
    const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');

    await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null
      })
      .eq('id', user.id);

    res.json({
      success: true,
      message: 'Votre mot de passe a été réinitialisé avec succès'
    });

  } catch (err) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', err);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la réinitialisation du mot de passe'
    });
  }
});

// Middleware de vérification du token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Non autorisé',
        message: 'Token d\'authentification requis'
      });
    }

    // Vérification du token dans la base de données
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_token', token)
      .single();

    if (error || !user) {
      return res.status(403).json({
        error: 'Token invalide',
        message: 'Token d\'authentification invalide ou expiré'
      });
    }

    // Ajout de l'utilisateur à la requête
    req.user = user;
    next();

  } catch (err) {
    console.error('Erreur lors de la vérification du token:', err);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la vérification du token'
    });
  }
};

// Endpoint protégé pour vérifier l'authentification
router.get('/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name
    }
  });
});

// Endpoint de logout
router.post('/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Invalidation du token
    await supabase
      .from('users')
      .update({ auth_token: null })
      .eq('id', req.user.id);

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (err) {
    console.error('Erreur lors du logout:', err);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la déconnexion'
    });
  }
});

export default router;