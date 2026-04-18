Je vais créer le fichier `SportsTabs.jsx` avec des tabs horizontaux scrollables et un indicateur actif (underline neon).

```jsx
import React from 'react';
import './SportsTabs.css';

const SportsTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'PSG', label: 'PSG' },
    { id: 'NBA', label: 'NBA' },
    { id: 'NFL', label: 'NFL' },
    { id: 'UFC', label: 'UFC' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="sports-tabs-container">
      <div className="sports-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <div
          className="active-indicator"
          style={{
            transform: `translateX(${tabs.findIndex(t => t.id === activeTab) * 100}%)`
          }}
        />
      </div>
    </div>
  );
};

export default SportsTabs;
```

```css
.sports-tabs-container {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sports-tabs-container::-webkit-scrollbar {
  display: none;
}

.sports-tabs {
  display: flex;
  position: relative;
  width: max-content;
  min-width: 100%;
  background-color: var(--bg2);
  border-bottom: 1px solid var(--border);
  padding: 8px 0;
  gap: 16px;
}

.tab-button {
  position: relative;
  background: transparent;
  border: none;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--t2);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s ease;
  z-index: 1;
}

.tab-button:hover {
  color: var(--t1);
}

.tab-button.active {
  color: var(--green);
}

.active-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 60px;
  background-color: var(--green);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease;
  z-index: 0;
}

@media (max-width: 600px) {
  .sports-tabs {
    gap: 12px;
  }

  .tab-button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .active-indicator {
    width: 50px;
  }
}