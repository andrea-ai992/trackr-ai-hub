Création du fichier src/services/api/discord.js

```javascript
// Import des librairies nécessaires
import axios from 'axios';
import { supabaseUrl, supabaseKey } from '../config/supabase';

// Définition des constantes pour les API Discord
const DISCORD_API_URL = 'https://discord.com/api/v9';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// Fonction pour récupérer les données de l'API Discord
async function getDiscordData(endpoint) {
  try {
    // Envoi de la requête GET à l'API Discord
    const response = await axios.get(`${DISCORD_API_URL}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Récupération des données de la réponse
    const data = response.data;

    // Renvoi des données
    return data;
  } catch (error) {
    // Gestion des erreurs
    const errorMessage = error.message;
    const statusCode = error.response ? error.response.status : null;

    // Renvoi des erreurs
    return {
      error: true,
      errorMessage,
      statusCode,
    };
  }
}

// Fonction pour envoyer des données à l'API Discord
async function postDiscordData(endpoint, data) {
  try {
    // Envoi de la requête POST à l'API Discord
    const response = await axios.post(`${DISCORD_API_URL}/${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Récupération des données de la réponse
    const data = response.data;

    // Renvoi des données
    return data;
  } catch (error) {
    // Gestion des erreurs
    const errorMessage = error.message;
    const statusCode = error.response ? error.response.status : null;

    // Renvoi des erreurs
    return {
      error: true,
      errorMessage,
      statusCode,
    };
  }
}

// Export des fonctions
export { getDiscordData, postDiscordData };
```

Création du fichier src/config/supabase.js

```javascript
// Import des librairies nécessaires
import { defineConfig } from 'supabase-url';

// Définition des constantes pour Supabase
const supabaseUrl = 'https://trackr-ai-hub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaGFuIjoiMjMwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Export des constantes
export { supabaseUrl, supabaseKey };
```

Création du fichier src/styles/globals.css

```css
/* Import des polices */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Définition des variables CSS */
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

/* Styles globaux */
body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

h1, h2, h3, h4, h5, h6 {
  color: var(--t2);
}

p {
  color: var(--t3);
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
  background-color: var(--bg);
}

input[type="text"], input[type="email"], input[type="password"] {
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
  border-radius: 5px;
  width: 100%;
}

input[type="text"]:focus, input[type="email"]:focus, input[type="password"]:focus {
  border-color: var(--green);
  box-shadow: 0 0 5px var(--green);
}
```

Création du fichier src/components/Error.js

```javascript
// Import des librairies nécessaires
import React from 'react';

// Fonction pour afficher les erreurs
function Error({ error, errorMessage, statusCode }) {
  return (
    <div style={{
      backgroundColor: '#333',
      color: '#fff',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: '0 0 5px #666',
    }}>
      <h2 style={{
        margin: '0',
        padding: '0',
        fontSize: '24px',
        color: '#ff0000',
      }}>
        Erreur {statusCode}
      </h2>
      <p style={{
        margin: '0',
        padding: '0',
        fontSize: '18px',
        color: '#fff',
      }}>
        {errorMessage}
      </p>
    </div>
  );
}

// Export de la fonction
export default Error;
```

Création du fichier src/pages/Discord.js

```javascript
// Import des librairies nécessaires
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Error from '../components/Error';
import { getDiscordData } from '../services/api/discord';

// Fonction pour afficher les données de l'API Discord
function Discord() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [statusCode, setStatusCode] = useState(null);

  // Récupération des données de l'API Discord
  useEffect(() => {
    getDiscordData('guilds')
      .then((response) => {
        setData(response);
      })
      .catch((error) => {
        setError(error.errorMessage);
        setStatusCode(error.statusCode);
      });
  }, []);

  // Affichage des données
  if (data) {
    return (
      <div style={{
        backgroundColor: '#333',
        color: '#fff',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 0 5px #666',
      }}>
        <h2 style={{
          margin: '0',
          padding: '0',
          fontSize: '24px',
          color: '#ff0000',
        }}>
          Données de l'API Discord
        </h2>
        <p style={{
          margin: '0',
          padding: '0',
          fontSize: '18px',
          color: '#fff',
        }}>
          {data.name}
        </p>
      </div>
    );
  } else if (error) {
    return (
      <Error
        error={error}
        errorMessage={error.errorMessage}
        statusCode={statusCode}
      />
    );
  } else {
    return (
      <div style={{
        backgroundColor: '#333',
        color: '#fff',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 0 5px #666',
      }}>
        <h2 style={{
          margin: '0',
          padding: '0',
          fontSize: '24px',
          color: '#ff0000',
        }}>
          Chargement des données...
        </h2>
      </div>
    );
  }
}

// Export de la fonction
export default Discord;
```

Création du fichier src/pages/_app.js

```javascript
// Import des librairies nécessaires
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Discord from './Discord';

// Fonction pour afficher l'application
function App() {
  return (
    <Router>
      <Discord />
    </Router>
  );
}

// Export de la fonction
export default App;
```

Création du fichier src/index.js

```javascript
// Import des librairies nécessaires
import React from 'react';
import ReactDOM from 'react-dom';
import App from './pages/_app';

// Fonction pour afficher l'application
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

Création du fichier src/package.json

```json
{
  "name": "trackr-ai-hub",
  "version": "1.0.0",
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^0.27.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.4.0",
    "supabase": "^1.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^2.3.0",
    "vite": "^3.2.3"
  }
}
```

Création du fichier src/vite.config.js

```javascript
// Import des librairies nécessaires
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Fonction pour configurer Vite
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    manifest: true,
  },
});
```

Création du fichier src/rollup.config.js

```javascript
// Import des librairies nécessaires
import { defineConfig } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

