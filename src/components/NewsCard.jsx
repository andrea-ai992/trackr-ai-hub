Je vais améliorer le composant NewsCard en ajoutant des cards avec une accent bar colorée selon la source et des badges BREAKING/NEW dynamiques.

```jsx
import { useRef, useState } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import styles from "../styles/news.module.css";

const CATEGORY_COLORS = {
  BBC: { bg: "#e60026", border: "transparent", accent: "#e60026" },
  Bloomberg: { bg: "#1a1a1a", border: "var(--green)", accent: "#00ff88" },
  CoinDesk: { bg: "#f7931a", border: "transparent", accent: "#f7931a" },
  "Le Monde": { bg: "#003189", border: "transparent", accent: "#003189" },
  Reuters: { bg: "#ff8000", border: "transparent", accent: "#ff8000" },
  WSJ: { bg: "#003366", border: "transparent", accent: "#003366" },
  CNBC: { bg: "#1e1e1e", border: "var(--green)", accent: "#00ff88" },
  ESPN: { bg: "#d50000", border: "transparent", accent: "#d50000" },
  NBA: { bg: "#c8102e", border: "transparent", accent: "#c8102e" },
  NFL: { bg: "#013369", border: "transparent", accent: "#013369" },
  TechCrunch: { bg: "#ff0000", border: "transparent", accent: "#ff0000" },
  ArsTechnica: { bg: "#000000", border: "var(--green)", accent: "#00ff88" },
  TheVerge: { bg: "#000000", border: "var(--green)", accent: "#00ff88" },
  Wired: { bg: "#000000", border: "var(--green)", accent: "#00ff88" },
  TechMeme: { bg: "#000000", border: "var(--green)", accent: "#00ff88" },
  Cointelegraph: { bg: "#2d8f47", border: "transparent", accent: "#2d8f47" },
  TheBlock: { bg: "#000000", border: "var(--green)", accent: "#00ff88" },
  Decrypt: { bg: "#000000", border: "var(--green)", accent: "#00ff88" },
  LeFigaro: { bg: "#003366", border: "transparent", accent: "#003366" },
  Liberation: { bg: "#000000", border: "var(--green)", accent: "#00ff88" },
  LExpress: { bg: "#003366", border: "transparent", accent: "#003366" },
  Default: { bg: "var(--t3)", border: "transparent", accent: "var(--t2)" },
};

function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffMin < 30) return { type: "BREAKING", time: `${diffMin}m ago` };
  if (diffMin < 120) return { type: "NEW", time: `${diffMin}m ago` };
  if (diffHour < 24) return { type: "OLD", time: `${diffHour}h ago` };
  return { type: "OLD", time: `${Math.floor(diffHour / 24)}d ago` };
}

function LazyImage({ src, alt, className }) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isVisible = useIntersectionObserver(imgRef, { threshold: 0.1, rootMargin: "100px" });

  const placeholderUrl = `https://picsum.photos/seed/${encodeURIComponent(alt || "news")}/72/72`;

  return (
    <div ref={imgRef} className={`${styles.imageWrapper} ${className || ""}`}>
      {!loaded && (
        <div className={styles.imageSkeleton} aria-hidden="true">
          <div className={styles.shimmer} />
        </div>
      )}
      {isVisible && (
        <img
          src={error || !src ? placeholderUrl : src}
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
    url,
    urlToImage,
    publishedAt,
    source,
  } = article;

  const catKey = source?.name || "Default";
  const catStyle = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.Default;
  const relTime = getRelativeTime(publishedAt);

  return (
    <article className={styles.card}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cardLink}
        aria-label={`Read article: ${title}`}
      >
        <div className={styles.imageContainer}>
          <LazyImage src={urlToImage} alt={title} />
          <div className={styles.imageTop}>
            <span
              className={styles.categoryBadge}
              style={{
                backgroundColor: catStyle.bg,
                borderLeft: `3px solid ${catStyle.border}`,
                color: catStyle.accent,
              }}
            >
              {catKey}
            </span>
            {relTime.type === "BREAKING" && (
              <span className={`${styles.breakingBadge} ${styles.badge}`}>BREAKING</span>
            )}
            {relTime.type === "NEW" && (
              <span className={`${styles.newBadge} ${styles.badge}`}>NEW</span>
            )}
          </div>
        </div>

        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>
            {title}
          </h3>
          <div className={styles.cardFooter}>
            <span className={styles.sourceName} style={{ color: catStyle.accent }}>
              {source?.name}
            </span>
            <time className={styles.timestamp} dateTime={publishedAt}>
              {relTime.time}
            </time>
          </div>
        </div>
      </a>
    </article>
  );
}

export default NewsCard;