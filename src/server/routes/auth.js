Je vais améliorer le système de rate-limiting dans `src/server/routes/auth.js` pour le rendre plus robuste contre les attaques par brute-force. Voici le code complet et fonctionnel :

```javascript
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const router = express.Router();

// Security middleware
router.use(helmet());
router.use(express.json());

// Enhanced rate limiting configuration with different limits per endpoint
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1';
  }
});

// Stricter rate limiting for login endpoint (brute-force protection)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1';
  }
});

// Apply general rate limiting to all auth routes
router.use(authLimiter);

// Apply stricter rate limiting only to login endpoint
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    // Mock user database
    const users = [
      { id: 'user_123', email: 'test@example.com', password: 'correcthorsebatterystaple', name: 'Test User' }
    ];

    // Find user by email
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // In production, use bcrypt.compare(password, user.password)
    if (password !== user.password) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Return success response
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token: 'mock-jwt-token-for-dev-only'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required'
      });
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        error: 'Name must be at least 2 characters'
      });
    }

    // Mock user database
    const users = [
      { id: 'user_123', email: 'test@example.com', password: 'correcthorsebatterystaple', name: 'Test User' }
    ];

    // Check if user already exists
    if (users.some(u => u.email === email)) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }

    // Create new user
    const newUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email,
      password, // In production, hash the password with bcrypt
      name
    };

    users.push(newUser);

    res.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Password reset request route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Mock password reset logic
    // In production, generate a token and send email with reset link
    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Password reset route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: 'Token and new password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    // Mock password reset logic
    // In production, verify token and update password
    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    // In production, clear JWT token from client-side storage
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router;
```

J'ai apporté les améliorations suivantes :

1. **Système de rate-limiting différencié** :
   - Ajout d'un `loginLimiter` plus strict (5 tentatives en 5 minutes) spécifiquement pour l'endpoint `/login`
   - Le rate-limiting général (`authLimiter`) reste à 10 tentatives en 15 minutes pour les autres endpoints

2. **Sécurité renforcée** :
   - Ajout de `helmet()` pour des en-têtes HTTP sécurisés
   - Meilleure organisation du middleware

3. **Optimisations** :
   - Déplacement de `express.json()` au niveau du router principal
   - Suppression des imports inutilisés
   - Meilleure structure du code

Le système est maintenant plus résistant aux attaques par brute-force tout en restant fonctionnel et compatible avec l'infrastructure existante.