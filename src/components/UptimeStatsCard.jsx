src/components/UptimeStatsCard.jsx
```jsx
import { useState, useEffect } from 'react';

export default function UptimeStatsCard() {
  const [uptimeData, setUptimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUptimeData = async () => {
      try {
        const response = await fetch('/api/uptime');
        if (!response.ok) throw new Error('Failed to fetch uptime data');
        const data = await response.json();
        setUptimeData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUptimeData();

    const interval = setInterval(fetchUptimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="uptime-stats-card">
        <div className="uptime-stats-header">
          <span className="uptime-title">Uptime & Cost</span>
        </div>
        <div className="uptime-stats-loading">
          <div className="uptime-stat-item">
            <div className="uptime-stat-value">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="uptime-stats-card">
        <div className="uptime-stats-header">
          <span className="uptime-title">Uptime & Cost</span>
        </div>
        <div className="uptime-stats-error">
          <div className="uptime-stat-item">
            <div className="uptime-stat-value" style={{ color: 'var(--green)' }}>Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="uptime-stats-card">
      <div className="uptime-stats-header">
        <span className="uptime-title">Uptime & Cost</span>
      </div>

      <div className="uptime-stats-grid">
        <div className="uptime-stat-item">
          <div className="uptime-stat-label">Uptime 24h</div>
          <div className="uptime-stat-value" style={{ color: uptimeData.uptime24h >= 99.9 ? 'var(--green)' : 'var(--t3)' }}>
            {uptimeData.uptime24h}%
          </div>
        </div>

        <div className="uptime-stat-item">
          <div className="uptime-stat-label">Uptime 7d</div>
          <div className="uptime-stat-value" style={{ color: uptimeData.uptime7d >= 99.9 ? 'var(--green)' : 'var(--t3)' }}>
            {uptimeData.uptime7d}%
          </div>
        </div>

        <div className="uptime-stat-item">
          <div className="uptime-stat-label">Uptime 30d</div>
          <div className="uptime-stat-value" style={{ color: uptimeData.uptime30d >= 99.9 ? 'var(--green)' : 'var(--t3)' }}>
            {uptimeData.uptime30d}%
          </div>
        </div>

        <div className="uptime-stat-item">
          <div className="uptime-stat-label">Cost 24h</div>
          <div className="uptime-stat-value">${uptimeData.cost24h}</div>
        </div>

        <div className="uptime-stat-item">
          <div className="uptime-stat-label">Cost 7d</div>
          <div className="uptime-stat-value">${uptimeData.cost7d}</div>
        </div>

        <div className="uptime-stat-item">
          <div className="uptime-stat-label">Cost 30d</div>
          <div className="uptime-stat-value">${uptimeData.cost30d}</div>
        </div>
      </div>
    </div>
  );
}
```

src/components/UptimeStatsCard.css
```css
.uptime-stats-card {
  width: 100%;
  max-width: 100%;
  background: var(--bg2);
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 16px;
  font-family: 'Inter', sans-serif;
}

.uptime-stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.uptime-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--t1);
}

.uptime-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.uptime-stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.uptime-stat-label {
  font-size: 12px;
  color: var(--t2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.uptime-stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--t1);
}

.uptime-stats-loading,
.uptime-stats-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.uptime-stats-error .uptime-stat-value {
  text-align: center;
  color: var(--green);
  font-size: 14px;
}

@media (max-width: 600px) {
  .uptime-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .uptime-stats-header {
    margin-bottom: 12px;
  }

  .uptime-title {
    font-size: 16px;
  }

  .uptime-stat-item {
    gap: 6px;
  }

  .uptime-stat-label {
    font-size: 11px;
  }

  .uptime-stat-value {
    font-size: 15px;
  }
}