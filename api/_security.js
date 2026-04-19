// api/_security.js
const rateLimits = new Map();
const API_KEYS = new Set(process.env.API_KEYS?.split(',') || []);

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const checkApiKeyExposure = (req) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;

  const token = authHeader.split(' ')[1];
  if (!token) return false;

  return API_KEYS.has(token);
};

const rateLimit = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const window = 60 * 1000;

  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { count: 1, start: now });
    return false;
  }

  const entry = rateLimits.get(ip);
  if (now - entry.start > window) {
    rateLimits.set(ip, { count: 1, start: now });
    return false;
  }

  if (entry.count >= 100) {
    return true;
  }

  entry.count++;
  return false;
};

export default function securityMiddleware(req, res, next) {
  if (checkApiKeyExposure(req)) {
    return res.status(403).json({ error: 'API key exposed' });
  }

  if (rateLimit(req)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  req.sanitize = sanitizeInput;
  next();
}