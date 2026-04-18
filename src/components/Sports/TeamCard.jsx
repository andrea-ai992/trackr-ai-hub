// src/components/Sports/TeamCard.jsx
import React from 'react';

const TeamCard = ({ team, score, isHome, opponent }) => {
  return (
    <div
      className="team-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        marginBottom: '8px',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={team.logo}
          alt={team.name}
          style={{
            width: '32px',
            height: '32px',
            objectFit: 'contain',
          }}
        />
        <div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {team.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {team.shortName}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '16px', color: 'var(--neon)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 'bold' }}>
          {score}
        </div>
        <div style={{ fontSize: '12px', color: isHome ? 'var(--neon)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          {isHome ? 'HOME' : 'AWAY'}
        </div>
      </div>
      {opponent && (
        <div style={{ marginLeft: '8px' }}>
          <img
            src={opponent.logo}
            alt={opponent.name}
            style={{
              width: '24px',
              height: '24px',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TeamCard;