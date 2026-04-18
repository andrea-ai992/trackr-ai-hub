Je vais implémenter un système de gestion des erreurs robuste pour `Markets.jsx` avec un `ErrorOverlay.jsx` complet et fonctionnel.

```jsx
// src/components/ErrorOverlay.jsx
import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorOverlay = ({ error, onRetry, isVisible }) => {
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setShowRetry(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isVisible || !error) return null;

  return (
    <div className="error-overlay">
      <div className="error-content">
        <AlertCircle size={24} className="error-icon" />
        <h3>Connection Error</h3>
        <p>{error.message || 'Failed to fetch data'}</p>
        {showRetry && (
          <button
            className="retry-button"
            onClick={onRetry}
            aria-label="Retry connection"
          >
            <RefreshCw size={16} />
            <span>Retry Now</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorOverlay;
```

```css
/* src/components/ErrorOverlay.css */
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(8, 8, 8, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

.error-content {
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  max-width: 90vw;
  width: 320px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.1);
}

.error-icon {
  color: var(--green);
  margin-bottom: 1rem;
}

.error-content h3 {
  color: var(--t1);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-content p {
  color: var(--t2);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.retry-button {
  background-color: var(--green);
  color: #080808;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  width: 100%;
}

.retry-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

```jsx
// src/pages/Markets.jsx (modifications nécessaires)
import { useState, useEffect } from 'react';
import ErrorOverlay from '../components/ErrorOverlay';
import { AlertCircle } from 'lucide-react';

const Markets = () => {
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchMarketsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stocksRes, cryptoRes] = await Promise.all([
        fetch('/api/stocks'),
        fetch('/api/crypto')
      ]);

      if (!stocksRes.ok || !cryptoRes.ok) {
        throw new Error('Failed to fetch market data');
      }

      const [stocksData, cryptoData] = await Promise.all([
        stocksRes.json(),
        cryptoRes.json()
      ]);

      setStocks(stocksData);
      setCrypto(cryptoData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketsData();
  }, []);

  useEffect(() => {
    if (error && retryCount < 3) {
      const retryTimer = setTimeout(() => {
        fetchMarketsData();
        setRetryCount(prev => prev + 1);
      }, 5000);

      return () => clearTimeout(retryTimer);
    }
  }, [error, retryCount]);

  if (loading && !error) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading market data...</p>
      </div>
    );
  }

  return (
    <div className="markets-container">
      <ErrorOverlay
        error={error}
        onRetry={fetchMarketsData}
        isVisible={!!error}
      />

      {error ? (
        <div className="error-state">
          <AlertCircle size={48} />
          <h2>Connection Issues</h2>
          <p>We're having trouble fetching market data.</p>
        </div>
      ) : (
        <>
          <section className="markets-section">
            <h2>Stocks</h2>
            {/* Render stocks data */}
          </section>

          <section className="markets-section">
            <h2>Cryptocurrencies</h2>
            {/* Render crypto data */}
          </section>
        </>
      )}
    </div>
  );
};

export default Markets;
```

```css
/* src/pages/Markets.css (ajouts nécessaires) */
.markets-container {
  min-height: 100vh;
  padding: 1rem;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 1rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--border);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.markets-section {
  margin-bottom: 2rem;
}

.markets-section h2 {
  color: var(--t1);
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}