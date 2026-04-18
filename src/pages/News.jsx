Je vais implémenter un header sticky avec tabs catégories amélioré pour une navigation fluide et un design premium dans `src/pages/News.jsx`.

```jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RefreshCw,
  Loader2,
  ExternalLink,
  Search,
  X,
} from 'lucide-react';

const SOURCES = [
  {
    id: 'reuters_biz',
    label: 'Reuters',
    url: 'https://feeds.reuters.com/reuters/businessNews',
    cat: 'markets',
    color: '#ff8000',
    emoji: '🌐',
  },
  {
    id: 'bbc_biz',
    label: 'BBC Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    cat: 'markets',
    color: '#e60026',
    emoji: '🔴',
  },
  {
    id: 'coindesk',
    label: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    cat: 'crypto',
    color: '#f7931a',
    emoji: '🪙',
  },
  {
    id: 'lemonde',
    label: 'Le Monde',
    url: 'https://www.lemonde.fr/rss/une.xml',
    cat: 'world',
    color: '#003189',
    emoji: '📰',
  },
  {
    id: 'bloomberg',
    label: 'Bloomberg',
    url: 'https://www.bloomberg.com/feed/podcast/etf-report.xml',
    cat: 'markets',
    color: '#1a1a1a',
    emoji: '📈',
  },
];

const TABS = [
  { id: 'all', label: 'Tout' },
  { id: 'tech', label: 'Tech' },
  { id: 'finance', label: 'Finance' },
  { id: 'sports', label: 'Sports' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'france', label: 'France' },
  { id: 'world', label: 'Monde' },
];

const CACHE = {};
const TTL = 90 * 1000;

function parseXML(text) {
  try {
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    const nodes = [...doc.querySelectorAll('item'), ...doc.querySelectorAll('entry')];
    return nodes.map((el) => {
      const title = el.querySelector('title')?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, '')?.trim();
      const linkEl = el.querySelector('link');
      const url = linkEl?.getAttribute('href') || linkEl?.textContent?.trim() || el.querySelector('guid')?.textContent?.trim();
      const pubRaw = el.querySelector('pubDate, published, updated')?.textContent;
      const time = pubRaw ? Math.floor(new Date(pubRaw).getTime() / 1000) : 0;
      return {
        title,
        url,
        time,
      };
    }).filter((i) => i.title && i.url && i.title.length > 5);
  } catch {
    return [];
  }
}

async function fetchSource(src) {
  const cached = CACHE[src.id];
  if (cached && Date.now() - cached.ts < TTL) return cached.data;
  const encoded = encodeURIComponent(src.url);
  let items = [];
  try {
    const r = await fetch(`https://corsproxy.io/?${encoded}`, { signal: AbortSignal.timeout(7000) });
    if (r.ok) items = parseXML(await r.text());
  } catch {}
  if (items.length) CACHE[src.id] = { data: items, ts: Date.now() };
  return items;
}

function ago(ts) {
  if (!ts) return '';
  const m = Math.floor((Date.now() / 1000 - ts) / 60);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const isBreaking = (ts) => ts && (Date.now() / 1000 - ts) < 30 * 60;
const isNew = (ts) => ts && (Date.now() / 1000 - ts) < 120 * 60;

function NewsCard({ item }) {
  const breaking = isBreaking(item.time);
  const newItem = isNew(item.time) && !breaking;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="news-card"
      style={{
        display: 'block',
        textDecoration: 'none',
        padding: '16px 16px 16px 20px',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${item.sourceColor}`,
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        position: 'relative',
        marginBottom: '12px',
      }}
    >
      {breaking && (
        <span
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontSize: '10px',
            fontWeight: 800,
            color: 'var(--green)',
            background: 'rgba(0,255,136,0.15)',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid var(--green)',
          }}
        >
          BREAKING
        </span>
      )}
      {newItem && !breaking && (
        <span
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontSize: '10px',
            fontWeight: 800,
            color: 'var(--green)',
            background: 'rgba(0,255,136,0.15)',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid var(--green)',
          }}
        >
          NEW
        </span>
      )}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 8,
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: item.sourceColor,
            background: item.sourceColor === '#1a1a1a' ? 'rgba(255,255,255,0.1)' : 'transparent',
            padding: item.sourceColor === '#1a1a1a' ? '2px 6px' : 0,
            borderRadius: item.sourceColor === '#1a1a1a' ? '4px' : 0,
          }}
        >
          {item.sourceEmoji} {item.source}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--t3)',
          }}
        >
          · {ago(item.time)}
        </span>
        <ExternalLink size={14} style={{ color: 'var(--t3)', marginLeft: 'auto', flexShrink: 0 }} />
      </div>
      <h3
        style={{
          fontSize: '15px',
          lineHeight: 1.45,
          color: 'var(--t1)',
          fontWeight: 500,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {item.title}
      </h3>
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt=""
          style={{
            width: '72px',
            height: '72px',
            objectFit: 'cover',
            borderRadius: '6px',
            marginLeft: 'auto',
            marginTop: '12px',
          }}
        />
      )}
    </a>
  );
}

function Header({ tab, setTab, search, setSearch, setSearchFocused }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        background: 'var(--bg)',
        zIndex: 100,
        padding: '16px 0 12px',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0, 255, 136, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--t3)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <input
            type="text"
            placeholder="Rechercher dans les actualités..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              background: 'var(--bg2)',
              color: 'var(--t1)',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--t3)',
                cursor: 'pointer',
                padding: '4px',
                zIndex: 1,
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '6px',
            paddingBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingLeft: '8px',
            paddingRight: '8px',
          }}
          className="hide-scrollbar"
        >
          {TABS.map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              style={{
                flex: '0 0 auto',
                padding: '10px 16px',
                background: tab === tabItem.id ? 'var(--green)' : 'var(--bg2)',
                color: tab === tabItem.id ? '#080808' : 'var(--t1)',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                backdropFilter: 'blur(10px)',
                boxShadow: tab === tabItem.id ? '0 0 0 1px var(--green)' : 'none',
              }}
            >
              {tabItem.label}
              {tab === tabItem.id && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '6px',
                    height: '6px',
                    background: 'var(--green)',
                    borderRadius: '50%',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export default function News() {
  const [tab, setTab] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled(
      SOURCES.map((s) => fetchSource(s).then((rows) =>
        rows.map((r) => ({
          ...r,
          source: s.label,
          sourceColor: s.color,
          sourceEmoji: s.emoji,
          category: s.cat,
        })),
      )),
    );
    let merged = [];
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value.length) merged.push(...r.value);
    });
    setItems(merged.sort((a, b) => b.time - a.time));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => load(), 90 * 1000);
    return () => clearInterval(timerRef.current);
  }, [load]);

  const filtered = items
    .filter((item) => {
      const matchesSearch = search
        ? item.title?.toLowerCase().includes(search.toLowerCase()) ||
          item.source?.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesTab = tab === 'all' || item.category === tab;
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => b.time - a.time);

  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--t1)',
        padding: '16px',
        minHeight: '100vh',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <Header
        tab={tab}
        setTab={setTab}
        search={search}
        setSearch={setSearch}
        setSearchFocused={setSearchFocused}
      />

      <div
        style={{
          marginTop: '16px',
        }}
      >
        {loading ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                style={{
                  background: 'var(--bg2)',
                  padding: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--border)',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      width: '60%',
                      height: '12px',
                      background: 'var(--border)',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    style={{
                      width: '80%',
                      height: '10px',
                      background: 'var(--border)',
                      borderRadius: '4px',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: '0.2s',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--t2)',
            }}
          >
            <Search
              size={48}
              style={{
                opacity: 0.3,
                marginBottom: '16px',
              }}
            />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Aucun résultat trouvé</h3>
            <p style={{ fontSize: '14px' }}>
              {search ? 'Ajustez votre recherche ou essayez un autre filtre.' : 'Aucune actualité disponible pour ce filtre.'}
            </p>
          </div>
        ) : (
          filtered.map((item, index) => (
            <NewsCard key={`${item.url}-${index}`} item={item} />
          ))
        )}
      </div>
    </div>
  );
}