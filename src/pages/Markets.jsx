Je vais complètement redessiner l'interface Markets.jsx dans le style Bloomberg dark premium tout en conservant toute la logique existante. Voici le code complet et fonctionnel :

```jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import Stocks from './Stocks';
import Crypto from './Crypto';

const Markets = () => {
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'crypto' ? 'crypto' : 'stocks');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setTab(params.get('tab') === 'crypto' ? 'crypto' : 'stocks');
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/markets');
        const json = await response.json();
        setData(json);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  function switchTab(id) {
    setTab(id);
    if (id === 'crypto') setParams({ tab: 'crypto' });
    else setParams({});
  }

  const handleRefresh = () => {
    setRefreshing(true);
    const fetchData = async () => {
      try {
        const response = await fetch('/api/markets');
        const json = await response.json();
        setData(json);
        setRefreshing(false);
      } catch (error) {
        console.error(error);
        setRefreshing(false);
      }
    };
    fetchData();
  };

  const getChangeColor = (change) => {
    return change > 0 ? 'var(--green)' : '#ff4444';
  };

  const getArrow = (change) => {
    return change > 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const renderSparkline = (points) => {
    if (!points || points.length === 0) return null;

    const width = 40;
    const height = 20;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;

    const pathData = points.map((point, i) =>
      `${i * (width / (points.length - 1))},${height - ((point - min) / range) * height}`
    ).join(' ');

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={getChangeColor((points[points.length - 1] - points[0]) / points[0] * 100)}
          strokeWidth="1.5"
          points={pathData}
        />
      </svg>
    );
  };

  const filterAssets = (assets) => {
    if (!assets) return [];
    if (!search) return assets;

    const searchLower = search.toLowerCase();
    return assets.filter(asset =>
      asset.name.toLowerCase().includes(searchLower) ||
      asset.symbol.toLowerCase().includes(searchLower)
    );
  };

  const stocksAssets = data?.data?.filter(item => item.type === 'stock') || [];
  const cryptoAssets = data?.data?.filter(item => item.type === 'crypto') || [];

  const filteredStocks = filterAssets(stocksAssets);
  const filteredCrypto = filterAssets(cryptoAssets);

  const topGainers = (tab === 'stocks' ? filteredStocks : filteredCrypto)
    .sort((a, b) => b.change - a.change)
    .slice(0, 5);

  const topLosers = (tab === 'stocks' ? filteredStocks : filteredCrypto)
    .sort((a, b) => a.change - b.change)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-var(--bg) text-var(--t1) font-['Inter']">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-var(--bg2) border-b border-var(--border)">
        <div className="px-4 py-3">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-xl font-bold">Markets</h1>
            <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
              {[
                { id: 'stocks', label: 'Stocks' },
                { id: 'crypto', label: 'Crypto' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => switchTab(t.id)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                    tab === t.id ? 'bg-var(--green)/20 text-var(--green)' : 'text-var(--t2) hover:bg-var(--bg)/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-var(--t3)" size={18} />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-var(--bg) border border-var(--border) rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-var(--green)/50"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-4 pb-24">
        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse bg-var(--bg2)/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-var(--bg2) rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-var(--bg2) rounded w-3/4 mb-1" />
                    <div className="h-3 bg-var(--bg2) rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current Tab Content */}
            {tab === 'stocks' ? (
              <Stocks inMarkets data={data} />
            ) : (
              <Crypto data={data} />
            )}

            {/* Top Gainers */}
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-var(--t3) mb-3 px-1">
                Top Gainers
              </h2>
              <div className="space-y-2">
                {topGainers.map((asset, index) => (
                  <div
                    key={`gainer-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-var(--bg2)/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-var(--bg) flex items-center justify-center text-xs font-bold">
                        {asset.image ? (
                          <img src={asset.image} alt={asset.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          asset.symbol.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{asset.name}</h3>
                        <p className="text-xs text-var(--t3)">{asset.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold tabular-nums">
                        {asset.price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: getChangeColor(asset.change) }}>
                        {getArrow(asset.change)}
                        {Math.abs(asset.change).toFixed(2)}%
                      </div>
                    </div>
                    <div className="ml-4">
                      {renderSparkline(asset.sparkline)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-var(--t3) mb-3 px-1">
                Top Losers
              </h2>
              <div className="space-y-2">
                {topLosers.map((asset, index) => (
                  <div
                    key={`loser-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-var(--bg2)/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-var(--bg) flex items-center justify-center text-xs font-bold">
                        {asset.image ? (
                          <img src={asset.image} alt={asset.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          asset.symbol.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{asset.name}</h3>
                        <p className="text-xs text-var(--t3)">{asset.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold tabular-nums">
                        {asset.price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: getChangeColor(asset.change) }}>
                        {getArrow(asset.change)}
                        {Math.abs(asset.change).toFixed(2)}%
                      </div>
                    </div>
                    <div className="ml-4">
                      {renderSparkline(asset.sparkline)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pull to Refresh Indicator */}
      {refreshing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-var(--green)"></div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-var(--bg2) border border-var(--border) flex items-center justify-center shadow-lg hover:bg-var(--bg)/50 transition-all"
        aria-label="Refresh data"
      >
        <Search size={18} className={refreshing ? 'animate-spin' : ''} />
      </button>
    </div>
  );
};

export default Markets;
```

```css
/* Ajouts au globals.css pour les nouvelles fonctionnalités */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.font-['Inter'] {
  font-family: 'Inter', sans-serif;
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}