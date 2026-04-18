Création de l'API Brain avec gestion des erreurs

```javascript
// api/brain.js
import { createServer } from 'http';
import { SupabaseClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

const brain = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { method, query } = req;
    const { id } = query;

    switch (method) {
      case 'GET':
        const brainData = await supabase
          .from('brain_data')
          .select('id, name, description')
          .eq('id', id);

        if (brainData.error) {
          throw brainData.error;
        }

        return res.status(200).json(brainData.data[0]);
      default:
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export default brain;
```

Création du serveur API

```javascript
// server.js
import express from 'express';
import brain from './api/brain';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/brain', brain);

const server = createServer(app);
server.listen(port, () => {
  console.log(`Serveur API démarré sur le port ${port}`);
});
```

Création du fichier de configuration pour Supabase

```javascript
// .env
SUPABASE_URL="https://your-supabase-url.supabase.co"
SUPABASE_KEY="your-supabase-key"
```

Création du fichier de configuration pour Next.js

```javascript
// next.config.js
module.exports = {
  // ...
  serverRuntimeConfig: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
  },
};
```

Création du fichier de styles pour la page d'erreur

```css
/* styles/error.css */
.error {
  font-family: Inter;
  color: var(--t1);
  background-color: var(--bg);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  width: 80%;
  margin: 40px auto;
}

.error h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.error p {
  font-size: 18px;
  margin-bottom: 20px;
}

.error a {
  text-decoration: none;
  color: var(--green);
}

.error a:hover {
  color: var(--green);
  text-decoration: underline;
}
```

Création de la page d'erreur

```javascript
// pages/_error.js
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/error.css';

const Error = () => {
  return (
    <div className={styles.error}>
      <h2>Erreur serveur</h2>
      <p>Une erreur est survenue. Veuillez réessayer plus tard.</p>
      <Link href="/">
        <a>Retourner à l'accueil</a>
      </Link>
    </div>
  );
};

export default Error;
```

Création du fichier de styles pour la page d'erreur

```css
/* styles/error.css */
.error {
  font-family: Inter;
  color: var(--t1);
  background-color: var(--bg);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  width: 80%;
  margin: 40px auto;
}

.error h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.error p {
  font-size: 18px;
  margin-bottom: 20px;
}

.error a {
  text-decoration: none;
  color: var(--green);
}

.error a:hover {
  color: var(--green);
  text-decoration: underline;
}