// src/components/NewsCard.jsx
import React from 'react';

const NewsCard = ({ title, source, time, url }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="news-item"
      style={{
        display: 'block',
        padding: '12px 16px',
        textDecoration: 'none',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border)',
        fontFamily: 'JetBrains Mono, monospace',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface-low)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '4px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }}>
        <span style={{ color: 'var(--neon-dim)' }}>{source}</span>
        <span style={{ color: 'var(--text-muted)' }}>{time}</span>
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: 600,
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {title}
      </div>
    </a>
  );
};

export default NewsCard;