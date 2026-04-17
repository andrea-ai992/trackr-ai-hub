I'll create all the required files for the News page redesign. Let me start with each file:

FILE: src/hooks/useIntersectionObserver.js

import { useState, useEffect, useRef, useCallback } from 'react';

const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px 0px 50px 0px',
    triggerOnce = true,
    initialIsIntersecting = false,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const [hasIntersected, setHasIntersected] = useState(initialIsIntersecting);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    cleanup();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [observedEntry] = entries;
        setEntry(observedEntry);
        const intersecting = observedEntry.isIntersecting;
        setIsIntersecting(intersecting);

        if (intersecting) {
          setHasIntersected(true);
          if (triggerOnce) {
            cleanup();
          }
        }
      },
      { threshold, root, rootMargin }
    );

    observerRef.current.observe(element);

    return cleanup;
  }, [threshold, root, rootMargin, triggerOnce, cleanup]);

  return { ref: elementRef, isIntersecting, hasIntersected, entry };
};

export const useMultipleIntersectionObserver = (count, options = {}) => {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px 0px 50px 0px',
    triggerOnce = true,
  } = options;

  const [intersectingStates, setIntersectingStates] = useState(
    () => new Array(count).fill(false)
  );
  const refs = useRef([]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setIntersectingStates(new Array(count).fill(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = refs.current.indexOf(entry.target);
          if (index !== -1 && entry.isIntersecting) {
            setIntersectingStates((prev) => {
              const next = [...prev];
              next[index] = true;
              return next;
            });
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold, root, rootMargin }
    );

    refs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [count, threshold, root, rootMargin, triggerOnce]);

  const setRef = useCallback((index) => (el) => {
    refs.current[index] = el;
  }, []);

  return { intersectingStates, setRef };
};

export default useIntersectionObserver;

FILE: src/components/NewsCard.jsx

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import styles from '../styles/news.module.css';

const CATEGORY_CONFIG = {
  technology: { label: 'Technology', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: '⚡' },
  ai: { label: 'AI & ML', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', icon: '🤖' },
  finance: { label: 'Finance', color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: '📈' },
  crypto: { label: 'Crypto', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: '₿' },
  health: { label: 'Health', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: '❤️' },
  science: { label: 'Science', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', icon: '🔬' },
  sports: { label: 'Sports', color: '#f97316', bg: 'rgba(249,115,22,0.15)', icon: '⚽' },
  politics: { label: 'Politics', color: '#64748b', bg: 'rgba(100,116,139,0.15)', icon: '🏛️' },
  entertainment: { label: 'Entertainment', color: '#ec4899', bg: 'rgba(236,72,153,0.15)', icon: '🎬' },
  world: { label: 'World', color: '#14b8a6', bg: 'rgba(20,184,166,0.15)', icon: '🌍' },
  default: { label: 'General', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', icon: '📰' },
};

const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (isNaN(diffInSeconds)) return 'Just now';

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}w ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
];

const getFallbackImage = (id) => {
  const index = Math.abs((id || 0) % FALLBACK_IMAGES.length);
  return FALLBACK_IMAGES[index];
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const imageVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.08, transition: { duration: 0.6, ease: 'easeOut' } },
};

const overlayVariants = {
  rest: { opacity: 0.5 },
  hover: { opacity: 0.75, transition: { duration: 0.3 } },
};

