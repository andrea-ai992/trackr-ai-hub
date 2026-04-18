**api/supabase.js**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://votre-projet.supabase.io';
const supabaseKey = 'votre-projet-supabase-key';
const supabaseSecret = 'votre-projet-supabase-secret';

const supabase = createClient(supabaseUrl, supabaseKey, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseSecret}`,
  },
});

export const supabaseAuth = async (username, password) => {
  try {
    const { data, error } = await supabase.auth.api.login({
      email: username,
      password,
    });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const supabaseRefreshToken = async (refreshToken) => {
  try {
    const { data, error } = await supabase.auth.api.refreshToken(refreshToken);
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const supabaseGetUser = async (token) => {
  try {
    const { data, error } = await supabase.auth.api.getUser(token);
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const supabaseRevokeToken = async (token) => {
  try {
    const { data, error } = await supabase.auth.api.revokeToken(token);
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const supabaseGetSession = async (token) => {
  try {
    const { data, error } = await supabase.auth.api.getSession(token);
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const supabaseCreateSession = async (token, expiresAt) => {
  try {
    const { data, error } = await supabase.auth.api.createSession(token, expiresAt);
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const supabaseUpdateSession = async (token, expiresAt) => {
  try {
    const { data, error } = await supabase.auth.api.updateSession(token, expiresAt);
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const supabaseDeleteSession = async (token) => {
  try {
    const { data, error } = await supabase.auth.api.deleteSession(token);
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
```

**api/andy.js**
```javascript
import express from 'express';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

const app = express();
const sessionStore = new session.MemoryStore();

app.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
  },
}));

app.use(express.json());

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await supabaseAuth(username, password);
    const token = user.session.token;
    const sessionData = await supabaseGetSession(token);
    const expiresAt = sessionData.expires_at;
    const newSession = await supabaseCreateSession(token, expiresAt);
    req.session.id = newSession.id;
    req.session.token = newSession.token;
    req.session.expiresAt = newSession.expires_at;
    res.json({ message: 'Connexion réussie' });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Erreur de connexion' });
  }
});

app.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const token = await supabaseRefreshToken(refreshToken);
    const sessionData = await supabaseGetSession(token);
    const expiresAt = sessionData.expires_at;
    const newSession = await supabaseCreateSession(token, expiresAt);
    req.session.id = newSession.id;
    req.session.token = newSession.token;
    req.session.expiresAt = newSession.expires_at;
    res.json({ message: 'Refresh token réussi' });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Erreur de refresh token' });
  }
});

app.post('/logout', async (req, res) => {
  try {
    const token = req.session.token;
    await supabaseRevokeToken(token);
    req.session.destroy();
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur de déconnexion' });
  }
});

export default app;
```

**styles.css**
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

.dark-mode {
  background-color: var(--bg);
  color: var(--t1);
}

.light-mode {
  background-color: var(--t1);
  color: var(--t2);
}

.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
```

**index.js**
```javascript
import express from 'express';
import app from './api/andy';

const port = 4000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
```

**package.json**
```json
{
  "name": "andy",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "express-session": "^1.22.1",
    "uuid": "^8.3.2",
    "@supabase/supabase-js": "^1.3.4"
  }
}