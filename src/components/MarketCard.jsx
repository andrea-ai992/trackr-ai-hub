// src/components/MarketCard.jsx
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const MarketCard = ({ symbol, name, price, change, changePercent, logoUrl, sparklineData }) => {
  const isPositive = changePercent >= 0;
  const neonColor = isPositive ? 'var(--neon)' : '#ff4444';
  const bgColor = isPositive ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)';

  return (
    <div
      className="w-full p-3 border-b border-border flex items-center gap-3 hover:bg-surface-low transition-colors"
      style={{ borderBottomColor: 'var(--border)' }}
    >
      <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center">
        <img src={logoUrl} alt={name} className="w-8 h-8 object-contain" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-text-primary font-medium text-sm">{symbol}</span>
          <span className="text-text-secondary text-xs">{name}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-text-primary font-bold text-base">${price.toFixed(2)}</span>
          <span
            className="text-sm"
            style={{ color: isPositive ? 'var(--neon)' : '#ff4444' }}
          >
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="w-20 h-10 flex items-end">
        <svg viewBox="0 0 50 20" className="w-full h-full">
          <polyline
            fill="none"
            stroke={neonColor}
            strokeWidth="1.5"
            points={sparklineData.map((val, i) => `${i * 5},${20 - val * 10}`).join(' ')}
          />
        </svg>
      </div>
      <ChevronDown size={16} className="text-text-muted" />
    </div>
  );
};

export default MarketCard;