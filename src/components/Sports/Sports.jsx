// src/components/Sports/Sports.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ESPNLiveScores from './ESPNLiveScores';

export default function Sports() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live');
  const tabs = [
    { id: 'live', label: 'Live' },
    { id: 'psg', label: 'PSG' },
    { id: 'nfl', label: 'NFL' },
    { id: 'nba', label: 'NBA' },
    { id: 'ufc', label: 'UFC' },
    { id: 'news', label: 'News' },
  ];

  return (
    <div className="sports-container">
      <header className="sports-header">
        <h1>Sports</h1>
      </header>

      <nav className="sports-nav">
        <ul>
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sports-content">
        {activeTab === 'live' && <ESPNLiveScores />}
        {activeTab === 'psg' && <div className="placeholder">PSG Content</div>}
        {activeTab === 'nfl' && <div className="placeholder">NFL Content</div>}
        {activeTab === 'nba' && <div className="placeholder">NBA Content</div>}
        {activeTab === 'ufc' && <div className="placeholder">UFC Content</div>}
        {activeTab === 'news' && <div className="placeholder">News Content</div>}
      </div>
    </div>
  );
}