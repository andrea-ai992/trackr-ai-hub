src/hooks/useGlobalSearch.js
import { useState, useCallback, useRef } from 'react';

const SEARCH_DATA = [
  {
    id: 'page-dashboard',
    type: 'page',
    label: 'Dashboard',
    description: 'Vue principale du portfolio',
    path: '/',
    icon: '🏠',
    keywords: ['dashboard', 'accueil', 'home', 'overview', 'vue principale'],
  },
  {
    id: 'page-markets',
    type: 'page',
    label: 'Markets',
    description: 'Marchés financiers en temps réel',
    path: '/markets',
    icon: '📈',
    keywords: ['markets', 'marchés', 'trading', 'cours', 'prix'],
  },
  {
    id: 'page-portfolio',
    type: 'page',
    label: 'Portfolio',
    description: 'Gestion de votre portefeuille',
    path: '/portfolio',
    icon: '💼',
    keywords: ['portfolio', 'portefeuille', 'actifs', 'positions'],
  },
  {
    id: 'page-analytics',
    type: 'page',
    label: 'Analytics',
    description: 'Analyses et statistiques avancées',
    path: '/analytics',
    icon: '📊',
    keywords: ['analytics', 'analyse', 'stats', 'statistiques', 'graphiques'],
  },
  {
    id: 'page-settings',
    type: 'page',
    label: 'Settings',
    description: 'Paramètres de l\'application',
    path: '/settings',
    icon: '⚙️',
    keywords: ['settings', 'paramètres', 'configuration', 'préférences'],
  },
  {
    id: 'market-btc',
    type: 'market',
    label: 'Bitcoin',
    description: 'BTC/USD — Crypto',
    path: '/markets?asset=BTC',
    icon: '₿',
    ticker: 'BTC',
    category: 'Crypto',
    keywords: ['bitcoin', 'btc', 'crypto', 'cryptocurrency'],
  },
  {
    id: 'market-eth',
    type: 'market',
    label: 'Ethereum',
    description: 'ETH/USD — Crypto',
    path: '/markets?asset=ETH',
    icon: 'Ξ',
    ticker: 'ETH',
    category: 'Crypto',
    keywords: ['ethereum', 'eth', 'crypto', 'ether'],
  },
  {
    id: 'market-sol',
    type: 'market',
    label: 'Solana',
    description: 'SOL/USD — Crypto',
    path: '/markets?asset=SOL',
    icon: '◎',
    ticker: 'SOL',
    category: 'Crypto',
    keywords: ['solana', 'sol', 'crypto'],
  },
  {
    id: 'market-aapl',
    type: 'market',
    label: 'Apple Inc.',
    description: 'AAPL — Stocks',
    path: '/markets?asset=AAPL',
    icon: '🍎',
    ticker: 'AAPL',
    category: 'Stocks',
    keywords: ['apple', 'aapl', 'stocks', 'actions', 'tech'],
  },
  {
    id: 'market-tsla',
    type: 'market',
    label: 'Tesla',
    description: 'TSLA — Stocks',
    path: '/markets?asset=TSLA',
    icon: '⚡',
    ticker: 'TSLA',
    category: 'Stocks',
    keywords: ['tesla', 'tsla', 'stocks', 'elon', 'ev'],
  },
  {
    id: 'market-nvda',
    type: 'market',
    label: 'NVIDIA',
    description: 'NVDA — Stocks',
    path: '/markets?asset=NVDA',
    icon: '🟢',
    ticker: 'NVDA',
    category: 'Stocks',
    keywords: ['nvidia', 'nvda', 'stocks', 'gpu', 'ai', 'chips'],
  },
  {
    id: 'market-gold',
    type: 'market',
    label: 'Gold',
    description: 'XAU/USD — Commodities',
    path: '/markets?asset=GOLD',
    icon: '🥇',
    ticker: 'XAU',
    category: 'Commodities',
    keywords: ['gold', 'or', 'xau', 'commodities', 'matières premières'],
  },
  {
    id: 'market-eurusd',
    type: 'market',
    label: 'EUR/USD',
    description: 'Euro vs Dollar — Forex',
    path: '/markets?asset=EURUSD',
    icon: '💱',
    ticker: 'EURUSD',
    category: 'Forex',
    keywords: ['eurusd', 'euro', 'dollar', 'forex', 'currency', 'devises'],
  },
  {
    id: 'asset-btc-portfolio',
    type: 'asset',
    label: 'Bitcoin (Portfolio)',
    description: '0.42 BTC — $28,350',
    path: '/portfolio?highlight=BTC',
    icon: '₿',
    ticker: 'BTC',
    keywords: ['bitcoin', 'btc', 'portfolio', 'position'],
  },
  {
    id: 'asset-eth-portfolio',
    type: 'asset',
    label: 'Ethereum (Portfolio)',
    description: '3.8 ETH — $7,220',
    path: '/portfolio?highlight=ETH',
    icon: 'Ξ',
    ticker: 'ETH',
    keywords: ['ethereum', 'eth', 'portfolio', 'position'],
  },
  {
    id: 'asset-aapl-portfolio',
    type: 'asset',
    label: 'Apple (Portfolio)',
    description: '10 shares — $1,890',
    path: '/portfolio?highlight=AAPL',
    icon: '🍎',
    ticker: 'AAPL',
    keywords: ['apple', 'aapl', 'portfolio', 'actions', 'position'],
  },
];

