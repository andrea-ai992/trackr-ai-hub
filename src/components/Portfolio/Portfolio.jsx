Je vais créer le hook personnalisé `usePortfolioData.js` et le composant `Portfolio.jsx` selon les spécifications.

```javascript
// src/hooks/usePortfolioData.js
import { useState, useEffect } from 'react';

const usePortfolioData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simuler une récupération de données depuis l'API
        const mockData = {
          performance: {
            totalReturn: 12.45,
            dailyChange: 0.75,
            monthlyChange: 3.2,
            annualChange: 12.45,
            benchmark: 8.75
          },
          allocations: [
            { name: 'Stocks', value: 65, color: '#00ff88' },
            { name: 'Bonds', value: 20, color: '#ff00aa' },
            { name: 'Crypto', value: 10, color: '#00aaff' },
            { name: 'Cash', value: 5, color: '#ffff00' }
          ],
          pnl: {
            current: 12540.50,
            initial: 11000.00,
            transactions: [
              { id: 1, date: '2024-01-15', symbol: 'AAPL', type: 'buy', shares: 10, price: 175.25, fees: 1.50 },
              { id: 2, date: '2024-02-20', symbol: 'BTC', type: 'buy', shares: 0.5, price: 50000, fees: 10 },
              { id: 3, date: '2024-03-10', symbol: 'AAPL', type: 'sell', shares: 5, price: 180.50, fees: 1.25 },
              { id: 4, date: '2024-04-05', symbol: 'ETH', type: 'buy', shares: 2, price: 3200, fees: 5 }
            ]
          }
        };

        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 800));
        setData(mockData);
      } catch (err) {
        setError('Failed to fetch portfolio data');
        console.error('Error fetching portfolio data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export default usePortfolioData;
```

