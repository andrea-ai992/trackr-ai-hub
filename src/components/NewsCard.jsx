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
        fontSize: '13px',
        lineHeight: '1.4',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface-low)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <div style={{ marginBottom: '4px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{source}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '8px' }}>{time}</span>
      </div>
      <div style={{ fontWeight: 500 }}>{title}</div>
    </a>
  );
};

export default NewsCard;