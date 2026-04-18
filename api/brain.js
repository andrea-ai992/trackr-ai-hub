Voici les fichiers modifiés avec l'implémentation de `AbortSignal.timeout()` dans tous les `fetch()` pour éviter les hangs indéfinis :

```javascript
// api/brain.js
import { createServer } from 'http';
import { SupabaseClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL et clé sont requises dans les variables d\'environnement');
}

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

const brain = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method, query, body } = req;
    const { id } = query;

    switch (method) {
      case 'GET':
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const { data, error } = await supabase
            .from('brain_data')
            .select('id, name, description')
            .eq('id', id)
            .single()
            .abortSignal(controller.signal);

          clearTimeout(timeoutId);

          if (error) {
            throw error;
          }

          return res.status(200).json(data);
        } catch (error) {
          console.error('Erreur Supabase:', error);
          return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        }

      case 'POST':
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const { data, error } = await supabase
            .from('brain_data')
            .insert([body])
            .select()
            .abortSignal(controller.signal);

          clearTimeout(timeoutId);

          if (error) {
            throw error;
          }

          return res.status(201).json(data);
        } catch (error) {
          console.error('Erreur Supabase:', error);
          return res.status(500).json({ error: 'Erreur lors de l\'insertion des données' });
        }

      default:
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

export default brain;
```

```javascript
// api/discord.js
import { SupabaseClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL et clé sont requises dans les variables d\'environnement');
}

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

const discord = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method, query, body } = req;

    switch (method) {
      case 'GET':
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const { data, error } = await supabase
            .from('discord_messages')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100)
            .abortSignal(controller.signal);

          clearTimeout(timeoutId);

          if (error) {
            throw error;
          }

          return res.status(200).json(data);
        } catch (error) {
          console.error('Erreur Supabase:', error);
          return res.status(500).json({ error: 'Erreur lors de la récupération des messages Discord' });
        }

      case 'POST':
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const { data, error } = await supabase
            .from('discord_messages')
            .insert([body])
            .select()
            .abortSignal(controller.signal);

          clearTimeout(timeoutId);

          if (error) {
            throw error;
          }

          return res.status(201).json(data);
        } catch (error) {
          console.error('Erreur Supabase:', error);
          return res.status(500).json({ error: 'Erreur lors de l\'enregistrement du message Discord' });
        }

      default:
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

export default discord;
```

```javascript
// api/andy.js
import { SupabaseClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL et clé sont requises dans les variables d\'environnement');
}

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

const andy = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method, query, body } = req;

    switch (method) {
      case 'GET':
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const { data, error } = await supabase
            .from('andy_chats')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)
            .abortSignal(controller.signal);

          clearTimeout(timeoutId);

          if (error) {
            throw error;
          }

          return res.status(200).json(data);
        } catch (error) {
          console.error('Erreur Supabase:', error);
          return res.status(500).json({ error: 'Erreur lors de la récupération des chats' });
        }

      case 'POST':
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const { data, error } = await supabase
            .from('andy_chats')
            .insert([body])
            .select()
            .abortSignal(controller.signal);

          clearTimeout(timeoutId);

          if (error) {
            throw error;
          }

          return res.status(201).json(data);
        } catch (error) {
          console.error('Erreur Supabase:', error);
          return res.status(500).json({ error: 'Erreur lors de l\'enregistrement du chat' });
        }

      default:
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

export default andy;
```

```javascript
// api/trading-expert.js
import { SupabaseClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL et clé sont requises dans les variables d\'environnement');
}

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

const tradingExpert = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method, query, body } = req;

    switch (method) {
      case 'GET':
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const { data, error } = await supabase
            .from('trading_expert')
            .select('*')
            .eq('id', query.id)
            .single()
            .abortSignal(controller.signal);

          clearTimeout(timeoutId);

          if (error) {
            throw error;
          }

          return res.status(200).json(data);
        } catch (error) {
          console.error('Erreur Supabase:', error);
          return res.status(500).json({ error: 'Erreur lors de la récupération des données de trading' });
        }

      case 'POST':
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const { data, error } = await supabase
            .from('trading_expert')
            .insert([body])
            .select()
            .abortSignal(controller.signal);

          clearTimeout(timeoutId);

          if (error) {
            throw error;
          }

          return res.status(201).json(data);
        } catch (error) {
          console.error('Erreur Supabase:', error);
          return res.status(500).json({ error: 'Erreur lors de l\'insertion des données de trading' });
        }

      default:
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

export default tradingExpert;