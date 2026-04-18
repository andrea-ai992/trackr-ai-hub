// src/components/NewsCard.jsx
import { useRef, useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import styles from "../styles/news.module.css";

const SOURCE_COLORS = {
  BBC: "#e60026",
  Bloomberg: "#1a1a1a",
  CoinDesk: "#f7931a",
  "Le Monde": "#003189",
  Reuters: "#ff8000",
};

const SOURCE_BORDER = {
  BBC: "2px solid #e60026",
  Bloomberg: "2px solid #00ff88",
  CoinDesk: "2px solid #f7931a",
  "Le Monde": "2px solid #003189",
  Reuters: "2px solid #ff8000",
};

function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 30) return { time: diffMin, unit: "min", type: "BREAKING" };
  if (diffHour < 2) return { time: diffHour, unit: "hour", type: "NEW" };
  if (diffDay < 1) return { time: diffHour, unit: "hour", type: "OLD" };
  return { time: diffDay, unit: "day", type: "OLD" };
}

function LazyImage({ src, alt, className }) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isVisible = useIntersectionObserver(imgRef, { threshold: 0.1, rootMargin: "100px" });

  const placeholderUrl = `https://picsum.photos/seed/${encodeURIComponent(alt || "news")}/72/72`;
  const finalSrc = error || !src ? placeholderUrl : src;

  return (
    <div ref={imgRef} className={`${styles.imageWrapper} ${className || ""}`}>
      {!loaded && (
        <div className={styles.imageSkeleton} aria-hidden="true">
          <div className={styles.shimmer} />
        </div>
      )}
      {isVisible && (
        <img
          src={finalSrc}
          alt={alt}
          className={`${styles.coverImage} ${loaded ? styles.imageLoaded : styles.imageHidden}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}

export function NewsCard({ article, index = 0 }) {
  const {
    title,
    description,
    url,
    urlToImage,
    publishedAt,
    source,
    category,
  } = article;

  const sourceName = source?.name || "Unknown";
  const sourceColor = SOURCE_COLORS[sourceName] || "var(--text-secondary)";
  const sourceBorder = SOURCE_BORDER[sourceName] || "none";
  const timeInfo = getRelativeTime(publishedAt);
  const timeText = timeInfo.unit === "min" ? `${timeInfo.time}m ago` :
                   timeInfo.unit === "hour" ? `${timeInfo.time}h ago` :
                   `${timeInfo.time}d ago`;

  const excerpt = description
    ? description.length > 120
      ? description.slice(0, 117) + "…"
      : description
    : null;

  return (
    <article className={styles.card}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cardLink}
        aria-label={`Read article: ${title}`}
      >
        <div className={styles.cardHeader}>
          <div className={styles.cardSource} style={{ color: sourceColor }}>
            {sourceName}
          </div>
          <div className={styles.cardTime}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {timeText}
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.cardTitleContainer}>
            <h3 className={styles.cardTitle}>{title}</h3>
          </div>

          {excerpt && (
            <p className={styles.cardExcerpt}>{excerpt}</p>
          )}
        </div>

        <div className={styles.cardFooter}>
          {urlToImage && (
            <div className={styles.cardThumbnail}>
              <LazyImage src={urlToImage} alt={title} />
            </div>
          )}
          <div className={styles.cardMeta}>
            {timeInfo.type === "BREAKING" && (
              <span className={styles.breakingBadge}>BREAKING</span>
            )}
            {timeInfo.type === "NEW" && (
              <span className={styles.newBadge}>NEW</span>
            )}
            <span className={styles.readMore}>
              Read more
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--neon)" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}

export default NewsCard;