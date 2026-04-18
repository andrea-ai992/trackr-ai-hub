import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const MARKETS_TABS = [
  { id: 'stocks', label: 'Stocks' },
  { id: 'crypto', label: 'Crypto' }
];

const MARKETS_DATA = {
  stocks: [
    { symbol: 'AAPL', name: 'Apple Inc.', logo: '/logos/aapl.png', price: 192.45, change: 2.34, changePercent: 1.23, volume: 45678900, marketCap: 2987654321 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', logo: '/logos/msft.png', price: 412.67, change: -1.23, changePercent: -0.30, volume: 23456789, marketCap: 3123456789 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', logo: '/logos/googl.png', price: 145.89, change: 0.56, changePercent: 0.39, volume: 12345678, marketCap: 1876543210 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', logo: '/logos/amzn.png', price: 189.23, change: -3.45, changePercent: -1.80, volume: 34567890, marketCap: 1987654321 },
    { symbol: 'TSLA', name: 'Tesla Inc.', logo: '/logos/tsla.png', price: 178.90, change: 4.56, changePercent: 2.61, volume: 56789012, marketCap: 5678901234 }
  ],
  crypto: [
    { symbol: 'BTC', name: 'Bitcoin', logo: '/logos/btc.png', price: 68723.45, change: 1245.67, changePercent: 1.84, volume: 23456789012, marketCap: 1357908642310 },
    { symbol: 'ETH', name: 'Ethereum', logo: '/logos/eth.png', price: 3456.78, change: -23.45, changePercent: -0.68, volume: 12345678901, marketCap: 412345678901 },
    { symbol: 'SOL', name: 'Solana', logo: '/logos/sol.png', price: 156.78, change: 3.45, changePercent: 2.25, volume: 3456789012, marketCap: 78901234567 },
    { symbol: 'ADA', name: 'Cardano', logo: '/logos/ada.png', price: 0.4567, change: -0.0123, changePercent: -2.65, volume: 1234567890, marketCap: 15678901234 },
    { symbol: 'DOT', name: 'Polkadot', logo: '/logos/dot.png', price: 6.7890, change: 0.1234, changePercent: 1.85, volume: 456789012, marketCap: 8901234567 }
  ]
};

const MarketCard = ({
  symbol,
  name,
  logo,
  price,
  change,
  changePercent,
  volume,
  marketCap,
  link
}) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const getChangeColor = () => {
    if (change > 0) return 'var(--green)';
    if (change < 0) return 'var(--red)';
    return 'var(--text-muted)';
  };

  const changePercentAbs = Math.abs(changePercent);

  return (
    <Link
      to={link}
      ref={cardRef}
      className="market-card"
      style={{
        opacity: isVisible ? '1' : '0',
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        transitionDelay: '0.1s',
        display: 'block',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div className="market-card-container">
        <div className="market-card-header">
          <div className="market-card-logo">
            {logo ? (
              <img src={logo} alt={`${symbol} logo`} width={32} height={32} />
            ) : (
              <div className="market-card-logo-placeholder">
                <span>{symbol.split('').slice(0, 2).join('')}</span>
              </div>
            )}
            <span className="market-card-symbol">{symbol}</span>
          </div>
          <h3 className="market-card-name">{name}</h3>
        </div>

        <div className="market-card-content">
          <div className="market-card-price">
            <span className="market-card-price-value">${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="market-card-change" style={{ color: getChangeColor() }}>
            <span className="market-card-change-value">
              {change > 0 ? '+' : ''}{change.toFixed(2)} ({changePercent > 0 ? '+' : ''}{changePercentAbs.toFixed(2)}%)
            </span>
          </div>

          <div className="market-card-details">
            <div className="market-card-detail">
              <span className="market-card-detail-label">Vol</span>
              <span className="market-card-detail-value">{volume.toLocaleString()}</span>
            </div>
            <div className="market-card-detail">
              <span className="market-card-detail-label">Cap</span>
              <span className="market-card-detail-value">${marketCap.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Markets = () => {
  const [activeTab, setActiveTab] = useState('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [stocksData, setStocksData] = useState([]);
  const [cryptoData, setCryptoData] = useState([]);

  useEffect(() => {
    const fetchStocksData = async () => {
      try {
        const response = await fetch('/api/stocks');
        const data = await response.json();
        setStocksData(data);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setStocksData(MARKETS_DATA.stocks);
      }
    };

    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch('/api/crypto-prices');
        const data = await response.json();
        setCryptoPrices(data);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    const fetchYahooFinance = async () => {
      try {
        const stocksSymbols = MARKETS_DATA.stocks.map(s => s.symbol).join(',');
        const cryptoSymbols = MARKETS_DATA.crypto.map(s => s.symbol).join(',');

        const stocksResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stocksSymbols}?interval=1d`);
        const cryptoResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${cryptoSymbols}?interval=1d`);

        const stocksData = await stocksResponse.json();
        const cryptoData = await cryptoResponse.json();

        const updatedStocks = MARKETS_DATA.stocks.map(stock => {
          const meta = stocksData.chart.result.find(r => r.meta.symbol === stock.symbol)?.meta;
          return meta ? {
            ...stock,
            price: meta.regularMarketPrice,
            change: meta.regularMarketChange,
            changePercent: meta.regularMarketChangePercent
          } : stock;
        });

        const updatedCrypto = MARKETS_DATA.crypto.map(crypto => {
          const meta = cryptoData.chart.result.find(r => r.meta.symbol === crypto.symbol)?.meta;
          return meta ? {
            ...crypto,
            price: meta.regularMarketPrice,
            change: meta.regularMarketChange,
            changePercent: meta.regularMarketChangePercent
          } : crypto;
        });

        setStocksData(updatedStocks);
        setCryptoData(updatedCrypto);
      } catch (error) {
        console.error('Error fetching Yahoo Finance data:', error);
        setStocksData(MARKETS_DATA.stocks);
        setCryptoData(MARKETS_DATA.crypto);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocksData();
    fetchCryptoPrices();
    fetchYahooFinance();
  }, []);

  const filteredStocks = stocksData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCrypto = cryptoData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderMarketList = () => {
    if (activeTab === 'stocks') {
      return filteredStocks.map((stock, index) => (
        <MarketCard
          key={`${stock.symbol}-${index}`}
          symbol={stock.symbol}
          name={stock.name}
          logo={stock.logo}
          price={stock.price}
          change={stock.change}
          changePercent={stock.changePercent}
          volume={stock.volume}
          marketCap={stock.marketCap}
          link={`/markets/${stock.symbol}`}
        />
      ));
    } else {
      return filteredCrypto.map((crypto, index) => (
        <MarketCard
          key={`${crypto.symbol}-${index}`}
          symbol={crypto.symbol}
          name={crypto.name}
          logo={crypto.logo}
          price={crypto.price}
          change={crypto.change}
          changePercent={crypto.changePercent}
          volume={crypto.volume}
          marketCap={crypto.marketCap}
          link={`/markets/${crypto.symbol}`}
        />
      ));
    }
  };

  return (
    <div className="markets-page">
      <div className="markets-header">
        <h1 className="markets-title">Markets</h1>
        <div className="markets-tabs">
          {MARKETS_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`markets-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <div className={`markets-tab-pill ${activeTab}`}></div>
        </div>
      </div>

      <div className="markets-search-container">
        <div className="markets-search">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search stocks or crypto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="markets-search-input"
          />
        </div>
      </div>

      <div className="markets-content">
        {isLoading ? (
          <div className="markets-skeleton">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="market-card market-card-skeleton">
                <div className="market-card-container">
                  <div className="market-card-header">
                    <div className="market-card-logo">
                      <div className="market-card-logo-placeholder"></div>
                      <div className="market-card-symbol-placeholder"></div>
                    </div>
                    <div className="market-card-name-placeholder"></div>
                  </div>
                  <div className="market-card-content">
                    <div className="market-card-price-placeholder"></div>
                    <div className="market-card-change-placeholder"></div>
                    <div className="market-card-details">
                      <div className="market-card-detail">
                        <div className="market-card-detail-label-placeholder"></div>
                        <div className="market-card-detail-value-placeholder"></div>
                      </div>
                      <div className="market-card-detail">
                        <div className="market-card-detail-label-placeholder"></div>
                        <div className="market-card-detail-value-placeholder"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="markets-list">
            {renderMarketList()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Markets;