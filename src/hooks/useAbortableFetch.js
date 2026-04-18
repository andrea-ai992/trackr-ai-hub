Je vais créer le hook `useAbortableFetch` et l'intégrer dans `News.jsx` comme demandé.

D'abord, voici le contenu du nouveau fichier `src/hooks/useAbortableFetch.js`:

```javascript
import { useState, useEffect, useCallback } from 'react';

const DEFAULT_TIMEOUT = 10000; // 10 secondes par défaut

/**
 * Hook personnalisé pour gérer les requêtes fetch avec gestion du timeout
 * @param {number} [timeout=DEFAULT_TIMEOUT] - Timeout en ms (défaut: 10000)
 * @returns {Object} - { data, error, isLoading, fetchData }
 */
export const useAbortableFetch = (timeout = DEFAULT_TIMEOUT) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async (url, options = {}) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError(new Error(`Request timed out after ${timeout}ms`));
      } else {
        setError(err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [timeout]);

  return { data, error, isLoading, fetchData };
};
```

Maintenant, voici le contenu complet de `src/pages/News.jsx` avec l'intégration du hook:

```javascript
import { useState, useEffect } from 'react';
import { useAbortableFetch } from '../hooks/useAbortableFetch';

const News = () => {
  const [rssSources, setRssSources] = useState([
    { id: 'tech', name: 'Tech', url: 'https://feeds.feedburner.com/TechCrunch' },
    { id: 'sport', name: 'Sports', url: 'https://www.espn.com/espn/rss/news' },
    { id: 'business', name: 'Business', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml' },
    { id: 'crypto', name: 'Crypto', url: 'https://cryptonews.com/feed/' },
  ]);
  const [activeSource, setActiveSource] = useState('tech');
  const [newsItems, setNewsItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, error, isLoading, fetchData } = useAbortableFetch(8000);

  const fetchNews = async (sourceId) => {
    const source = rssSources.find(s => s.id === sourceId);
    if (!source) return;

    setIsRefreshing(true);
    await fetchData(source.url);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchNews(activeSource);
  }, [activeSource]);

  useEffect(() => {
    if (data) {
      // Transformation basique des données RSS en structure simple
      const items = Array.isArray(data?.items)
        ? data.items.map(item => ({
            id: item.guid || item.link,
            title: item.title || 'No title',
            description: item.description || item.contentSnippet || '',
            link: item.link || '#',
            pubDate: item.pubDate || new Date().toISOString(),
            source: item.source?.title || rssSources.find(s => s.url === data.feedUrl)?.name || 'Unknown'
          }))
        : [];

      setNewsItems(items);
    }
  }, [data]);

  const handleRefresh = () => {
    fetchNews(activeSource);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>News Feed</h1>
        <div className="source-selector">
          {rssSources.map(source => (
            <button
              key={source.id}
              className={`source-btn ${activeSource === source.id ? 'active' : ''}`}
              onClick={() => setActiveSource(source.id)}
            >
              {source.name}
            </button>
          ))}
        </div>
      </header>

      <div className="news-actions">
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>Error loading news: {error.message}</p>
        </div>
      )}

      <div className="news-list">
        {newsItems.length > 0 ? (
          newsItems.map(item => (
            <article key={item.id} className="news-item">
              <h3 className="news-title">
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </h3>
              <div className="news-meta">
                <span className="news-source">{item.source}</span>
                <span className="news-date">
                  {new Date(item.pubDate).toLocaleDateString()}
                </span>
              </div>
              <p className="news-description">{item.description}</p>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="read-more"
              >
                Read more →
              </a>
            </article>
          ))
        ) : (
          <div className="no-news">
            {isLoading ? 'Loading news...' : 'No news available'}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background-color: var(--bg);
          color: var(--t1);
          padding: 1rem;
          font-family: 'Inter', sans-serif;
        }

        .page-header {
          margin-bottom: 1.5rem;
        }

        .page-header h1 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          color: var(--green);
        }

        .source-selector {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .source-btn {
          padding: 0.5rem 1rem;
          background-color: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          color: var(--t2);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .source-btn:hover {
          background-color: var(--bg3);
          border-color: var(--border-hi);
          color: var(--t1);
        }

        .source-btn.active {
          background-color: var(--green);
          color: var(--bg);
          border-color: var(--green);
        }

        .news-actions {
          margin-bottom: 1.5rem;
        }

        .refresh-btn {
          padding: 0.5rem 1rem;
          background-color: var(--green);
          color: var(--bg);
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          padding: 1rem;
          background-color: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          color: #ff6b6b;
        }

        .news-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .news-item {
          padding: 1.2rem;
          background-color: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          transition: border-color 0.2s ease;
        }

        .news-item:hover {
          border-color: var(--border-hi);
        }

        .news-title {
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .news-title a {
          color: var(--t1);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .news-title a:hover {
          color: var(--green);
        }

        .news-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
          font-size: 0.85rem;
          color: var(--t3);
        }

        .news-source {
          color: var(--green);
          font-weight: 600;
        }

        .news-description {
          margin-bottom: 1rem;
          line-height: 1.5;
          color: var(--t2);
        }

        .read-more {
          display: inline-block;
          color: var(--green);
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }

        .read-more:hover {
          opacity: 0.8;
        }

        .no-news {
          text-align: center;
          padding: 2rem;
          color: var(--t2);
        }

        @media (min-width: 768px) {
          .news-list {
            gap: 2rem;
          }

          .news-item {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default News;
```

J'ai également ajouté le style CSS directement dans le composant avec `styled-jsx` pour respecter les contraintes du projet. Le hook `useAbortableFetch` est maintenant utilisé dans la page News pour tous les appels fetch, avec un timeout de 8 secondes pour éviter les hangs indéfinis.