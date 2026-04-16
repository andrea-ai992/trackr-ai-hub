// ─── Security Middleware — Trackr API ────────────────────────────────────────
// Protects all API routes against:
// - Rate limiting (brute force, DDoS)
// - IP-based abuse detection
// - Prompt injection in user input
// - Oversized payloads
// - CORS abuse
// - Bot/scanner detection
// - Malicious code injection via self-improve
// - Compromised internal calls

// ─── In-memory rate limiter (resets per serverless instance) ─────────────────
const rateLimitMap = new Map()

function getRateLimit(ip, route, windowMs = 60_000, max = 20) {
  const key = `${ip}:${route}`
  const now = Date.now()
  let entry = rateLimitMap.get(key)

  if (!entry || now - entry.start > windowMs) {
    entry = { start: now, count: 0 }
    rateLimitMap.set(key, entry)
  }

  entry.count++

  // Cleanup old entries every 100 requests
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap) {
      if (now - v.start > windowMs * 2) rateLimitMap.delete(k)
    }
  }

  return { allowed: entry.count <= max, count: entry.count, max }
}

// ─── Allowed origins ──────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://trackr-app-nu.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
]

function isAllowedOrigin(origin) {
  if (!origin) return true  // server-to-server or same-origin
  return ALLOWED_ORIGINS.some(o => origin === o || origin.endsWith('.vercel.app'))
}

// ─── Prompt injection patterns ────────────────────────────────────────────────
const INJECTION_PATTERNS = [
  /ignore (previous|all|prior) (instructions?|prompts?|context)/i,
  /you are now|forget (you are|your|all)/i,
  /\bsystem prompt\b.*\bignore\b/i,
  /\bDAN\b|\bjailbreak\b|\bunfiltered\b/i,
  /act as (an?|your) (evil|unrestricted|uncensored)/i,
  /override.*security|bypass.*auth|disable.*filter/i,
  /\bexfiltrate\b|\bexfil\b|\bdata theft\b/i,
]

function detectInjection(text) {
  if (typeof text !== 'string') return false
  return INJECTION_PATTERNS.some(p => p.test(text))
}

// ─── Dangerous code patterns (for self-improve safety scan) ──────────────────
const DANGEROUS_CODE_PATTERNS = [
  // Shell execution
  { pattern: /\bexec\s*\(|child_process|spawn\s*\(|execSync/,       label: 'shell execution' },
  { pattern: /\brm\s+-rf\b|rimraf|deleteRecursive/,                  label: 'recursive delete' },
  // Crypto miners / outbound exfil
  { pattern: /\bcrypto\s*\.createHash.*secret|miner|cryptonight/i,   label: 'crypto miner pattern' },
  { pattern: /fetch\(['"`]https?:\/\/(?!api\.(anthropic|coingecko|discord|github)\.com|query\d?\.finance\.yahoo)/i, label: 'unexpected outbound URL' },
  // Credential access
  { pattern: /process\.env\b.*(?:secret|token|key|pass|auth).*\blog\b/i, label: 'logging credentials' },
  { pattern: /console\.(log|warn|error).*process\.env/i,             label: 'env var leak to logs' },
  // Code execution tricks
  { pattern: /\beval\s*\(|\bnew\s+Function\s*\(/,                    label: 'dynamic code execution' },
  { pattern: /atob\s*\(|btoa\s*\(.*eval/i,                          label: 'base64 + eval pattern' },
  // Self-modification guard
  { pattern: /_security\.js|self-improve\.js/,                       label: 'modifying security files' },
]

// Returns array of findings — empty means safe
export function scanCodeSafety(code) {
  if (typeof code !== 'string') return []
  return DANGEROUS_CODE_PATTERNS
    .filter(({ pattern }) => pattern.test(code))
    .map(({ label }) => label)
}

// ─── CRON / internal endpoint protection ─────────────────────────────────────
// Returns true if blocked (caller should return immediately)
export function requireCronSecret(req, res) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false  // not configured — skip (dev mode)

  const provided =
    req.headers['x-cron-secret'] ||
    req.headers['authorization']?.replace('Bearer ', '') ||
    req.query?.secret

  if (provided !== secret) {
    res.status(401).json({ error: 'Unauthorized — CRON_SECRET required' })
    return true
  }
  return false
}

// ─── Get client IP ────────────────────────────────────────────────────────────
function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

// ─── CORS headers ─────────────────────────────────────────────────────────────
export function setCORSHeaders(req, res) {
  const origin = req.headers.origin
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
}

// ─── Main security check ─────────────────────────────────────────────────────
// Returns null if OK, or truthy if blocked
export function securityCheck(req, res, options = {}) {
  const {
    maxBodyKB = 50,          // max payload size in KB
    rateWindowMs = 60_000,   // 1 minute window
    rateMax = 30,            // max requests per window
    checkInjection = false,  // enable prompt injection check
    cronOnly = false,        // restrict to cron/internal calls only
    route = req.url,
  } = options

  setCORSHeaders(req, res)

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return { preflight: true }
  }

  // Cron-only endpoints require CRON_SECRET
  if (cronOnly && requireCronSecret(req, res)) {
    return { blocked: true }
  }

  // Check origin for browser requests
  const origin = req.headers.origin
  if (origin && !isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Forbidden origin' })
    return { blocked: true }
  }

  // Block obviously malicious user agents
  const ua = req.headers['user-agent'] || ''
  const badAgents = /sqlmap|nikto|masscan|nmap|zgrab|burpsuite|dirbuster|curl\/7\.[0-4]/i
  if (badAgents.test(ua)) {
    res.status(403).json({ error: 'Forbidden' })
    return { blocked: true }
  }

  // Payload size check
  const contentLength = parseInt(req.headers['content-length'] || '0')
  if (contentLength > maxBodyKB * 1024) {
    res.status(413).json({ error: 'Payload too large' })
    return { blocked: true }
  }

  // Rate limiting
  const ip = getIP(req)
  const rl = getRateLimit(ip, route, rateWindowMs, rateMax)
  res.setHeader('X-RateLimit-Limit', rateMax)
  res.setHeader('X-RateLimit-Remaining', Math.max(0, rateMax - rl.count))

  if (!rl.allowed) {
    res.status(429).json({ error: 'Too many requests. Please slow down.' })
    return { blocked: true }
  }

  // Prompt injection check (opt-in)
  if (checkInjection && req.body) {
    const bodyStr = JSON.stringify(req.body)
    if (detectInjection(bodyStr)) {
      res.status(400).json({ error: 'Invalid request content' })
      return { blocked: true }
    }
  }

  return null  // all clear
}
