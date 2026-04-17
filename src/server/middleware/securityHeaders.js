src/server/middleware/securityHeaders.js

const crypto = require('crypto');

const generateNonce = () => {
  return crypto.randomBytes(16).toString('base64');
};

const securityHeaders = (options = {}) => {
  const {
    isDevelopment = process.env.NODE_ENV === 'development',
    allowedOrigins = [
      'https://trackr-app-nu.vercel.app',
      'https://trackr-ai-hub.vercel.app',
    ],
    reportUri = '/csp-report',
  } = options;

  return (req, res, next) => {
    const nonce = generateNonce();
    res.locals.cspNonce = nonce;

    // ─── Content-Security-Policy ───────────────────────────────────────────────
    const cspDirectives = [
      `default-src 'self'`,
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''}`,
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com data:`,
      `img-src 'self' data: https: blob:`,
      `connect-src 'self' https://api.openai.com https://*.vercel.app wss://*.vercel.app`,
      `media-src 'self' blob:`,
      `object-src 'none'`,
      `frame-src 'none'`,
      `frame-ancestors 'none'`,
      `form-action 'self'`,
      `base-uri 'self'`,
      `manifest-src 'self'`,
      `worker-src 'self' blob:`,
      `child-src 'self' blob:`,
      `upgrade-insecure-requests`,
      `block-all-mixed-content`,
      `report-uri ${reportUri}`,
    ].join('; ');

    res.setHeader('Content-Security-Policy', cspDirectives);

    // ─── Strict-Transport-Security (HSTS) ─────────────────────────────────────
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );

    // ─── X-Frame-Options ──────────────────────────────────────────────────────
    res.setHeader('X-Frame-Options', 'DENY');

    // ─── X-Content-Type-Options ───────────────────────────────────────────────
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // ─── X-XSS-Protection ────────────────────────────────────────────────────
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // ─── Referrer-Policy ─────────────────────────────────────────────────────
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // ─── Permissions-Policy ──────────────────────────────────────────────────
    res.setHeader(
      'Permissions-Policy',
      [
        'accelerometer=()',
        'ambient-light-sensor=()',
        'autoplay=(self)',
        'battery=()',
        'camera=()',
        'cross-origin-isolated=()',
        'display-capture=()',
        'document-domain=()',
        'encrypted-media=(self)',
        'execution-while-not-rendered=()',
        'execution-while-out-of-viewport=()',
        'fullscreen=(self)',
        'geolocation=()',
        'gyroscope=()',
        'keyboard-map=()',
        'magnetometer=()',
        'microphone=()',
        'midi=()',
        'navigation-override=()',
        'payment=()',
        'picture-in-picture=()',
        'publickey-credentials-get=()',
        'screen-wake-lock=()',
        'sync-xhr=()',
        'usb=()',
        'web-share=(self)',
        'xr-spatial-tracking=()',
      ].join(', ')
    );

    // ─── Cross-Origin Policies ────────────────────────────────────────────────
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

    // ─── Cache-Control ────────────────────────────────────────────────────────
    const isStaticAsset =
      req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/) &&
      req.path.includes('/assets/');

    if (isStaticAsset) {
      res.setHeader(
        'Cache-Control',
        'public, max-age=31536000, immutable'
      );
    } else if (req.path === '/' || req.path.match(/\.html$/)) {
      res.setHeader(
        'Cache-Control',
        'no-cache, no-store, must-revalidate'
      );
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    }

    // ─── CORS Strict ─────────────────────────────────────────────────────────
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token'
      );
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Vary', 'Origin');
    } else if (!origin) {
      // Same-origin requests — allowed
    } else {
      // Unknown origin — block CORS but let request through (handled by CSP)
      res.setHeader('Access-Control-Allow-Origin', '');
    }

    // ─── Preflight ────────────────────────────────────────────────────────────
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    // ─── Remove fingerprinting headers ────────────────────────────────────────
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    next();
  };
};

// ─── CSP Violation Report Endpoint ────────────────────────────────────────────
const cspReportHandler = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
    if (body.length > 4096) {
      req.destroy();
      res.status(413).end();
      return;
    }
  });

  req.on('end', () => {
    try {
      const report = JSON.parse(body);
      const violation = report['csp-report'] || report;

      console.warn('[CSP Violation]', {
        timestamp: new Date().toISOString(),
        blockedUri: violation['blocked-uri'],
        violatedDirective: violation['violated-directive'],
        effectiveDirective: violation['effective-directive'],
        originalPolicy: violation['original-policy'],
        documentUri: violation['document-uri'],
        referrer: violation['referrer'],
        disposition: violation['disposition'],
      });

      res.status(204).end();
    } catch (err) {
      console.error('[CSP Report Parse Error]', err.message);
      res.status(400).end();
    }
  });
};

// ─── Security Audit Logger ────────────────────────────────────────────────────
const securityAuditLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /\.\.\//,
    /union.*select/i,
    /exec\s*\(/i,
    /document\.cookie/i,
    /eval\s*\(/i,
  ];

  const checkString = (str) =>
    suspiciousPatterns.some((pattern) => pattern.test(str));

  const url = decodeURIComponent(req.url || '');
  const ua = req.headers['user-agent'] || '';

  if (checkString(url) || checkString(ua)) {
    console.warn('[Security Audit] Suspicious request detected', {
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress,
      method: req.method,
      url: req.url,
      userAgent: ua.slice(0, 200),
    });

    res.status(400).json({ error: 'Bad Request' });
    return;
  }

  next();
};

// ─── Rate Limiter (lightweight, no external deps) ─────────────────────────────
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests, please try again later.',
  } = options;

  const requests = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requests.entries()) {
      if (now - data.windowStart > windowMs) {
        requests.delete(key);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, windowStart: now });
      next();
      return;
    }

    const data = requests.get(ip);

    if (now - data.windowStart > windowMs) {
      requests.set(ip, { count: 1, windowStart: now });
      next();
      return;
    }

    data.count += 1;

    if (data.count > max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader(
        'X-RateLimit-Reset',
        Math.ceil((data.windowStart + windowMs) / 1000)
      );
      res.status(429).json({ error: message });
      return;
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - data.count));
    res.setHeader(
      'X-RateLimit-Reset',
      Math.ceil((data.windowStart + windowMs) / 1000)
    );

    next();
  };
};

// ─── Compose all security middleware ─────────────────────────────────────────
const createSecurityStack = (options = {}) => {
  const {
    enableAuditLogger = true,
    enableRateLimiter = true,
    rateLimiterOptions = {},
    headersOptions = {},
  } = options;

  const stack = [];

  if (enableAuditLogger) {
    stack.push(securityAuditLogger);
  }

  if (enableRateLimiter) {
    stack.push(createRateLimiter(rateLimiterOptions));
  }

  stack.push(securityHeaders(headersOptions));

  return stack;
};

module.exports = {
  securityHeaders,
  cspReportHandler,
  securityAuditLogger,
  createRateLimiter,
  createSecurityStack,
  generateNonce,
};