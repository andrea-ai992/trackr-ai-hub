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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('trading_expert')
          .select('*')
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'POST':
      try {
        const { data, error } = await supabase
          .from('trading_expert')
          .insert({
            ...req.body,
          });

        if (error) {
          throw error;
        }

        return res.status(201).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'PUT':
      try {
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
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'DELETE':
      try {
        const { data, error } = await supabase
          .from('trading_expert')
          .delete()
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    default:
      return res.status(405).json({ message: 'Méthode non autorisée' });
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('brain')
          .select('*')
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'POST':
      try {
        const { data, error } = await supabase
          .from('brain')
          .insert({
            ...req.body,
          });

        if (error) {
          throw error;
        }

        return res.status(201).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'PUT':
      try {
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
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'DELETE':
      try {
        const { data, error } = await supabase
          .from('brain')
          .delete()
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    default:
      return res.status(405).json({ message: 'Méthode non autorisée' });
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('andy')
          .select('*')
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'POST':
      try {
        const { data, error } = await supabase
          .from('andy')
          .insert({
            ...req.body,
          });

        if (error) {
          throw error;
        }

        return res.status(201).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'PUT':
      try {
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
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'DELETE':
      try {
        const { data, error } = await supabase
          .from('andy')
          .delete()
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    default:
      return res.status(405).json({ message: 'Méthode non autorisée' });
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('discord')
          .select('*')
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'POST':
      try {
        const { data, error } = await supabase
          .from('discord')
          .insert({
            ...req.body,
          });

        if (error) {
          throw error;
        }

        return res.status(201).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'PUT':
      try {
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
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    case 'DELETE':
      try {
        const { data, error } = await supabase
          .from('discord')
          .delete()
          .eq('id', query.id);

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

    default:
      return res.status(405).json({ message: 'Méthode non autorisée' });
  }
}
```

```javascript
// .env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

```javascript
// next.config.js
module.exports = {
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
  },
};
```

```javascript
// pages/_app.js
import Head from 'next/head';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Trackr</title>
        <meta name="description" content="Trackr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
```

```javascript
// styles/globals.css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

a {
  color: var(--green);
  text-decoration: none;
}

a:hover {
  color: var(--green);
}

button {
  background-color: var(--bg2);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: var(--bg2);
  color: var(--t1);
}
```

```javascript
// components/Layout.js
import Head from 'next/head';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

function Layout({ children }) {
  return (
    <div>
      <Head>
        <title>Trackr</title>
        <meta name="description" content="Trackr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <nav>
          <ul>
            <li>
              <Link href="/">
                <a>Accueil</a>
              </Link>
            </li>
            <li>
              <Link href="/sports">
                <a>Sports</a>
              </Link>
            </li>
            <li>
              <Link href="/markets">
                <a>Marchés</a>
              </Link>
            </li>
            <li>
              <Link href="/news">
                <a>Actualités</a>
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default Layout;
```

```javascript
// components/Button.js
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

function Button({ children, onClick }) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
```

```javascript
// components/Card.js
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

function Card({ children }) {
  return (
    <div>
      <h2>{children}</h2>
    </div>
  );
}

export default Card;