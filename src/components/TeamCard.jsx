src/components/TeamCard.jsx
```jsx
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TeamCard = ({
  team,
  league,
  record,
  logo,
  colors,
  onSelect,
  isSelected = false,
  expanded = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Dégradés neon personnalisés pour chaque équipe
  const getGradient = (teamColors) => {
    if (!teamColors || teamColors.length < 2) return 'linear-gradient(135deg, var(--green), var(--green))';

    const [color1, color2] = teamColors;
    return `linear-gradient(135deg, ${color1}, ${color2})`;
  };

  const gradientStyle = getGradient(colors);

  return (
    <div
      className="team-card"
      style={{
        '--team-gradient': gradientStyle,
        '--team-border': isSelected ? 'var(--green)' : 'var(--border)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect && onSelect(team)}
    >
      <div className="team-header">
        <div className="team-logo-container">
          <img src={logo} alt={`${team} logo`} className="team-logo" />
        </div>

        <div className="team-info">
          <h3 className="team-name">{team}</h3>
          <div className="team-record">
            <span className="record-text">{record}</span>
          </div>
        </div>

        {isSelected ? (
          <ChevronUp className="chevron-icon" size={20} />
        ) : (
          <ChevronDown className="chevron-icon" size={20} />
        )}
      </div>

      {expanded && (
        <div className="team-details">
          <div className="detail-row">
            <span className="detail-label">League:</span>
            <span className="detail-value">{league}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Colors:</span>
            <div className="color-indicators">
              {colors?.map((color, index) => (
                <div
                  key={index}
                  className="color-dot"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCard;
```

src/components/TeamCard.css
```css
.team-card {
  --team-gradient: linear-gradient(135deg, var(--green), var(--green));
  --team-border: var(--border);

  width: 100%;
  max-width: 320px;
  background: var(--bg2);
  border: 1px solid var(--team-border);
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
  transition: all 0.3s ease;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 255, 136, 0.15);
  border-color: var(--green);
}

.team-card:hover .team-header {
  background: var(--team-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.team-header {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.3s ease;
}

.team-logo-container {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.team-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.team-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--t1);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-record {
  font-size: 14px;
  color: var(--t2);
  margin-top: 4px;
}

.chevron-icon {
  color: var(--t3);
  transition: color 0.3s ease;
}

.team-card:hover .chevron-icon {
  color: var(--green);
}

.team-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-label {
  color: var(--t3);
}

.detail-value {
  color: var(--t2);
}

.color-indicators {
  display: flex;
  gap: 4px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Dégradés spécifiques par équipe */
.team-card.psg {
  --team-gradient: linear-gradient(135deg, #004D98, #A71930);
}

.team-card.nba {
  --team-gradient: linear-gradient(135deg, #C8102E, #1D428A);
}

.team-card.nfl {
  --team-gradient: linear-gradient(135deg, #003366, #A71930);
}

.team-card.ufc {
  --team-gradient: linear-gradient(135deg, #D20515, #000000);
}

@media (max-width: 480px) {
  .team-card {
    max-width: 100%;
    padding: 12px;
  }

  .team-logo-container {
    width: 40px;
    height: 40px;
  }

  .team-logo {
    width: 24px;
    height: 24px;
  }

  .team-name {
    font-size: 14px;
  }

  .team-record {
    font-size: 12px;
  }
}