// src/components/PortfolioPerformance.jsx
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, PieChart } from 'lucide-react';

const PortfolioPerformance = ({ data }) => {
  const [activeTab, setActiveTab] = useState('performance');

  if (!data) return null;

  const totalPL = data.positions.reduce((sum, pos) => sum + (pos.currentValue - pos.costBasis), 0);
  const totalValue = data.positions.reduce((sum, pos) => sum + pos.currentValue, 0);
  const totalPLPercent = totalValue > 0 ? (totalPL / totalValue) * 100 : 0;

  const getPLColor = (value) => {
    if (value > 0) return 'var(--neon)';
    if (value < 0) return '#ff4444';
    return 'var(--text-primary)';
  };

  const renderDonutChart = () => {
    const sectors = data.positions.map(pos => ({
      ticker: pos.ticker,
      value: pos.currentValue,
      color: pos.pl > 0 ? 'var(--neon)' : '#ff4444'
    }));

    const total = sectors.reduce((sum, sector) => sum + sector.value, 0);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (totalPLPercent / 100) * circumference;

    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="var(--surface-low)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={totalPLPercent > 0 ? 'var(--neon)' : '#ff4444'}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-center" style={{ color: getPLColor(totalPL) }}>
            {totalPLPercent > 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  };

  const renderPerformanceChart = () => {
    const days = 30;
    const dataPoints = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 86400000).toISOString().split('T')[0],
      value: 100 + Math.sin(i * 0.2) * 15 + (Math.random() * 10 - 5)
    }));

    const maxValue = Math.max(...dataPoints.map(d => d.value));
    const minValue = Math.min(...dataPoints.map(d => d.value));
    const range = maxValue - minValue;

    return (
      <svg className="w-full h-20" viewBox="0 0 300 80">
        <polyline
          fill="none"
          stroke={totalPL > 0 ? 'var(--neon)' : '#ff4444'}
          strokeWidth="2"
          points={dataPoints.map((point, i) =>
            `${i * 10},${80 - ((point.value - minValue) / range) * 60}`
          ).join(' ')}
        />
        <polyline
          fill="none"
          stroke="rgba(0,255,136,0.2)"
          strokeWidth="1"
          points={dataPoints.map((point, i) =>
            `${i * 10},${80 - ((point.value - minValue) / range) * 60}`
          ).join(' ')}
        />
      </svg>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold tracking-wider">PERFORMANCE</h2>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 text-xs font-bold rounded ${activeTab === 'performance' ? 'bg-neon text-black' : 'bg-surface-low text-neon'}`}
            onClick={() => setActiveTab('performance')}
          >
            PERF
          </button>
          <button
            className={`px-3 py-1 text-xs font-bold rounded ${activeTab === 'allocation' ? 'bg-neon text-black' : 'bg-surface-low text-neon'}`}
            onClick={() => setActiveTab('allocation')}
          >
            ALLOC
          </button>
        </div>
      </div>

      {activeTab === 'performance' ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold tabular-nums" style={{ color: getPLColor(totalPL) }}>
                {totalPL > 0 ? '+' : ''}{totalPL.toFixed(2)}
              </span>
              <span className="text-sm text-muted">TOTAL P&L</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={16} style={{ color: getPLColor(totalPL) }} />
              <span className="text-sm font-bold" style={{ color: getPLColor(totalPL) }}>
                {totalPLPercent > 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="bg-surface rounded-lg p-4">
            {renderPerformanceChart()}
            <div className="flex justify-between text-xs text-muted mt-2">
              <span>{new Date(Date.now() - 30 * 86400000).toLocaleDateString()}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold tabular-nums" style={{ color: getPLColor(totalPL) }}>
                {totalPL > 0 ? '+' : ''}{totalPL.toFixed(2)}
              </span>
              <span className="text-sm text-muted">TOTAL P&L</span>
            </div>
            <div className="flex items-center gap-1">
              <PieChart size={16} style={{ color: 'var(--neon)' }} />
              <span className="text-sm font-bold text-neon">ALLOCATION</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {renderDonutChart()}
            <div className="flex-1 flex flex-col gap-2">
              {data.positions.map((pos, i) => {
                const valuePercent = (pos.currentValue / totalValue) * 100;
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pos.pl > 0 ? 'var(--neon)' : '#ff4444' }} />
                      <span className="font-bold">{pos.ticker}</span>
                    </div>
                    <span className="text-muted">{valuePercent.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPerformance;