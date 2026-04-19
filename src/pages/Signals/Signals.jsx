import { useState, useEffect, useRef } from 'react';
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
  const chartRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    const fetchSignals = async () => {
      setLoading(true);
      setError(null);

      try {
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

        const newSearchParams = new URLSearchParams();
        if (validatedParams.symbol) newSearchParams.set('symbol', validatedParams.symbol);
        if (validatedParams.exchange) newSearchParams.set('exchange', validatedParams.exchange);
        if (validatedParams.signalType) newSearchParams.set('signalType', validatedParams.signalType);
        newSearchParams.set('status', validatedParams.status);
        newSearchParams.set('minConfidence', validatedParams.minConfidence.toString());
        newSearchParams.set('sortBy', validatedParams.sortBy);
        newSearchParams.set('sortOrder', validatedParams.sortOrder);

        setSearchParams(newSearchParams);

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
            indicators: {
              rsi: 72,
              macd: { line: 0.45, signal: 0.38 },
              volume: 1250000,
              rsiScore: 7,
              macdScore: 8,
              volumeScore: 6,
            },
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
            indicators: {
              rsi: 28,
              macd: { line: -0.32, signal: -0.25 },
              volume: 890000,
              rsiScore: 3,
              macdScore: 2,
              volumeScore: 4,
            },
          },
          {
            id: '3',
            symbol: 'SOL/USD',
            exchange: 'BINANCE',
            signalType: 'BUY',
            price: 145.25,
            confidence: 92,
            timestamp: '2024-05-20T10:20:00Z',
            status: 'active',
            indicators: {
              rsi: 68,
              macd: { line: 0.12, signal: 0.08 },
              volume: 3400000,
              rsiScore: 6,
              macdScore: 5,
              volumeScore: 9,
            },
          },
          {
            id: '4',
            symbol: 'ADA/USD',
            exchange: 'COINBASE',
            signalType: 'HOLD',
            price: 0.42,
            confidence: 65,
            timestamp: '2024-05-20T10:15:00Z',
            status: 'active',
            indicators: {
              rsi: 52,
              macd: { line: -0.05, signal: -0.02 },
              volume: 520000,
              rsiScore: 5,
              macdScore: 4,
              volumeScore: 3,
            },
          },
        ];

        const filteredSignals = mockSignals.filter(signal => {
          return (
            (validatedParams.symbol === '' || signal.symbol.includes(validatedParams.symbol)) &&
            (validatedParams.exchange === '' || signal.exchange === validatedParams.exchange) &&
            (validatedParams.signalType === '' || signal.signalType === validatedParams.signalType) &&
            (validatedParams.status === 'all' || signal.status === validatedParams.status) &&
            signal.confidence >= validatedParams.minConfidence
          );
        });

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

  const getScoreColor = (score) => {
    if (score >= 7) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSignalColor = (type) => {
    if (type === 'BUY') return 'text-green-400';
    if (type === 'SELL') return 'text-red-400';
    return 'text-yellow-400';
  };

  const renderChart = () => {
    if (signals.length === 0) return null;

    return (
      <div ref={chartRef} className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--border)] mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[var(--neon)]">Technical Indicators</h3>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span>RSI</span>
            <span>MACD</span>
            <span>Volume</span>
          </div>
        </div>

        <div className="space-y-3">
          {signals.map((signal) => (
            <div key={signal.id} className="border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${getSignalColor(signal.signalType)}`}>
                    {signal.signalType}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">{signal.symbol}</span>
                  <span className="text-xs text-[var(--text-muted)]">{signal.exchange}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">RSI:</span>
                    <span className={`text-xs font-mono ${getScoreColor(signal.indicators.rsiScore)}`}>
                      {signal.indicators.rsi.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">MACD:</span>
                    <span className={`text-xs font-mono ${signal.indicators.macd.line > signal.indicators.macd.signal ? 'text-green-400' : 'text-red-400'}`}>
                      {signal.indicators.macd.line > 0 ? '+' : ''}{signal.indicators.macd.line.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">Vol:</span>
                    <span className={`text-xs font-mono ${getScoreColor(signal.indicators.volumeScore)}`}>
                      {signal.indicators.volume.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono]">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4 text-[var(--neon)]">Signals</h1>

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

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--text-secondary)]">Sort by</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--neon)]"
            >
              <option value="timestamp">Time</option>
              <option value="confidence">Confidence</option>
              <option value="symbol">Symbol</option>
            </select>
          </div>

          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--neon)] transition-colors"
          >
            <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
            <span>Sort</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-[var(--text-muted)] text-sm">Loading signals...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        ) : signals.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-[var(--text-muted)] text-sm">No signals found</div>
          </div>
        ) : (
          <>
            <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--border)] mb-4 overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-6 gap-4 text-xs text-[var(--text-secondary)] mb-3">
                  <div>Signal</div>
                  <div>Symbol</div>
                  <div>Exchange</div>
                  <div>Price</div>
                  <div>Confidence</div>
                  <div>Time</div>
                </div>
                <div className="space-y-2">
                  {signals.map((signal) => (
                    <div key={signal.id} className="grid grid-cols-6 gap-4 text-xs py-2 border-t border-[var(--border)] first:border-t-0">
                      <div>
                        <span className={`font-mono ${getSignalColor(signal.signalType)}`}>
                          {signal.signalType}
                        </span>
                      </div>
                      <div className="font-mono">{signal.symbol}</div>
                      <div className="text-[var(--text-muted)]">{signal.exchange}</div>
                      <div className="font-mono">${signal.price.toFixed(2)}</div>
                      <div>
                        <span className={`font-mono ${signal.confidence >= 70 ? 'text-green-400' : signal.confidence >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {signal.confidence}%
                        </span>
                      </div>
                      <div className="text-[var(--text-muted)]">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {renderChart()}
          </>
        )}
      </div>
    </div>
  );
};

export default Signals;