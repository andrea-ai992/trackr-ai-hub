CryptoMoversCarousel.jsx
```jsx
import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const CryptoMoversCarousel = () => {
  const [movers, setMovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carouselRef = useRef(null);
  const scrollInterval = useRef(null);

  const fetchMovers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h'
      );
      if (!res.ok) throw new Error('Failed to fetch movers');
      const data = await res.json();
      setMovers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovers();
    return () => clearInterval(scrollInterval.current);
  }, []);

  useEffect(() => {
    if (loading || error || !carouselRef.current) return;
    const scrollWidth = carouselRef.current.scrollWidth;
    const clientWidth = carouselRef.current.clientWidth;
    let scrollPos = 0;

    const autoScroll = () => {
      scrollPos += 1;
      if (scrollPos >= scrollWidth - clientWidth) scrollPos = 0;
      carouselRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
    };

    scrollInterval.current = setInterval(autoScroll, 3000);
    return () => clearInterval(scrollInterval.current);
  }, [loading, error]);

  const scrollLeft = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <section className="w-full py-4 px-2">
      <h2 className="text-lg font-semibold mb-3 px-1" style={{ color: 'var(--green)' }}>Top 24h Movers</h2>
      <div className="relative">
        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-3 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex-shrink-0 w-40 h-20 bg-slate-800 rounded-lg animate-pulse" />
            ))
          ) : error ? (
            <div className="text-red-500 text-sm px-1">Error: {error}</div>
          ) : (
            movers.map((coin) => (
              <div
                key={coin.id}
                className="flex-shrink-0 w-40 h-20 bg-slate-800 rounded-lg p-3 flex flex-col justify-between border border-var(--border)"
              >
                <div className="flex items-center gap-2">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--t1)' }}>{coin.symbol.toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold" style={{ color: coin.price_change_percentage_24h >= 0 ? 'var(--green)' : '#ff4444' }}>
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-slate-900/50 p-1 rounded-full backdrop-blur-sm hover:bg-slate-900/80"
        >
          <ChevronLeft size={20} style={{ color: 'var(--t1)' }} />
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-900/50 p-1 rounded-full backdrop-blur-sm hover:bg-slate-900/80"
        >
          <ChevronRight size={20} style={{ color: 'var(--t1)' }} />
        </button>
      </div>
    </section>
  );
};

export default CryptoMoversCarousel;
```

CryptoTrader.jsx
```jsx
import { useState, useEffect } from 'react';
import { ChevronDown, ShoppingCart, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const CryptoTrader = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);

  const fetchCoins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
      );
      if (!res.ok) throw new Error('Failed to fetch coins');
      const data = await res.json();
      setCoins(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  const handleBuy = () => {
    if (!selected || !amount || parseFloat(amount) <= 0) return;
    const price = selected.current_price;
    const cost = price * parseFloat(amount);
    if (cost > balance) {
      alert('Insufficient balance');
      return;
    }
    setBalance(prev => prev - cost);
    setPositions(prev => [...prev, { ...selected, amount: parseFloat(amount), entryPrice: price }]);
    setHistory(prev => [{ ...selected, amount: parseFloat(amount), price, type: 'buy', timestamp: new Date().toISOString() }, ...prev]);
    setAmount('');
  };

  const handleSell = () => {
    if (!selected || !amount || parseFloat(amount) <= 0) return;
    const pos = positions.find(p => p.id === selected.id);
    if (!pos || pos.amount < parseFloat(amount)) {
      alert('Insufficient position');
      return;
    }
    const sellPrice = selected.current_price;
    const profit = (sellPrice - pos.entryPrice) * parseFloat(amount);
    setBalance(prev => prev + sellPrice * parseFloat(amount));
    setPositions(prev => prev.map(p => p.id === selected.id ? { ...p, amount: p.amount - parseFloat(amount) } : p).filter(p => p.amount > 0));
    setHistory(prev => [{ ...selected, amount: parseFloat(amount), price: sellPrice, type: 'sell', profit, timestamp: new Date().toISOString() }, ...prev]);
    setAmount('');
  };

  return (
    <div className="w-full min-h-screen bg-var(--bg) text-var(--t1) p-4">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--green)' }}>CryptoTrader</h1>

      <div className="bg-var(--bg2) p-4 rounded-lg mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-semibold">Portfolio</span>
          <ChevronDown size={18} />
        </div>
        <div className="text-3xl font-bold mb-2" style={{ color: 'var(--green)' }}>${balance.toFixed(2)}</div>
        <div className="text-sm text-var(--t2)">
          {positions.reduce((acc, p) => acc + p.amount * p.current_price, 0).toFixed(2)} invested • {positions.length} positions
        </div>
      </div>

      <div className="bg-var(--bg2) p-4 rounded-lg mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-semibold">Trade</span>
          <ChevronDown size={18} />
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent border border-var(--border) rounded px-3 py-2 text-var(--t1) placeholder-var(--t3)"
          />
        </div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setOrderType('market')}
            className={`px-4 py-2 rounded border ${orderType === 'market' ? 'border-var(--green)' : 'border-var(--border)'}`}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType('limit')}
            className={`px-4 py-2 rounded border ${orderType === 'limit' ? 'border-var(--green)' : 'border-var(--border)'}`}
          >
            Limit
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBuy}
            className="flex-1 bg-green-900/30 hover:bg-green-900/50 text-var(--green) p-3 rounded-lg flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} /> Buy
          </button>
          <button
            onClick={handleSell}
            className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-500 p-3 rounded-lg flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} /> Sell
          </button>
        </div>
      </div>

      <div className="bg-var(--bg2) p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-semibold">Positions</span>
          <ChevronDown size={18} />
        </div>
        {positions.length === 0 ? (
          <div className="text-center py-8 text-var(--t3)">No positions</div>
        ) : (
          <div className="space-y-3">
            {positions.map((pos) => (
              <div key={pos.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img src={pos.image} alt={pos.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="font-medium">{pos.symbol.toUpperCase()}</div>
                    <div className="text-sm text-var(--t2)">${pos.current_price.toFixed(2)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" style={{ color: pos.current_price >= pos.entryPrice ? 'var(--green)' : '#ff4444' }}>
                    {pos.amount.toFixed(4)} • {((pos.current_price - pos.entryPrice) / pos.entryPrice * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-var(--t2)">${(pos.amount * pos.current_price).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-var(--bg2) p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-semibold">History</span>
          <ChevronDown size={18} />
        </div>
        {history.length === 0 ? (
          <div className="text-center py-8 text-var(--t3)">No trades</div>
        ) : (
          <div className="space-y-3">
            {history.map((trade, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img src={trade.image} alt={trade.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="font-medium">{trade.symbol.toUpperCase()}</div>
                    <div className="text-sm text-var(--t2)">{new Date(trade.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" style={{ color: trade.type === 'buy' ? 'var(--green)' : '#ff4444' }}>
                    {trade.type.toUpperCase()} • {trade.amount.toFixed(4)} • ${(trade.price * trade.amount).toFixed(2)}
                  </div>
                  {trade.profit && (
                    <div className="text-sm" style={{ color: trade.profit >= 0 ? 'var(--green)' : '#ff4444' }}>
                      P&L: ${trade.profit.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoTrader;