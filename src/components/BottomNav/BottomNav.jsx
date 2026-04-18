import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Sports, Market, News, More } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [unreadNews, setUnreadNews] = useState(true); // Simule des nouvelles non lues

  const tabs = [
    { name: 'home', label: 'Home', icon: <Home size={22} /> },
    { name: 'sports', label: 'Sports', icon: <Sports size={22} /> },
    { name: 'markets', label: 'Markets', icon: <Market size={22} /> },
    { name: 'news', label: 'News', icon: <News size={22} />, hasBadge: unreadNews },
    { name: 'more', label: 'More', icon: <More size={22} /> },
  ];

  return (
    <div className="bottom-nav">
      <div className="tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={`/${tab.name}`}
            className={`tab ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.hasBadge && <span className="badge">!</span>}
            <div className="pill" />
            {tab.icon}
            <span className="label">{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNav; 

// BottomNav.css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(8, 8, 8, 0.92);
  backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  justify-content: center;
  z-index: 1000;
}

.tabs {
  display: flex;
  width: 100%;
  height: 100%;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--t3);
  position: relative;
  transition: transform 300ms ease;
}

.tab.active {
  color: var(--green);
}

.tab .pill {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 255, 136, 0.12);
  border-radius: 12px;
  padding: 6px 16px;
  transition: transform 300ms ease;
  transform: translateY(0);
}

.tab.active .pill {
  transform: translateY(-10px);
}

.label {
  font-size: 9px;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: red;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  margin-right: 4px;
}