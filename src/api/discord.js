Voici la version corrigée de `src/api/discord.js` avec une lecture directe du stream SSE utilisant `ReadableStream` et `TextDecoderStream` :

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

    if (!response.body) {
      throw new Error('No response body');
    }

    // Lecture directe du stream avec ReadableStream et TextDecoderStream
    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += value;
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

Le fichier `src/api/discord.css` reste inchangé car il est déjà conforme aux règles demandées.