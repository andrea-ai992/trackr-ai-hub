// src/components/SportsTabs.jsx
import { useState, useEffect } from 'react';

const SportsTabs = ({ items, activeTab, onTabChange }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeTab !== undefined) {
      const index = items.findIndex(item => item.id === activeTab);
      if (index !== -1) setActiveIndex(index);
    }
  }, [activeTab, items]);

  const handleTabClick = (index, id) => {
    setActiveIndex(index);
    onTabChange(id);
  };

  return (
    <div className="sports-tabs-container">
      <div className="sports-tabs">
        {items.map((item, index) => (
          <button
            key={item.id}
            className={`sports-tab ${index === activeIndex ? 'active' : ''}`}
            onClick={() => handleTabClick(index, item.id)}
            aria-label={item.label}
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
```

```css
/* src/components/SportsTabs.css */
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

.sports-tabs-container {
  width: 100%;
  padding: 0.5rem 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sports-tabs-container::-webkit-scrollbar {
  display: none;
}

.sports-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0 0.5rem;
  width: max-content;
}

.sports-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--t2);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  outline: none;
  white-space: nowrap;
}

.sports-tab:hover {
  background-color: rgba(0, 255, 136, 0.1);
  border-color: var(--green);
  color: var(--t1);
}

.sports-tab.active {
  background-color: var(--green);
  color: var(--bg);
  border-color: var(--green);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

.tab-icon {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
}

.tab-label {
  font-size: 0.9rem;
  font-weight: 500;
}

@media (min-width: 768px) {
  .sports-tab {
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
  }

  .tab-label {
    font-size: 1rem;
  }
}