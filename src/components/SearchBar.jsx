Je vais optimiser le composant `SearchBar.jsx` avec un schéma Zod pour valider les paramètres de recherche et améliorer la sécurité. Voici les modifications :

**src/components/SearchBar.jsx**
```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().max(100, "La recherche ne doit pas dépasser 100 caractères")
    .regex(/^[a-zA-Z0-9\s\-_@.]+$/, "Caractères non autorisés dans la recherche"),
});

function SearchBar({ onSearch, debounceTime = 300 }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const debouncedSearch = useCallback(
    useCallback((value) => {
      try {
        const validated = searchSchema.parse({ query: value });
        setError('');
        onSearch(validated.query);
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.errors[0].message);
        }
      }
    }, [onSearch]),
    [onSearch]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(query);
    }, debounceTime);

    return () => {
      clearTimeout(timer);
    };
  }, [query, debounceTime, debouncedSearch]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    debouncedSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full"
    >
      <div className="flex items-center bg-[var(--bg2)] rounded-md p-2 w-full">
        <input
          type="search"
          value={query}
          onChange={handleChange}
          placeholder="Recherche (symboles, noms)..."
          className="bg-transparent outline-none p-2 text-[var(--t2)] w-full"
          aria-label="Rechercher des actifs"
        />
        <button
          type="submit"
          className="bg-[var(--green)] h-8 w-8 rounded-full ml-2 flex items-center justify-center"
          aria-label="Rechercher"
        >
          <FaSearch className="text-[var(--bg)]" />
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 px-2" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default SearchBar;
```

**src/pages/Markets.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import SearchBar from '../components/SearchBar';
import { Tabs, TabList, TabPanels, TabPanel } from '@lucide-react';