function scoreMatch(item, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  let score = 0;
  const label = item.label.toLowerCase();
  const description = (item.description || '').toLowerCase();
  const ticker = (item.ticker || '').toLowerCase();
  const keywords = item.keywords || [];

  if (label === q) score += 100;
  else if (label.startsWith(q)) score += 80;
  else if (label.includes(q)) score += 60;

  if (ticker === q) score += 90;
  else if (ticker.startsWith(q)) score += 70;

  if (description.includes(q)) score += 30;

  keywords.forEach((kw) => {
    if (kw === q) score += 50;
    else if (kw.startsWith(q)) score += 35;
    else if (kw.includes(q)) score += 20;
  });

  return score;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef(null);

  const search = useCallback((value) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(0);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const scored = SEARCH_DATA.map((item) => ({
        ...item,
        score: scoreMatch(item, value),
      }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      setResults(scored);
      setIsOpen(scored.length > 0);
      setSelectedIndex(0);
    }, 300);
  }, []);

  const clear = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(0);
  }, []);

  const open = useCallback(() => {
    if (results.length > 0) {
      setIsOpen(true);
    }
  }, [results]);

  const moveSelection = useCallback(
    (direction) => {
      setSelectedIndex((prev) => {
        if (direction === 'down') {
          return prev < results.length - 1 ? prev + 1 : 0;
        }
        return prev > 0 ? prev - 1 : results.length - 1;
      });
    },
    [results.length]
  );

  return {
    query,
    results,
    isOpen,
    selectedIndex,
    search,
    clear,
    close,
    open,
    moveSelection,
    setSelectedIndex,
  };
}

---

src/components/GlobalSearchBar.jsx
import { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalSearch } from '../hooks/useGlobalSearch';

const TYPE_CONFIG = {
  page: {
    label: 'Page',
    bg: 'bg-violet-500/20',
    text: 'text-violet-300',
    border: 'border-violet-500/30',
  },
  market: {
    label: 'Market',
    bg: 'bg-blue-500/20',
    text: 'text-blue-300',
    border: 'border-blue-500/30',
  },
  asset: {
    label: 'Asset',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
  },
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    transition: {
      duration: 0.13,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.15 },
  },
};

export default function GlobalSearchBar() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const {
    query,
    results,
    isOpen,
    selectedIndex,
    search,
    clear,
    close,
    open,
    moveSelection,
    setSelectedIndex,
  } = useGlobalSearch();

  const handleSelect = useCallback(
    (item) => {
      navigate(item.path);
      clear();
      inputRef.current?.blur();
    },
    [navigate, clear]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        open();
        return;
      }

      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveSelection('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveSelection('up');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, moveSelection, handleSelect, close, open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const isMac =
    typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().includes('MAC');

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => {
            if (results.length > 0) open();
          }}
          placeholder="Search pages, markets, assets..."
          className="
            w-full h-10 pl-10 pr-24
            bg-white/5 border border-white/10
            rounded-xl text-sm text-white placeholder-gray-500
            focus:outline-none focus:border-violet-500/60 focus:bg-white/8
            transition-all duration-200
            backdrop-blur-sm
          "
          autoComplete="off"
          spellCheck="false"
          aria-label="Global search"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query ? (
            <button
              onClick={() => {
                clear();
                inputRef.current?.focus();
              }}
              className="
                p-0.5 rounded-md text-gray-400 hover:text-white
                hover:bg-white/10 transition-all duration-150
              "
              aria-label="Clear search"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : (
            <kbd className="
              hidden sm:flex items-center gap-0.5
              px-1.5 py-0.5 rounded-md
              bg-white/8 border border-white/10
              text-[10px] text-gray-500 font-mono
            ">
              {isMac ? '⌘' : 'Ctrl'}K
            </kbd>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            key="search-dropdown"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
              absolute top-full left-0 right-0 mt-2 z-50
              bg-[#0f1117]/95 backdrop-blur-xl
              border border-white/10 rounded-2xl
              shadow-2xl shadow-black/60
              overflow-hidden
            "
            role="listbox"
            aria-label="Search results"
          >
            {Object.entries(groupedResults).map(([type, items]) => {
              const config = TYPE_CONFIG[type] || TYPE_CONFIG.page;

              return (
                <div key={type}>
                  <div className="px-3 pt-2.5 pb-1 flex items-center gap-2">
                    <span
                      className={`
                        text-[10px] font-semibold uppercase tracking-widest
                        px-2 py-0.5 rounded-full border
                        ${config.bg} ${config.text} ${config.border}
                      `}
                    >
                      {config.label}s
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>

                  {items.map((item) => {
                    const globalIndex = results.findIndex(
                      (r) => r.id === item.id
                    );
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <motion.button
                        key={item.id}
                        variants={itemVariants}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5
                          text-left transition-all duration-100
                          ${
                            isSelected
                              ? 'bg-violet-500/15 border-l-2 border-violet-400'