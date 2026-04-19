import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';

const Signals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    symbol: searchParams.get('symbol') || '',
    exchange: searchParams.get('exchange') || '',
    signalType: searchParams.get('signalType') || '',
    status: searchParams.get('status') || 'active',
    minConfidence: searchParams.get('minConfidence') || '70',
    sortBy: searchParams.get('sortBy') || 'timestamp',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  // Fetch signals based on debounced filters
  useEffect(() => {
    const fetchSignals = async () => {
      setLoading(true);
      setError(null);

      try {
        // Validate query parameters
        const validatedParams = {
          symbol: debouncedFilters.symbol.trim().toUpperCase(),
          exchange: debouncedFilters.exchange.trim().toUpperCase(),
          signalType: debouncedFilters.signalType.trim(),
          status: debouncedFilters.status,
          minConfidence: Math.max(0, Math.min(100, parseInt(debouncedFilters.minConfidence) || 70)),
          sortBy: ['timestamp', 'confidence', 'symbol'].includes(debouncedFilters.sortBy)
            ? debouncedFilters.sortBy
            : 'timestamp',
          sortOrder: ['asc', 'desc'].includes(debouncedFilters.sortOrder)
            ? debouncedFilters.sortOrder
            : 'desc',
        };

        // Update URL with validated params
        const newSearchParams = new URLSearchParams();
        if (validatedParams.symbol) newSearchParams.set('symbol', validatedParams.symbol);
        if (validatedParams.exchange) newSearchParams.set('exchange', validatedParams.exchange);
        if (validatedParams.signalType) newSearchParams.set('signalType', validatedParams.signalType);
        newSearchParams.set('status', validatedParams.status);
        newSearchParams.set('minConfidence', validatedParams.minConfidence.toString());
        newSearchParams.set('sortBy', validatedParams.sortBy);
        newSearchParams.set('sortOrder', validatedParams.sortOrder);

        setSearchParams(newSearchParams);

        // Mock API call - replace with actual fetch in production
        const mockSignals = [
          {
            id: '1',
            symbol: 'BTC/USD',
            exchange: 'BINANCE',
            signalType: 'BUY',
            price: 42000.50,
            confidence: 85,
            timestamp: '2024-05-20T10:30:00Z',
            status: 'active',
          },
          {
            id: '2',
            symbol: 'ETH/USD',
            exchange: 'BINANCE',
            signalType: 'SELL',
            price: 2800.75,
            confidence: 72,
            timestamp: '2024-05-20T10:25:00Z',
            status: 'active',
          },
        ];

        // Apply filters to mock data
        const filteredSignals = mockSignals.filter(signal => {
          return (
            (validatedParams.symbol === '' || signal.symbol.includes(validatedParams.symbol)) &&
            (validatedParams.exchange === '' || signal.exchange === validatedParams.exchange) &&
            (validatedParams.signalType === '' || signal.signalType === validatedParams.signalType) &&
            signal.status === validatedParams.status &&
            signal.confidence >= validatedParams.minConfidence
          );
        });

        // Apply sorting
        const sortedSignals = [...filteredSignals].sort((a, b) => {
          if (validatedParams.sortBy === 'timestamp') {
            return validatedParams.sortOrder === 'asc'
              ? new Date(a.timestamp) - new Date(b.timestamp)
              : new Date(b.timestamp) - new Date(a.timestamp);
          }
          if (validatedParams.sortBy === 'confidence') {
            return validatedParams.sortOrder === 'asc' ? a.confidence - b.confidence : b.confidence - a.confidence;
          }
          if (validatedParams.sortBy === 'symbol') {
            return validatedParams.sortOrder === 'asc'
              ? a.symbol.localeCompare(b.symbol)
              : b.symbol.localeCompare(a.symbol);
          }
          return 0;
        });

        setSignals(sortedSignals);
      } catch (err) {
        setError('Failed to fetch signals');
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [debouncedFilters, setSearchParams]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      symbol: '',
      exchange: '',
      signalType: '',
      status: 'active',
      minConfidence: '70',
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
  };

  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono]">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4 text-[var(--neon)]">Signals</h1>

        {/* Filters */}
        <div className="bg-[var(--surface)] rounded-lg p-4 mb-4 border border-[var(--border)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">Symbol</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  name="symbol"
                  value={filters.symbol}
                  onChange={handleFilterChange}
                  placeholder="BTC, ETH..."
                  className="w-full bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--neon)]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">Exchange</label>
              <select
                name="exchange"
                value={filters.exchange}
                onChange={handleFilterChange}
                className="w-full bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--neon)]"
              >
                <option value="">All</option>
                <option value="BINANCE">BINANCE</option>
                <option value="COINBASE">COINBASE</option>
                <option value="KRAKEN">KRAKEN</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">Signal Type</label>
              <select
                name="signalType"
                value={filters.signalType}
                onChange={handleFilterChange}
                className="w-full bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--neon)]"
              >
                <option value="">All</option>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
                <option value="HOLD">HOLD</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">Min Confidence</label>
              <input
                type="number"
                name="minConfidence"
                value={filters.minConfidence}
                onChange={handleFilterChange}
                min="0"
                max="100"
                className="w-full bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--neon)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              <label className="text-xs text-[var(--text-secondary)]">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--neon)]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="all">All</option>
              </select>
            </div>

            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--neon)] transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--text-secondary)]">Sort by</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--neon)]"
            >
              <option value="timestamp">Timestamp</option>
              <option value="confidence">Confidence</option>
              <option value="symbol">Symbol</option>
            </select>
            <button
              onClick={toggleSortOrder}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--neon)] transition-colors"
            >
              {filters.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>

        {/* Signals List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-[var(--text-muted)]">Loading signals...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : signals.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">No signals found</div>
        ) : (
          <div className="space-y-3">
            {signals.map((signal) => (
              <div
                key={signal.id}
                className="bg-[var(--surface)] rounded-lg p-3 border border-[var(--border)] hover:border-[var(--border-bright)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--neon)]">{signal.symbol}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{signal.exchange}</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {new Date(signal.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      signal.signalType === 'BUY' ? 'text-green-500' :
                      signal.signalType === 'SELL' ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {signal.signalType}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {signal.confidence}%
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-[var(--text-secondary)]">
                  Price: ${signal.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Signals;