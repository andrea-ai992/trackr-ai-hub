// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingUp, TrendingDown, Clock, Newspaper, Plane, TrendingUpDown, Bot } from "lucide-react";
import { NewsCard } from "../components/NewsCard";

const SOURCE_COLORS = {
  BBC: "#e60026",
  Bloomberg: "#00ff88",
  CoinDesk: "#f7931a",
  "Le Monde": "#003189",
  Reuters: "#ff8000",
};

const CRYPTO_MOVERS = [
  { name: "BTC", symbol: "₿", change: 2.45, color: "#f7931a" },
  { name: "ETH", symbol: "Ξ", change: -1.23, color: "#627eea" },
  { name: "SOL", symbol: "◎", change: 3.78, color: "#00d4ff" },
];

const NEWS_ITEMS = [
  {
    title: "Bitcoin ETFs See Record Inflows as Market Recovers",
    description: "Institutional investors are pouring money into Bitcoin ETFs, signaling renewed confidence in the cryptocurrency market.",
    url: "#",
    urlToImage: "https://picsum.photos/seed/bitcoin-etf/120/80",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: "CoinDesk" },
    category: "Crypto"
  },
  {
    title: "Federal Reserve Holds Interest Rates Steady",
    description: "The Federal Reserve has decided to keep interest rates unchanged, citing stable economic conditions.",
    url: "#",
    urlToImage: "https://picsum.photos/seed/fed/120/80",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: "Bloomberg" },
    category: "Finance"
  },
  {
    title: "PSG Signs New Star Striker for Record Fee",
    description: "Paris Saint-Germain has completed the signing of a world-class striker for a transfer fee of over €100 million.",
    url: "#",
    urlToImage: "https://picsum.photos/seed/psg/120/80",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    source: { name: "BBC" },
    category: "Sports"
  }
];

const FEAR_GREED_DATA = {
  value: 72,
  status: "Greed",
  color: "#00ff88"
};

export default function Dashboard() {
  const [portfolioValue, setPortfolioValue] = useState(12456.78);
  const [dailyChange, setDailyChange] = useState(2.45);
  const [isPositive, setIsPositive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolioValue(prev => {
        const change = (Math.random() * 4 - 2).toFixed(2);
        setDailyChange(parseFloat(change));
        setIsPositive(parseFloat(change) >= 0);
        return parseFloat((prev + parseFloat(change)).toFixed(2));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const FearGreedGauge = () => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (FEAR_GREED_DATA.value / 100) * circumference;

    return (
      <div className="gauge-container">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--surface-low)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={FEAR_GREED_DATA.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontFamily="JetBrains Mono">
            {FEAR_GREED_DATA.value}
          </text>
          <text x="50" y="70" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="JetBrains Mono">
            {FEAR_GREED_DATA.status}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="hero-section">
        <div className="portfolio-card">
          <div className="portfolio-header">
            <h2>Portfolio</h2>
            <div className="portfolio-value">
              <span className="value">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? <ArrowUpRight size={16} /> : <ArrowUpRight size={16} style={{ transform: 'rotate(180deg)' }} />}
                {dailyChange}%
              </span>
            </div>
          </div>
          <div className="portfolio-details">
            <div className="portfolio-chart">
              <svg width="100" height="40" viewBox="0 0 100 40">
                <polyline
                  points="0,30 10,25 20,28 30,20 40,22 50,18 60,15 70,10 80,12 90,8 100,5"
                  fill="none"
                  stroke="var(--neon)"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="crypto-movers">
        <div className="movers-header">
          <h3>Crypto Movers</h3>
          <Link to="/markets" className="view-all">View All</Link>
        </div>
        <div className="movers-list">
          {CRYPTO_MOVERS.map((crypto, index) => (
            <div key={index} className="mover-item">
              <div className="mover-name">
                <span className="symbol">{crypto.symbol}</span>
                <span className="name">{crypto.name}</span>
              </div>
              <div className={`mover-change ${crypto.change >= 0 ? 'positive' : 'negative'}`}>
                {crypto.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(crypto.change)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fear-greed">
        <div className="fear-greed-header">
          <h3>Fear & Greed Index</h3>
          <div className="fear-greed-value">
            <FearGreedGauge />
          </div>
        </div>
      </div>

      <div className="news-section">
        <div className="news-header">
          <h3>Latest News</h3>
          <Link to="/news" className="view-all">View All</Link>
        </div>
        <div className="news-list">
          {NEWS_ITEMS.map((article, index) => (
            <NewsCard key={index} article={article} />
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/flights" className="action-card">
            <Plane size={24} />
            <span>Flights</span>
          </Link>
          <Link to="/markets" className="action-card">
            <TrendingUpDown size={24} />
            <span>Markets</span>
          </Link>
          <Link to="/sports" className="action-card">
            <TrendingUp size={24} />
            <span>Sports</span>
          </Link>
          <Link to="/andy" className="action-card">
            <Bot size={24} />
            <span>AnDy</span>
          </Link>
        </div>
      </div>
    </div>
  );
}