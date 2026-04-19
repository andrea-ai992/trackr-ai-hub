import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon, Button } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useQuery } from '../utils/supabase';
import { fetchYahooFinance } from '../utils/fetchYahooFinance';
import { fetchCoinGecko } from '../utils/fetchCoinGecko';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  variation24h: number;
}

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
}

const Markets = () => {
  const location = useLocation();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      const response = await fetchYahooFinance();
      setStocks(response.data);
    };

    const fetchCryptos = async () => {
      const response = await fetchCoinGecko();
      setCryptos(response.data);
    };

    fetchStocks();
    fetchCryptos();
    setLoading(false);
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const sortedStocks = stocks.sort((a, b) => {
    if (sortDirection === 'asc') {
      return a.variation24h - b.variation24h;
    } else {
      return b.variation24h - a.variation24h;
    }
  });

  const sortedCryptos = cryptos.sort((a, b) => {
    if (sortDirection === 'asc') {
      return a.current_price - b.current_price;
    } else {
      return b.current_price - a.current_price;
    }
  });

  return (
    <div className="h-screen overflow-y-auto">
      <header className="sticky top-0 bg--surface-low z-10">
        <nav className="flex justify-between items-center p-4">
          <Link to="/markets/stocks">
            <Button
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
            >
              <Icon name="chart-line" size={16} />
              <span className="text--text-primary">Stocks</span>
            </Button>
          </Link>
          <Link to="/markets/crypto">
            <Button
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
            >
              <Icon name="chart-line" size={16} />
              <span className="text--text-primary">Crypto</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearch}
              className="w-48 p-2 pl-10 text--text-primary"
              placeholder="Recherche"
            />
            <Button
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
              onClick={handleSort}
            >
              <Icon name="sort" size={16} />
              <span className="text--text-primary">Trier</span>
            </Button>
          </div>
        </nav>
      </header>
      <main className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border--border-bright" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedStocks.map((stock) => (
              <div key={stock.symbol} className="bg--surface p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text--text-primary">{stock.name}</span>
                  <span className="text--text-muted">{stock.symbol}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text--text-primary">{stock.price}</span>
                  <span
                    className={`text--text-muted ${
                      stock.variation24h > 0 ? 'text--text-muted' : 'text--text-error'
                    }`}
                  >
                    {stock.variation24h > 0 ? '+' : ''}
                    {Math.abs(stock.variation24h).toFixed(2)}%
                  </span>
                </div>
                <div className="h-4 w-24 bg--surface-low rounded-lg" />
              </div>
            ))}
            {sortedCryptos.map((crypto) => (
              <div key={crypto.id} className="bg--surface p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text--text-primary">{crypto.name}</span>
                  <span className="text--text-muted">{crypto.symbol}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text--text-primary">{crypto.current_price}</span>
                  <span className="text--text-muted">{crypto.market_cap}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text--text-primary">{crypto.total_volume}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Markets;