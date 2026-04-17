// FILE: src/components/CryptoMarkets.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const COINGECKO_API =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h';

const REFRESH_INTERVAL = 60000;

function SparklineChart({ data, positive }) {
  if (!data || data.length === 0) return null;
  const chartData = data.map((price, index) => ({ index, price }));
  return (
    <ResponsiveContainer width="100%" height={50}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={positive ? '#22c55e' : '#ef4444'}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: 'none',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#f1f5f9',
          }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
          labelFormatter={() => ''}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CoinCard({ coin }) {
  const positive = coin.price_change_percentage_24h >= 0;
  const sparklineData = coin.sparkline_in_7d?.price || [];

  const formatPrice = (price) => {
    if (price == null) return 'N/A';
    if (price >= 1000)
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  const formatMarketCap = (cap) => {
    if (cap == null) return 'N/A';
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.coinInfo}>
          <img
            src={coin.image}
            alt={coin.name}
            style={styles.coinImage}
            loading="lazy"
          />
          <div style={styles.coinMeta}>
            <span style={styles.coinName}>{coin.name}</span>
            <span style={styles.coinSymbol}>{coin.symbol.toUpperCase()}</span>
          </div>
        </div>
        <div style={styles.rankBadge}>#{coin.market_cap_rank}</div>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.priceSection}>
          <span style={styles.price}>${formatPrice(coin.current_price)}</span>
          <span
            style={{
              ...styles.change,
              color: positive ? '#22c55e' : '#ef4444',
              background: positive
                ? 'rgba(34,197,94,0.12)'
                : 'rgba(239,68,68,0.12)',
            }}
          >
            {positive ? '▲' : '▼'}{' '}
            {Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
          </span>
        </div>

        <div style={styles.sparklineWrapper}>
          <SparklineChart data={sparklineData} positive={positive} />
        </div>

        <div style={styles.cardFooter}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Market Cap</span>
            <span style={styles.statValue}>
              {formatMarketCap(coin.market_cap)}
            </span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>24h Volume</span>
            <span style={styles.statValue}>
              {formatMarketCap(coin.total_volume)}
            </span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>24h High</span>
            <span style={{ ...styles.statValue, color: '#22c55e' }}>
              ${formatPrice(coin.high_24h)}
            </span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>24h Low</span>
            <span style={{ ...styles.statValue, color: '#ef4444' }}>
              ${formatPrice(coin.low_24h)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.coinInfo}>
          <div
            style={{
              ...styles.coinImage,
              background: '#334155',
              borderRadius: '50%',
            }}
          />
          <div style={styles.coinMeta}>
            <div style={styles.skeletonLine} />
            <div
              style={{
                ...styles.skeletonLine,
                width: '40px',
                marginTop: '6px',
              }}
            />
          </div>
        </div>
        <div style={{ ...styles.skeletonLine, width: '30px' }} />
      </div>
      <div style={styles.cardBody}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div
            style={{ ...styles.skeletonLine, width: '120px', height: '24px' }}
          />
          <div
            style={{ ...styles.skeletonLine, width: '70px', height: '24px' }}
          />
        </div>
        <div
          style={{
            ...styles.skeletonLine,
            width: '100%',
            height: '50px',
            marginBottom: '12px',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={styles.stat}>
              <div
                style={{
                  ...styles.skeletonLine,
                  width: '50px',
                  height: '10px',
                }}
              />
              <div
                style={{
                  ...styles.skeletonLine,
                  width: '60px',
                  height: '14px',
                  marginTop: '4px',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CryptoMarkets() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const countdownRef = useRef(null);

  const startCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(REFRESH_INTERVAL / 1000);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const fetchCoins = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(COINGECKO_API, {
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit reached. Please wait a moment.');
        }
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setCoins(data);
      setLastUpdated(new Date());
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startCountdown]);

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, REFRESH_INTERVAL);
    return () => {
      clearInterval(interval);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchCoins]);

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}>📈</span> Crypto Markets
          </h1>
          <button
            style={styles.refreshBtn}
            onClick={fetchCoins}
            disabled={loading}
            aria-label="Refresh markets"
          >
            <span
              style={{
                display: 'inline-block',
                animation: loading ? 'spin 1s linear infinite' : 'none',
              }}
            >
              ⟳
            </span>
          </button>
        </div>

        <div style={styles.statusBar}>
          <span style={styles.statusDot} />
          <span style={styles.statusText}>
            {loading && coins.length === 0
              ? 'Loading...'
              : lastUpdated
              ? `Updated ${formatTime(lastUpdated)} · Refreshing in ${countdown}s`
              : 'Fetching data...'}
          </span>
        </div>

        <p style={styles.subtitle}>Top 10 cryptocurrencies by market cap</p>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <span style={styles.errorIcon}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={styles.errorTitle}>Failed to load market data</p>
            <p style={styles.errorMessage}>{error}</p>
          </div>
          <button style={styles.retryBtn} onClick={fetchCoins}>
            Retry
          </button>
        </div>
      )}

      <div style={styles.grid}>
        {loading && coins.length === 0
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
          : coins.map((coin) => <CoinCard key={coin.id} coin={coin} />)}
      </div>

      {coins.length > 0 && (
        <p style={styles.attribution}>
          Data provided by{' '}
          <a
            href="https://www.coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            CoinGecko
          </a>
        </p>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f172a',
    padding: '16px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: '480px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '20px',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  titleIcon: {
    fontSize: '22px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 0',
  },
  refreshBtn: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '20px',
    lineHeight: 1,
    padding: '6px 10px',
    transition: 'background 0.2s',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#22c55e',
    animation: 'pulse 2s ease-in-out infinite',
    flexShrink: 0,
  },
  statusText: {
    fontSize: '12px',
    color: '#64748b',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '16px',
  },
  errorIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  errorTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: '#fca5a5',
  },
  errorMessage: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: '#f87171',
  },
  retryBtn: {
    background: 'rgba(239,68,68,0.2)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: '6px',
    color: '#fca5a5',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    background: '#1e293b',
    borderRadius: '16px',
    border: '1px solid #334155',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px 10px',
  },
  coinInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  coinImage: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  coinMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  coinName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#f1f5f9',
    lineHeight: 1.2,
  },
  coinSymbol: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  rankBadge: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    background: '#0f172a',
    borderRadius: '6px',
    padding: '3px 7px',
  },
  cardBody: {
    padding: '0 16px 14px',
  },
  priceSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  price: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: '-0.3px',
  },
  change: {
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '6px',
    padding: '3px 8px',
  },
  sparklineWrapper: {
    marginBottom: '12px',
  },
  cardFooter: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '8px',
    paddingTop: '10px',
    borderTop: '1px solid #0f172a',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statLabel: {
    fontSize: '10px',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#cbd5e1',
  },
  skeletonLine: {
    height: '14px',
    width: '80px',
    borderRadius: '4px',
    background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
    backgroundSize: '400px 100%',
    animation: 'shimmer 1.4s ease-in-out infinite',
  },
  attribution: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#475569',
    marginTop: '20px',
    padding: '0 0 24px',
  },
  link: {
    color: '#6366f1',
    textDecoration: 'none',
  },
};
```

```jsx
// FILE: src/pages/CryptoMarketsPage.jsx
import CryptoMarkets from '../components/CryptoMarkets';

export default function CryptoMarketsPage() {
  return <CryptoMarkets />;
}
```

```jsx
// FILE: src/App.jsx  (router integration — merge avec l'existant)
// Ajouter dans les imports:
import CryptoMarketsPage from './pages/CryptoMarketsPage';

// Ajouter dans les routes React Router:
// <Route path="/markets" element={<CryptoMarketsPage />} />
//
// Exemple complet si App.jsx utilise createBrowserRouter ou <Routes>:
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CryptoMarketsPage from './pages/CryptoMarketsPage';
// ... autres imports existants

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* routes existantes conservées */}
        <Route path="/markets" element={<CryptoMarketsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

```json
// package.json — vérifier que recharts est présent, sinon:
// npm install recharts
// Entrée attendue dans dependencies:
