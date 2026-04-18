Voici le fichier `src/pages/BrainExplorer/api/discord.js` complet et fonctionnel :

```javascript
// src/pages/BrainExplorer/api/discord.js
// Gestion des appels SSE à l'API Discord via le serveur Node.js

export const fetchDiscordSSE = async (prompt, onMessage, onError) => {
  try {
    const response = await fetch('http://localhost:4000/api/discord/sse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Pas de flux disponible');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onMessage(parsed.content);
              }
            } catch (e) {
              console.error('Erreur parsing JSON:', e);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Erreur SSE:', error);
    onError(error.message || 'Erreur de connexion au flux');
  }
};

// Fonction utilitaire pour envoyer une requête simple (non SSE)
export const sendDiscordMessage = async (prompt) => {
  try {
    const response = await fetch('http://localhost:4000/api/discord/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur message Discord:', error);
    throw error;
  }
};
```

Et voici le fichier CSS associé `src/pages/BrainExplorer/api/discord.css` :

```css
/* src/pages/BrainExplorer/api/discord.css */
.discord-sse-container {
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  background-color: var(--bg2);
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  font-family: 'Inter', sans-serif;
  color: var(--t1);
  font-size: 0.9rem;
  line-height: 1.5;
  overflow-x: hidden;
}

.discord-sse-message {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: rgba(0, 255, 136, 0.1);
  border-left: 3px solid var(--green);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.discord-sse-error {
  color: #ff4444;
  font-weight: 500;
}

.discord-input-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.discord-input {
  flex: 1;
  padding: 0.75rem;
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--t1);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
}

.discord-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--green);
  color: #000;
  border: none;
  border-radius: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.discord-button:hover {
  background-color: #00e67a;
}

.discord-button:disabled {
  background-color: var(--t3);
  cursor: not-allowed;
}