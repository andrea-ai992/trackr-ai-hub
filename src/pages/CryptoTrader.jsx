import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

const CryptoTrader = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Marché');
  const [prices, setPrices] = useState({
    BTC: { price: 0, change24h: 0 },
    ETH: { price: 0, change24h: 0 },
    SOL: { price: 0, change24h: 0 }
  });
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [orderbook, setOrderbook] = useState({
    bids: [],
    asks: []
  });
  const [positions, setPositions] = useState([
    { symbol: 'BTC', side: 'long', entry: 42000, current: 44100, size: 0.1 },
    { symbol: 'ETH', side: 'short', entry: 3000, current: 2940, size: 0.5 },
    { symbol: 'SOL', side: 'long', entry: 150, current: 168, size: 2 }
  ]);
  const [history, setHistory] = useState([
    { symbol: 'BTC', side: 'BUY', price: 42000, size: 0.05, time: '10:15' },
    { symbol: 'ETH', side: 'SELL', price: 3050, size: 0.2, time: '11:30' },
    { symbol: 'SOL', side: 'BUY', price: 148, size: 1, time: '12:45' }
  ]);
  const wsRef = useRef(null);

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
        setPortfolioValue(10000 + (data.bitcoin.usd - 42000) * 0.1 + (data.ethereum.usd - 3000) * 0.5 + (data.solana.usd - 150) * 2);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const generateOrderbook = () => {
      const bids = [];
      const asks = [];
      const midPrice = prices.BTC.price;

      for (let i = 0; i < 8; i++) {
        const priceVariation = midPrice * (0.999 - i * 0.0005);
        const size = Math.random() * 10 + 5;
        bids.push({ price: priceVariation.toFixed(2), size: size.toFixed(2) });
      }

      for (let i = 0; i < 8; i++) {
        const priceVariation = midPrice * (1.001 + i * 0.0005);
        const size = Math.random() * 10 + 5;
        asks.push({ price: priceVariation.toFixed(2), size: size.toFixed(2) });
      }

      setOrderbook({ bids, asks });
    };

    generateOrderbook();
    const interval = setInterval(generateOrderbook, 5000);

    return () => clearInterval(interval);
  }, [prices.BTC.price]);

  const calculatePnL = (position) => {
    const currentValue = position.size * (position.side === 'long' ? position.current : -position.current);
    const entryValue = position.size * (position.side === 'long' ? position.entry : -position.entry);
    const pnl = currentValue - entryValue;
    const pnlPercent = (pnl / entryValue) * 100;
    return { pnl, pnlPercent };
  };

  const handleBuySell = (symbol, side) => {
    const newPosition = {
      symbol,
      side,
      entry: prices[symbol].price,
      current: prices[symbol].price,
      size: side === 'BUY' ? 0.1 : -0.1
    };
    setPositions([...positions, newPosition]);
    setHistory([...history, { symbol, side, price: prices[symbol].price, size: side === 'BUY' ? 0.1 : -0.1, time: new Date().toLocaleTimeString().slice(0, 5) }]);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono] overflow-hidden">
      <header className="w-full p-4 border-b border-[var(--border)] flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-[var(--neon)]">
          <ChevronDown size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold">CryptoTrader</h1>
        </div>
        <div className="w-8"></div>
      </header>

      <div className="px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">Portfolio</span>
          <span className="text-sm text-[var(--text-secondary)]">BTC/USD</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${portfolioValue.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${prices.BTC.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {prices.BTC.change24h >= 0 ? '+' : ''}{prices.BTC.change24h.toFixed(2)}%
            </span>
            <span className="text-sm text-[var(--text-secondary)]">BTC ${prices.BTC.price.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-4">
            <span className="text-sm text-[var(--text-secondary)]">ETH ${prices.ETH.price.toLocaleString()}</span>
            <span className={`text-sm ${prices.ETH.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {prices.ETH.change24h >= 0 ? '+' : ''}{prices.ETH.change24h.toFixed(2)}%
            </span>
          </div>
          <div className="flex gap-4">
            <span className="text-sm text-[var(--text-secondary)]">SOL ${prices.SOL.price.toLocaleString()}</span>
            <span className={`text-sm ${prices.SOL.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {prices.SOL.change24h >= 0 ? '+' : ''}{prices.SOL.change24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-[var(--border)]">
        <div className="flex gap-6 text-sm">
          <button
            onClick={() => setActiveTab('Marché')}
            className={`pb-2 border-b-2 ${activeTab === 'Marché' ? 'border-[var(--neon)] text-[var(--neon)]' : 'border-transparent text-[var(--text-secondary)]'}`}
          >
            Marché
          </button>
          <button
            onClick={() => setActiveTab('Positions')}
            className={`pb-2 border-b-2 ${activeTab === 'Positions' ? 'border-[var(--neon)] text-[var(--neon)]' : 'border-transparent text-[var(--text-secondary)]'}`}
          >
            Positions
          </button>
          <button
            onClick={() => setActiveTab('Historique')}
            className={`pb-2 border-b-2 ${activeTab === 'Historique' ? 'border-[var(--neon)] text-[var(--neon)]' : 'border-transparent text-[var(--text-secondary)]'}`}
          >
            Historique
          </button>
        </div>
      </div>

      {activeTab === 'Marché' && (
        <div className="px-4 py-4">
          <div className="bg-[var(--surface)] rounded-lg p-4 mb-4">
            <h3 className="text-sm text-[var(--text-secondary)] mb-2">Orderbook</h3>
            <div className="flex flex-col gap-1 text-xs">
              {orderbook.bids.map((bid, index) => (
                <div key={`bid-${index}`} className="flex justify-between">
                  <span className="text-green-500">{bid.price}</span>
                  <span className="text-gray-400">{bid.size}</span>
                </div>
              ))}
              <div className="border-t border-[var(--border-bright)] my-1"></div>
              {orderbook.asks.map((ask, index) => (
                <div key={`ask-${index}`} className="flex justify-between">
                  <span className="text-red-500">{ask.price}</span>
                  <span className="text-gray-400">{ask.size}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Spread</span>
              <span className="text-[var(--neon)]">
                {((parseFloat(orderbook.asks[0].price) - parseFloat(orderbook.bids[0].price)) / parseFloat(orderbook.bids[0].price) * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleBuySell('BTC', 'BUY')}
              className="flex-1 h-11 bg-green-600 text-white rounded-md font-bold text-sm hover:bg-green-700 transition-colors"
            >
              BUY BTC
            </button>
            <button
              onClick={() => handleBuySell('BTC', 'SELL')}
              className="flex-1 h-11 bg-red-600 text-white rounded-md font-bold text-sm hover:bg-red-700 transition-colors"
            >
              SELL BTC
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleBuySell('ETH', 'BUY')}
              className="flex-1 h-11 bg-green-600 text-white rounded-md font-bold text-sm hover:bg-green-700 transition-colors"
            >
              BUY ETH
            </button>
            <button
              onClick={() => handleBuySell('ETH', 'SELL')}
              className="flex-1 h-11 bg-red-600 text-white rounded-md font-bold text-sm hover:bg-red-700 transition-colors"
            >
              SELL ETH
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleBuySell('SOL', 'BUY')}
              className="flex-1 h-11 bg-green-600 text-white rounded-md font-bold text-sm hover:bg-green-700 transition-colors"
            >
              BUY SOL
            </button>
            <button
              onClick={() => handleBuySell('SOL', 'SELL')}
              className="flex-1 h-11 bg-red-600 text-white rounded-md font-bold text-sm hover:bg-red-700 transition-colors"
            >
              SELL SOL
            </button>
          </div>
        </div>
      )}

      {activeTab === 'Positions' && (
        <div className="px-4 py-4">
          {positions.map((position, index) => {
            const { pnl, pnlPercent } = calculatePnL(position);
            return (
              <div key={index} className="bg-[var(--surface)] rounded-lg p-4 mb-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm text-[var(--text-secondary)]">{position.symbol} {position.side === 'long' ? 'LONG' : 'SHORT'}</span>
                    <div className="text-sm">
                      <span className="text-[var(--text-secondary)]">Entry: </span>
                      <span>${position.entry.toLocaleString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-[var(--text-secondary)]">Current: </span>
                      <span>${position.current.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {position.size > 0 ? 'LONG' : 'SHORT'} {Math.abs(position.size)} {position.symbol}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'Historique' && (
        <div className="px-4 py-4">
          {history.map((trade, index) => (
            <div key={index} className="bg-[var(--surface)] rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-bold">{trade.side}</span>
                  <span className="text-sm text-[var(--text-secondary)] ml-2">{trade.symbol}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm">${trade.price.toLocaleString()}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{trade.size > 0 ? '+' : ''}{trade.size} {trade.symbol}</div>
                </div>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">{trade.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CryptoTrader;