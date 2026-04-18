Je vais corriger les 4 fichiers API en ajoutant `AbortSignal.timeout()` à tous les appels fetch() et en améliorant la gestion des erreurs. Voici les fichiers modifiés :

```javascript
// api/trading-expert.js
import { AbortSignal } from 'node-abort-controller';
import { SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { NextApiRequest, NextApiResponse } from 'next';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('trading_expert')
          .select('*')
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'POST': {
        const { data, error } = await supabase
          .from('trading_expert')
          .insert(req.body)
          .abortSignal(controller.signal)
          .select();

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(201).json(data);
      }

      case 'PUT': {
        const { data, error } = await supabase
          .from('trading_expert')
          .update(req.body)
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'DELETE': {
        const { data, error } = await supabase
          .from('trading_expert')
          .delete()
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      default:
        return res.status(405).json({
          message: getErrorMessage(405),
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    clearTimeout(timeoutId);
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

    if (error.name === 'AbortError') {
      return res.status(408).json({
        message: 'Requête expirée (timeout)',
        code: 'TIMEOUT_ERROR'
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

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('brain')
          .select('*')
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'POST': {
        const { data, error } = await supabase
          .from('brain')
          .insert(req.body)
          .abortSignal(controller.signal)
          .select();

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(201).json(data);
      }

      case 'PUT': {
        const { data, error } = await supabase
          .from('brain')
          .update(req.body)
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'DELETE': {
        const { data, error } = await supabase
          .from('brain')
          .delete()
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      default:
        return res.status(405).json({
          message: getErrorMessage(405),
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    clearTimeout(timeoutId);
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

    if (error.name === 'AbortError') {
      return res.status(408).json({
        message: 'Requête expirée (timeout)',
        code: 'TIMEOUT_ERROR'
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

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('andy')
          .select('*')
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'POST': {
        const { data, error } = await supabase
          .from('andy')
          .insert(req.body)
          .abortSignal(controller.signal)
          .select();

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(201).json(data);
      }

      case 'PUT': {
        const { data, error } = await supabase
          .from('andy')
          .update(req.body)
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'DELETE': {
        const { data, error } = await supabase
          .from('andy')
          .delete()
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      default:
        return res.status(405).json({
          message: getErrorMessage(405),
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    clearTimeout(timeoutId);
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

    if (error.name === 'AbortError') {
      return res.status(408).json({
        message: 'Requête expirée (timeout)',
        code: 'TIMEOUT_ERROR'
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

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('discord')
          .select('*')
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'POST': {
        const { data, error } = await supabase
          .from('discord')
          .insert(req.body)
          .abortSignal(controller.signal)
          .select();

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(201).json(data);
      }

      case 'PUT': {
        const { data, error } = await supabase
          .from('discord')
          .update(req.body)
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'DELETE': {
        const { data, error } = await supabase
          .from('discord')
          .delete()
          .eq('id', query.id)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (error) throw error;
        return res.status(200).json(data);
      }

      default:
        return res.status(405).json({
          message: getErrorMessage(405),
          code: 'METHOD_NOT_ALLOWED'
        });
    }
  } catch (error) {
    clearTimeout(timeoutId);
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

    if (error.name === 'AbortError') {
      return res.status(408).json({
        message: 'Requête expirée (timeout)',
        code: 'TIMEOUT_ERROR'
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
      className={`fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-lg bg-[--bg2] border border-[--border] backdrop-blur-sm ${className}`}
      role="alert"
      style={{
        backgroundColor: 'var(--bg2)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-