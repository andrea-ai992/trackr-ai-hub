import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const SignalsChart = ({ data }) => {
  const [activeTab, setActiveTab] = useState('rsi');
  const [chartWidth, setChartWidth] = useState(375);
  const [chartHeight, setChartHeight] = useState(200);

  useEffect(() => {
    const handleResize = () => {
      setChartWidth(Math.min(375, window.innerWidth - 20));
      setChartHeight(Math.min(200, window.innerHeight * 0.25));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!data || !data.rsi || !data.macd || !data.volume) return null;

  const renderRSIChart = () => {
    const rsiValues = data.rsi.values;
    const rsiOverbought = 70;
    const rsiOversold = 30;
    const maxValue = Math.max(...rsiValues, rsiOverbought);
    const minValue = Math.min(...rsiValues, rsiOversold);

    return (
      <div className="chart-container" style={{ width: chartWidth, height: chartHeight }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="rsiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="var(--surface-low)" rx="4" />

          <path
            d={`M0,${chartHeight} ${rsiValues.map((val, i) => `${i * (chartWidth / (rsiValues.length - 1))},${chartHeight - ((val - minValue) / (maxValue - minValue)) * chartHeight}`).join(' ')}`}
            stroke="var(--neon)"
            strokeWidth="1.5"
            fill="url(#rsiGradient)"
            fillOpacity="0.6"
          />

          <line
            x1="0"
            y1={chartHeight - ((rsiOverbought - minValue) / (maxValue - minValue)) * chartHeight}
            x2={chartWidth}
            y2={chartHeight - ((rsiOverbought - minValue) / (maxValue - minValue)) * chartHeight}
            stroke="#ff4444"
            strokeWidth="1"
            strokeDasharray="2,2"
          />

          <line
            x1="0"
            y1={chartHeight - ((rsiOversold - minValue) / (maxValue - minValue)) * chartHeight}
            x2={chartWidth}
            y2={chartHeight - ((rsiOversold - minValue) / (maxValue - minValue)) * chartHeight}
            stroke="#4444ff"
            strokeWidth="1"
            strokeDasharray="2,2"
          />

          <text x={chartWidth - 40} y={20} fill="#ff4444" fontSize="10" fontFamily="JetBrains Mono">OB</text>
          <text x={chartWidth - 40} y={chartHeight - 5} fill="#4444ff" fontSize="10" fontFamily="JetBrains Mono">OS</text>
        </svg>

        <div className="chart-info">
          <div className="signal-item">
            <span className="signal-label">RSI: {data.rsi.current.toFixed(2)}</span>
            {data.rsi.current > rsiOverbought && (
              <span className="signal-bearish">
                <TrendingDown size={14} /> Overbought
              </span>
            )}
            {data.rsi.current < rsiOversold && (
              <span className="signal-bullish">
                <TrendingUp size={14} /> Oversold
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMACDChart = () => {
    const macdLine = data.macd.macdLine;
    const signalLine = data.macd.signalLine;
    const histogram = data.macd.histogram;

    const maxValue = Math.max(...macdLine.map((val, i) => Math.max(val, signalLine[i], histogram[i])));
    const minValue = Math.min(...macdLine.map((val, i) => Math.min(val, signalLine[i], histogram[i])));

    return (
      <div className="chart-container" style={{ width: chartWidth, height: chartHeight }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="macdGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="var(--surface-low)" rx="4" />

          <path
            d={`M0,${chartHeight/2} ${macdLine.map((val, i) => `${i * (chartWidth / (macdLine.length - 1))},${chartHeight/2 - (val / maxValue) * (chartHeight/2)}`).join(' ')}`}
            stroke="#00ff88"
            strokeWidth="1.5"
            fill="none"
          />

          <path
            d={`M0,${chartHeight/2} ${signalLine.map((val, i) => `${i * (chartWidth / (signalLine.length - 1))},${chartHeight/2 - (val / maxValue) * (chartHeight/2)}`).join(' ')}`}
            stroke="#ffaa00"
            strokeWidth="1.5"
            fill="none"
          />

          {histogram.map((val, i) => (
            <rect
              key={i}
              x={i * (chartWidth / (histogram.length - 1)) - 1}
              y={chartHeight/2 - (val / maxValue) * (chartHeight/2)}
              width="2"
              height={Math.abs((val / maxValue) * (chartHeight/2))}
              fill={val > 0 ? "#00ff88" : "#ff4444"}
            />
          ))}
        </svg>

        <div className="chart-info">
          <div className="signal-item">
            <span className="signal-label">MACD: {data.macd.current.toFixed(4)}</span>
            <span className={`signal-${data.macd.histogram[data.macd.histogram.length-1] > 0 ? 'bullish' : 'bearish'}`}>
              {data.macd.histogram[data.macd.histogram.length-1] > 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              {data.macd.histogram[data.macd.histogram.length-1] > 0 ? ' Bullish' : ' Bearish'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderVolumeChart = () => {
    const volumeValues = data.volume.values;
    const priceChanges = data.volume.priceChanges;

    const maxVolume = Math.max(...volumeValues);
    const minVolume = Math.min(...volumeValues.filter(v => v > 0));

    return (
      <div className="chart-container" style={{ width: chartWidth, height: chartHeight }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="var(--surface-low)" rx="4" />

          {volumeValues.map((vol, i) => (
            <rect
              key={i}
              x={i * (chartWidth / (volumeValues.length - 1))}
              y={chartHeight - (vol / maxVolume) * chartHeight}
              width={Math.max(1, chartWidth / (volumeValues.length - 1) - 1)}
              height={(vol / maxVolume) * chartHeight}
              fill={priceChanges[i] > 0 ? "var(--neon)" : "#ff4444"}
              opacity="0.8"
            />
          ))}
        </svg>

        <div className="chart-info">
          <div className="signal-item">
            <span className="signal-label">Volume: {data.volume.current.toLocaleString()}</span>
            <span className={`signal-${priceChanges[priceChanges.length-1] > 0 ? 'bullish' : 'bearish'}`}>
              {priceChanges[priceChanges.length-1] > 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              {priceChanges[priceChanges.length-1] > 0 ? ' Up' : ' Down'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="signals-chart" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      <div className="chart-tabs">
        <button
          className={`tab-button ${activeTab === 'rsi' ? 'active' : ''}`}
          onClick={() => setActiveTab('rsi')}
        >
          RSI
        </button>
        <button
          className={`tab-button ${activeTab === 'macd' ? 'active' : ''}`}
          onClick={() => setActiveTab('macd')}
        >
          MACD
        </button>
        <button
          className={`tab-button ${activeTab === 'volume' ? 'active' : ''}`}
          onClick={() => setActiveTab('volume')}
        >
          Volume
        </button>
      </div>

      <div className="chart-content">
        {activeTab === 'rsi' && renderRSIChart()}
        {activeTab === 'macd' && renderMACDChart()}
        {activeTab === 'volume' && renderVolumeChart()}
      </div>
    </div>
  );
};

export default SignalsChart;