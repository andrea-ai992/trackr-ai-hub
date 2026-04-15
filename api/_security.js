// ─── Security Middleware — Trackr API ────────────────────────────────────────
// Protects all API routes against:
// - Rate limiting (brute force, DDoS)
// - IP-based abuse detection
// - Prompt injection in user input
// - Oversized payloads
// - CORS abuse
// - Bot/scanner detection

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
]

function detectInjection(text) {
  if (typeof text !== 'string') return false
  return INJECTION_PATTERNS.some(p => p.test(text))
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
// Returns null if OK, or { status, error } if blocked
export function securityCheck(req, res, options = {}) {
  const {
    maxBodyKB = 50,          // max payload size in KB
    rateWindowMs = 60_000,   // 1 minute window
    rateMax = 30,            // max requests per window (generous for API)
    checkInjection = false,  // enable prompt injection check
    route = req.url,
  } = options

  setCORSHeaders(req, res)

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return { preflight: true }
  }

  // Check origin for browser requests
  const origin = req.headers.origin
  if (origin && !isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Forbidden origin' })
    return { blocked: true }
  }

  // Block obviously malicious user agents
  const ua = req.headers['user-agent'] || ''
  const badAgents = /sqlmap|nikto|masscan|nmap|zgrab|burpsuite|dirbuster/i
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
