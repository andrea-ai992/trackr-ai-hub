Je vais sécuriser les API en utilisant les secrets Supabase via des variables d'environnement et corriger les problèmes dans les fichiers fournis. Voici les modifications nécessaires :

Fichier `api/brain.js` (version sécurisée et corrigée) :

```javascript
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
          const { data, error } = await supabase
            .from('brain_data')
            .select('id, name, description')
            .eq('id', id)
            .single();

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
          const { data, error } = await supabase
            .from('brain_data')
            .insert([body])
            .select();

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

Fichier `api/trading-expert.js` (version sécurisée) :

```javascript
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
          const { data, error } = await supabase
            .from('trading_expert')
            .select('*')
            .eq('id', query.id)
            .single();

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
          const { data, error } = await supabase
            .from('trading_expert')
            .insert([body])
            .select();

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
```

Fichier `api/andy.js` (version sécurisée) :

```javascript
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
          const { data, error } = await supabase
            .from('andy_chats')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

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
          const { data, error } = await supabase
            .from('andy_chats')
            .insert([body])
            .select();

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

Fichier `api/discord.js` (version sécurisée) :

```javascript
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
          const { data, error } = await supabase
            .from('discord_messages')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);

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
          const { data, error } = await supabase
            .from('discord_messages')
            .insert([body])
            .select();

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

Fichier `.env.local` (à créer à la racine du projet) :

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Fichier `pages/_error.js` (version corrigée et complète) :

```javascript
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/error.module.css';

const Error = ({ statusCode }) => {
  return (
    <>
      <Head>
        <title>{statusCode ? `Erreur ${statusCode}` : 'Erreur'}</title>
      </Head>
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h1 className={styles.errorTitle}>
            {statusCode ? `Erreur ${statusCode}` : 'Une erreur est survenue'}
          </h1>
          <p className={styles.errorMessage}>
            {statusCode
              ? 'Désolé, une erreur est survenue côté serveur.'
              : 'Une erreur inattendue s\'est produite.'}
          </p>
          <Link href="/" className={styles.errorLink}>
            Retourner à l'accueil
          </Link>
        </div>
      </div>
    </>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
```

Fichier `styles/error.module.css` (version complète) :

```css
.errorContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--bg);
}

.errorCard {
  font-family: 'Inter', sans-serif;
  color: var(--t1);
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.errorTitle {
  font-size: 28px;
  margin-bottom: 20px;
  color: var(--green);
}

.errorMessage {
  font-size: 16px;
  margin-bottom: 30px;
  line-height: 1.5;
}

.errorLink {
  display: inline-block;
  padding: 12px 24px;
  background-color: var(--green);
  color: #080808;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.errorLink:hover {
  background-color: #00e67a;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .errorCard {
    padding: 30px 20px;
  }

  .errorTitle {
    font-size: 24px;
  }
}
```

Fichier `pages/_app.js` (version corrigée) :

```javascript
import { useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
```

Fichier `styles/globals.css` (version complète) :

```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111111;
  --bg3: #1a1a1a;
  --border: rgba(255, 255, 255, 0.07);
  --border-hi: rgba(0, 255, 136, 0.2);
  --t1: #f0f0f0;
  --t2: #888888;
  --t3: #444444;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--t1);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: var(--green);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: #00e67a;
}

button {
  cursor: pointer;
  background-color: var(--green);
  color: #080808;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #00e67a;
  transform: translateY(-2px);
}

input, textarea, select {
  background-color: var(--bg2);
  border: 1px solid var(--border);
  color: var(--t1);
  padding: 12px 16px;
  border-radius: 6px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--green);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
}