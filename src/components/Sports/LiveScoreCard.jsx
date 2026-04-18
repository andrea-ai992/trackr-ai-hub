src/components/Sports/LiveScoreCard.jsx
```jsx
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LiveScoreCard = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  sport,
  time,
  homeLogo,
  awayLogo,
  league,
  isExpanded = false,
  onToggleExpand
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  useEffect(() => {
    setLocalExpanded(isExpanded);
  }, [isExpanded]);

  const getTeamColors = () => {
    const colors = {
      psg: { home: '#003399', away: '#003399' },
      nba: { home: '#ff6600', away: '#ff6600' },
      nfl: { home: '#cb1325', away: '#002244' },
      ufc: { home: '#000000', away: '#00ff88' }
    };

    const sportKey = sport.toLowerCase();
    return colors[sportKey] || { home: '#00ff88', away: '#00ff88' };
  };

  const colors = getTeamColors();

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onToggleExpand?.();
    }, 300);
    setLocalExpanded(!localExpanded);
  };

  const getStatusColor = () => {
    if (status.toLowerCase().includes('live')) return '#00ff88';
    if (status.toLowerCase().includes('halftime')) return '#ffcc00';
    if (status.toLowerCase().includes('final')) return '#ff3333';
    return '#00ff88';
  };

  const getSportIcon = () => {
    const icons = {
      psg: '⚽',
      nba: '🏀',
      nfl: '🏈',
      ufc: '🥊'
    };
    return icons[sport.toLowerCase()] || '🎾';
  };

  return (
    <div className="live-score-card">
      <div
        className={`score-card-header ${isAnimating ? 'animate-pulse' : ''}`}
        onClick={handleToggle}
        style={{
          backgroundColor: localExpanded ? 'var(--bg2)' : 'var(--bg)',
          borderBottom: localExpanded ? '1px solid var(--border-hi)' : '1px solid var(--border)'
        }}
      >
        <div className="team-info">
          <img
            src={homeLogo}
            alt={`${homeTeam} logo`}
            className="team-logo"
            style={{ borderColor: colors.home }}
          />
          <span className="team-name home-team" style={{ color: colors.home }}>
            {homeTeam}
          </span>
        </div>

        <div className="score-main">
          <div className="score-container">
            <span
              className={`score home-score ${isAnimating ? 'animate-score' : ''}`}
              style={{ color: colors.home }}
            >
              {homeScore}
            </span>
            <span className="vs">vs</span>
            <span
              className={`score away-score ${isAnimating ? 'animate-score' : ''}`}
              style={{ color: colors.away }}
            >
              {awayScore}
            </span>
          </div>
          <div className="status-time">
            <span className="status" style={{ color: getStatusColor() }}>
              {status}
            </span>
            {time && <span className="time">{time}</span>}
          </div>
        </div>

        <div className="team-info">
          <span className="team-name away-team" style={{ color: colors.away }}>
            {awayTeam}
          </span>
          <img
            src={awayLogo}
            alt={`${awayTeam} logo`}
            className="team-logo"
            style={{ borderColor: colors.away }}
          />
        </div>

        <div className="expand-icon">
          {localExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {localExpanded && (
        <div className="score-card-details">
          <div className="detail-row">
            <span className="detail-label">League:</span>
            <span className="detail-value">{league}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Sport:</span>
            <span className="detail-value">
              {getSportIcon()} {sport.toUpperCase()}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value" style={{ color: getStatusColor() }}>
              {status}
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .live-score-card {
          font-family: 'Inter', sans-serif;
          width: 100%;
          margin: 8px 0;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .score-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .team-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .team-logo {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid;
          object-fit: cover;
        }

        .team-name {
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .score-main {
          flex: 2;
          text-align: center;
        }

        .score-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .score {
          font-size: 20px;
          font-weight: 700;
          min-width: 32px;
          text-align: center;
        }

        .vs {
          font-size: 12px;
          color: var(--t3);
          margin: 0 4px;
        }

        .status-time {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
        }

        .status {
          font-weight: 600;
        }

        .time {
          color: var(--t3);
        }

        .expand-icon {
          flex: 0 0 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .score-card-details {
          padding: 12px 16px;
          background-color: var(--bg2);
          border-top: 1px solid var(--border);
          animation: slideDown 0.3s ease;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          font-size: 13px;
        }

        .detail-label {
          color: var(--t2);
        }

        .detail-value {
          color: var(--t1);
          font-weight: 500;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-pulse {
          animation: pulse 1.5s ease-in-out;
        }

        .animate-score {
          animation: pulse 0.8s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LiveScoreCard;