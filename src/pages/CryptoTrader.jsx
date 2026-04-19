import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

const CryptoTrader = () => {
  const [tickers, setTickers] = useState([]);
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
  const [positions, setPositions] = useState([
    { symbol: 'BTC', entry: 42000, current: 42500, size: 0.1 },
    { symbol: 'ETH', entry: 3100, current: 3050, size: 0.5 },
    { symbol: 'SOL', entry: 150, current: 152, size: 10 }
  ]);
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [price, setPrice] = useState(42000);
  const [spread, setSpread] = useState(50);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        setTickers([
          { symbol: 'BTC', price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
          { symbol: 'ETH', price: data.ethereum.usd, change: data.ethereum.usd_24h_change },
          { symbol: 'SOL', price: data.solana.usd, change: data.solana.usd_24h_change }
        ]);
        setPrice(data.bitcoin.usd);
      } catch (error) {
        console.error('Error fetching tickers:', error);
      }
    };

    fetchTickers();
    const interval = setInterval(fetchTickers, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const generateOrderbook = () => {
      const bids = [];
      const asks = [];
      const midPrice = price;
      const depth = 20;

      for (let i = 1; i <= depth; i++) {
        const bidPrice = midPrice - (i * spread * 0.1);
        const askPrice = midPrice + (i * spread * 0.1);
        const bidSize = Math.random() * 5 + 1;
        const askSize = Math.random() * 5 + 1;

        bids.push({ price: bidPrice, size: bidSize });
        asks.push({ price: askPrice, size: askSize });
      }

      setOrderbook({ bids, asks });
    };

    generateOrderbook();
    const interval = setInterval(generateOrderbook, 5000);
    return () => clearInterval(interval);
  }, [price, spread]);

  const updatePosition = (symbol, currentPrice) => {
    setPositions(positions.map(pos => {
      if (pos.symbol === symbol) {
        return { ...pos, current: currentPrice };
      }
      return pos;
    }));
  };

  const calculatePnL = (entry, current) => {
    return ((current - entry) / entry) * 100;
  };

  const handleBuy = () => {
    const newPrice = price + (Math.random() * 100 - 50);
    setPrice(newPrice);
    updatePosition(activeSymbol, newPrice);
  };

  const handleSell = () => {
    const newPrice = price + (Math.random() * 100 - 50);
    setPrice(newPrice);
    updatePosition(activeSymbol, newPrice);
  };

  const getChangeColor = (change) => {
    return change >= 0 ? '#00ff88' : '#ff4444';
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono] text-sm">
      {/* Header */}
      <header className="p-3 border-b border-[var(--border)]">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-lg font-bold">CRYPTO TRADER</h1>
          <div className="flex items-center gap-2">
            <ChevronDown size={16} />
            <span>Market</span>
          </div>
        </div>

        <div className="flex gap-2">
          {tickers.map((ticker) => (
            <button
              key={ticker.symbol}
              className={`flex-1 p-2 rounded border ${activeSymbol === ticker.symbol ? 'border-[var(--neon)]' : 'border-transparent'}`}
              onClick={() => {
                setActiveSymbol(ticker.symbol);
                setPrice(ticker.price);
                setSpread(Math.abs(ticker.price * 0.001));
              }}
            >
              <div className="text-xs text-[var(--text-secondary)]">{ticker.symbol}</div>
              <div className="text-base font-bold">${ticker.price.toLocaleString()}</div>
              <div className="text-xs" style={{ color: getChangeColor(ticker.change) }}>
                {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)}%
              </div>
            </button>
          ))}
        </div>
      </header>

      {/* Orderbook */}
      <section className="p-3 border-b border-[var(--border)]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xs text-[var(--text-secondary)]">ORDERBOOK</h2>
          <div className="flex gap-2 text-xs">
            <span>BID</span>
            <span>ASK</span>
          </div>
        </div>

        <div className="flex gap-2 h-32">
          {/* Bids */}
          <div className="flex-1 flex flex-col-reverse gap-1">
            {orderbook.bids.slice().reverse().map((bid, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-red-500">${bid.price.toFixed(2)}</span>
                <span>{bid.size.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Asks */}
          <div className="flex-1 flex flex-col gap-1">
            {orderbook.asks.map((ask, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-green-500">${ask.price.toFixed(2)}</span>
                <span>{ask.size.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 p-2 bg-[var(--surface-low)] rounded text-center">
          <div className="text-xs text-[var(--text-secondary)]">SPREAD</div>
          <div className="text-sm font-bold">${spread.toFixed(2)}</div>
        </div>
      </section>

      {/* Positions */}
      <section className="p-3 border-b border-[var(--border)]">
        <h2 className="text-xs text-[var(--text-secondary)] mb-2">POSITIONS</h2>
        <div className="space-y-2">
          {positions.map((pos, index) => {
            const pnl = calculatePnL(pos.entry, pos.current);
            const pnlColor = pnl >= 0 ? '#00ff88' : '#ff4444';

            return (
              <div key={index} className="p-2 bg-[var(--surface-low)] rounded">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{pos.symbol}</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {pos.entry.toLocaleString()} → {pos.current.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs">PnL</span>
                  <span className="text-xs" style={{ color: pnlColor }}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full h-1 bg-[var(--surface-high)] rounded-full mt-1">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(Math.abs(pnl), 100)}%`,
                      backgroundColor: pnlColor
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Actions */}
      <section className="p-3">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-[var(--text-secondary)]">ORDER</span>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
              onClick={handleSell}
            >
              SELL
            </button>
            <button
              className="px-4 py-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30 transition-colors"
              onClick={handleBuy}
            >
              BUY
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-[var(--surface-low)] rounded">
            <div className="text-xs text-[var(--text-secondary)]">SIZE</div>
            <input
              type="number"
              defaultValue="1"
              className="w-full bg-transparent outline-none text-right"
            />
          </div>
          <div className="p-2 bg-[var(--surface-low)] rounded">
            <div className="text-xs text-[var(--text-secondary)]">PRICE</div>
            <input
              type="number"
              value={price.toFixed(2)}
              readOnly
              className="w-full bg-transparent outline-none text-right"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CryptoTrader;