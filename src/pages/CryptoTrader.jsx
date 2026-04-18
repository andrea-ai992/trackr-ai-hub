import { useState, useEffect } from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

const CryptoTrader = () => {
  const [prices, setPrices] = useState({
    BTC: { price: 0, change24h: 0 },
    ETH: { price: 0, change24h: 0 },
    SOL: { price: 0, change24h: 0 }
  });
  const [activePair, setActivePair] = useState('BTC');
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
  const [positions, setPositions] = useState([
    { symbol: 'BTC', entry: 42000, current: 42500, size: 0.05 },
    { symbol: 'ETH', entry: 3200, current: 3150, size: 2.5 },
    { symbol: 'SOL', entry: 150, current: 155, size: 10 }
  ]);
  const [orderType, setOrderType] = useState('market');
  const [orderSize, setOrderSize] = useState(0.01);
  const [orderPrice, setOrderPrice] = useState(0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        setPrices({
          BTC: { price: data.bitcoin.usd, change24h: data.bitcoin.usd_24h_change },
          ETH: { price: data.ethereum.usd, change24h: data.ethereum.usd_24h_change },
          SOL: { price: data.solana.usd, change24h: data.solana.usd_24h_change }
        });
        setOrderPrice(data[activePair.toLowerCase()].usd);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, [activePair]);

  useEffect(() => {
    const generateOrderbook = () => {
      const bids = [];
      const asks = [];
      const midPrice = prices[activePair].price;

      for (let i = 1; i <= 10; i++) {
        const priceDeviation = midPrice * (0.001 * i);
        bids.push({
          price: midPrice - priceDeviation,
          size: Math.random() * 50 + 10,
          total: Math.random() * 500 + 100
        });
        asks.push({
          price: midPrice + priceDeviation,
          size: Math.random() * 50 + 10,
          total: Math.random() * 500 + 100
        });
      }

      setOrderbook({ bids: bids.reverse(), asks });
    };

    generateOrderbook();
  }, [activePair, prices]);

  const calculatePL = (position) => {
    const currentPrice = prices[position.symbol].price;
    const pl = ((currentPrice - position.entry) / position.entry) * 100 * position.size;
    return pl;
  };

  const handleBuy = () => {
    const newPosition = {
      symbol: activePair,
      entry: orderPrice,
      current: prices[activePair].price,
      size: orderSize
    };
    setPositions([...positions, newPosition]);
  };

  const handleSell = () => {
    const newPosition = {
      symbol: activePair,
      entry: orderPrice,
      current: prices[activePair].price,
      size: -orderSize
    };
    setPositions([...positions, newPosition]);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono] p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-xl font-bold text-[var(--neon)]">CRYPTO TRADER</h1>
          <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>

        {/* Price Ticker */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
          {['BTC', 'ETH', 'SOL'].map((symbol) => (
            <div
              key={symbol}
              className={`flex-shrink-0 w-32 p-3 rounded-lg border border-[var(--border)] cursor-pointer transition-all ${
                activePair === symbol ? 'bg-[var(--surface-high)] border-[var(--neon)]' : 'hover:bg-[var(--surface-low)]'
              }`}
              onClick={() => setActivePair(symbol)}
            >
              <div className="text-sm text-[var(--text-secondary)]">{symbol}</div>
              <div className="font-bold text-lg">${prices[symbol].price.toLocaleString()}</div>
              <div className={`text-xs flex items-center gap-1 ${
                prices[symbol].change24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {prices[symbol].change24h >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {prices[symbol].change24h.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orderbook */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Bids */}
          <div className="bg-[var(--surface)] rounded-lg p-3">
            <div className="text-sm text-[var(--text-secondary)] mb-2">BIDS</div>
            <div className="space-y-1 text-xs font-mono">
              {orderbook.bids.map((bid, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-green-400">${bid.price.toFixed(2)}</span>
                  <span className="text-[var(--text-muted)]">{bid.size.toFixed(2)}</span>
                  <span className="text-[var(--text-muted)]">{bid.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Asks */}
          <div className="bg-[var(--surface)] rounded-lg p-3">
            <div className="text-sm text-[var(--text-secondary)] mb-2">ASKS</div>
            <div className="space-y-1 text-xs font-mono">
              {orderbook.asks.map((ask, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-red-400">${ask.price.toFixed(2)}</span>
                  <span className="text-[var(--text-muted)]">{ask.size.toFixed(2)}</span>
                  <span className="text-[var(--text-muted)]">{ask.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Positions */}
      <div className="mb-6">
        <div className="text-sm text-[var(--text-secondary)] mb-3">OPEN POSITIONS</div>
        <div className="space-y-3">
          {positions.map((position, index) => {
            const pl = calculatePL(position);
            const plColor = pl >= 0 ? 'text-green-400' : 'text-red-400';
            const plSymbol = pl >= 0 ? '+' : '';

            return (
              <div key={index} className="bg-[var(--surface)] rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{position.symbol}</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Entry: ${position.entry.toFixed(2)} | Size: {position.size}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${plColor}`}>
                      {plSymbol}{pl.toFixed(2)}%
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      ${position.current.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Panel */}
      <div className="fixed bottom-4 left-4 right-4 bg-[var(--surface-high)] rounded-lg p-4 border border-[var(--border-bright)]">
        <div className="flex gap-2 mb-3">
          <button
            className={`flex-1 py-2 px-4 rounded text-sm font-bold ${
              orderType === 'market' ? 'bg-[var(--neon)] text-black' : 'bg-[var(--surface)] text-[var(--text-primary)]'
            }`}
            onClick={() => setOrderType('market')}
          >
            MARKET
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded text-sm font-bold ${
              orderType === 'limit' ? 'bg-[var(--neon)] text-black' : 'bg-[var(--surface)] text-[var(--text-primary)]'
            }`}
            onClick={() => setOrderType('limit')}
          >
            LIMIT
          </button>
        </div>

        {orderType === 'limit' && (
          <div className="mb-3">
            <div className="text-xs text-[var(--text-secondary)] mb-1">LIMIT PRICE</div>
            <input
              type="number"
              value={orderPrice}
              onChange={(e) => setOrderPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-2 text-sm font-mono text-[var(--text-primary)]"
              placeholder="Price"
            />
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <button
            className="bg-[var(--surface)] px-3 py-1 rounded text-xs"
            onClick={() => setOrderSize(0.01)}
          >
            0.01
          </button>
          <button
            className="bg-[var(--surface)] px-3 py-1 rounded text-xs"
            onClick={() => setOrderSize(0.1)}
          >
            0.1
          </button>
          <button
            className="bg-[var(--surface)] px-3 py-1 rounded text-xs"
            onClick={() => setOrderSize(1)}
          >
            1
          </button>
          <input
            type="number"
            value={orderSize}
            onChange={(e) => setOrderSize(parseFloat(e.target.value) || 0)}
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded p-2 text-xs font-mono text-[var(--text-primary)]"
            placeholder="Size"
          />
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-3 rounded font-bold transition-colors"
            onClick={handleBuy}
          >
            BUY
          </button>
          <button
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded font-bold transition-colors"
            onClick={handleSell}
          >
            SELL
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptoTrader;