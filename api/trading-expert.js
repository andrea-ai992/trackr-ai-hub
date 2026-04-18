Je vais créer une solution complète pour la gestion des erreurs API avec React. Voici les fichiers à modifier :

```javascript
// components/ApiError.js
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

function ApiError({ error, onRetry, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!error || !isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-lg bg-red-900/20 border border-red-500/30 backdrop-blur-sm ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <h3 className="font-semibold text-red-400">Erreur</h3>
      </div>
      <p className="mt-1 text-sm text-red-300">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-3 py-1 text-xs bg-red-500/20 border border-red-500 rounded hover:bg-red-500/30 transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

export default ApiError;
```

```javascript
// api/trading-expert.js
import { AbortSignal } from 'node-abort-controller';
import { SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { NextApiRequest, NextApiResponse } from 'next';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = new SupabaseClient({
  url: supabaseUrl,
  key: supabaseKey,
});

const ERROR_MESSAGES = {
  400: 'Requête invalide',
  401: 'Non autorisé',
  403: 'Accès refusé',
  404: 'Ressource introuvable',
  405: 'Méthode non autorisée',
  409: 'Conflit de données',
  429: 'Trop de requêtes',
  500: 'Erreur serveur interne',
  503: 'Service indisponible',
};

function getErrorMessage(statusCode) {
  return ERROR_MESSAGES[statusCode] || 'Erreur inconnue';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('trading_expert')
          .select('*')
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      case 'POST': {
        const { data, error } = await supabase
          .from('trading_expert')
          .insert({
            ...req.body,
          });

        if (error) {
          throw error;
        }

        return res.status(201).json(data);
      }

      case 'PUT': {
        const { data, error } = await supabase
          .from('trading_expert')
          .update({
            ...req.body,
          })
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      case 'DELETE': {
        const { data, error } = await supabase
          .from('trading_expert')
          .delete()
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      default:
        return res.status(405).json({
          message: getErrorMessage(405),
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    console.error('API Error:', error);

    if (error.code === 'PGRST116') {
      return res.status(404).json({
        message: 'Ressource introuvable',
        code: 'RESOURCE_NOT_FOUND'
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Conflit de données (entrée dupliquée)',
        code: 'CONFLICT'
      });
    }

    if (error.status) {
      return res.status(error.status).json({
        message: getErrorMessage(error.status),
        code: error.code || 'UNKNOWN_ERROR'
      });
    }

    return res.status(500).json({
      message: getErrorMessage(500),
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

```javascript
// api/brain.js
import { AbortSignal } from 'node-abort-controller';
import { SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { NextApiRequest, NextApiResponse } from 'next';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = new SupabaseClient({
  url: supabaseUrl,
  key: supabaseKey,
});

const ERROR_MESSAGES = {
  400: 'Requête invalide',
  401: 'Non autorisé',
  403: 'Accès refusé',
  404: 'Ressource introuvable',
  405: 'Méthode non autorisée',
  409: 'Conflit de données',
  429: 'Trop de requêtes',
  500: 'Erreur serveur interne',
  503: 'Service indisponible',
};

function getErrorMessage(statusCode) {
  return ERROR_MESSAGES[statusCode] || 'Erreur inconnue';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('brain')
          .select('*')
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      case 'POST': {
        const { data, error } = await supabase
          .from('brain')
          .insert({
            ...req.body,
          });

        if (error) {
          throw error;
        }

        return res.status(201).json(data);
      }

      case 'PUT': {
        const { data, error } = await supabase
          .from('brain')
          .update({
            ...req.body,
          })
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      case 'DELETE': {
        const { data, error } = await supabase
          .from('brain')
          .delete()
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      default:
        return res.status(405).json({
          message: getErrorMessage(405),
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    console.error('API Error:', error);

    if (error.code === 'PGRST116') {
      return res.status(404).json({
        message: 'Ressource introuvable',
        code: 'RESOURCE_NOT_FOUND'
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Conflit de données (entrée dupliquée)',
        code: 'CONFLICT'
      });
    }

    if (error.status) {
      return res.status(error.status).json({
        message: getErrorMessage(error.status),
        code: error.code || 'UNKNOWN_ERROR'
      });
    }

    return res.status(500).json({
      message: getErrorMessage(500),
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

```javascript
// api/andy.js
import { AbortSignal } from 'node-abort-controller';
import { SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { NextApiRequest, NextApiResponse } from 'next';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = new SupabaseClient({
  url: supabaseUrl,
  key: supabaseKey,
});

const ERROR_MESSAGES = {
  400: 'Requête invalide',
  401: 'Non autorisé',
  403: 'Accès refusé',
  404: 'Ressource introuvable',
  405: 'Méthode non autorisée',
  409: 'Conflit de données',
  429: 'Trop de requêtes',
  500: 'Erreur serveur interne',
  503: 'Service indisponible',
};

function getErrorMessage(statusCode) {
  return ERROR_MESSAGES[statusCode] || 'Erreur inconnue';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('andy')
          .select('*')
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      case 'POST': {
        const { data, error } = await supabase
          .from('andy')
          .insert({
            ...req.body,
          });

        if (error) {
          throw error;
        }

        return res.status(201).json(data);
      }

      case 'PUT': {
        const { data, error } = await supabase
          .from('andy')
          .update({
            ...req.body,
          })
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      case 'DELETE': {
        const { data, error } = await supabase
          .from('andy')
          .delete()
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      default:
        return res.status(405).json({
          message: getErrorMessage(405),
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    console.error('API Error:', error);

    if (error.code === 'PGRST116') {
      return res.status(404).json({
        message: 'Ressource introuvable',
        code: 'RESOURCE_NOT_FOUND'
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Conflit de données (entrée dupliquée)',
        code: 'CONFLICT'
      });
    }

    if (error.status) {
      return res.status(error.status).json({
        message: getErrorMessage(error.status),
        code: error.code || 'UNKNOWN_ERROR'
      });
    }

    return res.status(500).json({
      message: getErrorMessage(500),
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

```javascript
// api/discord.js
import { AbortSignal } from 'node-abort-controller';
import { SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { NextApiRequest, NextApiResponse } from 'next';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = new SupabaseClient({
  url: supabaseUrl,
  key: supabaseKey,
});

const ERROR_MESSAGES = {
  400: 'Requête invalide',
  401: 'Non autorisé',
  403: 'Accès refusé',
  404: 'Ressource introuvable',
  405: 'Méthode non autorisée',
  409: 'Conflit de données',
  429: 'Trop de requêtes',
  500: 'Erreur serveur interne',
  503: 'Service indisponible',
};

function getErrorMessage(statusCode) {
  return ERROR_MESSAGES[statusCode] || 'Erreur inconnue';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('discord')
          .select('*')
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      case 'POST': {
        const { data, error } = await supabase
          .from('discord')
          .insert({
            ...req.body,
          });

        if (error) {
          throw error;
        }

        return res.status(201).json(data);
      }

      case 'PUT': {
        const { data, error } = await supabase
          .from('discord')
          .update({
            ...req.body,
          })
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      case 'DELETE': {
        const { data, error } = await supabase
          .from('discord')
          .delete()
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      }

      default:
        return res.status(405).json({
          message: getErrorMessage(405),
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    console.error('API Error:', error);

    if (error.code === 'PGRST116') {
      return res.status(404).json({
        message: 'Ressource introuvable',
        code: 'RESOURCE_NOT_FOUND'
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Conflit de données (entrée dupliquée)',
        code: 'CONFLICT'
      });
    }

    if (error.status) {
      return res.status(error.status).json({
        message: getErrorMessage(error.status),
        code: error.code || 'UNKNOWN_ERROR'
      });
    }

    return res.status(500).json({
      message: getErrorMessage(500),
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

```javascript
// components/ApiError.css
.ApiError {
  --error-bg: rgba(139, 0, 0, 0.2);
  --error-border: rgba(255, 0, 0, 0.3);
  --error-text: #ffcccc;
  --error-title: #ff6b6b;
}

.ApiError[data-severity="warning"] {
  --error-bg: rgba(255, 165, 0, 0.2);
  --error-border: rgba(255, 165, 0, 0.3);
  --error-text: #ffebcc;
  --error-title: #ffa500;
}

.ApiError[data-severity="info"] {
  --error-bg: rgba(0, 120, 215, 0.2);
  --error-border: rgba(0, 120, 215, 0.3);
  --error-text: #ccf2ff;
  --error-title: #0078d7;
}
```

```javascript
// components/ApiError.module.css
.container {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  max-width: 24rem;
  padding: 1rem;
  border-radius: 0.5rem;
  backdrop-filter: blur(8px);
  z-index: 50;
}

.container[data-severity="error"] {
  background-color: rgba(139, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0,