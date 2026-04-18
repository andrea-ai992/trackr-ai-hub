// src/components/Sports/TeamCard.jsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

export const TeamCard = ({ team, isHome, score, time, competition }) => {
  return (
    <div className="team-card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: 'var(--surface)',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      marginBottom: '8px',
      width: '100%'
    }}>
      <div className="team-info" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1
      }}>
        <div className="team-logo" style={{
          width: '32px',
          height: '32px',
          backgroundColor: team.color || 'var(--text-primary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--bg)',
          fontWeight: 'bold',
          fontSize: '14px',
          flexShrink: 0
        }}>
          {team.logo || team.name.charAt(0)}
        </div>
        <div className="team-details">
          <div className="team-name" style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '2px'
          }}>
            {team.name}
          </div>
          <div className="team-record" style={{
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            {team.record || 'N/A'}
          </div>
        </div>
      </div>

      <div className="score-section" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px'
      }}>
        <div className="match-score" style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--neon)'
        }}>
          {score}
        </div>
        {time && (
          <div className="match-time" style={{
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            {time}
          </div>
        )}
        {competition && (
          <div className="match-competition" style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}>
            {competition}
          </div>
        )}
      </div>

      {isHome && (
        <ChevronDown size={16} style={{
          color: 'var(--neon)',
          marginLeft: '8px'
        }} />
      )}
    </div>
  );
};