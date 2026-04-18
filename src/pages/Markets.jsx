Je vais implémenter les modifications demandées dans `Markets.jsx` pour ajouter `AbortSignal.timeout()` et intégrer le composant `FearGreedGauge`. Voici les modifications complètes :

```jsx
// src/pages/Markets.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, RefreshCw, AlertTriangle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import Sparkline from '../components/Sparkline';
import PatternCardSkeleton from '../components/PatternCardSkeleton';
import FearGreedGauge from '../components/FearGreedGauge';

const Markets = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState(searchParams.get('tab') || 'stocks');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchMarketData = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutSignal = AbortSignal.timeout(8000); // Timeout de 8 secondes
      const combinedSignal = AbortSignal.any([signal, timeoutSignal]);

      const response = await fetch(
        tab === 'stocks'
          ? 'https://api.stockdata.org/v1/data/quote/stocks?api_token=YOUR_API_KEY'
          : 'https://api.stockdata.org/v1/data/quote/crypto?api_token=YOUR_API_KEY',
        { signal: combinedSignal }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setData(jsonData.data);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection.');
      } else if (err.name === 'TimeoutError') {
        setError('Request took too long to respond.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    const controller = new AbortController();
    fetchMarketData(controller.signal);

    return () => controller.abort();
  }, [tab, refreshTrigger, fetchMarketData]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    const controller = new AbortController();
    fetchMarketData(controller.signal);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const sortedData = useCallback(() => {
    if (!data) return [];

    let sortableData = [...data];
    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      sortableData = sortableData.filter(item =>
        item.name.toLowerCase().includes(termLower) ||
        item.symbol.toLowerCase().includes(termLower)
      );
    }

    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const stocks = sortedData().filter(item => item.type === 'stock');
  const crypto = sortedData().filter(item => item.type === 'crypto');
  const sortedStocks = sortConfig.key ? [...stocks].sort((a, b) => a[sortConfig.key] > b[sortConfig.key] ? 1 : -1) : stocks;
  const sortedCrypto = sortConfig.key ? [...crypto].sort((a, b) => a[sortConfig.key] > b[sortConfig.key] ? 1 : -1) : crypto;

  if (loading && retryCount === 0) {
    return (
      <div className="min-h-screen bg-var(--bg) text-var(--t1) font-['Inter']">
        <div className="px-4 pt-4 pb-24">
          <div className="space-y-3">
            <PatternCardSkeleton />
            <PatternCardSkeleton />
            <PatternCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-var(--bg) text-var(--t1) font-['Inter']">
      <div className="px-4 pt-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange('stocks')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'stocks'
                  ? 'bg-var(--green) text-var(--bg)'
                  : 'bg-var(--bg2) hover:bg-var(--bg3)'
              }`}
            >
              Stocks
            </button>
            <button
              onClick={() => handleTabChange('crypto')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'crypto'
                  ? 'bg-var(--green) text-var(--bg)'
                  : 'bg-var(--bg2) hover:bg-var(--bg3)'
              }`}
            >
              Crypto
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-var(--bg2) hover:bg-var(--bg3) transition-colors"
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder={tab === 'stocks' ? "Search stocks..." : "Search crypto..."}
        />

        {error ? (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="font-medium text-red-500">Error loading data</h3>
            </div>
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-xs bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Retry ({retryCount}/3)
            </button>
          </div>
        ) : (
          <>
            {/* Nouveau composant FearGreedGauge */}
            <div className="mb-6">
              <FearGreedGauge />
            </div>

            {data && (tab === 'stocks' ? sortedStocks : sortedCrypto).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-var(--t3)">No {tab} found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                <div className="grid grid-cols-3 gap-4 px-3 py-2 text-xs text-var(--t3) uppercase tracking-wider">
                  <button
                    onClick={() => requestSort('name')}
                    className="flex items-center gap-1 hover:text-var(--t1)"
                  >
                    Name {getSortIndicator('name')}
                  </button>
                  <button
                    onClick={() => requestSort('price')}
                    className="flex items-center gap-1 hover:text-var(--t1) justify-end"
                  >
                    Price {getSortIndicator('price')}
                  </button>
                  <button
                    onClick={() => requestSort('change')}
                    className="flex items-center gap-1 hover:text-var(--t1) justify-end"
                  >
                    Change {getSortIndicator('change')}
                  </button>
                </div>

                {tab === 'stocks'
                  ? sortedStocks.map((stock) => (
                      <div
                        key={stock.symbol}
                        className="bg-var(--bg2) border border-var(--border) rounded-lg p-3 hover:border-var(--border-hi) transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-var(--bg) flex items-center justify-center">
                              <span className="text-xs font-bold">{stock.symbol.slice(0, 2)}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-var(--t1)">{stock.name}</h4>
                              <p className="text-xs text-var(--t3)">{stock.symbol}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-var(--t1)">${stock.price.toFixed(2)}</p>
                            <p className={`text-xs ${
                              stock.change > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 h-8">
                          <Sparkline data={stock.sparkline} />
                        </div>
                      </div>
                    ))
                  : sortedCrypto.map((crypto) => (
                      <div
                        key={crypto.symbol}
                        className="bg-var(--bg2) border border-var(--border) rounded-lg p-3 hover:border-var(--border-hi) transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-var(--bg) flex items-center justify-center">
                              <span className="text-xs font-bold">{crypto.symbol}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-var(--t1)">{crypto.name}</h4>
                              <p className="text-xs text-var(--t3)">{crypto.symbol}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-var(--t1)">${crypto.price.toFixed(2)}</p>
                            <p className={`text-xs ${
                              crypto.change > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {crypto.change > 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 h-8">
                          <Sparkline data={crypto.sparkline} />
                        </div>
                      </div>
                    ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Markets;
```

```jsx
// src/components/PatternCardSkeleton.jsx
const PatternCardSkeleton = () => {
  return (
    <div className="bg-var(--bg2) border border-var(--border) rounded-lg p-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-var(--bg)"></div>
          <div className="space-y-1">
            <div className="h-4 bg-var(--bg) rounded w-24"></div>
            <div className="h-3 bg-var(--bg) rounded w-16"></div>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <div className="h-4 bg-var(--bg) rounded w-16 ml-auto"></div>
          <div className="h-3 bg-var(--bg) rounded w-12 ml-auto"></div>
        </div>
      </div>
      <div className="mt-2 h-8 bg-var(--bg) rounded"></div>
    </div>
  );
};

export default PatternCardSkeleton;