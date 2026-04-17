
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import styles from "../styles/news.module.css";

const CATEGORY_COLORS = {
  Technology: { bg: "#6366f1", light: "#e0e7ff" },
  Business: { bg: "#0ea5e9", light: "#e0f2fe" },
  Science: { bg: "#10b981", light: "#d1fae5" },
  Health: { bg: "#f59e0b", light: "#fef3c7" },
  Politics: { bg: "#ef4444", light: "#fee2e2" },
  Sports: { bg: "#8b5cf6", light: "#ede9fe" },
  Entertainment: { bg: "#ec4899", light: "#fce7f3" },
  World: { bg: "#14b8a6", light: "#ccfbf1" },
  Finance: { bg: "#f97316", light: "#ffedd5" },
  Climate: { bg: "#22c55e", light: "#dcfce7" },
  Default: { bg: "#64748b", light: "#f1f5f9" },
};

function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
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
    description,
    url,
    urlToImage,
    publishedAt,
    source,
    category = "Default",
    author,
  } = article;

  const catKey = Object.keys(CATEGORY_COLORS).find(
    (k) => k.toLowerCase() === (category || "").toLowerCase()
  ) || "Default";
  const catStyle = CATEGORY_COLORS[catKey];
  const relTime = getRelativeTime(publishedAt);
  const excerpt = description
    ? description.length > 120
      ? description.slice(0, 117) + "…"
      : description
    : null;

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

  const overlayVariants = {
    rest: { opacity: 0.55 },
    hover: { opacity: 0.72, transition: { duration: 0.25 } },
  };

  const scaleVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.04, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.article
      className={`${styles.card} ${featured ? styles.cardFeatured : ""}`}
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
          <motion.div className={styles.imageScale} variants={scaleVariants}>
            <LazyImage src={urlToImage} alt={title} />
          </motion.div>

          <motion.div className={styles.gradientOverlay} variants={overlayVariants} />

          <div className={styles.imageTop}>
            <span
              className={styles.categoryBadge}
              style={{
                backgroundColor: catStyle.bg,
                boxShadow: `0 2px 8px ${catStyle.bg}55`,
              }}
            >
              {catKey === "Default" ? category || "News" : catKey}
            </span>

            {featured && (
              <span className={styles.featuredBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Featured
              </span>
            )}
          </div>

          <div className={styles.imageBottom}>
            <time className={styles.timestamp} dateTime={publishedAt} title={new Date(publishedAt).toLocaleString()}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {relTime}
            </time>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.cardMeta}>
            {source?.name && (
              <span className={styles.sourceName} style={{ color: catStyle.bg }}>
                {source.name}
              </span>
            )}
            {author && source?.name && <span className={styles.metaDot}>·</span>}
            {author && (
              <span className={styles.authorName}>
                {author.length > 25 ? author.slice(0, 22) + "…" : author}
              </span>
            )}
          </div>

          <h2 className={`${styles.cardTitle} ${featured ? styles.cardTitleFeatured : ""}`}>
            {title}
          </h2>

          {excerpt && (
            <p className={styles.cardExcerpt}>{excerpt}</p>
          )}

          <div className={styles.cardFooter}>
            <span className={styles.readMore} style={{ color: catStyle.bg }}>
              Read more
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}

export default NewsCard;