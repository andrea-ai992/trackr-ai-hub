Fichier src/components/NewsCard.jsx :
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
  Default: { bg: "var(--t3)", border: "transparent", accent: "var(--t3)" },
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
              <span className={styles.breakingBadge}>BREAKING</span>
            )}
            {relTime.type === "NEW" && (
              <span className={styles.newBadge}>NEW</span>
            )}
          </div>
        </div>

        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>
            {title}
          </h3>
          <div className={styles.cardFooter}>
            <span className={styles.sourceName} style={{ color: catStyle.bg }}>
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
```

Fichier src/pages/News.jsx :
```jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import NewsCard from "../components/NewsCard";
import styles from "../styles/news.module.css";

const CATEGORIES = [
  { id: "all", label: "Tout" },
  { id: "tech", label: "Tech" },
  { id: "finance", label: "Finance" },
  { id: "sports", label: "Sports" },
  { id: "crypto", label: "Crypto" },
  { id: "france", label: "France" },
];

const RSS_FEEDS = {
  all: [
    "http://feeds.bbci.co.uk/news/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
    "https://www.lemonde.fr/rss/une.xml",
    "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    "https://www.reuters.com/tools/rss",
    "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "https://www.bloomberg.com/feeds/podcasts/masters_in_business.xml"
  ],
  tech: [
    "https://feeds.arstechnica.com/arstechnica/index",
    "https://www.theverge.com/rss/index.xml",
    "https://www.wired.com/feed/",
    "https://www.techmeme.com/feed.xml"
  ],
  finance: [
    "https://www.wsj.com/xml/rss/3_7085.xml",
    "https://www.bloomberg.com/feeds/podcasts/etf_report.xml",
    "https://www.cnbc.com/id/100003114/device/rss/rss.html"
  ],
  sports: [
    "https://www.espn.com/espn/rss/news",
    "https://www.nba.com/rss/nba_rss.xml",
    "https://www.nfl.com/rss/",
    "https://www.lequipe.fr/rss/actualites.xml"
  ],
  crypto: [
    "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "https://cointelegraph.com/rss",
    "https://www.theblock.co/feed/",
    "https://decrypt.co/feed"
  ],
  france: [
    "https://www.lemonde.fr/rss/une.xml",
    "https://www.lefigaro.fr/rss/figaro_actualites.xml",
    "https://www.liberation.fr/rss/liberation",
    "https://www.lexpress.fr/rss/alaune.xml"
  ]
};

function News() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("cat") || "all");
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const fetchNews = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const feeds = RSS_FEEDS[activeCategory] || RSS_FEEDS.all;
      const allArticles = [];

      for (const feedUrl of feeds) {
        try {
          const response = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`, {
            signal: abortControllerRef.current.signal
          });
          if (!response.ok) throw new Error(`Failed to fetch ${feedUrl}`);

          const data = await response.json();
          allArticles.push(...data.articles);
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error("Error fetching feed:", err);
          }
        }
      }

      const filteredArticles = allArticles
        .filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      setNews(filteredArticles);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError("Failed to load news. Please try again later.");
        console.error("News fetch error:", err);
      }
    } finally {
      if (abortControllerRef.current.signal.aborted) return;
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchNews();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNews]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchParams({ q: query, cat: activeCategory });
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSearchParams({ q: searchQuery, cat: category });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchParams({ q: searchQuery, cat: activeCategory });
    }
  };

  return (
    <div className={styles.newsPage}>
      <header className={styles.newsHeader}>
        <h1 className={styles.pageTitle}>News</h1>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className={styles.searchInput}
            />
            <svg
              className={styles.searchIcon}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--t2)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>
      </header>

      <div className={styles.categoriesContainer}>
        <div className={styles.categoriesWrapper}>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`${styles.categoryButton} ${activeCategory === category.id ? styles.categoryButtonActive : ""}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.newsContainer} ref={containerRef}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className={styles.cardSkeleton}>
              <div className={styles.imageSkeleton} />
              <div className={styles.cardBodySkeleton}>
                <div className={styles.titleSkeleton} />
                <div className={styles.footerSkeleton}>
                  <div className={styles.sourceSkeleton} />
                  <div className={styles.timeSkeleton} />
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className={styles.errorMessage}>
            <p>{error}</p>
            <button onClick={fetchNews} className={styles.retryButton}>
              Retry
            </button>
          </div>
        ) : news.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No news found for your search.</p>
          </div>
        ) : (
          news.map((article, index) => (
            <NewsCard
              key={`${article.url}-${index}`}
              article={article}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default News;