const NewsCard = ({
  article,
  index = 0,
  isFeatured = false,
  onCardClick,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { ref, hasIntersected } = useIntersectionObserver({
    threshold: 0.05,
    rootMargin: '0px 0px 100px 0px',
    triggerOnce: true,
  });

  const category = article?.category?.toLowerCase() || 'default';
  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
  const relativeTime = getRelativeTime(article?.publishedAt || article?.date);
  const imageUrl = imageError || !article?.urlToImage
    ? getFallbackImage(index)
    : article.urlToImage;

  const handleImageLoad = useCallback(() => setImageLoaded(true), []);
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleClick = useCallback(() => {
    if (onCardClick) {
      onCardClick(article);
    } else if (article?.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  }, [article, onCardClick]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const readingTime = article?.content
    ? Math.max(1, Math.ceil(article.content.split(' ').length / 200))
    : Math.floor(Math.random() * 4) + 2;

  return (
    <motion.article
      ref={ref}
      className={`${styles.card} ${isFeatured ? styles.cardFeatured : ''}`}
      variants={cardVariants}
      initial="hidden"
      animate={hasIntersected ? 'visible' : 'hidden'}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Read article: ${article?.title}`}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.cardImageWrapper}>
        {!imageLoaded && (
          <div className={styles.imageSkeleton}>
            <div className={styles.skeletonShimmer} />
          </div>
        )}

        {hasIntersected && (
          <motion.img
            src={imageUrl}
            alt={article?.title || 'News article'}
            className={`${styles.cardImage} ${imageLoaded ? styles.imageVisible : styles.imageHidden}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            variants={imageVariants}
            animate={isHovered ? 'hover' : 'rest'}
            loading="lazy"
            decoding="async"
          />
        )}

        <motion.div
          className={styles.cardOverlay}
          variants={overlayVariants}
          animate={isHovered ? 'hover' : 'rest'}
        />

        <div className={styles.cardTopMeta}>
          <span
            className={styles.categoryBadge}
            style={{
              backgroundColor: categoryConfig.bg,
              color: categoryConfig.color,
              borderColor: `${categoryConfig.color}40`,
            }}
          >
            <span className={styles.categoryIcon}>{categoryConfig.icon}</span>
            {categoryConfig.label}
          </span>

          {isFeatured && (
            <span className={styles.featuredBadge}>
              ★ Featured
            </span>
          )}
        </div>

        <div className={styles.cardBottomMeta}>
          <span className={styles.readingTime}>
            📖 {readingTime} min read
          </span>
        </div>
      </div>

      <div className={styles.cardContent}>
        <h3 className={`${styles.cardTitle} ${isFeatured ? styles.cardTitleFeatured : ''}`}>
          {article?.title || 'Untitled Article'}
        </h3>

        {(article?.description || article?.excerpt) && (
          <p className={styles.cardExcerpt}>
            {article?.description || article?.excerpt}
          </p>
        )}

        <div className={styles.cardFooter}>
          <div className={styles.sourceInfo}>
            {article?.source?.name && (
              <span className={styles.sourceName}>
                {article.source.name}
              </span>
            )}
            {article?.author && (
              <span className={styles.authorName}>
                by {article.author.split(',')[0].trim()}
              </span>
            )}
          </div>

          <div className={styles.timeInfo}>
            <span className={styles.timestamp} title={article?.publishedAt}>
              🕐 {relativeTime}
            </span>
          </div>
        </div>

        <motion.div
          className={styles.readMoreBar}
          style={{ backgroundColor: categoryConfig.color }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </motion.article>
  );
};

export default NewsCard;

FILE: src/styles/news.module.css

.newsPage {
  min-height: 100vh;
  background: #0a0a0f;
  padding: 0 0 80px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ─── Hero Header ─────────────────────────────────── */
.heroHeader {
  position: relative;
  padding: 48px 20px 40px;
  text-align: center;
  overflow: hidden;
}

.heroBg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%);
  pointer-events: none;
}

.heroTitle {
  position: relative;
  font-size: clamp(28px, 6vw, 48px);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.03em;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.heroSubtitle {
  position: relative;
  font-size: 15px;
  color: #64748b;
  margin: 0 0 32px 0;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

/* ─── Controls Bar ────────────────────────────────── */
.controlsBar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 24px;
  flex-wrap: wrap;
}

.searchWrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.searchIcon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  pointer-events: none;
  opacity: 0.5;
}

.searchInput {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 10px 16px 10px 36px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  box-sizing: border-box;
}

.searchInput::placeholder {
  color: #475569;
}

.searchInput:focus {
  border-color: rgba(99,102,241,0.5);
  background: rgba(255,255,255,0.08);
}

.refreshBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(99,102,241,0.15);
  border: 1px solid rgba(99,102,241,0.3);
  border-radius: 12px;
  color: #818cf8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.refreshBtn:hover {
  background: rgba(99,102,241,0.25);
  border-color: rgba(99,102,241,0.5);
}

.refreshBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ─── Filter Tabs ─────────────────────────────────── */
.filterSection {
  padding: 0 20px 24px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.filterSection::-webkit-scrollbar {
  display: none;
}

.filterTabs {
  display: flex;
  gap: 8px;
  width: max-content;
  padding-bottom: 4px;
}

.filterTab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 50px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04