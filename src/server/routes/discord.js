Voici le fichier `src/server/routes/discord.js` complet et fonctionnel :

```javascript
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Configuration SSE
const sseConfig = {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  },
};

// Middleware pour vérifier l'authentification Discord
const authenticateDiscord = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({ error: 'Token Discord manquant' });
  }

  try {
    // Vérification basique du token (à adapter selon ton système d'auth)
    const { data: user, error } = await supabase
      .from('discord_users')
      .select('*')
      .eq('discord_token', token)
      .single();

    if (error || !user) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Erreur d\'authentification:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Route pour le stream SSE des messages Discord
router.get('/discord/stream', authenticateDiscord, async (req, res) => {
  try {
    // Récupération des channels accessibles
    const { data: channels, error } = await supabase
      .from('discord_channels')
      .select('id, name, guild_id')
      .eq('user_id', req.user.id);

    if (error) throw error;

    // Création du stream
    res.writeHead(200, sseConfig);

    // Envoi d'un événement de bienvenue
    res.write(`event: welcome\ndata: {"message": "Stream Discord actif", "channels": ${JSON.stringify(channels)}}\n\n`);

    // Souscription aux changements en temps réel
    const channelIds = channels.map(c => c.id);

    const subscription = supabase
      .channel('discord_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discord_messages',
          filter: `channel_id=in.(${channelIds.join(',')})`,
        },
        (payload) => {
          const message = {
            id: payload.new.id,
            content: payload.new.content,
            author: payload.new.author,
            channel_id: payload.new.channel_id,
            timestamp: payload.new.timestamp,
            attachments: payload.new.attachments || [],
          };

          res.write(`event: message\ndata: ${JSON.stringify(message)}\n\n`);
        }
      )
      .subscribe();

    // Gestion de la fermeture de la connexion
    req.on('close', () => {
      subscription.unsubscribe();
      res.end();
    });

    req.on('aborted', () => {
      subscription.unsubscribe();
      res.end();
    });

  } catch (err) {
    console.error('Erreur dans le stream Discord:', err);
    res.writeHead(500, sseConfig);
    res.write(`event: error\ndata: {"error": "Impossible de démarrer le stream"}\n\n`);
    res.end();
  }
});

// Route pour envoyer un message via Discord
router.post('/discord/message', authenticateDiscord, async (req, res) => {
  const { channel_id, content } = req.body;

  if (!channel_id || !content) {
    return res.status(400).json({ error: 'channel_id et content sont requis' });
  }

  try {
    // Vérification que le channel est accessible
    const { data: channel, error: channelError } = await supabase
      .from('discord_channels')
      .select('*')
      .eq('id', channel_id)
      .eq('user_id', req.user.id)
      .single();

    if (channelError || !channel) {
      return res.status(403).json({ error: 'Channel non accessible' });
    }

    // Envoi du message via l'API Discord (à adapter selon ton système)
    const { data: message, error } = await supabase
      .rpc('send_discord_message', {
        p_channel_id: channel_id,
        p_content: content,
        p_user_id: req.user.id,
      });

    if (error) throw error;

    res.json({ success: true, message });
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

export default router;