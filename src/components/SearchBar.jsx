Je vais optimiser le composant `SearchBar.jsx` avec un debounce de 300ms et l'intégrer avec les filtres stocks/crypto dans `Markets.jsx`. Voici les modifications :

**src/components/SearchBar.jsx**
```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';

function SearchBar({ onSearch, debounceTime = 300 }) {
  const [query, setQuery] = useState('');

  const debouncedSearch = useCallback(
    useCallback((value) => {
      onSearch(value);
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
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-[var(--bg2)] rounded-md p-2 w-full"
    >
      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Recherche..."
        className="bg-transparent outline-none p-2 text-[var(--t2)] w-full"
      />
      <button
        type="submit"
        className="bg-[var(--green)] h-8 w-8 rounded-full ml-2 flex items-center justify-center"
      >
        <FaSearch className="text-[var(--bg)]" />
      </button>
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
import { Tabs, TabList, TabPanels, TabPanel } from '@lucide-react/core';

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
        // Fetch stocks
        const { data: stocksData, error: stocksError } = await supabase
          .from('stocks')
          .select('*')
          .order('symbol', { ascending: true });

        if (stocksError) throw stocksError;

        // Fetch crypto
        const { data: cryptoData, error: cryptoError } = await supabase
          .from('crypto')
          .select('*')
          .order('symbol', { ascending: true });

        if (cryptoError) throw cryptoError;

        setStocks(stocksData);
        setCrypto(cryptoData);
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
      // Filtre par recherche
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.symbol.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtres spécifiques
      const matchesExchange = filters.exchange ? item.exchange === filters.exchange : true;
      const matchesCategory = filters.category ? item.category === filters.category : true;
      const matchesPrice = filters.minPrice || filters.maxPrice
        ? (filters.minPrice ? item.price >= parseFloat(filters.minPrice) : true) &&
          (filters.maxPrice ? item.price <= parseFloat(filters.maxPrice) : true)
        : true;

      return matchesSearch && matchesExchange && matchesCategory && matchesPrice;
    });
  };

  const filteredStocks = applyFilters(stocks);
  const filteredCrypto = applyFilters(crypto);

  return (
    <div className="bg-[var(--bg)] min-h-screen p-4">
      <header className="sticky top-0 bg-[var(--bg)] py-2 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-[var(--t1)] font-bold">Markets</h1>
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="flex justify-center mb-4">
          <Tabs
            active={activeTab}
            onChange={handleTabChange}
            className="flex justify-center gap-4"
          >
            <TabList>
              <Tab>Tout</Tab>
              <Tab>Stocks</Tab>
              <Tab>Crypto</Tab>
            </TabList>
          </Tabs>
        </div>

        {activeTab === 'Stocks' && (
          <div className="bg-[var(--bg2)] rounded-lg p-4 mb-4">
            <h3 className="text-[var(--t1)] font-semibold mb-3">Filtres Stocks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded p-2 text-[var(--t1)]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Crypto' && (
          <div className="bg-[var(--bg2)] rounded-lg p-4 mb-4">
            <h3 className="text-[var(--t1)] font-semibold mb-3">Filtres Crypto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <div className="grid grid-cols-1 gap-4">
                    {filteredStocks.map((stock) => (
                      <div key={stock.id} className="bg-[var(--bg2)] rounded-md p-4">
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
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-[var(--t1)] font-bold mb-3">Cryptos</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {filteredCrypto.map((crypto) => (
                      <div key={crypto.id} className="bg-[var(--bg2)] rounded-md p-4">
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
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Stocks' && (
              <div className="grid grid-cols-1 gap-4">
                {filteredStocks.map((stock) => (
                  <div key={stock.id} className="bg-[var(--bg2)] rounded-md p-4">
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
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Crypto' && (
              <div className="grid grid-cols-1 gap-4">
                {filteredCrypto.map((crypto) => (
                  <div key={crypto.id} className="bg-[var(--bg2)] rounded-md p-4">
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
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Markets;