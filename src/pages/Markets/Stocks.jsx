Je vais d'abord ajouter la validation des inputs dans les pages Stocks et Crypto, puis améliorer le composant SparklineAnimated pour qu'il soit plus performant et intégré correctement. Voici les modifications :

```jsx
// src/components/SparklineAnimated.jsx
import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import './SparklineAnimated.css';

const SparklineAnimated = ({ price, change, percentChange, isCrypto = false }) => {
  const [isUp, setIsUp] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const sparklineRef = useRef(null);

  // Sanitize et formater les données
  const sanitizePrice = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') return '0.00';
    const strValue = String(value);
    const sanitized = DOMPurify.sanitize(strValue, { ALLOWED_TAGS: [] });
    return parseFloat(sanitized).toFixed(2);
  };

  const sanitizeChange = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') return '0.00';
    const strValue = String(value);
    const sanitized = DOMPurify.sanitize(strValue, { ALLOWED_TAGS: [] });
    return parseFloat(sanitized).toFixed(2);
  };

  const sanitizePercent = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') return '0.00';
    const strValue = String(value);
    const sanitized = DOMPurify.sanitize(strValue, { ALLOWED_TAGS: [] });
    return parseFloat(sanitized).toFixed(2);
  };

  const safePrice = sanitizePrice(price);
  const safeChange = sanitizeChange(change);
  const safePercent = sanitizePercent(percentChange);

  // Déterminer la direction de la variation
  useEffect(() => {
    setIsUp(parseFloat(safeChange) >= 0);
  }, [safeChange]);

  // Animation de pulsation pour les prix en hausse/baiss
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Générer les données pour le sparkline avec des valeurs réalistes
  const generateSparklineData = () => {
    const basePrice = parseFloat(safePrice);
    const volatility = basePrice * 0.005;
    const points = 20;
    const dataPoints = [];

    // Génération plus réaliste avec tendance
    const trend = parseFloat(safeChange) > 0 ? 1 : -1;
    const trendFactor = Math.abs(parseFloat(safeChange)) / 100;

    for (let i = 0; i < points; i++) {
      const variation = (Math.random() - 0.5) * volatility * 2;
      const trendVariation = trend * volatility * trendFactor * (i / points);
      const currentPrice = basePrice + variation + trendVariation;
      dataPoints.push(currentPrice);
    }

    return dataPoints;
  };

  const sparklineData = generateSparklineData();

  // Trouver les min/max pour l'échelle
  const minPrice = Math.min(...sparklineData);
  const maxPrice = Math.max(...sparklineData);
  const priceRange = maxPrice - minPrice;

  return (
    <div className="sparkline-container">
      <div className="sparkline-price">
        <span className="price-value">${safePrice}</span>
        <span className={`price-change ${isUp ? 'up' : 'down'}`}>
          {isUp ? '▲' : '▼'} {safeChange} ({safePercent}%)
        </span>
      </div>

      <div className="sparkline-wrapper">
        <svg
          ref={sparklineRef}
          className="sparkline-svg"
          viewBox={`0 0 100 ${maxPrice > 0 ? maxPrice : 1}`}
          preserveAspectRatio="none"
        >
          <polyline
            points={sparklineData
              .map((p, i) => `${i * (100 / (sparklineData.length - 1))},${p}`)
              .join(' ')}
            fill="none"
            stroke={isUp ? 'var(--green)' : 'var(--t3)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points de données */}
          {sparklineData.map((p, i) => (
            <circle
              key={`point-${i}`}
              cx={i * (100 / (sparklineData.length - 1))}
              cy={p}
              r="1.5"
              fill={isUp ? 'var(--green)' : 'var(--t3)'}
              opacity="0.7"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default SparklineAnimated;
```

```css
/* src/components/SparklineAnimated.css */
.sparkline-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 150px;
}

.sparkline-wrapper {
  position: relative;
  width: 100%;
  height: 40px;
}

.sparkline-price {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 14px;
  font-weight: 600;
}

.price-value {
  color: var(--green);
  font-size: 16px;
  font-weight: 700;
}

.price-change {
  font-size: 12px;
  font-weight: 500;
}

.price-change.up {
  color: var(--green);
}

.price-change.down {
  color: var(--t3);
}

.sparkline-svg {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom,
    rgba(0, 255, 136, 0.1) 0%,
    transparent 100%);
  border-radius: 4px;
}

.pulse-indicator {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: var(--green);
  border-radius: 50%;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;
}
```

