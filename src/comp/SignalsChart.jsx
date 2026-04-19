import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart2, AlertTriangle } from 'lucide-react';

const SignalsChart = ({ data }) => {
  const [activeTab, setActiveTab] = useState('RSI');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (data) {
      processChartData(data);
    }
  }, [data, activeTab]);

  const processChartData = (rawData) => {
    if (!rawData || !rawData.prices) return;

    const prices = rawData.prices;
    const rsiValues = rawData.rsi || [];
    const macdValues = rawData.macd || [];
    const volumeData = rawData.volume || [];

    let chartConfig = {
      labels: [],
      values: [],
      signals: [],
      bullishCount: 0,
      bearishCount: 0
    };

    const length = prices.length;

    switch (activeTab) {
      case 'RSI':
        for (let i = 0; i < length; i++) {
          if (i >= 14) {
            const rsi = rsiValues[i];
            chartConfig.labels.push(prices[i].date.split('T')[0]);
            chartConfig.values.push(rsi);

            if (rsi < 30) {
              chartConfig.signals.push({ type: 'bullish', value: rsi });
              chartConfig.bullishCount++;
            } else if (rsi > 70) {
              chartConfig.signals.push({ type: 'bearish', value: rsi });
              chartConfig.bearishCount++;
            } else {
              chartConfig.signals.push({ type: 'neutral', value: rsi });
            }
          }
        }
        break;

      case 'MACD':
        for (let i = 0; i < length; i++) {
          if (i >= 26) {
            const macd = macdValues[i];
            chartConfig.labels.push(prices[i].date.split('T')[0]);
            chartConfig.values.push(macd.macd);

            if (macd.macd > 0 && macd.signal > 0) {
              chartConfig.signals.push({ type: 'bullish', value: macd.macd });
              chartConfig.bullishCount++;
            } else if (macd.macd < 0 && macd.signal < 0) {
              chartConfig.signals.push({ type: 'bearish', value: macd.macd });
              chartConfig.bearishCount++;
            } else {
              chartConfig.signals.push({ type: 'neutral', value: macd.macd });
            }
          }
        }
        break;

      case 'Volume':
        for (let i = 0; i < length; i++) {
          const volume = volumeData[i] || 0;
          chartConfig.labels.push(prices[i].date.split('T')[0]);
          chartConfig.values.push(volume);

          if (volume > 0) {
            if (prices[i].close > prices[i].open) {
              chartConfig.signals.push({ type: 'bullish', value: volume });
              chartConfig.bullishCount++;
            } else {
              chartConfig.signals.push({ type: 'bearish', value: volume });
              chartConfig.bearishCount++;
            }
          } else {
            chartConfig.signals.push({ type: 'neutral', value: volume });
          }
        }
        break;

      default:
        break;
    }

    setChartData(chartConfig);
  };

  const getSignalIcon = (type) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp size={16} color="#00ff88" />;
      case 'bearish':
        return <TrendingDown size={16} color="#ff4444" />;
      default:
        return <BarChart2 size={16} color="#aaa" />;
    }
  };

  const getSignalColor = (type) => {
    switch (type) {
      case 'bullish':
        return 'var(--neon)';
      case 'bearish':
        return '#ff4444';
      default:
        return 'var(--text-secondary)';
    }
  };

  if (!data || !chartData) {
    return (
      <div className="signals-chart-container">
        <div className="chart-tabs">
          <button className={`tab-btn ${activeTab === 'RSI' ? 'active' : ''}`} onClick={() => setActiveTab('RSI')}>RSI</button>
          <button className={`tab-btn ${activeTab === 'MACD' ? 'active' : ''}`} onClick={() => setActiveTab('MACD')}>MACD</button>
          <button className={`tab-btn ${activeTab === 'Volume' ? 'active' : ''}`} onClick={() => setActiveTab('Volume')}>Volume</button>
        </div>
        <div className="chart-placeholder">
          <AlertTriangle size={48} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="signals-chart-container">
      <div className="chart-tabs">
        <button className={`tab-btn ${activeTab === 'RSI' ? 'active' : ''}`} onClick={() => setActiveTab('RSI')}>RSI</button>
        <button className={`tab-btn ${activeTab === 'MACD' ? 'active' : ''}`} onClick={() => setActiveTab('MACD')}>MACD</button>
        <button className={`tab-btn ${activeTab === 'Volume' ? 'active' : ''}`} onClick={() => setActiveTab('Volume')}>Volume</button>
      </div>

      <div className="chart-header">
        <h3>{activeTab}</h3>
        <div className="score-indicator">
          <span className="bullish-score">
            <TrendingUp size={14} color="#00ff88" /> {chartData.bullishCount}
          </span>
          <span className="bearish-score">
            <TrendingDown size={14} color="#ff4444" /> {chartData.bearishCount}
          </span>
        </div>
      </div>

      <div className="chart-area">
        <svg viewBox={`0 0 375 ${activeTab === 'Volume' ? 200 : 180}`} preserveAspectRatio="none">
          {chartData.values.map((value, index) => {
            const x = (index / (chartData.values.length - 1)) * 375;
            const y = activeTab === 'Volume'
              ? 200 - (Math.min(Math.max(value / (Math.max(...chartData.values) * 1.1), 0), 1) * 180)
              : activeTab === 'RSI'
                ? 180 - (Math.min(Math.max(value / 100, 0), 1) * 180)
                : 180 - (Math.min(Math.max((value + 20) / 40, 0), 1) * 180);

            const signal = chartData.signals[index];
            const color = getSignalColor(signal.type);

            return (
              <g key={index}>
                <line
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={180}
                  stroke={color}
                  strokeWidth={index === chartData.values.length - 1 ? 2 : 1}
                  strokeOpacity={0.6}
                />
                {index % Math.max(1, Math.floor(chartData.values.length / 10)) === 0 && (
                  <text
                    x={x}
                    y={190}
                    fill="var(--text-secondary)"
                    fontFamily="JetBrains Mono, monospace"
                    fontSize={10}
                    textAnchor="middle"
                  >
                    {chartData.labels[index]}
                  </text>
                )}
              </g>
            );
          })}

          {chartData.signals.map((signal, index) => {
            if (signal.type === 'neutral') return null;

            const x = (index / (chartData.values.length - 1)) * 375;
            const y = activeTab === 'Volume'
              ? 200 - (Math.min(Math.max(chartData.values[index] / (Math.max(...chartData.values) * 1.1), 0), 1) * 180)
              : activeTab === 'RSI'
                ? 180 - (Math.min(Math.max(chartData.values[index] / 100, 0), 1) * 180)
                : 180 - (Math.min(Math.max((chartData.values[index] + 20) / 40, 0), 1) * 180);

            return (
              <g key={`signal-${index}`} transform={`translate(${x}, ${y})`}>
                {getSignalIcon(signal.type)}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: 'var(--neon)' }}></div>
          <span>Bullish</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ff4444' }}></div>
          <span>Bearish</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: 'var(--text-secondary)' }}></div>
          <span>Neutre</span>
        </div>
      </div>
    </div>
  );
};

export default SignalsChart;