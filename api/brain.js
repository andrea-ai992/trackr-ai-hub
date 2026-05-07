// api/brain.js
// ─── Brain API — memory, context, agent state ─────────────────────────────────
import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.use(express.json({ limit: '10kb' }))

// Utility: fetch with AbortSignal.timeout
async function safeFetch(url, options = {}, timeoutMs = 8000) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) {
    await response.body?.cancel().catch(() => {})
    throw Object.assign(new Error(`HTTP ${response.status}`), { statusCode: response.status })
  }
  const ct = response.headers.get('content-type') || ''
  if (!ct.includes('application/json') && !ct.includes('text/json') && !ct.includes('text/plain')) {
    await response.body?.cancel().catch(() => {})
    throw Object.assign(new Error(`Unexpected content-type: ${ct}`), { statusCode: 502 })
  }
  return response.json()
}

// GET /api/brain — retrieve latest brain memory entries
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)
    const type = req.query.type || undefined

    const entries = await prisma.memory.findMany({
      where: type ? { type } : undefined,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      success: true,
      count: entries.length,
      entries,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/brain — store a new memory entry
router.post('/', async (req, res, next) => {
  try {
    const { type, content, metadata } = req.body || {}
    if (!type || !content) {
      return res.status(400).json({ error: 'Missing required fields: type, content' })
    }

    const entry = await prisma.memory.create({
      data: {
        type,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date(),
      },
    })

    res.status(201).json({ success: true, entry })
  } catch (err) {
    next(err)
  }
})

// Error handler
router.use((err, req, res, _next) => {
  console.error('[brain.js] Error:', err.message)
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  })
})

export default router

  try {
    const response = await fetch(`/api/brain/${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Brain API request timed out after 8 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getBrainAnalysis = async (query) => {
  return fetchBrainData('analyze', { method: 'POST', body: JSON.stringify({ query }) });
};

export const getBrainContext = async () => {
  return fetchBrainData('context');
};
```

```javascript
// api/discord.js
const fetchDiscordData = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`/api/discord/${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Discord API request timed out after 8 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getDiscordMessages = async (channelId) => {
  return fetchDiscordData(`messages/${channelId}`);
};

export const sendDiscordMessage = async (channelId, content) => {
  return fetchDiscordData(`messages/${channelId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
};
```

```javascript
// api/andy.js
const fetchAndyData = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`/api/andy/${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Andy API request timed out after 8 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getAndyResponse = async (message) => {
  return fetchAndyData('chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
};

export const getAndyContext = async () => {
  return fetchAndyData('context');
};
```

```javascript
// api/trading-expert.js
const fetchTradingData = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`/api/trading-expert/${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Trading Expert API request timed out after 8 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getMarketAnalysis = async (symbol) => {
  return fetchTradingData('analysis', {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  });
};

export const getTradingSignals = async (symbol) => {
  return fetchTradingData('signals', {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  });
};
```

```javascript
// src/pages/News.jsx
// Modification de la fonction fetchNews pour utiliser AbortSignal.timeout()
const fetchNews = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    let url = '/api/news';
    if (selectedSource !== 'all') {
      url += `?source=${selectedSource}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setNews(data);
  } catch (err) {
    if (err.name === 'TimeoutError') {
      setError('La requête a pris trop de temps à répondre. Veuillez réessayer.');
    } else {
      setError(err.message || 'Erreur lors de la récupération des actualités');
    }
  } finally {
    setLoading(false);
  }
}, [selectedSource]);
```

Ces modifications implémentent un timeout de 8 secondes pour chaque requête fetch, avec une gestion appropriée des erreurs de timeout. Les fichiers API suivent maintenant un pattern cohérent avec gestion centralisée du timeout.