function Markets() {
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tout');
  const [filters, setFilters] = useState({
    exchange: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    marketCap: '',
    volume: '',
  });

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const { data: stocksData, error: stocksError } = await supabase
          .from('stocks')
          .select('*')
          .order('symbol', { ascending: true });

        if (stocksError) throw stocksError;

        const { data: cryptoData, error: cryptoError } = await supabase
          .from('crypto')
          .select('*')
          .order('symbol', { ascending: true });

        if (cryptoError) throw cryptoError;

        setStocks(stocksData || []);
        setCrypto(cryptoData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching markets:', error);
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = (items) => {
    return items.filter(item => {
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesExchange = filters.exchange ? item.exchange === filters.exchange : true;
      const matchesCategory = filters.category ? item.category === filters.category : true;
      const matchesPrice = (filters.minPrice || filters.maxPrice)
        ? (filters.minPrice ? item.price >= parseFloat(filters.minPrice) : true) &&
          (filters.maxPrice ? item.price <= parseFloat(filters.maxPrice) : true)
        : true;

      const matchesMarketCap = filters.marketCap
        ? (() => {
            const cap = item.market_cap || 0;
            if (filters.marketCap === 'large') return cap >= 10000000000;
            if (filters.marketCap === 'medium') return cap >= 1000000000 && cap < 10000000000;
            if (filters.marketCap === 'small') return cap < 1000000000;
            return true;
          })()
        : true;

      return matchesSearch && matchesExchange && matchesCategory && matchesPrice && matchesMarketCap;
    });
  };

  const filteredStocks = applyFilters(stocks);
  const filteredCrypto = applyFilters(crypto);

  return (
    <div className="bg-[var(--bg)] min-h-screen p-4">
      <header className="sticky top-0 bg-[var(--bg)] py-2 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h1 className="text-[var(--t1)] font-bold">Markets</h1>
          <div className="w-full sm:w-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex justify-center gap-4"
          >
            <TabList className="flex gap-4">
              <Tab value="Tout">Tout</Tab>
              <Tab value="Stocks">Stocks</Tab>
              <Tab value="Crypto">Crypto</Tab>
            </TabList>
          </Tabs>
        </div>

        {activeTab === 'Stocks' && (
          <div className="bg-[var(--bg2)] rounded-lg p-4 mb-4">
            <h3 className="text-[var(--t1)] font-semibold mb-3">Filtres Stocks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[var(--t2)] text-sm block mb-1">Bourse</label>
                <select
                  name="exchange"
                  value={filters.exchange}
                  onChange={handleFilterChange}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded p-2 text-[var(--t1)]"
                >
                  <option value="">Toutes</option>
                  <option value="NYSE">NYSE</option>
                  <option value="NASDAQ">NASDAQ</option>
                  <option value="EURONEXT">EURONEXT</option>
                </select>
              </div>
              <div>
                <label className="text-[var(--t2)] text-sm block mb-1">Catégorie</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded p-2 text-[var(--t1)]"
                >
                  <option value="">Toutes</option>
                  <option value="Tech">Tech</option>
                  <option value="Finance">Finance</option>
                  <option value="Energy">Energy</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
              </div>
              <div>
                <label className="text-[var(--t2)] text-sm block mb-1">Prix min</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded p-2 text-[var(--t1)]"
                />
              </div>
              <div>
                <label className="text-[var(--t2)] text-sm block mb-1">Prix max</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="10000"
                  min="0"
                  step="0.01"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded p-2 text-[var(--t1)]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Crypto' && (
          <div className="bg-[var(--bg2)] rounded-lg p-4 mb-4">
            <h3 className="text-[var(--t1)] font-semibold mb-3">Filtres Crypto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[var(--t2)] text-sm block mb-1">Catégorie</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded p-2 text-[var(--t1)]"
                >
                  <option value="">Toutes</option>
                  <option value="DeFi">DeFi</option>
                  <option value="Layer 1">Layer 1</option>
                  <option value="Layer 2">Layer 2</option>
                  <option value="Meme">Meme</option>
                  <option value="Stablecoin">Stablecoin</option>
                </select>
              </div>
              <div>
                <label className="text-[var(--t2)] text-sm block mb-1">Capitalisation</label>
                <select
                  name="marketCap"
                  value={filters.marketCap}
                  onChange={handleFilterChange}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded p-2 text-[var(--t1)]"
                >
                  <option value="">Toutes</option>
                  <option value="large">Large (Top 50)</option>
                  <option value="medium">Medium (Top 50-200)</option>
                  <option value="small">Small (Top 200+)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array(6).fill(null).map((_, index) => (
              <div key={index} className="bg-[var(--bg2)] rounded-md p-4 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'Tout' && (
              <>
                <div className="mb-6">
                  <h2 className="text-[var(--t1)] font-bold mb-3">Stocks</h2>
                  {filteredStocks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredStocks.map((stock) => (
                        <Link
                          key={stock.id}
                          to={`/stocks/${stock.symbol}`}
                          className="block bg-[var(--bg2)] rounded-md p-4 hover:bg-[var(--bg3)] transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-[var(--t1)] font-bold">{stock.name}</h3>
                              <p className="text-[var(--t2)]">{stock.symbol} • {stock.exchange}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[var(--t1)] font-bold">${stock.price.toFixed(2)}</p>
                              <p className={`text-sm ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--t2)] text-center py-8">Aucun résultat trouvé</p>
                  )}
                </div>

                <div>
                  <h2 className="text-[var(--t1)] font-bold mb-3">Cryptos</h2>
                  {filteredCrypto.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredCrypto.map((crypto) => (
                        <Link
                          key={crypto.id}
                          to={`/crypto/${crypto.symbol}`}
                          className="block bg-[var(--bg2)] rounded-md p-4 hover:bg-[var(--bg3)] transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-[var(--t1)] font-bold">{crypto.name}</h3>
                              <p className="text-[var(--t2)]">{crypto.symbol}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[var(--t1)] font-bold">${crypto.price.toFixed(2)}</p>
                              <p className={`text-sm ${crypto.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {crypto.change_24h >= 0 ? '+' : ''}{crypto.change_24h.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--t2)] text-center py-8">Aucun résultat trouvé</p>
                  )}
                </div>
              </>
            )}

            {activeTab === 'Stocks' && (
              <div className="mb-6">
                <h2 className="text-[var(--t1)] font-bold mb-3">Stocks</h2>
                {filteredStocks.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredStocks.map((stock) => (
                      <Link
                        key={stock.id}
                        to={`/stocks/${stock.symbol}`}
                        className="block bg-[var(--bg2)] rounded-md p-4 hover:bg-[var(--bg3)] transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-[var(--t1)] font-bold">{stock.name}</h3>
                            <p className="text-[var(--t2)]">{stock.symbol} • {stock.exchange}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[var(--t1)] font-bold">${stock.price.toFixed(2)}</p>
                            <p className={`text-sm ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--t2)] text-center py-8">Aucun résultat trouvé</p>
                )}
              </div>
            )}

            {activeTab === 'Crypto' && (
              <div>
                <h2 className="text-[var(--t1)] font-bold mb-3">Cryptos</h2>
                {filteredCrypto.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredCrypto.map((crypto) => (
                      <Link
                        key={crypto.id}
                        to={`/crypto/${crypto.symbol}`}
                        className="block bg-[var(--bg2)] rounded-md p-4 hover:bg-[var(--bg3)] transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-[var(--t1)] font-bold">{crypto.name