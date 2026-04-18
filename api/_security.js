**1. Ajout de headers de sécurité dans vercel.json**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/static-build",
      "config": {
        "headers": [
          {
            "source": "/",
            "headers": [
              {
                "key": "X-Frame-Options",
                "value": "DENY"
              },
              {
                "key": "X-Content-Type-Options",
                "value": "nosniff"
              },
              {
                "key": "Referrer-Policy",
                "value": "strict-origin-when-cross-origin"
              },
              {
                "key": "Permissions-Policy",
                "value": "camera=( ), microphone=( ), geolocation=( )"
              }
            ]
          }
        ]
      }
    }
  ]
}
```

**2. Création de api/_security.js**

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import * as supabase from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, supabaseSecret);

const rateLimit = new Map<string, number>();
const maxRequests = 100;
const timeWindow = 60 * 1000; // 1 minute

const securityMiddleware = async (req: NextApiRequest, res: NextApiResponse) => {
  const ip = req.ip;
  const now = Date.now();

  if (rateLimit.has(ip)) {
    const lastRequest = rateLimit.get(ip);
    if (now - lastRequest < timeWindow) {
      return res.status(429).json({ error: 'Too many requests' });
    }
  }

  rateLimit.set(ip, now);
  rateLimit.set(ip, now + timeWindow, { expires: 'set' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  try {
    const { data, error } = await supabaseClient
      .from('api_keys')
      .select('id')
      .eq('key', apiKey);

    if (error) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (!data.length) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }

  const input = req.body;
  const sanitizedInput = sanitizeInput(input);

  req.body = sanitizedInput;

  return next();
};

const sanitizeInput = (str: string) => {
  return str.replace(/<[^>]*>/g, '');
};

export default securityMiddleware;
```

**3. Vérification que .env n'est pas dans le build Vite**

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // ...
  envPrefix: 'VITE_',
  // ...
});
```

**4. Ajout de la fonction sanitizeInput dans src/utils/sanitize.ts**

```typescript
export function sanitizeInput(str: string) {
  return str.replace(/<[^>]*>/g, '');
}