import express from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const app = express();
const router = express.Router();

// Configuration CORS et JSON
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

router.use(express.json({ limit: '10kb' }));

// Middleware de timeout (10 secondes)
const timeoutMiddleware = (req, res, next) => {
  const timeout = setTimeout(() => {
    const error = new Error('Request timeout');
    error.statusCode = 408;
    next(error);
  }, 10000);

  res.on('finish', () => clearTimeout(timeout));
  next();
};

// Fonction de validation des données sensibles
const sanitizeData = (data) => {
  if (!data) return null;
  const sanitized = { ...data };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.apiKey;
  delete sanitized.creditCard;
  delete sanitized.ssn;
  return sanitized;
};

// Middleware de gestion d'erreur global
const errorHandler = (err, req, res, next) => {
  console.error('Erreur API:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Erreur interne du serveur' : err.message;

  res.status(statusCode).json({
    error: {
      code: statusCode,
      message,
      timestamp: new Date().toISOString()
    }
  });
};

// Middleware de validation des requêtes
const validateRequest = (req, res, next) => {
  if (req.method === 'POST' && !req.body) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Le corps de la requête est vide'
    });
  }
  next();
};

// Fonction utilitaire pour les requêtes fetch avec timeout
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// API pour récupérer les données de l'IA
router.get('/', timeoutMiddleware, validateRequest, async (req, res, next) => {
  try {
    const data = await prisma.ia.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: 'Aucune donnée IA trouvée',
        timestamp: new Date().toISOString()
      });
    }

    const validatedData = data.map(sanitizeData);
    res.json({
      success: true,
      count: validatedData.length,
      data: validatedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// API pour envoyer des données à l'IA
router.post('/', timeoutMiddleware, validateRequest, async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new Error('Données manquantes dans le corps de la requête');
    }

    const validatedData = sanitizeData(req.body);
    if (!validatedData) {
      throw new Error('Données invalides après validation');
    }

    const id = uuidv4();
    const createdData = await prisma.ia.create({
      data: {
        ...validatedData,
        id,
        createdAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Données enregistrées avec succès',
      data: sanitizeData(createdData),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// API pour récupérer les messages de chat
router.get('/chat', timeoutMiddleware, validateRequest, async (req, res, next) => {
  try {
    const messages = await prisma.chat.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    if (!messages || messages.length === 0) {
      return res.status(404).json({
        message: 'Aucun message de chat trouvé',
        timestamp: new Date().toISOString()
      });
    }

    const validatedMessages = messages.map(sanitizeData);
    res.json({
      success: true,
      count: validatedMessages.length,
      data: validatedMessages,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// API pour envoyer un message de chat
router.post('/chat', timeoutMiddleware, validateRequest, async (req, res, next) => {
  try {
    if (!req.body || !req.body.message) {
      throw new Error('Message manquant dans le corps de la requête');
    }

    const validatedMessage = sanitizeData(req.body);
    if (!validatedMessage.message) {
      throw new Error('Le message ne peut pas être vide');
    }

    const id = uuidv4();
    const createdMessage = await prisma.chat.create({
      data: {
        ...validatedMessage,
        id,
        createdAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: sanitizeData(createdMessage),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// API pour récupérer les données de l'IA avec timeout
router.get('/fetch', timeoutMiddleware, validateRequest, async (req, res, next) => {
  try {
    const response = await fetchWithTimeout('https://api.example.com/ai-data', {}, 5000);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      error.message = 'Request timeout';
      error.statusCode = 408;
    }
    next(error);
  }
});

// API pour envoyer des données à l'IA avec timeout
router.post('/fetch', timeoutMiddleware, validateRequest, async (req, res, next) => {
  try {
    const response = await fetchWithTimeout('https://api.example.com/ai-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    }, 5000);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      error.message = 'Request timeout';
      error.statusCode = 408;
    }
    next(error);
  }
});

// Gestion des erreurs globales
router.use(errorHandler);

// Application des routes
app.use('/api/andy', router);

export default app;