import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';

const CryptoTrader = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Marché');
  const [prices, setPrices] = useState({
    BTC: { current: 0, change24h: 0 },
    ETH: { current: 0, change24h: 0 },
    SOL: { current: 0, change24h: 0 },
  });
  const [orderbook, setOrderbook] = useState({
    bids: [],
    asks: [],
    spread: 0,
  });
  const [positions, setPositions] = useState([
    { symbol: 'BTC', side: 'long', entry: 50000, current: 52500, size: 0.02 },
    { symbol: 'ETH', side: 'short', entry: 3000, current: 2940, size: 0.1 },
    { symbol: 'SOL', side: 'long', entry: 150, current: 168, size: 1 },
  ]);
  const [portfolioValue, setPortfolioValue] = useState(12500);

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json();
      setPrices({
        BTC: { current: data.bitcoin.usd, change24h: data.bitcoin.usd_24h_change },
        ETH: { current: data.ethereum.usd, change24h: data.ethereum.usd_24h_change },
        SOL: { current: data.solana.usd, change24h: data.solana.usd_24h_change },
      });
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  }, []);

  const generateOrderbook = useCallback(() => {
    const bids = [];
    const asks = [];
    const midPrice = prices.BTC.current;

    for (let i = 1; i <= 8; i++) {
      const priceVariation = midPrice * (1 - i * 0.001);
      bids.push({
        price: parseFloat(priceVariation.toFixed(2)),
        size: parseFloat((Math.random() * 10 + 5).toFixed(2)),
      });
    }

    for (let i = 1; i <= 8; i++) {
      const priceVariation = midPrice * (1 + i * 0.001);
      asks.push({
        price: parseFloat(priceVariation.toFixed(2)),
        size: parseFloat((Math.random() * 10 + 5).toFixed(2)),
      });
    }

    const spread = asks[0].price - bids[0].price;
    setOrderbook({ bids, asks, spread });
  }, [prices.BTC.current]);

  const calculatePositions = useCallback(() => {
    const updatedPositions = positions.map(position => {
      const currentPrice = prices[position.symbol]?.current || 0;
      const pnlValue = (currentPrice - position.entry) * position.size * (position.side === 'long' ? 1 : -1);
      const pnlPercent = (pnlValue / (position.entry * position.size)) * 100;

      return {
        ...position,
        current: currentPrice,
        pnlValue: parseFloat(pnlValue.toFixed(2)),
        pnlPercent: parseFloat(pnlPercent.toFixed(2)),
      };
    });

    const totalPnl = updatedPositions.reduce((sum, pos) => sum + pos.pnlValue, 0);
    setPortfolioValue(12500 + totalPnl);
    setPositions(updatedPositions);
  }, [prices, positions]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  useEffect(() => {
    generateOrderbook();
  }, [prices.BTC.current, generateOrderbook]);

  useEffect(() => {
    calculatePositions();
  }, [prices, calculatePositions]);

  const handleBuy = (symbol) => {
    const currentPrice = prices[symbol]?.current || 0;
    setPositions(prev => [
      ...prev,
      {
        symbol,
        side: 'long',
        entry: currentPrice,
        current: currentPrice,
        size: 0.01,
        pnlValue: 0,
        pnlPercent: 0,
      },
    ]);
  };

  const handleSell = (symbol) => {
    const currentPrice = prices[symbol]?.current || 0;
    setPositions(prev => [
      ...prev,
      {
        symbol,
        side: 'short',
        entry: currentPrice,
        current: currentPrice,
        size: 0.01,
        pnlValue: 0,
        pnlPercent: 0,
      },
    ]);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono] text-sm">
      <header className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        <button onClick={() => navigate(-1)} className="text-[var(--neon)]">
          <ChevronDown size={20} />
        </button>
        <h1 className="text-lg font-bold">CRYPTO TRADER</h1>
        <div className="w-6"></div>
      </header>

      <main className="p-3">
        {/* Header Section */}
        <section className="mb-4">
          <div className="bg-[var(--surface)] rounded-lg p-3 mb-2">
            <div className="text-[var(--text-secondary)] text-xs mb-1">TOTAL PORTFOLIO</div>
            <div className="text-xl font-bold text-[var(--neon)]">${portfolioValue.toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(prices).map(([symbol, data]) => (
              <div key={symbol} className="bg-[var(--surface)] rounded-lg p-2 text-center">
                <div className="text-xs font-bold">{symbol}</div>
                <div className="text-lg font-bold text-[var(--neon)]">${data.current.toLocaleString()}</div>
                <div className={`text-xs ${data.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Orderbook Section */}
        <section className="mb-4">
          <div className="bg-[var(--surface)] rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-[var(--text-secondary)]">ORDERBOOK</div>
              <div className="text-xs text-[var(--text-secondary)]">SPREAD: ${orderbook.spread.toFixed(2)}</div>
            </div>

            <div className="flex">
              {/* Bids */}
              <div className="flex-1 pr-2">
                <div className="flex justify-between text-xs text-green-500 mb-1">
                  <span>BID</span>
                  <span>SIZE</span>
                </div>
                {orderbook.bids.map((bid, index) => (
                  <div key={`bid-${index}`} className="flex justify-between text-xs mb-1">
                    <span>${bid.price.toFixed(2)}</span>
                    <span>{bid.size}</span>
                  </div>
                ))}
              </div>

              {/* Asks */}
              <div className="flex-1 pl-2 border-l border-[var(--border)]">
                <div className="flex justify-between text-xs text-red-500 mb-1">
                  <span>ASK</span>
                  <span>SIZE</span>
                </div>
                {orderbook.asks.map((ask, index) => (
                  <div key={`ask-${index}`} className="flex justify-between text-xs mb-1">
                    <span>${ask.price.toFixed(2)}</span>
                    <span>{ask.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Positions Section */}
        <section className="mb-4">
          <div className="bg-[var(--surface)] rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-[var(--text-secondary)]">POSITIONS</div>
              <div className="text-xs text-[var(--text-secondary)]">3 ACTIVE</div>
            </div>

            {positions.map((position, index) => (
              <div key={index} className="mb-2 p-2 bg-[var(--surface-low)] rounded">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`text-xs font-bold mr-2 ${position.side === 'long' ? 'text-green-500' : 'text-red-500'}`}>
                      {position.side === 'long' ? 'LONG' : 'SHORT'}
                    </span>
                    <span className="font-bold">{position.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[var(--text-secondary)]">ENTRY</div>
                    <div className="text-xs">${position.entry.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <div className="text-right">
                    <div className="text-xs text-[var(--text-secondary)]">CURRENT</div>
                    <div className="text-xs">${position.current.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[var(--text-secondary)]">P&L</div>
                    <div className={`text-xs font-bold ${position.pnlValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${position.pnlValue.toFixed(2)} ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Buy/Sell Buttons */}
        <section className="grid grid-cols-2 gap-2 mb-4">
          {Object.keys(prices).map(symbol => (
            <div key={symbol} className="flex gap-2">
              <button
                onClick={() => handleBuy(symbol)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded p-2 flex items-center justify-center gap-1 text-xs font-bold h-11"
              >
                <Plus size={16} />
                <span>BUY</span>
                <span className="text-[var(--text-secondary)]">{symbol}</span>
              </button>
              <button
                onClick={() => handleSell(symbol)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded p-2 flex items-center justify-center gap-1 text-xs font-bold h-11"
              >
                <Minus size={16} />
                <span>SELL</span>
                <span className="text-[var(--text-secondary)]">{symbol}</span>
              </button>
            </div>
          ))}
        </section>

        {/* Tabs */}
        <section className="flex justify-around border-t border-[var(--border)]">
          {['Marché', 'Positions', 'Historique'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center text-xs font-bold border-b-2 ${activeTab === tab ? 'border-[var(--neon)] text-[var(--neon)]' : 'border-transparent text-[var(--text-secondary)]'}`}
            >
              {tab}
            </button>
          ))}
        </section>
      </main>
    </div>
  );
};

export default CryptoTrader;