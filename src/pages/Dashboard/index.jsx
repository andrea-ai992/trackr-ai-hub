import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, TrendingDown, Sparkles, Newspaper, Target, ChartLine, Bot, Wallet, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [topMovers, setTopMovers] = useState([]);
  const [fearGreed, setFearGreed] = useState({ value: 52, label: 'Neutral' });
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const portfolioData = await fetch('/api/portfolio').then(res => res.json());
        const moversData = await fetch('/api/movers').then(res => res.json());
        const fearGreedData = await fetch('/api/fear-greed').then(res => res.json());
        const newsData = await fetch('/api/news').then(res => res.json());

        setPortfolio(portfolioData);
        setTopMovers(moversData);
        setFearGreed(fearGreedData);
        setNews(newsData);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFearGreedColor = (value) => {
    if (value < 20) return '#ff4757';
    if (value < 40) return '#ff6b6b';
    if (value < 60) return '#ffd93d';
    if (value < 80) return '#2ed573';
    return '#1dd1a1';
  };

  const FearGreedGauge = ({ value }) => {
    const angle = (value / 100) * 180;
    const color = getFearGreedColor(value);

    return (
      <div className="w-48 h-24 flex flex-col items-center">
        <svg width="100" height="50" viewBox="0 0 100 50" className="mb-2">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="#444" />
            </linearGradient>
          </defs>
          <path d="M 10 40 A 30 30 0 0 1 90 40" stroke="url(#gaugeGradient)" strokeWidth="3" fill="none" />
          <path d="M 10 40 A 30 30 0 0 1 90 40" stroke="#222" strokeWidth="3" fill="none" strokeDasharray="2,2" />
          <line x1="50" y1="40" x2="50" y2="10" stroke={color} strokeWidth="3" transform={`rotate(${angle} 50 40)`} />
          <circle cx="50" cy="40" r="4" fill={color} />
        </svg>
        <div className="text-xs text-center">
          <div className="font-bold" style={{ color }}>{value}</div>
          <div className="text-[10px] text-gray-400">{fearGreed.label}</div>
        </div>
      </div>
    );
  };

  const Sparkline = ({ data }) => {
    if (!data || data.length === 0) return <svg width="60" height="20" viewBox="0 0 60 20" />;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 50 + 5;
      const y = 15 - ((val - min) / range) * 12;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="60" height="20" viewBox="0 0 60 20">
        <polyline points={points} fill="none" stroke="#00ff88" strokeWidth="1.5" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-[#e0e0e0] p-4 pt-20">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-[#111] rounded animate-pulse" />
          <div className="h-32 w-full bg-[#111] rounded animate-pulse" />
          <div className="h-24 w-full bg-[#111] rounded animate-pulse" />
          <div className="h-48 w-full bg-[#111] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#e0e0e0] p-4 pt-20 font-['JetBrains_Mono']">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-bold">Bonjour Andrea</h1>
          <p className="text-sm text-[#aaa]">{new Date().toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#aaa]">LIVE</span>
          <div className="w-3 h-3 bg-[#00ff88] rounded-full animate-pulse" />
        </div>
      </header>

      {/* Hero Card */}
      <div className="mb-6 fade-in">
        <div className="bg-[#0f0f0f]/40 backdrop-blur-xl rounded-xl p-6 border border-[--border]">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-[#aaa] mb-1">Portfolio Value</p>
              <p className="text-3xl font-bold text-[#e0e0e0]">
                ${portfolio?.total?.toLocaleString() || '0.00'}
              </p>
              <p className={`text-sm flex items-center gap-1 ${portfolio?.change >= 0 ? 'text-[#00ff88]' : 'text-[#ff4757]'}`}>
                {portfolio?.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {portfolio?.change?.toFixed(2)}%
              </p>
            </div>
            <div className="w-24 h-12">
              <Sparkline data={portfolio?.sparkline} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Movers */}
      <section className="mb-6 fade-in" style={{ animationDelay: '60ms' }}>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Sparkles size={16} /> Top Movers
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {topMovers.map((item, i) => (
            <div key={i} className="flex-shrink-0 w-32 bg-[#111]/40 backdrop-blur-xl rounded-xl p-3 border border-[--border] animate-pulse-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                  {item.symbol.substring(0, 2)}
                </div>
                <span className="text-xs text-[#aaa]">{item.symbol}</span>
              </div>
              <p className="text-sm font-bold">${item.price.toFixed(2)}</p>
              <p className={`text-xs ${item.change >= 0 ? 'text-[#00ff88]' : 'text-[#ff4757]'}`}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Fear & Greed */}
      <section className="mb-6 fade-in" style={{ animationDelay: '120ms' }}>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <AlertTriangle size={16} /> Fear & Greed
        </h2>
        <div className="flex items-center gap-4">
          <FearGreedGauge value={fearGreed.value} />
          <div className="flex-1 bg-[#111]/40 backdrop-blur-xl rounded-xl p-4 border border-[--border]">
            <div className="flex justify-between items-center">
              <span className="text-sm">Extreme Fear</span>
              <span className="text-sm">Extreme Greed</span>
            </div>
            <div className="w-full h-1 bg-[#222] rounded-full mt-2">
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${fearGreed.value}%`,
                  background: getFearGreedColor(fearGreed.value)
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* News Feed */}
      <section className="mb-6 fade-in" style={{ animationDelay: '180ms' }}>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Newspaper size={16} /> News Feed
        </h2>
        <div className="space-y-3">
          {news.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-[#111]/40 backdrop-blur-xl rounded-xl border border-[--border]">
              <div className={`w-2 h-2 rounded-full mt-2 ${item.source === 'Bloomberg' ? 'bg-blue-500' : item.source === 'Reuters' ? 'bg-red-500' : 'bg-green-500'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <div className="flex items-center gap-2 text-xs text-[#aaa] mt-1">
                  <span className="bg-[#0f0f0f] px-2 py-0.5 rounded text-[10px]">{item.source}</span>
                  <span>{item.time}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#aaa]" />
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="fade-in" style={{ animationDelay: '240ms' }}>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Target size={16} /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Markets', icon: ChartLine, path: '/markets' },
            { name: 'Portfolio', icon: Wallet, path: '/portfolio' },
            { name: 'Signals', icon: Sparkles, path: '/signals' },
            { name: 'AnDy', icon: Bot, path: '/andy' }
          ].map((action, i) => (
            <Link
              key={i}
              to={action.path}
              className="flex items-center gap-3 p-4 bg-[#111]/40 backdrop-blur-xl rounded-xl border border-[--border] hover:bg-[#1a1a1a]/60 transition-all duration-200"
            >
              <action.icon size={20} className="text-[#00ff88]" />
              <span className="font-medium">{action.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;