// Fonction pour configurer Rollup
export default defineConfig({
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  plugins: [terser(), nodeResolve()],
});
```

Création du fichier src/supabase.js

```javascript
// Import des librairies nécessaires
import { defineConfig } from 'supabase-url';

// Fonction pour configurer Supabase
export default defineConfig({
  url: 'https://trackr-ai-hub.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaGFuIjoiMjMwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
});
```

Création du fichier src/config.js

```javascript
// Import des librairies nécessaires
import { supabaseUrl, supabaseKey } from './supabase';

// Fonction pour configurer l'application
export default {
  supabaseUrl,
  supabaseKey,
};
```

Création du fichier src/services/api/discord.js

```javascript
// Import des librairies nécessaires
import axios from 'axios';
import { supabaseUrl, supabaseKey } from '../config/supabase';

// Fonction pour récupérer les données de l'API Discord
async function getDiscordData(endpoint) {
  try {
    // Envoi de la requête GET à l'API Discord
    const response = await axios.get(`${supabaseUrl}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Récupération des données de la réponse
    const data = response.data;

    // Renvoi des données
    return data;
  } catch (error) {
    // Gestion des erreurs
    const errorMessage = error.message;
    const statusCode = error.response ? error.response.status : null;

    // Renvoi des erreurs
    return {
      error: true,
      errorMessage,
      statusCode,
    };
  }
}

// Fonction pour envoyer des données à l'API Discord
async function postDiscordData(endpoint, data) {
  try {
    // Envoi de la requête POST à l'API Discord
    const response = await axios.post(`${supabaseUrl}/${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Récupération des données de la réponse
    const data = response.data;

    // Renvoi des données
    return data;
  } catch (error) {
    // Gestion des erreurs
    const errorMessage = error.message;
    const statusCode = error.response ? error.response.status : null;

    // Renvoi des erreurs
    return {
      error: true,
      errorMessage,
      statusCode,
    };
  }
}

// Export des fonctions
export { getDiscordData, postDiscordData };
```

Création du fichier src/components/Error.js

```javascript
// Import des librairies nécessaires
import React from 'react';

// Fonction pour afficher les erreurs
function Error({ error, errorMessage, statusCode }) {
  return (
    <div style={{
      backgroundColor: '#333',
      color: '#fff',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: '0 0 5px #666',
    }}>
      <h2 style={{
        margin: '0',
        padding: '0',
        fontSize: '24px',
        color: '#ff0000',
      }}>
        Erreur {statusCode}
      </h2>
      <p style={{
        margin: '0',
        padding: '0',
        fontSize: '18px',
        color: '#fff',
      }}>
        {errorMessage}
      </p>
    </div>
  );
}

// Export de la fonction
export default Error;
```

Création du fichier src/pages/Discord.js

```javascript
// Import des librairies nécessaires
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Error from '../components/Error';
import { getDiscordData } from '../services/api/discord';

// Fonction pour afficher les données de l'API Discord
function Discord() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [statusCode, setStatusCode] = useState(null);

  // Récupération des données de l'API Discord
  useEffect(() => {
    getDiscordData('guilds')
      .then((response) => {
        setData(response);
      })
      .catch((error) => {
        setError(error.errorMessage);
        setStatusCode(error.statusCode);
      });
  }, []);

  // Affichage des données
  if (data) {
    return (
      <div style={{
        backgroundColor: '#333',
        color: '#fff',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 0 5px #666',
      }}>
        <h2 style={{
          margin: '0',
          padding: '0',
          fontSize: '24px',
          color: '#ff0000',
        }}>
          Données de l'API Discord
        </h2>
        <p style={{
          margin: '0',
          padding: '0',
          fontSize: '18px',
          color: '#fff',
        }}>
          {data.name}
        </p>
      </div>
    );
  } else if (error) {
    return (
      <Error
        error={error}
        errorMessage={error.errorMessage}
        statusCode={statusCode}
      />
    );
  } else {
    return (
      <div style={{
        backgroundColor: '#333',
        color: '#fff',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 0 5px #666',
      }}>
        <h2 style={{
          margin: '0',
          padding: '0',
          fontSize: '24px',
          color: '#ff0000',
        }}>
          Chargement des données...
        </h2>
      </div>
    );
  }
}

// Export de la fonction
export default Discord;
```

Création du fichier src/pages/_app.js

```javascript
// Import des librairies nécessaires
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import Discord from './Discord';

// Fonction pour afficher l'application
function App() {
  return (
    <Router>
      <Discord />
    </Router>
  );
}

// Export de la fonction
export default App;
```

Création du fichier src/index.js

```javascript
// Import des librairies nécessaires
import React from 'react';
import ReactDOM from 'react-dom';
import App from './pages/_app';

// Fonction pour afficher l'application
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

Création du fichier src/package.json

```json
{
  "name": "trackr-ai-hub",
  "version": "1.0.0",
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^0.27.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.4.0",
    "supabase": "^1.4.0"
  },
  "devDependencies": {
    "@vitejs