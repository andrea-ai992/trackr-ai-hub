import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import styles from "../styles/news.module.css";

const CATEGORY_COLORS = {
  BBC: { bg: "#e60026", border: "transparent" },
  Bloomberg: { bg: "#1a1a1a", border: "#00ff88" },
  CoinDesk: { bg: "#f7931a", border: "transparent" },
  "Le Monde": { bg: "#003189", border: "transparent" },
  Reuters: { bg: "#ff8000", border: "transparent" },
  Default: { bg: "#64748b", border: "transparent" },
};

function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 30) return "BREAKING";
  if (diffMin < 120) return "NEW";
  return `${diffMin}m ago`;
}

function LazyImage({ src, alt, className }) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const isVisible = useIntersectionObserver(imgRef, { threshold: 0.1, rootMargin: "100px" });

  const placeholderUrl = `https://picsum.photos/seed/${encodeURIComponent(alt || "news")}/800/450`;
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

export function NewsCard({ article, index = 0, featured = false }) {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.45,
        delay: (index % 8) * 0.07,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.article
      className={styles.card}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
    >
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
              }}
            >
              {catKey}
            </span>
            {relTime === "BREAKING" && (
              <span className={styles.breakingBadge}>BREAKING</span>
            )}
            {relTime === "NEW" && (
              <span className={styles.newBadge}>NEW</span>
            )}
          </div>
        </div>

        <div className={styles.cardBody}>
          <h2 className={styles.cardTitle}>
            {title.length > 60 ? title.slice(0, 57) + "…" : title}
          </h2>
          <div className={styles.cardFooter}>
            <span className={styles.sourceName} style={{ color: catStyle.bg }}>
              {source?.name}
            </span>
            <time className={styles.timestamp} dateTime={publishedAt}>
              {relTime}
            </time>
          </div>
        </div>
      </a>
    </motion.article>
  );
}

export default NewsCard;