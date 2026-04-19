import { memo } from 'react';

const NewsArticle = memo(({ article }) => {
  const timeAgo = (dateStr) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <article className="news-item">
      <header className="news-header">
        <h3 className="news-title">{article.title}</h3>
        <div className="news-meta">
          <span className="news-source">{article.source}</span>
          <span className="news-time">{timeAgo(article.publishedAt)}</span>
        </div>
      </header>
      <p className="news-description">{article.description}</p>
    </article>
  );
});

export default NewsArticle;