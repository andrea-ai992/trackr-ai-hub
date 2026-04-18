src/server/middleware/rateLimiter.js
```javascript
const rateLimitMap = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip);
  const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have exceeded the 10 requests per minute limit.',
      retryAfter: Math.ceil((windowMs - (now - recentRequests[0])) / 1000)
    });
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);

  // Nettoyage des anciennes entrées toutes les 5 minutes
  if (rateLimitMap.size > 1000) {
    rateLimitMap.clear();
  }

  next();
};

module.exports = rateLimiter;