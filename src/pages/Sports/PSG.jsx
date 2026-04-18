Je vais implémenter le hook `useAbortableFetch` et créer la page `PSG.jsx` selon les spécifications.

---

src/hooks/useAbortableFetch.js
```javascript
import { useState, useEffect, useCallback } from 'react';

const useAbortableFetch = (initialUrl = '', initialOptions = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [controller, setController] = useState(null);

  const fetchData = useCallback(async (url = initialUrl, options = initialOptions) => {
    // Abort previous request if exists
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
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
      setData(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialUrl, initialOptions]);

  const abortFetch = useCallback(() => {
    if (controller) {
      controller.abort();
      setLoading(false);
    }
  }, [controller]);

  useEffect(() => {
    if (initialUrl) {
      fetchData();
    }
    return () => {
      abortFetch();
    };
  }, [fetchData, initialUrl, abortFetch]);

  return { data, error, loading, fetchData, abortFetch };
};

export default useAbortableFetch;
```

---

src/pages/Sports/PSG.jsx
```javascript
import { useState, useEffect } from 'react';
import { useAbortableFetch } from '../../hooks/useAbortableFetch';
import { ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';

const PSG = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [newsPage, setNewsPage] = useState(1);
  const [fixturesPage, setFixturesPage] = useState(1);
  const [statsPage, setStatsPage] = useState(1);

  // News API
  const { data: newsData, error: newsError, loading: newsLoading, fetchData: fetchNews } = useAbortableFetch(
    'https://trackr-app-nu.vercel.app/api/sports/psg/news?page=1&limit=10',
    { method: 'GET' }
  );

  // Fixtures API
  const { data: fixturesData, error: fixturesError, loading: fixturesLoading, fetchData: fetchFixtures } = useAbortableFetch(
    'https://trackr-app-nu.vercel.app/api/sports/psg/fixtures?page=1&limit=10',
    { method: 'GET' }
  );

  // Stats API
  const { data: statsData, error: statsError, loading: statsLoading, fetchData: fetchStats } = useAbortableFetch(
    'https://trackr-app-nu.vercel.app/api/sports/psg/stats?page=1&limit=10',
    { method: 'GET' }
  );

  useEffect(() => {
    fetchNews();
    fetchFixtures();
    fetchStats();
  }, []);

  const handleRefresh = () => {
    switch (activeTab) {
      case 'news':
        fetchNews();
        break;
      case 'fixtures':
        fetchFixtures();
        break;
      case 'stats':
        fetchStats();
        break;
      default:
        break;
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const loadMoreNews = () => {
    if (newsData?.hasMore) {
      const nextPage = newsPage + 1;
      setNewsPage(nextPage);
      fetchNews(`https://trackr-app-nu.vercel.app/api/sports/psg/news?page=${nextPage}&limit=10`);
    }
  };

  const loadMoreFixtures = () => {
    if (fixturesData?.hasMore) {
      const nextPage = fixturesPage + 1;
      setFixturesPage(nextPage);
      fetchFixtures(`https://trackr-app-nu.vercel.app/api/sports/psg/fixtures?page=${nextPage}&limit=10`);
    }
  };

  const loadMoreStats = () => {
    if (statsData?.hasMore) {
      const nextPage = statsPage + 1;
      setStatsPage(nextPage);
      fetchStats(`https://trackr-app-nu.vercel.app/api/sports/psg/stats?page=${nextPage}&limit=10`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] font-['Inter'] p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--green)] flex items-center gap-2">
          <span>PSG</span>
          <span className="text-[var(--t2)]">Paris Saint-Germain</span>
        </h1>
      </header>

      <div className="mb-4">
        <div className="flex border-b border-[var(--border)]">
          {['news', 'fixtures', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-[var(--green)] text-[var(--green)]'
                  : 'text-[var(--t2)] hover:text-[var(--t1)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {activeTab === 'news' && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-[var(--green)]">Latest News</h2>
              <button
                onClick={handleRefresh}
                className="p-1 rounded-full hover:bg-[var(--bg2)] transition-colors"
                aria-label="Refresh news"
              >
                <RefreshCw size={18} className="text-[var(--t2)]" />
              </button>
            </div>

            {newsError && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-sm text-red-300 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{newsError}</span>
              </div>
            )}

            {newsLoading && !newsData && (
              <div className="p-4 text-center text-[var(--t2)]">Loading news...</div>
            )}

            {newsData?.items && newsData.items.length > 0 && (
              <div className="space-y-3">
                {newsData.items.map((item) => (
                  <article
                    key={item.id}
                    className="p-4 bg-[var(--bg2)] rounded-lg border border-[var(--border)] hover:border-[var(--border-hi)] transition-colors"
                  >
                    <h3 className="font-medium text-[var(--t1)] mb-1">{item.title}</h3>
                    <p className="text-sm text-[var(--t2)] mb-2">{item.summary}</p>
                    <div className="flex justify-between items-center text-xs text-[var(--t3)]">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--green)] hover:underline"
                      >
                        Read more
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {newsData?.hasMore && (
              <button
                onClick={loadMoreNews}
                className="w-full mt-4 py-2 px-4 bg-[var(--bg3)] rounded-lg text-[var(--t2)] hover:bg-[var(--bg2)] transition-colors flex items-center justify-center gap-2"
              >
                <span>Load more</span>
                <ChevronDown size={16} />
              </button>
            )}
          </section>
        )}

        {activeTab === 'fixtures' && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-[var(--green)]">Upcoming Fixtures</h2>
              <button
                onClick={handleRefresh}
                className="p-1 rounded-full hover:bg-[var(--bg2)] transition-colors"
                aria-label="Refresh fixtures"
              >
                <RefreshCw size={18} className="text-[var(--t2)]" />
              </button>
            </div>

            {fixturesError && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-sm text-red-300 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{fixturesError}</span>
              </div>
            )}

            {fixturesLoading && !fixturesData && (
              <div className="p-4 text-center text-[var(--t2)]">Loading fixtures...</div>
            )}

            {fixturesData?.items && fixturesData.items.length > 0 && (
              <div className="space-y-3">
                {fixturesData.items.map((fixture) => (
                  <div
                    key={fixture.id}
                    className="p-4 bg-[var(--bg2)] rounded-lg border border-[var(--border)]"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[var(--t3)]">{new Date(fixture.date).toLocaleDateString()}</span>
                      <span className="text-sm text-[var(--t3)]">{fixture.competition}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={fixture.homeTeam.logo}
                          alt={fixture.homeTeam.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium">{fixture.homeTeam.name}</span>
                      </div>
                      <span className="text-lg font-bold px-4">VS</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{fixture.awayTeam.name}</span>
                        <img
                          src={fixture.awayTeam.logo}
                          alt={fixture.awayTeam.name}
                          className="w-8 h-8 rounded-full"
                        />
                      </div>
                    </div>
                    {fixture.status && (
                      <div className="mt-2 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          fixture.status === 'Scheduled'
                            ? 'bg-blue-900/50 text-blue-300'
                            : fixture.status === 'Postponed'
                              ? 'bg-yellow-900/50 text-yellow-300'
                              : 'bg-green-900/50 text-green-300'
                        }`}>
                          {fixture.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {fixturesData?.hasMore && (
              <button
                onClick={loadMoreFixtures}
                className="w-full mt-4 py-2 px-4 bg-[var(--bg3)] rounded-lg text-[var(--t2)] hover:bg-[var(--bg2)] transition-colors flex items-center justify-center gap-2"
              >
                <span>Load more</span>
                <ChevronDown size={16} />
              </button>
            )}
          </section>
        )}

        {activeTab === 'stats' && (
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-[var(--green)]">Team Stats</h2>
              <button
                onClick={handleRefresh}
                className="p-1 rounded-full hover:bg-[var(--bg2)] transition-colors"
                aria-label="Refresh stats"
              >
                <RefreshCw size={18} className="text-[var(--t2)]" />
              </button>
            </div>

            {statsError && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-sm text-red-300 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{statsError}</span>
              </div>
            )}

            {statsLoading && !statsData && (
              <div className="p-4 text-center text-[var(--t2)]">Loading stats...</div>
            )}

            {statsData?.items && statsData.items.length > 0 && (
              <div className="space-y-3">
                {statsData.items.map((stat) => (
                  <div
                    key={stat.id}
                    className="p-4 bg-[var(--bg2)] rounded-lg border border-[var(--border)]"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{stat.category}</span>
                      <span className="text-sm text-[var(--t3)]">{stat.season}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {stat.metrics.map((metric) => (
                        <div key={metric.name} className="flex justify-between">
                          <span className="text-sm text-[var(--t2)]">{metric.name}</span>
                          <span className="font-medium">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {statsData?.hasMore && (
              <button
                onClick={loadMoreStats}
                className="w-full mt-4 py-2 px-4 bg-[var(--bg3)] rounded-lg text-[var(--t2)] hover:bg-[var(--bg2)] transition-colors flex items-center justify-center gap-2"
              >
                <span>Load more</span>
                <ChevronDown size={16} />
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default PSG;