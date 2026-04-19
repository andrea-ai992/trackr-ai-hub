// src/components/NewsTabs.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NewsTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('general');
  const tabsRef = useRef(null);
  const indicatorRef = useRef(null);

  const tabs = [
    { id: 'general', label: 'Général', path: '/news/general' },
    { id: 'tech', label: 'Tech', path: '/news/tech' },
    { id: 'sports', label: 'Sports', path: '/news/sports' },
    { id: 'business', label: 'Business', path: '/news/business' },
    { id: 'politics', label: 'Politique', path: '/news/politics' },
    { id: 'entertainment', label: 'Divertissement', path: '/news/entertainment' },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    const activeTabId = tabs.find(tab => tab.path === currentPath)?.id || 'general';
    setActiveTab(activeTabId);

    if (indicatorRef.current) {
      const activeTabElement = tabsRef.current?.querySelector(`[data-tab="${activeTabId}"]`);
      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;
        indicatorRef.current.style.width = `${offsetWidth}px`;
        indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
      }
    }
  }, [location.pathname]);

  const handleTabClick = (tabId, path) => {
    setActiveTab(tabId);
    navigate(path);
  };

  const handleScroll = () => {
    if (indicatorRef.current) {
      const scrollLeft = tabsRef.current?.scrollLeft || 0;
      indicatorRef.current.style.transform = `translateX(calc(${indicatorRef.current.dataset.translateX}px + ${scrollLeft}px))`;
    }
  };

  return (
    <div className="news-tabs-container">
      <div
        className="news-tabs-scroll"
        ref={tabsRef}
        onScroll={handleScroll}
      >
        <div className="news-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`news-tab ${activeTab === tab.id ? 'active' : ''}`}
              data-tab={tab.id}
              onClick={() => handleTabClick(tab.id, tab.path)}
            >
              {tab.label}
            </button>
          ))}
          <div
            ref={indicatorRef}
            className="news-tab-indicator"
            data-translate-x={(() => {
              const activeTabElement = tabsRef.current?.querySelector(`[data-tab="${activeTab}"]`);
              return activeTabElement ? activeTabElement.offsetLeft : 0;
            })()}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsTabs;