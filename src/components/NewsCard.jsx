// src/components/NewsCard.jsx
import React from 'react';
import { Clock } from 'lucide-react';

export const SOURCE_COLORS = {
  'BBC': '#c00',
  'Bloomberg': 'var(--surface-high)',
  'CoinDesk': '#f7931a',
  'Le Monde': '#003189',
  'Reuters': '#ff8000',
  'default': 'var(--neon)'
};

const sanitizeHTML = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const NewsCard = ({ article }) => {
  const formatTime = (dateString) => {
    const now = new Date();
    const articleTime = new Date(dateString);
    const diffMinutes = (now - articleTime) / (1000 * 60);

    if (diffMinutes < 30) return 'BREAKING';
    if (diffMinutes < 120) return 'NEW';
    return articleTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getBadgeColor = (badge) => {
    if (badge === 'BREAKING') return '#ff4444';
    if (badge === 'NEW') return 'var(--neon)';
    return 'transparent';
  };

  const getTimeColor = (badge) => {
    if (badge === 'BREAKING') return '#ff4444';
    if (badge === 'NEW') return 'var(--neon)';
    return 'var(--text-secondary)';
  };

  const sourceColor = SOURCE_COLORS[article.source] || SOURCE_COLORS.default;

  return (
    <article
      className="news-card"
      style={{
        '--source-color': sourceColor,
        '--badge-color': getBadgeColor(article.timeBadge),
        '--time-color': getTimeColor(article.timeBadge)
      }}
    >
      <div className="news-card-header">
        <div className="news-card-meta">
          <span className="news-card-source">{sanitizeHTML(article.source)}</span>
          {article.timeBadge && (
            <span className="news-card-time-badge">{sanitizeHTML(article.timeBadge)}</span>
          )}
        </div>
        <span className="news-card-time">
          {article.timeBadge && article.timeBadge !== 'BREAKING' && article.timeBadge !== 'NEW' ? sanitizeHTML(article.timeBadge) : formatTime(article.publishedAt)}
        </span>
      </div>
      <h3 className="news-card-title" dangerouslySetInnerHTML={{ __html: sanitizeHTML(article.title) }} />
      {article.description && <p className="news-card-description">{sanitizeHTML(article.description)}</p>}
    </article>
  );
};

export default NewsCard;