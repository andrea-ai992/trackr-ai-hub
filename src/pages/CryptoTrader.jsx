import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

const CryptoTrader = () => {
  const navigate = useNavigate();
  const [prices, setPrices] = useState({
    btc: { current: 0, change24h: 0 },
    eth: { current: 0, change24h: 0 },
    sol: { current: 0, change24h: 0 }
  });
  const [portfolio, setPortfolio] = useState({
    total: 15000,
    btc: { amount: 0.5, value: 0 },
    eth: { amount: 2.3, value: 0 },
    sol: { amount: 15.7, value: 0 }
  });
  const [orderbook, setOrderbook] = useState({
    bids: [],
    asks: []
  });
  const [spread, setSpread] = useState(0);
  const [positions, setPositions] = useState([
    { symbol: 'BTC', type: 'long', entry: 48000, current: 50400, amount: 0.5 },
    { symbol: 'ETH', type: 'short', entry: 3200, current: 3136, amount: 2.3 },
    { symbol: 'SOL', type: 'long', entry: 120, current: 134.4, amount: 15.7 }
  ]);
  const [activeTab, setActiveTab] = useState('Marché');

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();

        setPrices({
          btc: { current: data.bitcoin.usd, change24h: data.bitcoin.usd_24h_change },
          eth: { current: data.ethereum.usd, change24h: data.ethereum.usd_24h_change },
          sol: { current: data.solana.usd, change24h: data.solana.usd_24h_change }
        });

        setPortfolio(prev => ({
          ...prev,
          btc: { ...prev.btc, value: data.bitcoin.usd * prev.btc.amount },
          eth: { ...prev.eth, value: data.ethereum.usd * prev.eth.amount },
          sol: { ...prev.sol, value: data.solana.usd * prev.sol.amount },
          total: prev.total - prev.btc.value - prev.eth.value - prev.sol.value +
                 (data.bitcoin.usd * prev.btc.amount) +
                 (data.ethereum.usd * prev.eth.amount) +
                 (data.solana.usd * prev.sol.amount)
        }));
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
      const midPrice = prices.btc.current;

      for (let i = 1; i <= 8; i++) {
        const priceVariation = midPrice * (1 - (i * 0.002));
        const size = 10 + Math.random() * 20;
        bids.push({ price: priceVariation, size: size.toFixed(2) });
      }

      for (let i = 1; i <= 8; i++) {
        const priceVariation = midPrice * (1 + (i * 0.0025));
        const size = 10 + Math.random() * 20;
        asks.push({ price: priceVariation, size: size.toFixed(2) });
      }

      setOrderbook({ bids, asks });
      setSpread(((asks[0].price - bids[0].price) / bids[0].price * 100).toFixed(2));
    };

    generateOrderbook();
  }, [prices.btc.current]);

  const calculatePnL = (position) => {
    const currentValue = position.current * position.amount;
    const entryValue = position.entry * position.amount;
    const pnl = currentValue - entryValue;
    const pnlPercent = (pnl / entryValue) * 100;
    return { pnl, pnlPercent };
  };

  const updatePosition = (symbol, newPrice) => {
    setPositions(prev => prev.map(pos => {
      if (pos.symbol === symbol) {
        return { ...pos, current: newPrice };
      }
      return pos;
    }));
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono]">
      <header className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={20} className="text-[var(--neon)]" />
        </button>
        <h1 className="text-lg font-bold">CRYPTO TRADER</h1>
        <button onClick={() => {}} className="p-1">
          <RefreshCw size={20} className="text-[var(--neon)]" />
        </button>
      </header>

      <div className="p-3">
        <div className="bg-[var(--surface)] rounded-lg p-3 mb-3 border border-[var(--border)]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm text-[var(--text-secondary)]">BTC/USD</div>
              <div className="text-lg font-bold text-[var(--neon)]">${prices.btc.current.toLocaleString()}</div>
              <div className={`text-xs ${prices.btc.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {prices.btc.change24h >= 0 ? '+' : ''}{prices.btc.change24h.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--text-secondary)]">ETH/USD</div>
              <div className="text-lg font-bold text-[var(--neon)]">${prices.eth.current.toLocaleString()}</div>
              <div className={`text-xs ${prices.eth.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {prices.eth.change24h >= 0 ? '+' : ''}{prices.eth.change24h.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--text-secondary)]">SOL/USD</div>
              <div className="text-lg font-bold text-[var(--neon)]">${prices.sol.current.toLocaleString()}</div>
              <div className={`text-xs ${prices.sol.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {prices.sol.change24h >= 0 ? '+' : ''}{prices.sol.change24h.toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="mt-3 text-right">
            <div className="text-sm text-[var(--text-secondary)]">PORTFOLIO</div>
            <div className="text-xl font-bold text-[var(--neon)]">${portfolio.total.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab('Marché')}
            className={`px-4 py-2 rounded text-sm font-bold ${activeTab === 'Marché' ? 'bg-[var(--neon)] text-black' : 'bg-[var(--surface)]'}`}
          >
            Marché
          </button>
          <button
            onClick={() => setActiveTab('Positions')}
            className={`px-4 py-2 rounded text-sm font-bold ${activeTab === 'Positions' ? 'bg-[var(--neon)] text-black' : 'bg-[var(--surface)]'}`}
          >
            Positions
          </button>
          <button
            onClick={() => setActiveTab('Historique')}
            className={`px-4 py-2 rounded text-sm font-bold ${activeTab === 'Historique' ? 'bg-[var(--neon)] text-black' : 'bg-[var(--surface)]'}`}
          >
            Historique
          </button>
        </div>

        {activeTab === 'Marché' && (
          <div className="bg-[var(--surface)] rounded-lg p-3 border border-[var(--border)]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">ORDERBOOK</h2>
              <div className="text-sm text-[var(--text-secondary)]">SPREAD: <span className="text-[var(--neon)]">{spread}%</span></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs mb-2">
              <div className="text-green-500">BIDS</div>
              <div className="text-center text-[var(--text-secondary)]">PRICE</div>
              <div className="text-red-500 text-right">ASKS</div>
            </div>

            <div className="space-y-1 text-xs">
              {orderbook.bids.map((bid, index) => (
                <div key={`bid-${index}`} className="grid grid-cols-3 gap-2">
                  <div className="text-green-500">{bid.size}</div>
                  <div className="text-center">${bid.price.toFixed(2)}</div>
                  <div></div>
                </div>
              ))}

              <div className="grid grid-cols-3 gap-2 my-1 py-1 border-t border-b border-[var(--border-bright)]">
                <div></div>
                <div className="text-center font-bold">${prices.btc.current.toFixed(2)}</div>
                <div></div>
              </div>

              {orderbook.asks.map((ask, index) => (
                <div key={`ask-${index}`} className="grid grid-cols-3 gap-2">
                  <div></div>
                  <div className="text-center">${ask.price.toFixed(2)}</div>
                  <div className="text-red-500 text-right">{ask.size}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-green-600 text-black font-bold py-4 rounded text-sm">BUY</button>
              <button className="flex-1 bg-red-600 text-white font-bold py-4 rounded text-sm">SELL</button>
            </div>
          </div>
        )}

        {activeTab === 'Positions' && (
          <div className="space-y-3">
            {positions.map((position, index) => {
              const { pnl, pnlPercent } = calculatePnL(position);
              return (
                <div key={index} className="bg-[var(--surface)] rounded-lg p-3 border border-[var(--border)]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold">{position.symbol}/USD</div>
                      <div className={`text-xs ${position.type === 'long' ? 'text-green-500' : 'text-red-500'}`}>
                        {position.type.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">${position.current.toLocaleString()}</div>
                      <div className={`text-xs ${pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[var(--text-secondary)]">ENTRY</div>
                      <div>${position.entry.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[var(--text-secondary)]">P&L</div>
                      <div className={pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                        ${pnl.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'Historique' && (
          <div className="bg-[var(--surface)] rounded-lg p-3 border border-[var(--border)] text-center">
            <div className="text-[var(--text-secondary)]">Aucune transaction récente</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoTrader;