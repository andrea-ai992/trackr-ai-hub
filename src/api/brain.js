Je vais implémenter le système de timeout avec `AbortSignal.timeout()` pour tous les fichiers API mentionnés. Voici les modifications nécessaires :

```javascript
// src/api/brain.js
export const fetchBrainData = async (endpoint = '', params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = endpoint ? `/api/brain/${endpoint}${query ? `?${query}` : ''}` : '/api/brain';

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    } else if (error.name === 'AbortError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    }
    throw error;
  }
};

export const postBrainData = async (endpoint = '', data = {}) => {
  try {
    const response = await fetch(`/api/brain/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    } else if (error.name === 'AbortError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    }
    throw error;
  }
};
```

```javascript
// src/api/discord.js
export const fetchDiscordMessages = async (channelId, limit = 50) => {
  try {
    const response = await fetch(`/api/discord/messages/${channelId}?limit=${limit}`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    } else if (error.name === 'AbortError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    }
    throw error;
  }
};

export const sendDiscordMessage = async (channelId, content) => {
  try {
    const response = await fetch('/api/discord/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channelId, content }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    } else if (error.name === 'AbortError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    }
    throw error;
  }
};
```

```javascript
// src/api/andy.js
export const fetchAndyResponse = async (prompt, context = {}) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, context }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    } else if (error.name === 'AbortError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    }
    throw error;
  }
};

export const fetchAndyMemory = async (userId) => {
  try {
    const response = await fetch(`/api/chat/memory/${userId}`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    } else if (error.name === 'AbortError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    }
    throw error;
  }
};
```

```javascript
// src/api/trading-expert.js
import { z } from 'zod';

const TradingSignalSchema = z.object({
  symbol: z.string().min(1, "Le symbole est requis"),
  indicators: z.object({
    rsi: z.object({
      value: z.number().min(0).max(100),
      period: z.number().int().positive().default(14),
    }).optional(),
    macd: z.object({
      fast: z.number().int().positive().default(12),
      slow: z.number().int().positive().default(26),
      signal: z.number().int().positive().default(9),
    }).optional(),
    sma: z.object({
      value: z.number().min(0),
      period: z.number().int().positive().default(20),
    }).optional(),
  }),
});

export const validateTradingSignal = (signalData) => {
  return TradingSignalSchema.parse(signalData);
};

export const fetchTradingSignal = async (signalData) => {
  try {
    const validatedData = validateTradingSignal(signalData);

    const response = await fetch('/api/trading-expert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    } else if (error.name === 'AbortError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    } else if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(err => err.message).join(', '));
    }
    throw error;
  }
};