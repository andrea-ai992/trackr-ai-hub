// src/components/Sports/TeamCard.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';

const TeamCard = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  competition,
  competitionBadge,
  time,
  isLive,
  date
}) => {
  const getContrastColor = (hexColor) => {
    if (!hexColor) return '#e0e0e0';
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  const getTeamColors = (team) => {
    if (!team) return { primary: '#e0e0e0', secondary: '#aaa' };

    const colors = {
      'PSG': { primary: '#0057B8', secondary: '#FFFFFF' },
      'Real Madrid': { primary: '#FFFFFF', secondary: '#0057B8' },
      'Bayern Munich': { primary: '#DC143C', secondary: '#FFFFFF' },
      'Manchester City': { primary: '#6CABDD', secondary: '#FFFFFF' },
      'Liverpool': { primary: '#C8102E', secondary: '#F7D716' },
      'Barcelona': { primary: '#A50044', secondary: '#004D98' },
      'Juventus': { primary: '#000000', secondary: '#FFFFFF' },
      'AC Milan': { primary: '#A8002E', secondary: '#FFFFFF' },
      'Inter Milan': { primary: '#000000', secondary: '#0066A1' },
      'Arsenal': { primary: '#EF0107', secondary: '#FFFFFF' },
      'Chelsea': { primary: '#034694', secondary: '#C8102E' },
      'Manchester United': { primary: '#DA291C', secondary: '#FBE122' },
      'NFL': { primary: '#FFB612', secondary: '#013369' },
      'NBA': { primary: '#C8102E', secondary: '#F7D716' },
      'UFC': { primary: '#000000', secondary: '#FFB612' },
    };

    return colors[team] || { primary: '#e0e0e0', secondary: '#aaa' };
  };

  const homeColors = getTeamColors(homeTeam);
  const awayColors = getTeamColors(awayTeam);

  return (
    <div
      className="team-card"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div
        className="card-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}
      >
        <span>{competitionBadge || competition}</span>
        <span>{isLive ? 'LIVE' : time || date}</span>
      </div>

      <div
        className="teams-container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div
          className="team home-team"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            flex: 1
          }}
        >
          <div
            className="team-logo"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: homeColors.primary,
              color: getContrastColor(homeColors.primary),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              fontWeight: 'bold',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {homeTeam?.split(' ').map(word => word[0]).join('')}
          </div>
          <span
            className="team-name"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: 'var(--text-primary)',
              textAlign: 'center',
              lineHeight: '1.2'
            }}
          >
            {homeTeam}
          </span>
        </div>

        <div
          className="score-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            minWidth: '60px'
          }}
        >
          <span
            className="home-score"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '24px',
              fontWeight: 'bold',
              color: homeColors.primary
            }}
          >
            {homeScore ?? '-'}
          </span>
          <span
            className="vs"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}
          >
            VS
          </span>
          <span
            className="away-score"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '24px',
              fontWeight: 'bold',
              color: awayColors.primary
            }}
          >
            {awayScore ?? '-'}
          </span>
        </div>

        <div
          className="team away-team"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            flex: 1
          }}
        >
          <div
            className="team-logo"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: awayColors.primary,
              color: getContrastColor(awayColors.primary),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              fontWeight: 'bold',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {awayTeam?.split(' ').map(word => word[0]).join('')}
          </div>
          <span
            className="team-name"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: 'var(--text-primary)',
              textAlign: 'center',
              lineHeight: '1.2'
            }}
          >
            {awayTeam}
          </span>
        </div>
      </div>

      <div
        className="chevron-icon"
        style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <ChevronRight size={20} color="var(--neon)" />
      </div>
    </div>
  );
};

export default TeamCard;