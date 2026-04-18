// src/pages/Markets.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import MarketCard from '../components/MarketCard';

const TABS = [
  { id: 'stocks', label: 'Stocks' },
  { id: 'crypto', label: 'Crypto' },
];

const fetchStocks = async () => {
  try {
    const response = await fetch('https://trackr-app-nu.vercel.app/api/stocks');
    if (!response.ok) throw new Error('Failed to fetch stocks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return [];
  }
};

const fetchCryptoPrices = async () => {
  try {
    const response = await fetch('https://trackr-app-nu.vercel.app/api/crypto-prices');
    if (!response.ok) throw new Error('Failed to fetch crypto prices');
    return await response.json();
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return [];
  }
};

const fetchYahooFinance = async (symbol) => {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=7d`);
    if (!response.ok) throw new Error('Failed to fetch Yahoo data');
    const data = await response.json();
    const prices = data.chart.result?.[0]?.indicators?.quote?.[0]?.close?.filter(p => p !== null) || [];
    return prices.slice(-7);
  } catch (error) {
    console.error('Error fetching Yahoo data:', error);
    return Array(7).fill(null);
  }
};

export default function Markets() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState({ stocks: [], crypto: [] });
  const [loading, setLoading] = useState(true);
  const [yfData, setYfData] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [stocks, crypto] = await Promise.all([
        fetchStocks(),
        fetchCryptoPrices(),
      ]);
      setData({ stocks, crypto });
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'stocks') {
      const fetchYf = async () => {
        const symbols = data.stocks.slice(0, 5).map(s => s.symbol);
        const results = await Promise.all(
          symbols.map(symbol => fetchYahooFinance(symbol))
        );
        setYfData(prev => ({ ...prev, [activeTab]: results }));
      };
      if (data.stocks.length) fetchYf();
    }
  }, [activeTab, data.stocks]);

  const filteredData = useMemo(() => {
    if (activeTab === 'stocks') {
      return data.stocks.filter(stock =>
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return data.crypto.filter(crypto =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, searchTerm, data]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono] p-4">
      <h1 className="text-2xl font-bold mb-6 text-[var(--neon)]">Markets</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[var(--surface-high)] text-[var(--neon)] border border-[var(--border-bright)]'
                : 'bg-[var(--surface-low)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="sticky top-0 bg-[var(--bg)] z-10 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--surface-low)] rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--border-bright)]"
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-[var(--surface-low)] rounded-lg animate-pulse" />
          ))
        ) : (
          filteredData.map((item, i) => (
            <MarketCard
              key={item.id || item.symbol}
              item={item}
              type={activeTab}
              sparklineData={yfData[activeTab]?.[i] || Array(7).fill(null)}
            />
          ))
        )}
      </div>
    </div>
  );
}