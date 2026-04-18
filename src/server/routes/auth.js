src/server/routes/auth.js
```javascript
import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return req.ip === '::1' || req.ip === '127.0.0.1';
  }
});

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Login route
router.post('/login', express.json(), async (req, res) => {
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

    // TODO: Replace with actual authentication logic
    // This is a placeholder for the actual implementation
    const mockUser = {
      id: 'user_123',
      email: email,
      name: email.split('@')[0]
    };

    // Mock password check (in production, use bcrypt)
    if (password !== 'correcthorsebatterystaple') {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Return success response
    res.json({
      success: true,
      user: mockUser,
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
router.post('/register', express.json(), async (req, res) => {
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

    // TODO: Replace with actual registration logic
    // This is a placeholder for the actual implementation
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: email,
      name: name
    };

    res.json({
      success: true,
      user: mockUser,
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
router.post('/forgot-password', express.json(), async (req, res) => {
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

    // TODO: Replace with actual password reset logic
    // This is a placeholder for the actual implementation
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
router.post('/reset-password', express.json(), async (req, res) => {
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

    // TODO: Replace with actual password reset logic
    // This is a placeholder for the actual implementation
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
router.post('/logout', express.json(), async (req, res) => {
  try {
    // TODO: Implement actual logout logic (clear tokens, etc.)
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