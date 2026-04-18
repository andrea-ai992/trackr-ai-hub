Je vais créer un composant SparklineAnimated.jsx réutilisable avec SVG pour afficher les prix live pulsants (rouge/vert) et l'intégrer dans les pages Markets/Stocks et Markets/Crypto.

```jsx
// src/components/SparklineAnimated.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './SparklineAnimated.css';

const SparklineAnimated = ({ price, change, percentChange, isCrypto = false }) => {
  const [isUp, setIsUp] = useState(change >= 0);
  const [pulseKey, setPulseKey] = useState(0);
  const sparklineRef = useRef(null);

  // Déterminer la direction de la variation
  useEffect(() => {
    setIsUp(change >= 0);
  }, [change]);

  // Animation de pulsation pour les prix en hausse/baiss
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Générer les données pour le sparkline
  const generateSparklineData = () => {
    const dataPoints = [];
    const basePrice = parseFloat(price);
    const volatility = basePrice * 0.005; // 0.5% de volatilité
    const points = 20;

    for (let i = 0; i < points; i++) {
      const variation = (Math.random() - 0.5) * volatility * 2;
      const currentPrice = basePrice + variation;
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
        <span className="price-value">{price}</span>
        <span className={`price-change ${isUp ? 'up' : 'down'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(change)} ({Math.abs(percentChange)}%)
        </span>
      </div>

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

      {/* Animation de pulsation */}
      {isUp && (
        <motion.div
          key={pulseKey}
          className="pulse-indicator"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
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
}

.price-change {
  font-size: 12px;
}

.price-change.up {
  color: var(--green);
}

.price-change.down {
  color: var(--t3);
}

.sparkline-svg {
  width: 100%;
  height: 40px;
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
// src/pages/Markets/Stocks.jsx (modifié)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SparklineAnimated from '../../components/SparklineAnimated';
import './Stocks.css';

function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const { data, error } = await supabase
          .from('stocks')
          .select('id, name, price, change, percent_change')
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

    // Écouteur de changement en temps réel
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

  if (loading) {
    return <div className="loading">Chargement en cours...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="stocks">
      <h1>Marchés boursiers</h1>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.id}>
            <Link to={`/markets/stocks/${stock.id}`}>
              <h2>{stock.name}</h2>
              <SparklineAnimated
                price={stock.price}
                change={stock.change}
                percentChange={stock.percent_change}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Stocks;
```

```jsx
// src/pages/Markets/Crypto.jsx (modifié)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SparklineAnimated from '../../components/SparklineAnimated';
import './Crypto.css';

function Crypto() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const { data, error } = await supabase
          .from('cryptos')
          .select('id, name, price, change, percent_change')
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

    // Écouteur de changement en temps réel
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

  if (loading) {
    return <div className="loading">Chargement en cours...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="cryptos">
      <h1>Marchés cryptos</h1>
      <ul>
        {cryptos.map((crypto) => (
          <li key={crypto.id}>
            <Link to={`/markets/crypto/${crypto.id}`}>
              <h2>{crypto.name}</h2>
              <SparklineAnimated
                price={crypto.price}
                change={crypto.change}
                percentChange={crypto.percent_change}
                isCrypto={true}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Crypto;
```

```css
/* src/pages/Markets/Stocks.css (modifié) */
.stocks {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
}

.stocks h1 {
  color: var(--green);
  margin-bottom: 20px;
}

.stocks ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stocks li {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--bg2);
  transition: background-color 0.2s ease;
}

.stocks li:hover {
  background-color: rgba(255, 255, 255, 0.05);
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

.stocks h2 {
  margin: 0 0 8px 0;
  color: var(--t1);
  font-size: 18px;
}

.stocks .price {
  font-weight: bold;
  color: var(--green);
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: var(--t2);
}

.error {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: var(--t3);
}
```

```css
/* src/pages/Markets/Crypto.css (modifié) */
.cryptos {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
}

.cryptos h1 {
  color: var(--green);
  margin-bottom: 20px;
}

.cryptos ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cryptos li {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--bg2);
  transition: background-color 0.2s ease;
}

.cryptos li:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.cryptos li:last-child {
  margin-bottom: 0;
}

.cryptos a {
  text-decoration: none;
  color: var(--t2);
  display: block;
}

.cryptos a:hover h2 {
  color: var(--green);
}

.cryptos h2 {
  margin: 0 0 8px 0;
  color: var(--t1);
  font-size: 18px;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: var(--t2);
}

.error {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: var(--t3);
}