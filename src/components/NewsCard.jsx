// src/components/NewsCard.jsx
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

const SOURCE_COLORS = {
  BBC: "#e60026",
  Bloomberg: "#1a1a1a",
  CoinDesk: "#f7931a",
  "Le Monde": "#003189",
  Reuters: "#ff8000",
};

export function NewsCard({ article }) {
  const publishedAt = new Date(article.publishedAt);
  const now = new Date();
  const diffMinutes = (now - publishedAt) / (1000 * 60);
  const diffHours = diffMinutes / 60;

  const isBreaking = diffMinutes < 30;
  const isNew = diffMinutes < 120 && !isBreaking;

  return (
    <Link to={article.url} className="news-card" target="_blank" rel="noopener noreferrer">
      <div className="news-card-header">
        <div className="news-source" style={{ color: SOURCE_COLORS[article.source.name] || SOURCE_COLORS[article.source.name.split(' ')[0]] || '#00ff88' }}>
          {article.source.name}
        </div>
        {(isBreaking || isNew) && (
          <div className={`news-badge ${isBreaking ? 'breaking' : 'new'}`}>
            {isBreaking ? 'BREAKING' : 'NEW'}
          </div>
        )}
      </div>
      <div className="news-card-content">
        <div className="news-card-text">
          <h4>{article.title}</h4>
          <p>{article.description}</p>
          <div className="news-card-meta">
            <div className="news-time">
              <Clock size={12} />
              <span>{publishedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
        {article.urlToImage && (
          <div className="news-card-image">
            <img src={article.urlToImage} alt={article.title} />
          </div>
        )}
      </div>
    </Link>
  );
}