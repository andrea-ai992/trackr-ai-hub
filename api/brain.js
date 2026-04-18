Je vais implémenter `AbortSignal.timeout()` sur tous les `fetch()` dans `src/pages/News.jsx` pour éviter les hangs indéfinis, en m'inspirant de la logique existante dans les fichiers API.

```jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSource, setSelectedSource] = useState('all');
  const [savedArticles, setSavedArticles] = useState(new Set());
  const navigate = useNavigate();

  const sources = [
    { id: 'all', name: 'Tous' },
    { id: 'lemonde', name: 'Le Monde' },
    { id: 'lefigaro', name: 'Le Figaro' },
    { id: 'liberation', name: 'Libération' },
    { id: 'lexpress', name: 'L\'Express' },
    { id: 'bfmtv', name: 'BFMTV' },
    { id: 'rtl', name: 'RTL' },
    { id: '01net', name: '01Net' },
  ];

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      let url = '/api/news';
      if (selectedSource !== 'all') {
        url += `?source=${selectedSource}`;
      }

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNews(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('La requête a pris trop de temps à répondre. Veuillez réessayer.');
      } else {
        setError(err.message || 'Erreur lors de la récupération des actualités');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedSource]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSourceChange = (sourceId) => {
    setSelectedSource(sourceId);
  };

  const toggleSaveArticle = (article) => {
    setSavedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(article.url)) {
        newSet.delete(article.url);
      } else {
        newSet.add(article.url);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: fr,
      });
    } catch {
      return dateString;
    }
  };

  if (loading && news.length === 0) {
    return (
      <div className="min-h-screen bg bg2 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: 'var(--green)' }} />
          <p className="text-t2">Chargement des actualités...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg bg2 p-4">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-bg3 transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--green)' }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: 'var(--t1)' }}>Actualités</h1>
        </div>

        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-400 mb-2">⚠️ {error}</p>
          <button
            onClick={fetchNews}
            className="px-4 py-2 rounded-lg bg-bg3 hover:bg-bg transition-colors text-t1 border border-green/30"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg bg2 p-4">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-bg3 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--green)' }} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--t1)' }}>Actualités</h1>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => handleSourceChange(source.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedSource === source.id
                  ? 'bg-green/20 border border-green text-t1'
                  : 'bg-bg3 hover:bg-bg2 text-t2'
              }`}
            >
              {source.name}
            </button>
          ))}
        </div>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-t2">Aucune actualité disponible pour cette source.</p>
          <button
            onClick={fetchNews}
            className="mt-4 px-4 py-2 rounded-lg bg-bg3 hover:bg-bg transition-colors text-t1 border border-green/30"
          >
            Rafraîchir
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <article
              key={item.url}
              className="bg-bg3 rounded-lg overflow-hidden border border-border hover:border-green/30 transition-colors"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold text-t1 line-clamp-2">{item.title}</h2>
                  <button
                    onClick={() => toggleSaveArticle(item)}
                    className="p-1 rounded-full hover:bg-bg2 transition-colors"
                    aria-label={savedArticles.has(item.url) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    {savedArticles.has(item.url) ? (
                      <BookmarkCheck className="w-5 h-5" style={{ color: 'var(--green)' }} />
                    ) : (
                      <Bookmark className="w-5 h-5 text-t2" />
                    )}
                  </button>
                </div>

                <p className="text-t3 text-sm mb-3 line-clamp-3">{item.description}</p>

                <div className="flex items-center justify-between text-xs text-t3">
                  <span className="bg-bg2 px-2 py-1 rounded">{item.source}</span>
                  <span>{formatDate(item.publishedAt)}</span>
                </div>
              </div>

              {item.image && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-xs text-white line-clamp-1">{item.title}</p>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;