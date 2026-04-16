Voici le plan exact avant de coder :

1. **`api/_csrf.js`** — génère un token `crypto.randomUUID()`, le stocke en cookie `httpOnly; Secure; SameSite=Strict`, expose `setCsrfCookie(res)` et `validateCsrf(req, res)`.
2. **Import dans toutes les routes** — j'identifie d'abord les fichiers existants sous `/api/`.

Problème immédiat avec l'approche "bloquer toutes les routes" : les serverless functions Vercel sont des handlers HTTP bruts, pas un Express router. Chaque fichier a son propre `export default handler`. Je dois donc wrapper chaque handler ou exporter un middleware callable.

**Architecture choisie :**
- `api/_csrf.js` exporte `withCsrf(handler)` — un wrapper HOF
- Méthodes GET → génèrent/renouvellent le cookie
- Méthodes POST/PUT/DELETE → valident que le header `X-CSRF-Token` correspond au cookie

Checke d'abord les fichiers existants :

---

**`api/_csrf.js`** :

```js
import { randomUUID } from 'crypto'

const COOKIE_NAME = 'csrf_token'
const HEADER_NAME = 'x-csrf-token'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function parseCookies(req) {
  const raw = req.headers['cookie'] || ''
  return Object.fromEntries(
    raw.split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  )
}

function setCsrfCookie(res, token) {
  res.setHeader('Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
  )
}

export function withCsrf(handler) {
  return async (req, res) => {
    const method = req.method?.toUpperCase() || 'GET'
    const cookies = parseCookies(req)
    let token = cookies[COOKIE_NAME]

    if (SAFE_METHODS.has(method)) {
      // Toujours renouveler/émettre le token sur GET
      token = randomUUID()
      setCsrfCookie(res, token)
      return handler(req, res)
    }

    // POST / PUT / DELETE — valider
    if (!token) {
      return res.status(403).json({ error: 'CSRF: cookie absent' })
    }

    const headerToken = req.headers[HEADER_NAME]
    if (!headerToken || headerToken !== token) {
      return res.status(403).json({ error: 'CSRF: token invalide' })
    }

    return handler(req, res)
  }
}
```

**Usage dans chaque route :**

```js
import { withCsrf } from './_csrf.js'

async function handler(req, res) { ... }

export default withCsrf(handler)
```

**Côté frontend**, après chaque GET, lire le cookie `csrf_token` (⚠️ mais il est `httpOnly` — donc illisible en JS). 

---

**Problème critique** : un cookie `httpOnly` est illisible par `document.cookie`. Le frontend ne peut pas lire le token pour l'envoyer dans `X-CSRF-Token`.

**Solution correcte** : Double-submit pattern avec cookie non-httpOnly lu par le frontend, OU retourner le token dans le body du GET.

**Architecture révisée (Double Submit Cookie)** :
- Cookie `csrf_token` : **pas** httpOnly (JS peut le lire)
- Le frontend lit `document.cookie`, envoie `X-CSRF-Token: <valeur>`
- Le serveur compare header === cookie (un attaquant cross-site ne peut pas lire le cookie d'une autre origine)

```js
import { randomUUID } from 'crypto'

const COOKIE_NAME = 'csrf_token'
const HEADER_NAME = 'x-csrf-token'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function parseCookies(req) {
  const raw = req.headers['cookie'] || ''
  if (!raw) return {}
  return Object.fromEntries(
    raw.split(';')
      .map(c => c.trim())
      .filter(Boolean)
      .map(c => {
        const idx = c.indexOf('=')
        return [c.slice(0, idx), decodeURIComponent(c.slice(idx + 1))]
      })
  )
}

export function withCsrf(handler) {
  return async (req, res) => {
    const method = req.method?.toUpperCase() || 'GET'
    const cookies = parseCookies(req)
    let token = cookies[COOKIE_NAME]

    if (SAFE_METHODS.has(method)) {
      if (!token) {
        token = randomUUID()
        // SameSite=Strict suffit — pas httpOnly pour que le JS puisse le lire
        res.setHeader('Set-Cookie',
          `${COOKIE_NAME}=${token}; Path=/; Secure; SameSite=Strict; Max-Age=86400`
        )
      }
      return handler(req, res)
    }

    if (!token) {
      return res.status(403).json({ error: 'CSRF: cookie absent' })
    }

    const headerToken = req.headers[HEADER_NAME]
    if (!headerToken || headerToken !== token) {
      return res.status(403).json({ error: 'CSRF: token invalide' })
    }

    return handler(req, res)
  }
}
```

Maintenant je génère `api/self-improve.js` complet avec `withCsrf` wrappé sur le handler final :

```js
// ─── Self-Improve — AnDy lit le code et s'améliore automatiquement ───────────
// GET /api/self-improve?focus=security|performance|features|bugs|frontend
// Lit les fichiers clés, les analyse avec Claude, commit les améliorations
// v3 : CSRF protection via withCsrf wrapper

import { getMemoryEntries, getRecentFixesForFile, addMemoryEntry, formatMemoryForPrompt } from './memory.js'
import { withCsrf } from './_csrf.js'

// ... (tout le reste identique, handler wrappé en bas)

export default withCsrf(handler)
```

Je génère maintenant les deux fichiers complets.

---

**`api/_csrf.js`** — fichier complet :

```
import { randomUUID } from 'crypto'

const COOKIE_NAME = 'csrf_token'
const HEADER_NAME = 'x-csrf-token'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function parseCookies(req) {
  const raw = req.headers['cookie'] || ''
  if (!raw.trim()) return {}
  return Object.fromEntries(
    raw.split(';')
      .map(c => c.trim())
      .filter(Boolean)
      .map(c => {
        const idx = c.indexOf('=')
        if (idx === -1) return [c, '']
        return [c.slice(0, idx).trim(), decodeURIComponent(c.slice(idx + 1).trim())]
      })
  )
}

export function withCsrf(handler) {
  return async (req, res) => {
    const method = (req.method || 'GET').toUpperCase()
    const cookies = parseCookies(req)
    let token = cookies[COOKIE_NAME]

    if (SAFE_METHODS.has(method)) {
      if (!token || token.length < 32) {
        token = randomUUID()
        res.setHeader('Set-Cookie',
          `${COOKIE_NAME}=${token}; Path=/; Secure; SameSite=Strict; Max-Age=86400`
        )
      }
      return handler(req, res)
    }

    // Méthodes mutantes : POST, PUT, DELETE, PATCH
    if (!token) {
      return res.status(403).json({ error: 'CSRF: cookie absent — effectuez d\'abord un GET' })
    }

    const headerToken = (req.headers[HEADER_NAME] || '').trim()
    if (!headerToken) {
      return res.status(403).json({ error: `CSRF: header ${HEADER_NAME} manquant` })
    }

    if (headerToken !== token) {
      return res.status(403).json({ error: 'CSRF: token invalide' })
    }

    return handler(req, res)
  }
}
```

---

**`api/self-improve.js`** complet avec CSRF :