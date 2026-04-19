import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TerminalCrypto = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? data : data.slice(0, 5);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neon-dim">
          Crypto Watchlist
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-neon-dim hover:text-neon transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} /> Collapse
            </>
          ) : (
            <>
              <ChevronDown size={14} /> Expand
            </>
          )}
        </button>
      </div>

      <div className="border-t border-border">
        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-low transition-colors"
          >
            <div className="col-span-1 flex items-center gap-2">
              <img src={item.icon} alt={item.symbol} className="w-6 h-6" />
              <span className="font-semibold text-sm">{item.symbol}</span>
            </div>

            <div className="col-span-1 text-right">
              <span className="text-sm tabular-nums">{item.price}</span>
            </div>

            <div className="col-span-1 text-right">
              <span className={`text-sm font-semibold ${item.change >= 0 ? 'text-neon' : 'text-red-500'}`}>
                {item.change >= 0 ? '+' : ''}{item.change}%
              </span>
            </div>

            <div className="col-span-2">
              <svg width="100" height="30" viewBox="0 0 100 30" className="w-full h-6">
                <polyline
                  fill="none"
                  stroke={item.change >= 0 ? '#00ff88' : '#ff4444'}
                  strokeWidth="1.5"
                  points={item.sparkline}
                />
              </svg>
            </div>

            <div className="col-span-1 text-right text-xs text-text-muted tabular-nums">
              {item.volume}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TerminalCrypto;