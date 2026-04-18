import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';

const CryptoTrader = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Marché');
  const [prices, setPrices] = useState({
    BTC: { price: 0, change24h: 0 },
    ETH: { price: 0, change24h: 0 },
    SOL: { price: 0, change24h: 0 }
  });
  const [portfolio, setPortfolio] = useState({
    total: 0,
    assets: [
      { symbol: 'BTC', amount: 0.5, value: 0 },
      { symbol: 'ETH', amount: 3.2, value: 0 },
      { symbol: 'SOL', amount: 15.7, value: 0 }
    ]
  });
  const [orderbook, setOrderbook] = useState({
    bids: [],
    asks: []
  });
  const [positions, setPositions] = useState([
    { symbol: 'BTC', type: 'long', entry: 45000, current: 47250, pnl: 1125, pnlPercent: 5, active: true },
    { symbol: 'ETH', type: 'short', entry: 3100, current: 3038, pnl: -192, pnlPercent: -2, active: true },
    { symbol: 'SOL', type: 'long', entry: 120, current: 134.4, pnl: 226.8, pnlPercent: 12, active: true }
  ]);
  const [selectedAsset, setSelectedAsset] = useState('BTC');

  const fetchPrices = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
      const data = await response.json();
      setPrices({
        BTC: { price: data.bitcoin.usd, change24h: data.bitcoin.usd_24h_change },
        ETH: { price: data.ethereum.usd, change24h: data.ethereum.usd_24h_change },
        SOL: { price: data.solana.usd, change24h: data.solana.usd_24h_change }
      });
      updatePortfolio(data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const updatePortfolio = (priceData) => {
    const updatedAssets = portfolio.assets.map(asset => {
      const price = priceData[asset.symbol.toLowerCase()].usd;
      return {
        ...asset,
        value: asset.amount * price
      };
    });
    const total = updatedAssets.reduce((sum, asset) => sum + asset.value, 0);
    setPortfolio({ total, assets: updatedAssets });
  };

  const generateOrderbook = () => {
    const bids = [];
    const asks = [];
    const midPrice = prices[selectedAsset]?.price || 0;

    for (let i = 1; i <= 8; i++) {
      const priceVariation = midPrice * (0.001 * i);
      bids.push({
        price: midPrice - priceVariation,
        size: Math.random() * 10 + 5,
        total: (midPrice - priceVariation) * (Math.random() * 10 + 5)
      });
      asks.push({
        price: midPrice + priceVariation,
        size: Math.random() * 10 + 5,
        total: (midPrice + priceVariation) * (Math.random() * 10 + 5)
      });
    }

    setOrderbook({ bids, asks });
  };

  const calculateSpread = () => {
    if (orderbook.bids.length === 0 || orderbook.asks.length === 0) return 0;
    const bestBid = orderbook.bids[0].price;
    const bestAsk = orderbook.asks[0].price;
    return ((bestAsk - bestBid) / bestBid) * 100;
  };

  const updatePositionPnL = () => {
    setPositions(positions.map(position => {
      const currentPrice = prices[position.symbol.toLowerCase()]?.price || 0;
      const pnl = position.type === 'long'
        ? (currentPrice - position.entry) * (position.entry / position.entry)
        : (position.entry - currentPrice) * (position.entry / position.entry);
      const pnlPercent = position.type === 'long'
        ? ((currentPrice - position.entry) / position.entry) * 100
        : ((position.entry - currentPrice) / position.entry) * 100;
      return {
        ...position,
        current: currentPrice,
        pnl,
        pnlPercent
      };
    }));
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => {
      fetchPrices();
      generateOrderbook();
      updatePositionPnL();
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedAsset]);

  useEffect(() => {
    generateOrderbook();
  }, [selectedAsset]);

  const formatPrice = (price) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPnL = (value, percent) => {
    const absValue = Math.abs(value);
    const formattedValue = `$${absValue.toFixed(2)}`;
    const formattedPercent = `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
    return (
      <span style={{ color: percent >= 0 ? 'var(--neon)' : '#ff4444' }}>
        {value >= 0 ? formattedValue : `-${formattedValue}`} ({formattedPercent})
      </span>
    );
  };

  const handleBuy = () => {
    const currentPrice = prices[selectedAsset]?.price || 0;
    const newPosition = {
      symbol: selectedAsset,
      type: 'long',
      entry: currentPrice,
      current: currentPrice,
      pnl: 0,
      pnlPercent: 0,
      active: true
    };
    setPositions([...positions, newPosition]);
  };

  const handleSell = () => {
    const currentPrice = prices[selectedAsset]?.price || 0;
    const newPosition = {
      symbol: selectedAsset,
      type: 'short',
      entry: currentPrice,
      current: currentPrice,
      pnl: 0,
      pnlPercent: 0,
      active: true
    };
    setPositions([...positions, newPosition]);
  };

  return (
    <div style={{
      fontFamily: 'JetBrains Mono, monospace',
      backgroundColor: 'var(--bg)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--neon)',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '16px'
          }}
        >
          ← Dashboard
        </button>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 500 }}>CRYPTO TRADER</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        overflowX: 'auto'
      }}>
        {['BTC', 'ETH', 'SOL'].map(asset => (
          <button
            key={asset}
            onClick={() => setSelectedAsset(asset)}
            style={{
              backgroundColor: selectedAsset === asset ? 'var(--surface-high)' : 'var(--surface)',
              border: '1px solid var(--border)',
              color: selectedAsset === asset ? 'var(--neon)' : 'var(--text-primary)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
          >
            {asset}
          </button>
        ))}
      </div>

      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Prix</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Bloomberg Style</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 600 }}>
              {selectedAsset} {formatPrice(prices[selectedAsset]?.price || 0)}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {prices[selectedAsset]?.change24h >= 0 ? (
                <TrendingUp size={16} color="#00ff88" />
              ) : (
                <TrendingDown size={16} color="#ff4444" />
              )}
              <span style={{
                color: prices[selectedAsset]?.change24h >= 0 ? 'var(--neon)' : '#ff4444',
                fontSize: '14px'
              }}>
                {prices[selectedAsset]?.change24h >= 0 ? '+' : ''}{prices[selectedAsset]?.change24h.toFixed(2)}%
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>PORTFOLIO</div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>${formatPrice(portfolio.total)}</div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <button
          onClick={handleBuy}
          style={{
            backgroundColor: '#00aa44',
            border: 'none',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '14px',
            height: '44px',
            flex: 1
          }}
        >
          BUY {selectedAsset}
        </button>
        <button
          onClick={handleSell}
          style={{
            backgroundColor: '#aa0044',
            border: 'none',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '14px',
            height: '44px',
            flex: 1
          }}
        >
          SELL {selectedAsset}
        </button>
      </div>

      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        marginBottom: '16px'
      }}>
        {['Marché', 'Positions', 'Historique'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 16px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              color: activeTab === tab ? 'var(--neon)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--neon)' : 'none'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Marché' && (
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '8px',
          padding: '16px',
          flex: 1
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Order Book</h3>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <span>BID</span>
            <span>SIZE</span>
            <span>ASK</span>
            <span>SIZE</span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {orderbook.bids.slice().reverse().map((bid, index) => (
              <div key={`bid-${index}`} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 0',
                fontSize: '12px'
              }}>
                <span style={{ color: 'var(--neon)' }}>${formatPrice(bid.price)}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{bid.size.toFixed(2)}</span>
                {index === 0 && (
                  <span style={{
                    color: 'var(--text-secondary)',
                    fontSize: '10px'
                  }}>
                    SPREAD: {calculateSpread().toFixed(3)}%
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            margin: '8px 0',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <span>TOTAL</span>
            <span>PRICE</span>
            <span>TOTAL</span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {orderbook.asks.map((ask, index) => (
              <div key={`ask-${index}`} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 0',
                fontSize: '12px'
              }}>
                <span style={{ color: '#ff4444' }}>${formatPrice(ask.price)}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{ask.size.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Positions' && (
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '8px',
          padding: '16px',
          flex: 1
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Positions Actives</h3>

          {positions.filter(p => p.active).length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: 'var(--text-muted)'
            }}>
              Aucune position ouverte
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {positions.filter(p => p.active).map((position, index) => (
                <div key={index} style={{
                  backgroundColor: 'var(--surface-low)',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {position.symbol} {position.type.toUpperCase()}
                    </span>
                    <span style={{
                      color: position.pnlPercent >= 0 ? 'var(--neon)' : '#ff4444',
                      fontSize: '14px'
                    }}>
                      {formatPnL(position.pnl, position.pnlPercent)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>ENTRY: ${formatPrice(position.entry)}</span>
                    <span>CURRENT: ${formatPrice(position.current)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Historique' && (
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '8px',
          padding: '16px',
          flex: 1
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Historique des Trades</h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {[...Array(5)].map((_, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: '12px'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>BTC LONG</div>
                  <div style={{ color: 'var(--text-secondary)' }}>16:42:12</div>
                </div>
                <div style={{ color: 'var(--neon)' }}>$45,000.00</div>
                <div style={{ color: '#00aa44' }}>$+1,125.00 (+2.50%)</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoTrader;