// api/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';
import rateLimit from 'express-rate-limit';

import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

const router = express.Router();

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const logoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to extract client IP from forwarded headers
router.use((req, res, next) => {
  const forwarded = req.headers['x-forwarded-for'];
  req.ip = forwarded ? forwarded.split(/, /)[0] : req.socket.remoteAddress;
  next();
});

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: { session } } = await supabase.auth.getSession();

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    return res.json({ token, user });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/logout', logoutLimiter, async (req, res) => {
  try {
    await supabase.auth.signOut();
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Logout failed' });
  }
});

router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const { data, error } = await supabase.auth.refreshSession(refresh_token);

    if (error) throw error;

    const token = jwt.sign(
      { id: data.user.id, email: data.user.email },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    return res.json({ token, user: data.user });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;