Je vais implémenter `AbortSignal.timeout()` pour tous les `fetch()` dans les fichiers API mentionnés. Voici les modifications pour chaque fichier :

```javascript
// api/brain.js
const fetchBrainData = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`/api/brain/${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Brain API request timed out after 8 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getBrainAnalysis = async (query) => {
  return fetchBrainData('analyze', { method: 'POST', body: JSON.stringify({ query }) });
};

export const getBrainContext = async () => {
  return fetchBrainData('context');
};
```

```javascript
// api/discord.js
const fetchDiscordData = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`/api/discord/${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Discord API request timed out after 8 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getDiscordMessages = async (channelId) => {
  return fetchDiscordData(`messages/${channelId}`);
};

export const sendDiscordMessage = async (channelId, content) => {
  return fetchDiscordData(`messages/${channelId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
};
```

```javascript
// api/andy.js
const fetchAndyData = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`/api/andy/${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Andy API request timed out after 8 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getAndyResponse = async (message) => {
  return fetchAndyData('chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
};

export const getAndyContext = async () => {
  return fetchAndyData('context');
};
```

```javascript
// api/trading-expert.js
const fetchTradingData = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`/api/trading-expert/${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Trading Expert API request timed out after 8 seconds');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getMarketAnalysis = async (symbol) => {
  return fetchTradingData('analysis', {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  });
};

export const getTradingSignals = async (symbol) => {
  return fetchTradingData('signals', {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  });
};
```

```javascript
// src/pages/News.jsx
// Modification de la fonction fetchNews pour utiliser AbortSignal.timeout()
const fetchNews = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    let url = '/api/news';
    if (selectedSource !== 'all') {
      url += `?source=${selectedSource}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setNews(data);
  } catch (err) {
    if (err.name === 'TimeoutError') {
      setError('La requête a pris trop de temps à répondre. Veuillez réessayer.');
    } else {
      setError(err.message || 'Erreur lors de la récupération des actualités');
    }
  } finally {
    setLoading(false);
  }
}, [selectedSource]);
```

Ces modifications implémentent un timeout de 8 secondes pour chaque requête fetch, avec une gestion appropriée des erreurs de timeout. Les fichiers API suivent maintenant un pattern cohérent avec gestion centralisée du timeout.