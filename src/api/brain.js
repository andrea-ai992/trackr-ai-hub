Je vais corriger les fichiers `src/api/brain.js` et `src/api/andy.js` pour ajouter les `AbortSignal.timeout()` aux appels fetch() et implémenter la validation Zod.

```javascript
// src/api/brain.js
import { z } from 'zod';

const SignalSchema = z.object({
  rsi: z.object({
    value: z.string().min(1, "La valeur RSI est requise"),
    period: z.number().int().positive().default(14),
  }),
  macd: z.object({
    value: z.string().optional(),
    fast: z.number().int().positive().default(12),
    slow: z.number().int().positive().default(26),
  }),
  volume: z.object({
    value: z.string().min(1, "La valeur volume est requise"),
    period: z.number().int().positive().default(14),
  }),
});

export const validateSignals = (signals) => {
  return SignalSchema.parse(signals);
};

export const fetchBrainSignals = async (signals) => {
  try {
    const validatedSignals = validateSignals(signals);

    const response = await fetch('/api/brain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedSignals),
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
```

```javascript
// src/api/andy.js
import { z } from 'zod';

const AndyMessageSchema = z.object({
  message: z.string().min(1, "Le message ne peut pas être vide"),
  context: z.string().optional(),
  sessionId: z.string().optional(),
});

export const validateAndyMessage = (messageData) => {
  return AndyMessageSchema.parse(messageData);
};

export const fetchAndyResponse = async (messageData) => {
  try {
    const validatedData = validateAndyMessage(messageData);

    const response = await fetch('/api/chat', {
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