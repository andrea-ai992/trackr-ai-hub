**src/services/api/errors.js**
```javascript
import { createError } from 'http-errors';

const ERRORS = {
  DISCORD_API_ERROR: 'DISCORD_API_ERROR',
  DISCORD_API_RATE_LIMITED: 'DISCORD_API_RATE_LIMITED',
  DISCORD_API_INVALID_TOKEN: 'DISCORD_API_INVALID_TOKEN',
  DISCORD_API_INVALID_REQUEST: 'DISCORD_API_INVALID_REQUEST',
};

const errorMessages = {
  [ERRORS.DISCORD_API_ERROR]: 'Erreur de l\'API Discord',
  [ERRORS.DISCORD_API_RATE_LIMITED]: 'Trop de requêtes en un temps donné',
  [ERRORS.DISCORD_API_INVALID_TOKEN]: 'Token Discord invalide',
  [ERRORS.DISCORD_API_INVALID_REQUEST]: 'Requête Discord invalide',
};

const errorCodes = {
  [ERRORS.DISCORD_API_ERROR]: 500,
  [ERRORS.DISCORD_API_RATE_LIMITED]: 429,
  [ERRORS.DISCORD_API_INVALID_TOKEN]: 401,
  [ERRORS.DISCORD_API_INVALID_REQUEST]: 400,
};

const getError = (errorCode) => {
  const error = createError(errorCode, errorMessages[errorCode]);
  error.name = errorCode;
  return error;
};

export { ERRORS, errorMessages, errorCodes, getError };
```

**src/services/api/discord.js**
```javascript
import axios from 'axios';
import { getError } from './errors';
import { ERRORS, errorCodes } from './errors';

const DISCORD_API_URL = 'https://discord.com/api/v9';
const DISCORD_API_TOKEN = 'votre_token_discord';

const discordApi = axios.create({
  baseURL: DISCORD_API_URL,
  headers: {
    Authorization: `Bearer ${DISCORD_API_TOKEN}`,
  },
});

discordApi.interceptors.request.use((config) => {
  // Ajoutez les headers ou les paramètres nécessaires à la requête
  return config;
}, (error) => {
  return Promise.reject(error);
});

discordApi.interceptors.response.use((response) => {
  // Traitez les réponses de l'API
  return response;
}, (error) => {
  if (error.response.status === 429) {
    throw getError(ERRORS.DISCORD_API_RATE_LIMITED);
  } else if (error.response.status === 401) {
    throw getError(ERRORS.DISCORD_API_INVALID_TOKEN);
  } else if (error.response.status === 400) {
    throw getError(ERRORS.DISCORD_API_INVALID_REQUEST);
  } else {
    throw getError(ERRORS.DISCORD_API_ERROR);
  }
});

export const getGuilds = async () => {
  try {
    const response = await discordApi.get('/guilds');
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

**src/styles/global.css**
```css
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

.error {
  color: var(--t2);
  background-color: var(--bg2);
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 5px;
}
```

**src/components/Error.js**
```javascript
import React from 'react';
import styles from '../styles/global.css';

const Error = ({ error }) => {
  return (
    <div className="error">
      <h2>{error.message}</h2>
      <p>Erreur code: {error.name}</p>
    </div>
  );
};

export default Error;
```

**src/pages/Discord.js**
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Error from '../components/Error';
import { getGuilds } from '../services/api/discord';

const Discord = () => {
  const [guilds, setGuilds] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getGuilds()
      .then((data) => {
        setGuilds(data);
      })
      .catch((error) => {
        setError(error);
      });
  }, []);

  return (
    <div>
      <h1>Discord</h1>
      {error && <Error error={error} />}
      <ul>
        {guilds.map((guild) => (
          <li key={guild.id}>{guild.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Discord;