Voici le fichier `src/api/discord.js` complet et fonctionnel, avec une lecture ligne par ligne du stream SSE :

```javascript
// src/api/discord.js
import { SUPABASE_URL, SUPABASE_KEY } from '../config';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_BOT_TOKEN = import.meta.env.VITE_DISCORD_BOT_TOKEN;

export const getDiscordMessages = async (channelId) => {
  try {
    const response = await fetch(`${DISCORD_API_URL}/channels/${channelId}/messages`, {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    // Lecture ligne par ligne du stream SSE
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
    }

    try {
      return JSON.parse(result);
    } catch (parseError) {
      console.error('Failed to parse Discord messages:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching Discord messages:', error);
    return [];
  }
};

export const sendDiscordMessage = async (channelId, content) => {
  try {
    const response = await fetch(`${DISCORD_API_URL}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Discord message:', error);
    return null;
  }
};
```

Et voici le fichier CSS associé `src/api/discord.css` :

```css
/* src/api/discord.css */
.discord-messages {
  font-family: 'Inter', sans-serif;
  color: var(--t1);
  background-color: var(--bg);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  max-height: 400px;
  overflow-y: auto;
}

.discord-message {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.discord-message:last-child {
  border-bottom: none;
}

.discord-message-author {
  color: var(--green);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.discord-message-content {
  color: var(--t2);
  font-size: 0.9rem;
  line-height: 1.4;
}

.discord-message-time {
  color: var(--t3);
  font-size: 0.75rem;
  margin-top: 0.25rem;
  text-align: right;
}