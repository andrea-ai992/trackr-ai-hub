// api/_security.js
const rateLimits = new Map();
const MAX_REQUESTS = 100;
const TIME_WINDOW = 60 * 1000; // 1 minute

function sanitizeInput(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function checkApiKeysExposed(req) {
  const forbiddenPatterns = [
    /api_key=[^&]+/i,
    /apiKey=[^&]+/i,
    /access_token=[^&]+/i,
    /secret=[^&]+/i,
  ];

  const query = req.url.split('?')[1] || '';
  const body = req.body ? JSON.stringify(req.body) : '';

  const combined = query + body;
  return forbiddenPatterns.some(pattern => pattern.test(combined));
}

export default function securityMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (checkApiKeysExposed(req)) {
    return res.status(403).json({ error: "API keys exposure detected" });
  }

  const now = Date.now();
  const windowStart = now - TIME_WINDOW;

  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, []);
  }

  const requests = rateLimits.get(ip);
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);

  if (recentRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many requests" });
  }

  recentRequests.push(now);
  rateLimits.set(ip, recentRequests);

  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  req.sanitize = sanitizeInput;
  next();
}