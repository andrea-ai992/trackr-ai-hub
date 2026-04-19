import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['https://trackr-app-nu.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting for /api/auth
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: JSON.stringify({
    error: 'Too many requests',
    message: 'You have exceeded the 5 requests per minute limit for auth endpoints'
  }),
  headers: true,
  standardHeaders: 'draft-7',
  keyGenerator: (req) => {
    return req.ip;
  },
  skip: (req) => {
    return req.path === '/api/auth/status';
  }
});

app.use('/api/auth', authLimiter);

// Routes
app.get('/vibe', (req, res) => {
  res.json({ status: 'ok', message: 'Vibe check passed' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ status: 'ok', message: 'Login endpoint' });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ status: 'ok', message: 'Register endpoint' });
});

app.get('/api/auth/status', (req, res) => {
  res.json({ status: 'ok', message: 'Auth status' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;