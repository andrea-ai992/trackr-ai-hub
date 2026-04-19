// src/comp/ChartAnalysis.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';

const ChartAnalysis = () => {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('rsi');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/chart/${symbol}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) fetchData();
  }, [symbol]);

  if (loading) return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse text-neon text-sm">Loading...</div>
    </div>
  );

  if (error || !data) return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
      <AlertTriangle className="text-red-500" size={24} />
      <div className="text-text-muted text-sm">{error || 'No data available'}</div>
    </div>
  );

  const renderRSIChart = () => {
    const rsi = data.indicators?.rsi || [];
    const overbought = rsi.filter(v => v > 70).length;
    const oversold = rsi.filter(v => v < 30).length;
    const avg = rsi.reduce((a, b) => a + b, 0) / rsi.length;
    const bullish = rsi.slice(-10).every(v => v > 50) ? 'Strong' :
                   rsi.slice(-5).every(v => v > 50) ? 'Moderate' : 'Weak';
    const bearish = rsi.slice(-10).every(v => v < 50) ? 'Strong' :
                   rsi.slice(-5).every(v => v < 50) ? 'Moderate' : 'Weak';

    return (
      <div className="w-full h-full flex flex-col gap-2">
        <div className="flex items-center gap-2 text-neon text-xs">
          <TrendingUp size={14} />
          <span>RSI: {avg.toFixed(2)}</span>
          <span className={bullish === 'Strong' ? 'text-green-400' : bullish === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}>
            {bullish} Bullish
          </span>
          <span className={bearish === 'Strong' ? 'text-red-400' : bearish === 'Moderate' ? 'text-yellow-400' : 'text-green-400'}>
            {bearish} Bearish
          </span>
        </div>
        <div className="flex-1 bg-surface-low rounded border border-border rounded-lg p-2">
          <svg viewBox="0 0 300 100" className="w-full h-full">
            <polyline
              points={rsi.map((v, i) => `${i * 3},${100 - (v / 100) * 100}`).join(' ')}
              stroke="#00ff88"
              strokeWidth="1"
              fill="none"
            />
            <line x1="0" y1="30" x2="300" y2="30" stroke="#ff0000" strokeWidth="1" strokeDasharray="2" />
            <line x1="0" y1="70" x2="300" y2="70" stroke="#0000ff" strokeWidth="1" strokeDasharray="2" />
          </svg>
        </div>
      </div>
    );
  };

  const renderMACDChart = () => {
    const macd = data.indicators?.macd || [];
    const signal = data.indicators?.macdSignal || [];
    const histogram = data.indicators?.macdHistogram || [];

    const bullish = histogram.slice(-5).every(v => v > 0) ? 'Strong' :
                   histogram.slice(-3).every(v => v > 0) ? 'Moderate' : 'Weak';
    const bearish = histogram.slice(-5).every(v => v < 0) ? 'Strong' :
                   histogram.slice(-3).every(v => v < 0) ? 'Moderate' : 'Weak';

    return (
      <div className="w-full h-full flex flex-col gap-2">
        <div className="flex items-center gap-2 text-neon text-xs">
          <BarChart3 size={14} />
          <span>MACD: {macd.slice(-1)[0]?.toFixed(2)}</span>
          <span className={bullish === 'Strong' ? 'text-green-400' : bullish === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}>
            {bullish} Bullish
          </span>
          <span className={bearish === 'Strong' ? 'text-red-400' : bearish === 'Moderate' ? 'text-yellow-400' : 'text-green-400'}>
            {bearish} Bearish
          </span>
        </div>
        <div className="flex-1 bg-surface-low rounded border border-border rounded-lg p-2">
          <svg viewBox="0 0 300 100" className="w-full h-full">
            <polyline
              points={macd.map((v, i) => `${i * 3},${50 - v * 2}`).join(' ')}
              stroke="#00ff88"
              strokeWidth="1"
              fill="none"
            />
            <polyline
              points={signal.map((v, i) => `${i * 3},${50 - v * 2}`).join(' ')}
              stroke="#ff00ff"
              strokeWidth="1"
              fill="none"
            />
            <polyline
              points={histogram.map((v, i) => `${i * 3},${50 - v * 2}`).join(' ')}
              stroke={histogram.slice(-1)[0] > 0 ? '#00ff88' : '#ff0000'}
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>
    );
  };

  const renderVolumeChart = () => {
    const volume = data.volume || [];
    const price = data.price || [];
    const bullish = price.slice(-5).every((p, i) => p > price[i - 1]) ? 'Strong' :
                   price.slice(-3).every((p, i) => p > price[i - 1]) ? 'Moderate' : 'Weak';
    const bearish = price.slice(-5).every((p, i) => p < price[i - 1]) ? 'Strong' :
                   price.slice(-3).every((p, i) => p < price[i - 1]) ? 'Moderate' : 'Weak';

    return (
      <div className="w-full h-full flex flex-col gap-2">
        <div className="flex items-center gap-2 text-neon text-xs">
          <TrendingUp size={14} />
          <span>Volume: {volume.slice(-1)[0].toLocaleString()}</span>
          <span className={bullish === 'Strong' ? 'text-green-400' : bullish === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}>
            {bullish} Bullish
          </span>
          <span className={bearish === 'Strong' ? 'text-red-400' : bearish === 'Moderate' ? 'text-yellow-400' : 'text-green-400'}>
            {bearish} Bearish
          </span>
        </div>
        <div className="flex-1 bg-surface-low rounded border border-border rounded-lg p-2">
          <svg viewBox="0 0 300 100" className="w-full h-full">
            <polyline
              points={volume.map((v, i) => `${i * 3},${100 - (v / Math.max(...volume)) * 100}`).join(' ')}
              stroke="#00ff88"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-2 p-2 text-jetbrains font-mono">
      <div className="flex gap-1 bg-surface rounded-lg p-1 border border-border">
        <button
          onClick={() => setActiveTab('rsi')}
          className={`px-2 py-1 text-xs rounded ${activeTab === 'rsi' ? 'bg-surface-high text-neon border border-border' : 'text-text-secondary'}`}
        >
          RSI
        </button>
        <button
          onClick={() => setActiveTab('macd')}
          className={`px-2 py-1 text-xs rounded ${activeTab === 'macd' ? 'bg-surface-high text-neon border border-border' : 'text-text-secondary'}`}
        >
          MACD
        </button>
        <button
          onClick={() => setActiveTab('volume')}
          className={`px-2 py-1 text-xs rounded ${activeTab === 'volume' ? 'bg-surface-high text-neon border border-border' : 'text-text-secondary'}`}
        >
          Volume
        </button>
      </div>
      <div className="flex-1 bg-surface rounded-lg border border-border overflow-hidden">
        {activeTab === 'rsi' && renderRSIChart()}
        {activeTab === 'macd' && renderMACDChart()}
        {activeTab === 'volume' && renderVolumeChart()}
      </div>
    </div>
  );
};

export default ChartAnalysis;