// src/components/NewsCard.jsx
import React from 'react';
import { Clock } from 'lucide-react';

export const SOURCE_COLORS = {
  'BBC': '#e60026',
  'Bloomberg': '#1a1a1a',
  'CoinDesk': '#f7931a',
  'Le Monde': '#003189',
  'Reuters': '#ff8000',
  'default': 'var(--neon)'
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
    if (badge === 'NEW') return '#00ff88';
    return 'transparent';
  };

  const getTimeColor = (badge) => {
    if (badge === 'BREAKING') return '#ff4444';
    if (badge === 'NEW') return '#00ff88';
    return 'var(--text-secondary)';
  };

  const sourceColor = SOURCE_COLORS[article.source] || SOURCE_COLORS.default;

  return (
    <article className="news-card">
      <div className="news-card-accent" style={{ backgroundColor: sourceColor }} />
      <div className="news-card-content">
        <div className="news-card-header">
          <h3 className="news-card-title">{article.title}</h3>
          {article.thumbnail && (
            <img
              src={article.thumbnail}
              alt={article.title}
              className="news-card-thumbnail"
            />
          )}
        </div>
        <div className="news-card-footer">
          <span className="news-card-source" style={{ color: sourceColor }}>
            {article.source}
          </span>
          <span className="news-card-time" style={{ color: getTimeColor(article.timeBadge) }}>
            {article.timeBadge}
          </span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;