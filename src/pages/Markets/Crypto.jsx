Je vais créer un fichier `src/pages/Markets/Crypto.jsx` complet avec une validation stricte des inputs utilisateur et une protection contre les XSS en utilisant DOMPurify. Voici le code :

```jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';

const Crypto = () => {
  const navigate = useNavigate();
  const [cryptoData, setCryptoData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Crypto symbols validation pattern (uppercase letters only, 2-8 chars)
  const SYMBOL_PATTERN = /^[A-Z]{2,8}$/;
  // Amount validation pattern (numbers only, optional decimal, max 2 decimals)
  const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

  // Mock data - in production this would come from an API
  const mockCryptoData = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 45000.50, change: 2.3, marketCap: '850B' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3200.75, change: -1.2, marketCap: '380B' },
    { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin', price: 420.30, change: 0.8, marketCap: '68B' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', price: 120.45, change: 3.1, marketCap: '42B' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.75, change: -0.5, marketCap: '35B' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 1.25, change: 1.5, marketCap: '41B' },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.12, change: 0.3, marketCap: '15B' },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 7.89, change: -2.1, marketCap: '9B' },
  ];

  // Sanitize and validate search term
  const sanitizeSearchTerm = (term) => {
    const sanitized = DOMPurify.sanitize(term.trim());
    if (!SYMBOL_PATTERN.test(sanitized)) {
      throw new Error('Invalid symbol format. Use uppercase letters only (2-8 characters)');
    }
    return sanitized;
  };

  // Sanitize and validate amount
  const sanitizeAmount = (amt) => {
    const sanitized = DOMPurify.sanitize(amt.trim());
    if (!AMOUNT_PATTERN.test(sanitized)) {
      throw new Error('Invalid amount. Use numbers only with up to 2 decimal places');
    }
    return sanitized;
  };

  const fetchCryptoData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/crypto');
      // const data = await response.json();
      // setCryptoData(data);

      // Using mock data for now
      setCryptoData(mockCryptoData);
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Failed to load crypto data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCryptoData();
  }, [fetchCryptoData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');

    try {
      const sanitizedTerm = sanitizeSearchTerm(searchTerm);
      setSearchTerm(sanitizedTerm);

      if (sanitizedTerm) {
        const filtered = mockCryptoData.filter(crypto =>
          crypto.symbol.toLowerCase().includes(sanitizedTerm.toLowerCase()) ||
          crypto.name.toLowerCase().includes(sanitizedTerm.toLowerCase())
        );
        setCryptoData(filtered);
      } else {
        setCryptoData(mockCryptoData);
      }
    } catch (err) {
      setError(err.message);
      setCryptoData(mockCryptoData);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || AMOUNT_PATTERN.test(value)) {
      setAmount(value);
    }
  };

  const handleCryptoSelect = (crypto) => {
    setSelectedCrypto(crypto);
    setAmount('');
    setError('');
  };

  const handleTrade = () => {
    if (!selectedCrypto) {
      setError('Please select a cryptocurrency');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const sanitizedAmount = sanitizeAmount(amount);
      const parsedAmount = parseFloat(sanitizedAmount);

      if (parsedAmount <= 0) {
        setError('Amount must be greater than 0');
        return;
      }

      // In a real app, this would trigger a trade
      console.log(`Trade executed: ${parsedAmount} ${selectedCrypto.symbol}`);
      setError(`Trade executed: ${parsedAmount} ${selectedCrypto.symbol}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatChange = (change) => {
    return `${change >= 0 ? '+' : ''}${change}%`;
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading">Loading crypto data...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Crypto Market</h1>
        <p>Real-time cryptocurrency prices and trading</p>
      </header>

      <div className="crypto-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by symbol or name (e.g. BTC, Bitcoin)"
            className="search-input"
            maxLength={50}
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="crypto-grid">
        {cryptoData.map((crypto) => (
          <div
            key={crypto.id}
            className={`crypto-card ${selectedCrypto?.id === crypto.id ? 'selected' : ''}`}
            onClick={() => handleCryptoSelect(crypto)}
          >
            <div className="crypto-symbol">{crypto.symbol}</div>
            <div className="crypto-name">{crypto.name}</div>
            <div className="crypto-price">${formatNumber(crypto.price)}</div>
            <div className={`crypto-change ${crypto.change >= 0 ? 'positive' : 'negative'}`}>
              {formatChange(crypto.change)}
            </div>
            <div className="crypto-market-cap">Mkt Cap: {crypto.marketCap}</div>
          </div>
        ))}
      </div>

      {selectedCrypto && (
        <div className="trade-panel">
          <h2>Trade {selectedCrypto.symbol}</h2>
          <div className="trade-info">
            <span>Current Price: ${formatNumber(selectedCrypto.price)}</span>
          </div>

          <div className="amount-input">
            <label htmlFor="amount">Amount</label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              inputMode="decimal"
              pattern="[0-9]*(.[0-9]{0,2})?"
            />
            <span className="currency-symbol">{selectedCrypto.symbol}</span>
          </div>

          <button
            onClick={handleTrade}
            className="trade-button"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Execute Trade
          </button>
        </div>
      )}
    </div>
  );
};

export default Crypto;
```

Et voici le CSS correspondant à ajouter dans votre fichier de styles (par exemple `src/styles/Markets.css`) :

```css
/* Crypto specific styles */
.crypto-controls {
  margin: 1rem 0;
  padding: 0 1rem;
}

.search-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--t1);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--green);
}

.search-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--green);
  color: #000;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.search-button:hover {
  opacity: 0.9;
}

.crypto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  padding: 0 1rem;
  margin-bottom: 2rem;
}

.crypto-card {
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.crypto-card:hover {
  border-color: var(--green);
  transform: translateY(-2px);
}

.crypto-card.selected {
  border-color: var(--green);
  background-color: rgba(0, 255, 136, 0.1);
}

.crypto-symbol {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--t1);
}

.crypto-name {
  font-size: 0.875rem;
  color: var(--t2);
  margin-bottom: 0.5rem;
}

.crypto-price {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--t1);
  margin-bottom: 0.25rem;
}

.crypto-change {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.crypto-change.positive {
  color: #00ff88;
}

.crypto-change.negative {
  color: #ff4444;
}

.crypto-market-cap {
  font-size: 0.75rem;
  color: var(--t3);
}

.trade-panel {
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 0 1rem 2rem;
}

.trade-panel h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--t1);
}

.trade-info {
  margin-bottom: 1rem;
  color: var(--t2);
}

.amount-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.amount-input label {
  font-size: 0.875rem;
  color: var(--t2);
}

.amount-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--t1);
  font-size: 1rem;
}

.currency-symbol {
  padding: 0.75rem 1rem;
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--t1);
  font-weight: 600;
}

.trade-button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--green);
  color: #000;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.trade-button:hover {
  opacity: 0.9;
}

.trade-button:disabled {
  background-color: var(--t3);
  cursor: not-allowed;
  opacity: 0.6;
}

.error-message {
  color: #ff4444;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  background-color: rgba(255, 68, 68, 0.1);
  border-radius: 0.5rem;
  border-left: 3px solid #ff4444;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--t2);
}