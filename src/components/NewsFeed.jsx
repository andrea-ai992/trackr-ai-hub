Je vais implémenter `useAbortableFetch` et créer `NewsFeed.jsx` selon les spécifications.

```jsx
// src/hooks/useAbortableFetch.js
import { useState, useEffect, useCallback } from 'react';

const useAbortableFetch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [controller, setController] = useState(null);

  const fetchData = useCallback(async (url, options = {}, timeout = 8000) => {
    if (controller) {
      controller.abort();
    }

    const newController = new AbortController();
    setController(newController);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: newController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setController(null);
    }
  }, []);

  const cancelFetch = useCallback(() => {
    if (controller) {
      controller.abort();
      setLoading(false);
      setError('Request cancelled');
      setController(null);
    }
  }, [controller]);

  useEffect(() => {
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [controller]);

  return { data, loading, error, fetchData, cancelFetch };
};

export default useAbortableFetch;
```

```jsx
// src/components/NewsFeed.jsx
import { useState, useEffect } from 'react';
import { useAbortableFetch } from '../hooks/useAbortableFetch';

const NewsFeed = () => {
  const [newsSources, setNewsSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState('all');
  const { data: newsData, loading, error, fetchData } = useAbortableFetch();

  const newsFeeds = [
    { id: 'all', name: 'Tous', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/Business.xml' },
    { id: 'tech', name: 'Technologie', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TechCrunch' },
    { id: 'crypto', name: 'Crypto', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss' },
    { id: 'market', name: 'Marchés', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.bloomberg.com/feeds/podcasts/market_analysis.xml' },
  ];

  useEffect(() => {
    setNewsSources(newsFeeds);
    fetchData(newsFeeds[0].url);
  }, []);

  const handleSourceChange = (sourceId) => {
    const selectedFeed = newsFeeds.find(feed => feed.id === sourceId);
    if (selectedFeed) {
      setSelectedSource(sourceId);
      fetchData(selectedFeed.url);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="news-feed">
      <div className="news-header">
        <h2>Fil d'actualités</h2>
        <div className="source-selector">
          {newsSources.map((source) => (
            <button
              key={source.id}
              className={`source-btn ${selectedSource === source.id ? 'active' : ''}`}
              onClick={() => handleSourceChange(source.id)}
            >
              {source.name}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement des actualités...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>Erreur: {error}</p>
          <button onClick={() => fetchData(newsFeeds.find(f => f.id === selectedSource)?.url)}>Réessayer</button>
        </div>
      )}

      {!loading && !error && newsData && newsData.items && (
        <div className="news-list">
          {newsData.items.slice(0, 10).map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card"
            >
              <div className="news-content">
                <h3>{item.title}</h3>
                <p className="news-description">{item.description}</p>
                <div className="news-meta">
                  <span className="source">{item.author || 'Source inconnue'}</span>
                  <span className="date">{formatDate(item.pubDate)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {!loading && !error && (!newsData || !newsData.items || newsData.items.length === 0) && (
        <div className="empty-state">
          <p>Aucune actualité disponible pour cette source</p>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
```

```css
/* src/components/NewsFeed.css */
.news-feed {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--t1);
  background: var(--bg2);
  border-radius: 8px;
  padding: 16px;
  width: 100%;
  max-width: 100%;
}

.news-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.news-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: var(--t1);
}

.source-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.source-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--t2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.source-btn:hover {
  border-color: var(--border-hi);
  color: var(--t1);
}

.source-btn.active {
  background: var(--green);
  color: #000;
  border-color: var(--green);
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  gap: 12px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 255, 136, 0.2);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state p {
  color: #ff4444;
  font-size: 0.9rem;
}

.error-state button {
  background: var(--green);
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.error-state button:hover {
  opacity: 0.8;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
  color: inherit;
}

.news-card:hover {
  border-color: var(--border-hi);
  transform: translateY(-2px);
}

.news-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.news-content h3 {
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.3;
}

.news-description {
  font-size: 0.8rem;
  color: var(--t2);
  margin: 0;
  line-height: 1.4;
}

.news-meta {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--t3);
}

.source {
  font-weight: 500;
}

.date {
  margin-left: auto;
}

@media (min-width: 768px) {
  .news-feed {
    padding: 20px;
  }

  .source-selector {
    justify-content: center;
  }

  .news-content h3 {
    font-size: 1rem;
  }
}