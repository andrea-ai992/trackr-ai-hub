Création de `api/andy.js` from scratch :

```javascript
// Import des dépendances
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Création d'un client Prisma
const prisma = new PrismaClient();

// Création d'une instance Express
const app = express();

// Configuration des headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Configuration de la mise en forme des données
app.use(express.json());

// Fonction pour valider les données sensibles
function validateSensitiveData(data) {
  // Suppression des données sensibles
  delete data.password;
  delete data.token;
  delete data.apiKey;
  return data;
}

// API pour récupérer les données de l'IA
app.get('/api/andy', async (req, res) => {
  try {
    // Récupération des données de l'IA
    const data = await prisma.ia.findMany();
    // Validation des données sensibles
    const validatedData = data.map((item) => validateSensitiveData(item));
    // Envoi de la réponse
    res.json(validatedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne' });
  }
});

// API pour envoyer des données à l'IA
app.post('/api/andy', async (req, res) => {
  try {
    // Validation des données sensibles
    const validatedData = validateSensitiveData(req.body);
    // Enregistrement des données dans la base de données
    const id = uuidv4();
    await prisma.ia.create({ data: validatedData, id });
    // Envoi de la réponse
    res.json({ message: 'Données enregistrées' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne' });
  }
});

// Export de l'application Express
export default app;
```

Création de `api/andy.js` pour les requêtes chat :

```javascript
// Import des dépendances
import express from 'express';
import { PrismaClient } from '@prisma/client';

// Création d'un client Prisma
const prisma = new PrismaClient();

// Création d'une instance Express
const app = express();

// Configuration des headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Configuration de la mise en forme des données
app.use(express.json());

// Fonction pour valider les données sensibles
function validateSensitiveData(data) {
  // Suppression des données sensibles
  delete data.password;
  delete data.token;
  delete data.apiKey;
  return data;
}

// API pour récupérer les messages de chat
app.get('/api/andy/chat', async (req, res) => {
  try {
    // Récupération des messages de chat
    const messages = await prisma.chat.findMany();
    // Validation des données sensibles
    const validatedMessages = messages.map((item) => validateSensitiveData(item));
    // Envoi de la réponse
    res.json(validatedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne' });
  }
});

// API pour envoyer un message de chat
app.post('/api/andy/chat', async (req, res) => {
  try {
    // Validation des données sensibles
    const validatedMessage = validateSensitiveData(req.body);
    // Enregistrement du message dans la base de données
    const id = uuidv4();
    await prisma.chat.create({ data: validatedMessage, id });
    // Envoi de la réponse
    res.json({ message: 'Message envoyé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne' });
  }
});

// Export de l'application Express
export default app;
```

Création de `styles/api.css` pour les styles :

```css
body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.api-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.api-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--t2);
  margin-bottom: 20px;
}

.api-form {
  margin-top: 20px;
}

.api-form input {
  width: 100%;
  height: 40px;
  padding: 10px;
  font-size: 18px;
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 20px;
}

.api-form button {
  width: 100%;
  height: 40px;
  padding: 10px;
  font-size: 18px;
  background-color: var(--green);
  color: var(--t1);
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.api-form button:hover {
  background-color: #00cc00;
}

.api-response {
  margin-top: 20px;
}

.api-response pre {
  background-color: var(--bg3);
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
}
```

Création de `index.js` pour lancer l'application :

```javascript
import express from 'express';
import api from './api/andy.js';

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/api', api);

const port = 4000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
```

Création de `package.json` :

```json
{
  "name": "andy-api",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "@prisma/client": "^4.0.0",
    "uuid": "^8.3.2"
  }
}
```

Création de `prisma/schema.prisma` :

```prisma
model IA {
  id       String   @id @default(cuid())
  name     String
  data     String
}

model Chat {
  id       String   @id @default(cuid())
  message  String
}
```

Création de `prisma/.env` :

```makefile
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

Lancer l'application avec `npm start` et accéder à `http://localhost:4000/api/andy` pour tester les API.