// src/pages/Dashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, TrendingUp, TrendingDown, Newspaper, Settings, Plus, Minus } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [news, setNews] = useState([]);
  const [movers, setMovers] = useState([]);
  const [fearGreed, setFearGreed] = useState({ value: 50, label: 'Neutral' });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPortfolioValue(42893.24);
      setPortfolioChange(3.12);
      setNews(Array.from({ length: 5 }, (_, i) => ({
        id: i,
        title: `News article ${i + 1} about market trends and economic outlook`,
        source: `Source ${i + 1}`,
        time: '2 min ago'
      })));
      setMovers(Array.from({ length: 8 }, (_, i) => ({
        symbol: ['BTC', 'ETH', 'SOL', 'TSLA', 'NVDA', 'AMZN', 'AAPL', 'GOOGL'][i],
        change: Math.random() * 10 - 5,
        price: 100 + Math.random() * 50
      })));
      setFearGreed({ value: Math.floor(Math.random() * 100), label: Math.random() > 0.5 ? 'Fear' : 'Greed' });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const FearGreedGauge = useMemo(() => {
    const radius = 40;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const offset = circumference - (fearGreed.value / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-2">
        <svg width="100" height="100" className="transform -rotate-90">
          <circle
            stroke="#333"
            strokeWidth={strokeWidth}
            fill="none"
            r={normalizedRadius}
            cx="50"
            cy="50"
          />
          <circle
            stroke="var(--neon)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            r={normalizedRadius}
            cx="50"
            cy="50"
          />
        </svg>
        <div className="text-sm font-medium">{fearGreed.label}</div>
        <div className="text-xs text-text-muted">{fearGreed.value}/100</div>
      </div>
    );
  }, [fearGreed]);

  const Sparkline = useMemo(() => {
    const points = Array.from({ length: 7 }, (_, i) => ({
      x: i * 10,
      y: 10 + Math.random() * 5
    }));

    const pathData = points.map((p, i) =>
      i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`
    ).join(' ');

    return (
      <svg width="100" height="40" className="text-neon">
        <path d={pathData} fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }, []);

  const QuickAction = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-surface hover:bg-surface-high transition-colors"
    >
      <Icon size={20} className="text-neon" />
      <span className="text-xs">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold">Dashboard</h1>
          <div className="w-8 h-8 bg-surface rounded-full animate-pulse"></div>
        </div>

        <div className="bg-surface rounded-xl p-4 animate-pulse">
          <div className="flex justify-between items-center mb-2">
            <div className="w-20 h-4 bg-surface-low rounded"></div>
            <div className="w-12 h-4 bg-surface-low rounded"></div>
          </div>
          <div className="w-full h-20 bg-surface-low rounded"></div>
        </div>

        <div className="bg-surface rounded-xl p-4 animate-pulse">
          <div className="flex gap-2 mb-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 h-8 bg-surface-low rounded"></div>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-32 h-20 bg-surface-low rounded flex-shrink-0"></div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 animate-pulse">
          <div className="flex gap-2 mb-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex-1 h-6 bg-surface-low rounded"></div>
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex-1 h-16 bg-surface-low rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <button onClick={() => navigate('/settings')}>
          <Settings size={20} className="text-text-primary" />
        </button>
      </div>

      {/* Hero Portfolio */}
      <div className="bg-surface rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-secondary">Portfolio</span>
          <span className="text-xs text-text-muted">7 days</span>
        </div>
        <div className="text-2xl font-bold text-text-primary">
          ${portfolioValue.toLocaleString()}
        </div>
        <div className={`flex items-center gap-1 text-sm ${portfolioChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {portfolioChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(portfolioChange)}%
        </div>
        <div className="mt-3">
          <Sparkline />
        </div>
      </div>

      {/* Top Movers */}
      <div className="bg-surface rounded-xl p-4">
        <h2 className="text-sm font-medium mb-3">Top Movers</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {movers.map((mover, i) => (
            <div key={i} className="min-w-[100px] bg-surface-low rounded-lg p-3 flex-shrink-0">
              <div className="text-sm font-medium">{mover.symbol}</div>
              <div className={`text-sm ${mover.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {mover.change >= 0 ? '+' : ''}{mover.change.toFixed(2)}%
              </div>
              <div className="text-xs text-text-muted">${mover.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fear & Greed */}
      <div className="bg-surface rounded-xl p-4 flex justify-between items-center">
        <div>
          <div className="text-sm font-medium">Fear & Greed</div>
          <div className="text-xs text-text-muted">Market sentiment</div>
        </div>
        {FearGreedGauge}
      </div>

      {/* News Feed */}
      <div className="bg-surface rounded-xl p-4 flex-1 overflow-hidden">
        <h2 className="text-sm font-medium mb-3">News</h2>
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
          {news.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-8 h-8 bg-surface-low rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">{item.title}</div>
                <div className="flex justify-between items-center text-xs text-text-muted mt-1">
                  <span>{item.source}</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <QuickAction
          icon={Plus}
          label="Buy"
          onClick={() => navigate('/markets')}
        />
        <QuickAction
          icon={Minus}
          label="Sell"
          onClick={() => navigate('/markets')}
        />
        <QuickAction
          icon={TrendingUp}
          label="Trade"
          onClick={() => navigate('/signals')}
        />
        <QuickAction
          icon={Newspaper}
          label="News"
          onClick={() => navigate('/news')}
        />
      </div>
    </div>
  );
};

export default Dashboard;