```javascript
// src/components/Portfolio/Portfolio.jsx
import { useState } from 'react';
import usePortfolioData from '../../hooks/usePortfolioData';
import { TrendingUp, TrendingDown, PieChart, DollarSign, BarChart3, ChevronDown } from 'lucide-react';

const Portfolio = () => {
  const { data, loading, error } = usePortfolioData();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  if (loading) {
    return (
      <div className="portfolio-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const totalAllocation = data.allocations.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="portfolio-container">
      <header className="portfolio-header">
        <h1>Portfolio Overview</h1>
        <div className="portfolio-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'allocations' ? 'active' : ''}`}
            onClick={() => setActiveTab('allocations')}
          >
            Allocations
          </button>
          <button
            className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="portfolio-overview">
          <div className="portfolio-performance">
            <div className="performance-card">
              <div className="performance-header">
                <h3>Total Return</h3>
                <TrendingUp className="performance-icon" />
              </div>
              <div className="performance-value">{formatPercentage(data.performance.totalReturn)}</div>
              <div className="performance-label">vs Benchmark {formatPercentage(data.performance.benchmark)}</div>
            </div>

            <div className="performance-card">
              <div className="performance-header">
                <h3>Daily Change</h3>
                {data.performance.dailyChange >= 0 ? (
                  <TrendingUp className="performance-icon positive" />
                ) : (
                  <TrendingDown className="performance-icon negative" />
                )}
              </div>
              <div className={`performance-value ${data.performance.dailyChange >= 0 ? 'positive' : 'negative'}`}>
                {formatPercentage(data.performance.dailyChange)}
              </div>
            </div>

            <div className="performance-card">
              <div className="performance-header">
                <h3>P&L</h3>
                <DollarSign className="performance-icon" />
              </div>
              <div className="performance-value">{formatCurrency(data.pnl.current)}</div>
              <div className="performance-label">
                Initial: {formatCurrency(data.pnl.initial)} | Profit: {formatCurrency(data.pnl.current - data.pnl.initial)}
              </div>
            </div>
          </div>

          <div className="portfolio-chart">
            <div className="chart-header">
              <h3>Performance Chart</h3>
              <BarChart3 className="chart-icon" />
            </div>
            <div className="chart-placeholder">
              <div className="chart-grid">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="chart-bar">
                    <div className="bar-fill" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                  </div>
                ))}
              </div>
              <div className="chart-labels">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'allocations' && (
        <div className="portfolio-allocations">
          <div className="allocations-summary">
            <h3>Asset Allocation</h3>
            <div className="allocation-total">
              <PieChart className="allocation-icon" />
              <span>Total: {totalAllocation}%</span>
            </div>
          </div>

          <div className="allocations-chart">
            <div className="allocation-pie">
              {data.allocations.map((item, index) => (
                <div
                  key={index}
                  className="allocation-segment"
                  style={{
                    background: `conic-gradient(${item.color} 0% ${item.value * 3.6}%, transparent ${item.value * 3.6}% 100%)`,
                    transform: `rotate(${index * (360 / data.allocations.length)}deg)`
                  }}
                ></div>
              ))}
              <div className="allocation-center"></div>
            </div>

            <div className="allocation-legend">
              {data.allocations.map((item, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <div className="legend-info">
                    <div className="legend-name">{item.name}</div>
                    <div className="legend-value">{item.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="portfolio-transactions">
          <div className="transactions-header">
            <h3>Transaction History</h3>
            <div className="transaction-count">{data.pnl.transactions.length} transactions</div>
          </div>

          <div className="transactions-list">
            {data.pnl.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`transaction-item ${expandedTransaction === transaction.id ? 'expanded' : ''}`}
                onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}
              >
                <div className="transaction-main">
                  <div className="transaction-date">{transaction.date}</div>
                  <div className="transaction-symbol">{transaction.symbol}</div>
                  <div className={`transaction-type ${transaction.type}`}>{transaction.type}</div>
                  <div className="transaction-shares">{transaction.shares} shares</div>
                  <div className="transaction-price">{formatCurrency(transaction.price)}</div>
                </div>

                {expandedTransaction === transaction.id && (
                  <div className="transaction-details">
                    <div className="detail-row">
                      <span>Fees:</span>
                      <span>{formatCurrency(transaction.fees)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Total:</span>
                      <span>{formatCurrency(transaction.price * transaction.shares + transaction.fees)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
```

```css
/* src/components/Portfolio/Portfolio.css */
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --border: rgba(255, 255, 255, 0.07);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
}

.portfolio-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  min-height: 100vh;
  padding: 1rem;
}

.portfolio-header {
  margin-bottom: 1.5rem;
}

.portfolio-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--t1);
}

.portfolio-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}

.tab-button {
  background: none;
  border: none;
  color: var(--t2);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tab-button.active {
  color: var(--green);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background-color: var(--green);
  border-radius: 50%;
}

.portfolio-overview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.portfolio-performance {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.performance-card {
  background-color: var(--bg2);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--border);
}

.performance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.performance-header h3 {
  font-size: 0.8rem;
  color: var(--t2);
  font-weight: 500;
}

.performance-icon {
  width: 1rem;
  height: 1rem;
}

.performance-value {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.performance-value.positive {
  color: var(--green);
}

.performance-value.negative {
  color: #ff4444;
}

.performance-label {
  font-size: 0.7rem;
  color: var(--t3);
}

.portfolio-chart {
  background-color: var(--bg2);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--border);
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.chart-header h3 {
  font-size: 0.9rem;
  font-weight: 500;
}

.chart-icon {
  width: 1rem;
  height: 1rem;
  color: var(--green);
}

.chart-placeholder {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.chart-grid {
  display: flex;
  gap: 0.5rem;
  height: 80px;
  align-items: flex-end;
}

.chart-bar {
  flex: 1;
  background-color: var(--bg3);
  border-radius: 0.25rem;
  position: relative;
}

.bar-fill {
  width: 100%;
  background-color: var(--green);
  border-radius: 0.25rem;
  transition: height 0.3s ease;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: var(--t3);
}

.portfolio-allocations {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.allocations-summary {
  background-color: var(--bg2);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--border);
}

.allocations-summary h3 {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.allocation-total {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--t2);
}

.allocation-icon {
  width: 1rem;
  height: 1rem;
  color: var(--green);
}

.allocations-chart {
  background-color: var(--bg2);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--border);
}

.allocation-pie {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  position: relative;
}

.allocation-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transform-origin: center;
  clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%);
}

.allocation-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  background-color: var(--bg2);
  border-radius: 50%;
}

.allocation-legend {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
}

.legend-info {
  flex: 1;
}

.legend-name {