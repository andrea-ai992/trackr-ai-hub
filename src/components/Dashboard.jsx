Je vais implémenter le composant `FearGreedGauge.jsx` avec une approche sécurisée et intégrée au design system existant.

```jsx
// src/components/FearGreedGauge.jsx
import React, { useEffect, useState } from 'react';
import { sanitizeInput } from '../utils/sanitize';

const FearGreedGauge = ({ value = 50, size = '100%', showLabel = true }) => {
  const [safeValue, setSafeValue] = useState(50);
  const [safeLabel, setSafeLabel] = useState('Neutral');

  useEffect(() => {
    const sanitizedValue = Math.max(0, Math.min(100, Math.round(Number(value))));
    setSafeValue(sanitizedValue);

    let label = 'Neutral';
    if (sanitizedValue < 25) label = 'Extreme Fear';
    else if (sanitizedValue < 40) label = 'Fear';
    else if (sanitizedValue > 75) label = 'Extreme Greed';
    else if (sanitizedValue > 60) label = 'Greed';

    setSafeLabel(sanitizeInput(label));
  }, [value]);

  const getColor = () => {
    if (safeValue < 25) return 'var(--fear)';
    if (safeValue < 40) return 'var(--fear-medium)';
    if (safeValue > 75) return 'var(--greed)';
    if (safeValue > 60) return 'var(--greed-medium)';
    return 'var(--neutral)';
  };

  const getPosition = () => {
    return `calc(${safeValue}% - 12px)`;
  };

  return (
    <div
      className="fear-greed-gauge-container"
      style={{
        width: size,
        maxWidth: '300px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        color: 'var(--t1)',
      }}
    >
      {showLabel && (
        <div
          className="gauge-label"
          style={{
            textAlign: 'center',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: getColor(),
          }}
        >
          {safeLabel}
        </div>
      )}

      <div
        className="gauge-background"
        style={{
          height: '24px',
          background: 'linear-gradient(90deg, var(--fear) 0%, var(--fear-medium) 25%, var(--neutral) 40%, var(--green) 60%, var(--greed-medium) 75%, var(--greed) 100%)',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="gauge-fill"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${safeValue}%`,
            background: 'var(--green)',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '12px',
          }}
        />

        <div
          className="gauge-pointer"
          style={{
            position: 'absolute',
            left: getPosition(),
            top: '50%',
            transform: 'translateY(-50%) translateX(-50%)',
            width: '24px',
            height: '24px',
            background: 'var(--bg)',
            border: '2px solid var(--green)',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0, 255, 136, 0.3)',
            zIndex: 2,
          }}
        />

        <div
          className="gauge-ticks"
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            transform: 'translateY(-50%)',
          }}
        >
          {[0, 25, 50, 75, 100].map((tick) => (
            <div
              key={tick}
              className="gauge-tick"
              style={{
                position: 'absolute',
                left: `${tick}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '1px',
                height: tick === safeValue ? '16px' : '8px',
                background: 'rgba(255, 255, 255, 0.3)',
                transition: 'height 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="gauge-scale"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          fontSize: '10px',
          color: 'var(--t3)',
        }}
      >
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
};

export default FearGreedGauge;
```

```css
/* src/styles/components/FearGreedGauge.css */
:root {
  --fear: #ff4d4d;
  --fear-medium: #ff8c42;
  --neutral: #888888;
  --greed-medium: #4caf50;
  --greed: #00e676;
}

.fear-greed-gauge-container {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}
```

```jsx
// src/components/Dashboard.jsx (modification pour intégrer le composant)
import React, { useState, useCallback, useMemo } from 'react';
import { sanitizeInput, sanitizeUsername, validateEmail, containsXSS } from '../utils/sanitize';
import FearGreedGauge from './FearGreedGauge';

const MOCK_STATS = {
  totalTracked: 1247,
  activeToday: 89,
  completedTasks: 342,
  pendingReview: 23,
};

const MOCK_ACTIVITIES = [
  { id: 1, type: 'tracking', message: 'New tracking entry added', timestamp: '2 min ago', user: 'alice_user' },
  { id: 2, type: 'note', message: 'Note updated on Project Alpha', timestamp: '15 min ago', user: 'bob_dev' },
  { id: 3, type: 'review', message: 'Review completed for Task #442', timestamp: '1 hour ago', user: 'carol_pm' },
  { id: 4, type: 'tracking', message: 'Weekly report generated', timestamp: '3 hours ago', user: 'dave_ops' },
];

function StatCard({ title, value, icon, color }) {
  const safeTitle = sanitizeInput(title);
  const safeValue = String(parseInt(value, 10) || 0);

  return (
    <div className="stat-card" style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
      flex: '1 1 200px',
      minWidth: '180px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', color: '#666', fontWeight: '500' }}>{safeTitle}</p>
          <h2 style={{ margin: '4px 0 0', fontSize: '32px', fontWeight: '700', color: '#1a1a2e' }}>{safeValue}</h2>
        </div>
        <span style={{ fontSize: '36px', opacity: 0.7 }} role="img" aria-label={safeTitle}>{icon}</span>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const safeMessage = sanitizeInput(activity.message);
  const safeUser = sanitizeUsername(activity.user);
  const safeTimestamp = sanitizeInput(activity.timestamp);

  const typeColors = {
    tracking: '#3b82f6',
    note: '#10b981',
    review: '#f59e0b',
    default: '#6366f1',
  };

  const typeIcons = {
    tracking: '📍',
    note: '📝',
    review: '✅',
    default: '🔔',
  };

  const color = typeColors[activity.type] || typeColors.default;
  const icon = typeIcons[activity.type] || typeIcons.default;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0',
      gap: '12px',
    }}>
      <span style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: color + '20',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
      }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#333' }}>{safeMessage}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>{safeTimestamp}</span>
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>{safeUser}</span>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [marketData, setMarketData] = useState({
    fearGreedIndex: 65,
    lastUpdated: 'Just now'
  });

  return (
    <div style={{
      padding: '20px',
      background: 'var(--bg)',
      minHeight: '100vh',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <h1 style={{
        color: 'var(--t1)',
        marginBottom: '24px',
        fontSize: '24px',
        fontWeight: 600
      }}>
        Market Dashboard
      </h1>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Total Tracked"
          value={MOCK_STATS.totalTracked}
          icon="📊"
          color="#3b82f6"
        />
        <StatCard
          title="Active Today"
          value={MOCK_STATS.activeToday}
          icon="🔥"
          color="#10b981"
        />
        <StatCard
          title="Completed"
          value={MOCK_STATS.completedTasks}
          icon="✅"
          color="#f59e0b"
        />
        <StatCard
          title="Pending"
          value={MOCK_STATS.pendingReview}
          icon="⏳"
          color="#ef4444"
        />
      </div>

      <div style={{
        background: 'var(--bg2)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h2 style={{
          color: 'var(--t1)',
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 500
        }}>
          Market Sentiment
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <FearGreedGauge value={marketData.fearGreedIndex} size="100%" showLabel={true} />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '400px',
            marginTop: '16px'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Extreme Fear</span>
            <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Extreme Greed</span>
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg2)',
        borderRadius: '16px',
        padding: '24px',
      }}>
        <h2 style={{
          color: 'var(--t1)',
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 500
        }}>
          Recent Activity
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
          {MOCK_ACTIVITIES.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;