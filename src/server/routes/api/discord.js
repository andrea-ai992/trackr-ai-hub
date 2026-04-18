Je vais créer le fichier `src/server/routes/api/discord.js` avec une implémentation complète utilisant `AbortSignal.timeout()` pour éviter les timeouts indéfinis lors de la lecture des flux SSE.

```javascript
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { LRUCache } from 'lru-cache';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Configuration du cache pour les messages Discord
const messageCache = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 5, // 5 minutes
  allowStale: false
});

// Configuration du cache pour les utilisateurs Discord
const userCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60 * 24, // 24 heures
  allowStale: false
});

// Middleware pour gérer les erreurs
const handleError = (res, error) => {
  console.error('Discord API Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    details: error.message
  });
};

// Fonction pour récupérer un utilisateur Discord depuis le cache ou l'API
const getDiscordUser = async (userId) => {
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const userData = await response.json();
    userCache.set(userId, userData);
    return userData;
  } catch (error) {
    console.error('Error fetching Discord user:', error);
    return null;
  }
};

// Fonction pour récupérer les messages depuis Supabase ou l'API Discord
const getDiscordMessages = async (channelId, limit = 50) => {
  const cacheKey = `messages_${channelId}_${limit}`;

  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey);
  }

  try {
    // D'abord essayer de récupérer depuis Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('discord_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (!supabaseError && supabaseData) {
      const messages = supabaseData.reverse();
      messageCache.set(cacheKey, messages);
      return messages;
    }

    // Si Supabase échoue, utiliser l'API Discord
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    const messages = await response.json();
    messageCache.set(cacheKey, messages);
    return messages;
  } catch (error) {
    console.error('Error fetching Discord messages:', error);
    return [];
  }
};

// Route pour obtenir les messages d'un canal Discord
router.get('/messages/:channelId', async (req, res) => {
  const { channelId } = req.params;
  const { limit = 50 } = req.query;

  try {
    const messages = await getDiscordMessages(channelId, parseInt(limit, 10));
    res.json(messages);
  } catch (error) {
    handleError(res, error);
  }
});

// Route SSE pour le streaming des messages en temps réel
router.get('/sse/messages/:channelId', (req, res) => {
  const { channelId } = req.params;
  const { limit = 50 } = req.query;

  // Définir les headers pour le streaming SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Créer un signal d'abort avec timeout pour éviter les timeouts indéfinis
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    res.write('event: timeout\ndata: {"message": "Connection timeout after 30 seconds"}\n\n');
    res.end();
  }, 30000); // Timeout de 30 secondes

  // Fonction pour envoyer les données au client
  const sendEvent = async (data) => {
    if (controller.signal.aborted) return;

    try {
      const messages = await getDiscordMessages(channelId, parseInt(limit, 10));
      res.write(`event: message\ndata: ${JSON.stringify(messages)}\n\n`);
    } catch (error) {
      if (controller.signal.aborted) return;
      res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    }
  };

  // Envoyer les messages initiaux
  sendEvent().catch(console.error);

  // Mettre à jour les messages toutes les 5 secondes
  const intervalId = setInterval(() => {
    sendEvent().catch(console.error);
  }, 5000);

  // Nettoyer les ressources lorsque le client se déconnecte
  req.on('close', () => {
    clearTimeout(timeoutId);
    clearInterval(intervalId);
    controller.abort();
  });

  // Nettoyer lorsque le serveur ferme la connexion
  res.on('close', () => {
    clearTimeout(timeoutId);
    clearInterval(intervalId);
    controller.abort();
  });
});

// Route pour obtenir les détails d'un utilisateur Discord
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userData = await getDiscordUser(userId);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(userData);
  } catch (error) {
    handleError(res, error);
  }
});

// Route pour envoyer un message à un canal Discord
router.post('/messages/:channelId', async (req, res) => {
  const { channelId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
        },
        body: JSON.stringify({ content })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }

    const message = await response.json();

    // Invalider le cache pour ce canal
    const cacheKeys = messageCache.keys().filter(key => key.startsWith(`messages_${channelId}_`));
    cacheKeys.forEach(key => messageCache.delete(key));

    res.json(message);
  } catch (error) {
    handleError(res, error);
  }
});

export default router;