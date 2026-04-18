src/components/SportsTabs.jsx
```jsx
import { useState, useEffect, useRef } from 'react';

const SportsTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'psg', label: 'PSG' },
    { id: 'nba', label: 'NBA' },
    { id: 'nfl', label: 'NFL' },
    { id: 'ufc', label: 'UFC' },
  ];

  const [active, setActive] = useState(activeTab || 'psg');
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef({});

  useEffect(() => {
    if (activeTab) {
      setActive(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (tabRefs.current[active]) {
      const tabElement = tabRefs.current[active];
      const { offsetLeft, offsetWidth } = tabElement;

      setUnderlineStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [active]);

  const handleTabClick = (tabId) => {
    setActive(tabId);
    onTabChange(tabId);
  };

  return (
    <div className="sports-tabs-container">
      <div className="sports-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            className={`sports-tab ${active === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <div className="sports-tabs-underline" style={underlineStyle} />
      </div>
    </div>
  );
};

export default SportsTabs;
```

---

src/components/SportsTabs.css
```css
.sports-tabs-container {
  width: 100%;
  padding: 0 1rem;
  margin-bottom: 1.5rem;
}

.sports-tabs {
  position: relative;
  display: flex;
  gap: 1.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sports-tabs::-webkit-scrollbar {
  display: none;
}

.sports-tab {
  position: relative;
  background: transparent;
  border: none;
  padding: 0.75rem 0;
  color: var(--t2);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
  white-space: nowrap;
  z-index: 1;
}

.sports-tab:hover {
  color: var(--t1);
}

.sports-tab.active {
  color: var(--green);
}

.sports-tabs-underline {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--green);
  border-radius: 1px;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}
```

---

src/pages/Sports.jsx
```jsx
import { useState } from 'react';
import SportsTabs from '../components/SportsTabs';

const Sports = () => {
  const [activeTab, setActiveTab] = useState('psg');

  return (
    <div className="sports-page">
      <header className="sports-header">
        <h1 className="sports-title">Sports</h1>
        <SportsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </header>

      <main className="sports-content">
        {activeTab === 'psg' && (
          <div className="sports-section">
            <h2 className="sports-section-title">PSG</h2>
            <p className="sports-section-text">Paris Saint-Germain content will be displayed here.</p>
          </div>
        )}

        {activeTab === 'nba' && (
          <div className="sports-section">
            <h2 className="sports-section-title">NBA</h2>
            <p className="sports-section-text">NBA content will be displayed here.</p>
          </div>
        )}

        {activeTab === 'nfl' && (
          <div className="sports-section">
            <h2 className="sports-section-title">NFL</h2>
            <p className="sports-section-text">NFL content will be displayed here.</p>
          </div>
        )}

        {activeTab === 'ufc' && (
          <div className="sports-section">
            <h2 className="sports-section-title">UFC</h2>
            <p className="sports-section-text">UFC content will be displayed here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Sports;
```

---
src/pages/Sports.css
```css
.sports-page {
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.sports-header {
  padding: 1rem;
}

.sports-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--t1);
}

.sports-content {
  padding: 0 1rem;
}

.sports-section {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: var(--bg2);
}

.sports-section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--t1);
}

.sports-section-text {
  font-size: 1rem;
  color: var(--t2);
}