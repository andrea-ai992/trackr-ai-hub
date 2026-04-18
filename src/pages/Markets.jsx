Je vais redesign completement le fichier Markets.jsx avec les fonctionnalités premium demandées. Voici le code production-ready:

```jsx
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const Markets = () => {
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'crypto' ? 'crypto' : 'stocks');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    setTab(params.get('tab') === 'crypto' ? 'crypto' : 'stocks');
  }, [params]);

  const fetchStocksData = async () => {
    try {
      const response = await fetch('/api/markets');
      const json = await response.json();
      return json.data.filter(item => item.type === 'stock');
    } catch (error) {
      console.error('Error fetching stocks:', error);
      return [];
    }
  };

  const fetchCryptoData = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h');
      const json = await response.json();
      return json.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        change: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        sparkline: coin.sparkline_in_7d.price,
        image: coin.image,
        type: 'crypto'
      }));
    } catch (error) {
      console.error('Error fetching crypto:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let stocks = [];
        let crypto = [];

        if (tab === 'stocks') {
          stocks = await fetchStocksData();
        } else {
          crypto = await fetchCryptoData();
        }

        setData({ data: [...stocks, ...crypto] });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab]);

  const handleRefresh = () => {
    setRefreshing(true);
    const fetchData = async () => {
      try {
        let stocks = [];
        let crypto = [];

        if (tab === 'stocks') {
          stocks = await fetchStocksData();
        } else {
          crypto = await fetchCryptoData();
        }

        setData({ data: [...stocks, ...crypto] });
      } catch (error) {
        console.error(error);
      } finally {
        setRefreshing(false);
      }
    };
    fetchData();
  };

  const switchTab = (id) => {
    setTab(id);
    if (id === 'crypto') setParams({ tab: 'crypto' });
    else setParams({});
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

  const sortAssets = (assets) => {
    if (sortBy === 'gain') {
      return [...assets].sort((a, b) => b.change - a.change);
    } else if (sortBy === 'loss') {
      return [...assets].sort((a, b) => a.change - b.change);
    }
    return assets;
  };

  const stocksAssets = data?.data?.filter(item => item.type === 'stock') || [];
  const cryptoAssets = data?.data?.filter(item => item.type === 'crypto') || [];

  const filteredStocks = filterAssets(stocksAssets);
  const filteredCrypto = filterAssets(cryptoAssets);

  const sortedStocks = sortAssets(filteredStocks);
  const sortedCrypto = sortAssets(filteredCrypto);

  const topGainers = (tab === 'stocks' ? sortedStocks : sortedCrypto)
    .filter(asset => asset.change > 0)
    .slice(0, 5);

  const topLosers = (tab === 'stocks' ? sortedStocks : sortedCrypto)
    .filter(asset => asset.change < 0)
    .slice(0, 5);

  const tabIndicatorStyle = {
    transform: `translateX(${tab === 'stocks' ? '0' : '100%'})`,
    width: '50%'
  };

  return (
    <div className="min-h-screen bg-var(--bg) text-var(--t1) font-['Inter']">
      <div className="sticky top-0 z-50 bg-var(--bg2) border-b border-var(--border)">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold tracking-tight">Markets</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-var(--bg)/50 transition-colors disabled:opacity-50"
              aria-label="Refresh data"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-var(--t3)" size={18} />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-var(--bg2) border border-var(--border) rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-var(--green)/50"
            />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-var(--border) transform -translate-y-1/2">
              <div
                className="absolute bottom-0 h-0.5 bg-var(--green) transition-all duration-300"
                style={tabIndicatorStyle}
              />
            </div>
            {[
              { id: 'stocks', label: 'Stocks' },
              { id: 'crypto', label: 'Crypto' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  tab === t.id ? 'text-var(--green)' : 'text-var(--t2) hover:text-var(--t1)'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-3 border-t border-var(--border)">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-var(--t3)">Sort by:</span>
              <button
                onClick={() => setSortBy(sortBy === 'gain' ? 'default' : 'gain')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  sortBy === 'gain' ? 'bg-var(--green)/20 text-var(--green)' : 'text-var(--t3) hover:text-var(--t1)'
                }`}
              >
                Gain
              </button>
              <button
                onClick={() => setSortBy(sortBy === 'loss' ? 'default' : 'loss')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  sortBy === 'loss' ? 'bg-red-500/20 text-red-500' : 'text-var(--t3) hover:text-var(--t1)'
                }`}
              >
                Loss
              </button>
            </div>
            <button
              onClick={() => setSortBy('default')}
              className={`px-2 py-1 rounded-md transition-colors ${
                sortBy === 'default' ? 'text-var(--green)' : 'text-var(--t3) hover:text-var(--t1)'
              }`}
            >
              Default
            </button>
          </div>
        </div>
      </div>

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
            <div className="space-y-2 mb-6">
              {(tab === 'stocks' ? sortedStocks : sortedCrypto).map((asset, index) => (
                <div key={asset.id || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-var(--bg2)/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-var(--bg) flex items-center justify-center text-xs font-bold text-var(--t1) flex-shrink-0">
                      {asset.image ? (
                        <img src={asset.image} alt={asset.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-color">{asset.symbol.substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">{asset.name}</h3>
                      <p className="text-xs text-var(--t3) truncate">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-bold tabular-nums text-sm">
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
                  <div className="ml-4 flex-shrink-0">
                    {renderSparkline(asset.sparkline)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-var(--t3) mb-3 px-1">
                Top Gainers
              </h2>
              <div className="space-y-2">
                {topGainers.length > 0 ? (
                  topGainers.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-var(--bg2)/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-var(--bg) flex items-center justify-center text-xs font-bold text-var(--t1) flex-shrink-0">
                          {asset.image ? (
                            <img src={asset.image} alt={asset.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-color">{asset.symbol.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate">{asset.name}</h3>
                          <p className="text-xs text-var(--t3) truncate">{asset.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono font-bold tabular-nums text-sm">
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
                      <div className="ml-4 flex-shrink-0">
                        {renderSparkline(asset.sparkline)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-var(--t3) text-sm">
                    No gainers found
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-var(--t3) mb-3 px-1">
                Top Losers
              </h2>
              <div className="space-y-2">
                {topLosers.length > 0 ? (
                  topLosers.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-var(--bg2)/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-var(--bg) flex items-center justify-center text-xs font-bold text-var(--t1) flex-shrink-0">
                          {asset.image ? (
                            <img src={asset.image} alt={asset.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-color">{asset.symbol.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate">{asset.name}</h3>
                          <p className="text-xs text-var(--t3) truncate">{asset.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono font-bold tabular-nums text-sm">
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
                      <div className="ml-4 flex-shrink-0">
                        {renderSparkline(asset.sparkline)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-var