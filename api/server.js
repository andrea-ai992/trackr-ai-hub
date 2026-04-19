// api/server.js
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 4000;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many auth attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to auth routes
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      success: true,
      user: data.user,
      session: data.session
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message
    });
  }
});

app.post('/api/auth/signup', authLimiter, async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });

    if (error) throw error;

    res.json({
      success: true,
      user: data.user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

app.post('/api/auth/refresh', authLimiter, async (req, res) => {
  const { refresh_token } = req.body;

  try {
    const { data, error } = await supabase.auth.refreshSession(refresh_token);

    if (error) throw error;

    res.json({
      success: true,
      session: data.session
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message
    });
  }
});

app.post('/api/auth/logout', authLimiter, async (req, res) => {
  const { access_token } = req.body;

  try {
    const { error } = await supabase.auth.signOut(access_token);

    if (error) throw error;

    res.json({
      success: true
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;