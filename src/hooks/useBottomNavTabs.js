import { useState, useEffect } from 'react';

const useBottomNavTabs = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newsBadges, setNewsBadges] = useState({
    sports: 0,
    markets: 0,
    news: 0,
    agents: 0,
    portfolio: 0,
    cryptoTrader: 0,
    signals: 0,
  });

  // Simulate news badge updates (replace with real API calls)
  useEffect(() => {
    const interval = setInterval(() => {
      setNewsBadges(prev => ({
        sports: Math.random() > 0.7 ? prev.sports + 1 : prev.sports,
        markets: Math.random() > 0.6 ? prev.markets + 1 : prev.markets,
        news: Math.random() > 0.8 ? prev.news + 1 : prev.news,
        agents: Math.random() > 0.5 ? prev.agents + 1 : prev.agents,
        portfolio: Math.random() > 0.4 ? prev.portfolio + 1 : prev.portfolio,
        cryptoTrader: Math.random() > 0.6 ? prev.cryptoTrader + 1 : prev.cryptoTrader,
        signals: Math.random() > 0.7 ? prev.signals + 1 : prev.signals,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', badge: 0 },
    { id: 'sports', label: 'Sports', icon: 'Trophy', badge: newsBadges.sports },
    { id: 'markets', label: 'Markets', icon: 'TrendingUp', badge: newsBadges.markets },
    { id: 'news', label: 'News', icon: 'Newspaper', badge: newsBadges.news },
    { id: 'agents', label: 'Agents', icon: 'Bot', badge: newsBadges.agents },
    { id: 'portfolio', label: 'Portfolio', icon: 'PieChart', badge: newsBadges.portfolio },
    { id: 'cryptoTrader', label: 'CryptoTrader', icon: 'TrendingUp', badge: newsBadges.cryptoTrader },
    { id: 'signals', label: 'Signals', icon: 'Bell', badge: newsBadges.signals },
  ];

  return {
    activeTab,
    setActiveTab,
    newsBadges,
    tabs,
  };
};

export default useBottomNavTabs;