```jsx
// src/pages/Markets/Stocks.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';
import SparklineAnimated from '../../components/SparklineAnimated';
import './Stocks.css';

function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sanitization des inputs utilisateur
  const sanitizeInput = (input) => {
    if (!input) return '';
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  };

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const { data, error } = await supabase
          .from('stocks')
          .select('id, name, symbol, price, change, percent_change')
          .order('id', { ascending: false });
        if (error) {
          setError(error.message);
        } else {
          setStocks(data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();

    const subscription = supabase
      .channel('stocks_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stocks' },
        (payload) => {
          setStocks(prev => prev.map(stock =>
            stock.id === payload.new.id
              ? {
                  ...stock,
                  name: payload.new.name,
                  symbol: payload.new.symbol,
                  price: payload.new.price,
                  change: payload.new.change,
                  percent_change: payload.new.percent_change
                }
              : stock
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Chargement en cours...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="stocks">
      <div className="stocks-header">
        <h1>Marchés boursiers</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher une action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(sanitizeInput(e.target.value))}
            className="search-input"
          />
        </div>
      </div>
      <ul>
        {filteredStocks.length > 0 ? (
          filteredStocks.map((stock) => (
            <li key={stock.id}>
              <Link to={`/markets/stocks/${stock.id}`}>
                <div className="stock-header">
                  <h2>{stock.name}</h2>
                  <span className="stock-symbol">{stock.symbol}</span>
                </div>
                <SparklineAnimated
                  price={stock.price}
                  change={stock.change}
                  percentChange={stock.percent_change}
                />
              </Link>
            </li>
          ))
        ) : (
          <div className="no-results">
            {searchTerm ? 'Aucune action trouvée.' : 'Aucune action disponible.'}
          </div>
        )}
      </ul>
    </div>
  );
}

export default Stocks;
```

```css
/* src/pages/Markets/Stocks.css */
.stocks {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
  min-height: 100vh;
}

.stocks-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.stocks h1 {
  color: var(--green);
  margin: 0;
  font-size: 24px;
}

.search-container {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--t1);
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--green);
}

.stocks ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stocks li {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--bg2);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.stocks li:hover {
  background-color: rgba(255, 255, 255, 0.07);
  border-color: var(--border);
  transform: translateY(-2px);
}

.stocks li:last-child {
  margin-bottom: 0;
}

.stocks a {
  text-decoration: none;
  color: var(--t2);
  display: block;
}

.stocks a:hover h2 {
  color: var(--green);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stocks h2 {
  margin: 0;
  color: var(--t1);
  font-size: 18px;
  font-weight: 600;
}

.stock-symbol {
  color: var(--t3);
  font-size: 14px;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: var(--t2);
}

.error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: var(--t3);
}

.no-results {
  text-align: center;
  padding: 40px;
  color: var(--t3);
  font-size: 16px;
}
```

```jsx
// src/pages/Markets/Crypto.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';
import SparklineAnimated from '../../components/SparklineAnimated';
import './Crypto.css';

function Crypto() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sanitization des inputs utilisateur
  const sanitizeInput = (input) => {
    if (!input) return '';
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  };

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const { data, error } = await supabase
          .from('cryptos')
          .select('id, name, symbol, price, change, percent_change')
          .order('id', { ascending: false });
        if (error) {
          setError(error.message);
        } else {
          setCryptos(data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCryptos();

    const subscription = supabase
      .channel('cryptos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cryptos' },
        (payload) => {
          setCryptos(prev => prev.map(crypto =>
            crypto.id === payload.new.id
              ? {
                  ...crypto,
                  name: payload.new.name,
                  symbol: payload.new.symbol,
                  price: payload.new.price,
                  change: payload.new.change,
                  percent_change: payload.new.percent_change
                }
              : crypto
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Chargement en cours...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="cryptos">
      <div className="cryptos-header">
        <h1>Marchés cryptos</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher une crypto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(sanitizeInput(e.target.value))}
            className="search-input"
          />
        </div>
      </div>
      <ul>
        {filteredCryptos.length > 0 ? (
          filteredCryptos.map((crypto) => (
            <li key={crypto.id}>
              <Link to={`/markets/crypto/${crypto.id}`}>
                <div className="crypto-header">
                  <h2>{crypto.name}</h2>
                  <span className="crypto-symbol">{crypto.symbol}</span>
                </div>
                <SparklineAnimated
                  price={crypto.price}
                  change={crypto.change}
                  percentChange={crypto.percent_change}
                  isCrypto={true}
                />
              </Link>
            </li>
          ))
        ) : (
          <div className="no-results">
            {searchTerm ? 'Aucune crypto trouvée.' : 'Aucune crypto disponible.'}
          </div>
        )}
      </ul>
    </div>
  );
}

export default Crypto;
```

```css
/* src/pages/Markets/Crypto.css */
.cryptos {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
  min-height: 100vh;
}

.cryptos-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.cryptos h1 {
  color: var(--green);
  margin: 0;
  font-size: 24px;
}

.search-container {
  width: 100%;
}

.search-input {
  width: 1