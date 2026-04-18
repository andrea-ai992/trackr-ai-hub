import { useState, useEffect } from 'react';

const HeroCardPortfolio = ({ portfolioData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [cryptoData, setCryptoData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [dailyChange, setDailyChange] = useState(0);
  const [weeklyChange, setWeeklyChange] = useState(0);

  useEffect(() => {
    if (!portfolioData) return;

    const calculateMetrics = () => {
      let total = 0;
      let daily = 0;
      let weekly = 0;

      portfolioData.assets.forEach(asset => {
        total += asset.value;

        if (asset.type === 'crypto') {
          daily += asset.daily_change * asset.quantity;
          weekly += asset.weekly_change * asset.quantity;
        } else if (asset.type === 'stock') {
          daily += asset.daily_change * asset.quantity * asset.price;
          weekly += asset.weekly_change * asset.quantity * asset.price;
        }
      });

      setTotalValue(total);
      setDailyChange(daily);
      setWeeklyChange(weekly);
    };

    calculateMetrics();
  }, [portfolioData]);

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

  return (
    <div className="herocard-portfolio">
      <div className="portfolio-header">
        <h2>Portfolio Overview</h2>
        <div className="portfolio-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            Assets
          </button>
          <button
            className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
        </div>
      </div>

      <div className="portfolio-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="portfolio-value">
              <div className="value-amount">{formatCurrency(totalValue)}</div>
              <div className="value-change">
                <span className={dailyChange >= 0 ? 'positive' : 'negative'}>
                  {dailyChange >= 0 ? '▲' : '▼'} {formatPercentage(Math.abs(dailyChange))} today
                </span>
                <span className={weeklyChange >= 0 ? 'positive' : 'negative'}>
                  {weeklyChange >= 0 ? '▲' : '▼'} {formatPercentage(Math.abs(weeklyChange))} weekly
                </span>
              </div>
            </div>

            <div className="portfolio-breakdown">
              {portfolioData?.breakdown?.map((item, index) => (
                <div key={index} className="breakdown-item">
                  <div className="breakdown-label">
                    <div className="label-color" style={{ backgroundColor: item.color }}></div>
                    <span>{item.label}</span>
                  </div>
                  <div className="breakdown-percentage">{item.percentage}%</div>
                  <div className="breakdown-value">{formatCurrency(item.value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="assets-section">
            {portfolioData?.assets?.map((asset, index) => (
              <div key={index} className="asset-card">
                <div className="asset-info">
                  <div className="asset-icon">
                    {asset.type === 'crypto' ? (
                      <span className="crypto-icon">{asset.symbol}</span>
                    ) : (
                      <span className="stock-icon">{asset.symbol}</span>
                    )}
                  </div>
                  <div className="asset-details">
                    <div className="asset-name">{asset.name}</div>
                    <div className="asset-type">{asset.type}</div>
                  </div>
                </div>
                <div className="asset-metrics">
                  <div className="asset-price">{formatCurrency(asset.price)}</div>
                  <div className={`asset-change ${asset.daily_change >= 0 ? 'positive' : 'negative'}`}>
                    {asset.daily_change >= 0 ? '▲' : '▼'} {formatPercentage(asset.daily_change)}
                  </div>
                </div>
                <div className="asset-quantity">Qty: {asset.quantity.toFixed(4)}</div>
                <div className="asset-value">{formatCurrency(asset.value)}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="performance-section">
            <div className="performance-metrics">
              <div className="metric-card">
                <div className="metric-label">Total Value</div>
                <div className="metric-value">{formatCurrency(totalValue)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Daily Change</div>
                <div className={`metric-value ${dailyChange >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercentage(dailyChange)}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Weekly Change</div>
                <div className={`metric-value ${weeklyChange >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercentage(weeklyChange)}
                </div>
              </div>
            </div>

            <div className="performance-chart">
              <div className="chart-placeholder">
                <div className="chart-title">Portfolio Performance</div>
                <div className="chart-legend">
                  <span className="legend-item">Crypto</span>
                  <span className="legend-item">Stocks</span>
                  <span className="legend-item">Others</span>
                </div>
                <div className="chart-grid">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="chart-bar">
                      <div className="bar-value"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroCardPortfolio;