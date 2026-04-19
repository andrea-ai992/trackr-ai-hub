// src/components/SportsTabs.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SportsTabs = ({ items, activeTab, onTabChange }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (activeTab !== undefined) {
      const index = items.findIndex(item => item.id === activeTab);
      if (index !== -1) {
        setActiveIndex(index);
        if (tabsRef.current) {
          const tabElement = tabsRef.current.children[index];
          if (tabElement) {
            tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }
    }
  }, [activeTab, items]);

  useEffect(() => {
    const currentPath = location.pathname;
    const tabMatch = currentPath.match(/\/sports\/([^/]+)/);
    if (tabMatch) {
      const tabId = tabMatch[1];
      const index = items.findIndex(item => item.id === tabId);
      if (index !== -1) {
        setActiveIndex(index);
      }
    }
  }, [location.pathname, items]);

  const handleTabClick = (index, id) => {
    setActiveIndex(index);
    onTabChange(id);
    navigate(`/sports/${id}`);
  };

  return (
    <div className="sports-tabs-container">
      <div className="sports-tabs" ref={tabsRef}>
        {items.map((item, index) => (
          <button
            key={item.id}
            className={`sports-tab ${index === activeIndex ? 'active' : ''}`}
            onClick={() => handleTabClick(index, item.id)}
            aria-label={item.label}
            aria-current={index === activeIndex ? 'page' : undefined}
          >
            <span className="tab-icon">{item.icon}</span>
            <span className="tab-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const SportsTabsWrapper = ({ defaultTab, items, onTabChange }) => {
  return (
    <SportsTabs
      items={items}
      activeTab={defaultTab}
      onTabChange={onTabChange}
    />
  );
};

export default SportsTabsWrapper;