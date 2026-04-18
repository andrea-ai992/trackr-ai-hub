Je vais créer les fichiers nécessaires pour le redesign de l'interface Markets avec le style Bloomberg dark premium.

D'abord, voici le composant AssetCard.jsx:

```jsx
import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const AssetCard = ({ asset }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!asset) return null;

  const isPositive = asset.changePercent >= 0;
  const changeColor = isPositive ? 'var(--green)' : '#ff4444';
  const arrowIcon = isPositive ? <ChevronUp size={16} /> : <ChevronDown size={16} />;

  // Génération d'une sparkline SVG simple avec 7 points
  const generateSparkline = (priceData) => {
    if (!priceData || priceData.length < 2) {
      return "M0,20 L40,20";
    }

    const max = Math.max(...priceData);
    const min = Math.min(...priceData);
    const range = max - min || 1;

    const points = priceData.map((price, i) => {
      const x = (i / (priceData.length - 1)) * 40;
      const y = 20 - ((price - min) / range) * 40;
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  };

  return (
    <div
      className="asset-card"
      style={{
        backgroundColor: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '8px',
        transition: 'background-color 0.2s ease',
        opacity: isLoaded ? 1 : 0,
        animation: isLoaded ? 'fadeIn 0.3s ease-in' : 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Logo ou symbole */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: asset.logo ? 'transparent' : '#222',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            color: asset.color || 'var(--t1)',
            overflow: 'hidden'
          }}
        >
          {asset.logo ? (
            <img
              src={asset.logo}
              alt={asset.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.previousElementSibling.style.display = 'flex';
              }}
            />
          ) : (
            asset.symbol.substring(0, 2).toUpperCase()
          )}
        </div>

        {/* Nom et symbole */}
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--t1)', fontWeight: '600', fontSize: '14px' }}>
            {asset.name}
          </div>
          <div style={{ color: 'var(--t3)', fontSize: '12px' }}>
            {asset.symbol}
          </div>
        </div>

        {/* Prix */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--t1)', fontSize: '16px', fontWeight: '600', fontFamily: 'monospace' }}>
            {asset.price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
        </div>
      </div>

      {/* Variation et sparkline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
        <div style={{
          color: changeColor,
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {arrowIcon}
          {Math.abs(asset.changePercent).toFixed(2)}%
        </div>

        {/* Sparkline */}
        <svg
          width="40"
          height="20"
          viewBox="0 0 40 20"
          style={{ marginLeft: 'auto' }}
        >
          <path
            d={generateSparkline(asset.sparkline)}
            stroke={changeColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default AssetCard;
```

Maintenant, voici le fichier Markets.jsx mis à jour avec le nouveau design:

```jsx
import { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import AssetCard from '../components/AssetCard';

const Markets = () => {
  const [activeTab, setActiveTab] = useState('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef(null);

  // Simulation de données (à remplacer par l'API réelle)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 800));

        // Données mock pour les actions
        const mockStocks = [
          { id: 1, name: 'Apple Inc.', symbol: 'AAPL', price: 175.34, changePercent: 1.25, logo: 'https://logo.clearbit.com/apple.com', color: '#a6b1c0', sparkline: [172.1, 173.8, 174.5, 175.34, 176.1, 175.8, 175.34] },
          { id: 2, name: 'Microsoft Corporation', symbol: 'MSFT', price: 405.67, changePercent: -0.45, logo: 'https://logo.clearbit.com/microsoft.com', color: '#f25022', sparkline: [408.2, 407.5, 406.8, 405.67, 404.9, 405.3, 405.67] },
          { id: 3, name: 'Amazon.com Inc.', symbol: 'AMZN', price: 145.23, changePercent: 2.34, logo: 'https://logo.clearbit.com/amazon.com', color: '#ff9900', sparkline: [142.5, 143.8, 144.2, 145.23, 146.1, 145.8, 145.23] },
          { id: 4, name: 'Alphabet Inc.', symbol: 'GOOGL', price: 138.76, changePercent: 0.89, logo: 'https://logo.clearbit.com/google.com', color: '#4285f4', sparkline: [137.2, 138.1, 138.5, 138.76, 139.2, 138.9, 138.76] },
          { id: 5, name: 'Tesla Inc.', symbol: 'TSLA', price: 172.45, changePercent: -1.78, logo: 'https://logo.clearbit.com/tesla.com', color: '#cc0000', sparkline: [175.2, 174.5, 173.8, 172.45, 171.9, 172.2, 172.45] },
        ];

        // Données mock pour les cryptos
        const mockCrypto = [
          { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 42345.67, changePercent: 3.21, logo: 'https://logo.clearbit.com/bitcoin.org', color: '#f7931a', sparkline: [41200, 41500, 41800, 42345.67, 42500, 42400, 42345.67] },
          { id: 2, name: 'Ethereum', symbol: 'ETH', price: 2890.45, changePercent: -0.34, logo: 'https://logo.clearbit.com/ethereum.org', color: '#627eea', sparkline: [2910.5, 2905.3, 2898.7, 2890.45, 2885.2, 2888.9, 2890.45] },
          { id: 3, name: 'Solana', symbol: 'SOL', price: 132.78, changePercent: 4.56, logo: 'https://logo.clearbit.com/solana.com', color: '#9945ff', sparkline: [125.3, 128.7, 130.2, 132.78, 134.1, 133.5, 132.78] },
          { id: 4, name: 'XRP', symbol: 'XRP', price: 0.6789, changePercent: -2.12, logo: 'https://logo.clearbit.com/ripple.com', color: '#23292f', sparkline: [0.692, 0.688, 0.682, 0.6789, 0.675, 0.677, 0.6789] },
          { id: 5, name: 'Cardano', symbol: 'ADA', price: 0.4567, changePercent: 1.23, logo: 'https://logo.clearbit.com/cardano.org', color: '#0033ad', sparkline: [0.445, 0.451, 0.454, 0.4567, 0.458, 0.457, 0.4567] },
        ];

        setStocks(mockStocks);
        setCrypto(mockCrypto);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching market data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simuler un rafraîchissement
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Ici on pourrait appeler une API pour rafraîchir les données
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredStocks = stocks.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCrypto = crypto.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topGainers = [...filteredStocks, ...filteredCrypto]
    .filter(asset => asset.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

  const topLosers = [...filteredStocks, ...filteredCrypto]
    .filter(asset => asset.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  return (
    <div
      className="markets-page"
      style={{
        backgroundColor: 'var(--bg)',
        minHeight: '100vh',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        color: 'var(--t1)'
      }}
    >
      {/* Header avec tabs */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--bg)',
          zIndex: 100,
          padding: '16px 16px 0',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Markets</h1>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <button
            onClick={() => setActiveTab('stocks')}
            style={{
              padding: '8px 0',
              fontSize: '16px',
              fontWeight: activeTab === 'stocks' ? '600' : '400',
              color: activeTab === 'stocks' ? 'var(--t1)' : 'var(--t3)',
              borderBottom: activeTab === 'stocks' ? '2px solid var(--green)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            Stocks
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            style={{
              padding: '8px 0',
              fontSize: '16px',
              fontWeight: activeTab === 'crypto' ? '600' : '400',
              color: activeTab === 'crypto' ? 'var(--t1)' : 'var(--t3)',
              borderBottom: activeTab === 'crypto' ? '2px solid var(--green)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            Crypto
          </button>
        </div>

        {/* Barre de recherche */}
        <div
          style={{
            position: 'sticky',
            top: 80,
            backgroundColor: 'var(--bg)',
            padding: '12px 16px',
            zIndex: 99
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#111',
              borderRadius: '12px',
              padding: '10px 16px',
              border: '1px solid var(--border)'
            }}
          >
            <Search size={20} color="var(--t3)" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--t1)',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main
        ref={containerRef}
        style={{
          padding: '16px',
          paddingBottom: '80px'
        }}
      >
        {/* Rafraîchissement */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '16px'
          }}
        >
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#111',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              color: 'var(--t3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>