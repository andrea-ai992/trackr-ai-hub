// src/components/ChartAnalysisCard.jsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

const ChartAnalysisCard = ({ analysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!analysis) return null;

  const {
    recommendation,
    supportLevels,
    resistanceLevels,
    patterns,
    sentimentScore,
    timestamp
  } = analysis;

  const getRecommendationColor = () => {
    switch (recommendation) {
      case 'BUY': return 'bg-green-900/30 border-green-500';
      case 'SELL': return 'bg-red-900/30 border-red-500';
      default: return 'bg-yellow-900/30 border-yellow-500';
    }
  };

  return (
    <div className="w-full p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-[var(--text-secondary)]">ANALYSE IA</span>
          <div className={`px-2 py-1 text-xs font-mono rounded border ${getRecommendationColor()}`}>
            {recommendation}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-full hover:bg-[var(--surface-low)] transition-colors"
        >
          {isExpanded ? (
            <ChevronUp size={16} className="text-[var(--text-secondary)]" />
          ) : (
            <ChevronDown size={16} className="text-[var(--text-secondary)]" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-mono text-[var(--text-secondary)] mb-1">SUPPORT</h3>
              <div className="space-y-1">
                {supportLevels.map((level, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-mono text-[var(--text-primary)]">{level}</span>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-mono text-[var(--text-secondary)] mb-1">RÉSISTANCE</h3>
              <div className="space-y-1">
                {resistanceLevels.map((level, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-mono text-[var(--text-primary)]">{level}</span>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono text-[var(--text-secondary)] mb-1">PATTERNS</h3>
            <div className="flex flex-wrap gap-2">
              {patterns.map((pattern, index) => (
                <span key={index} className="px-2 py-1 text-xs font-mono bg-[var(--surface-high)] rounded border border-[var(--border)]">
                  {pattern}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[var(--text-secondary)]" />
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                {new Date(timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--text-secondary)]">SENTIMENT</span>
              <span className="text-sm font-mono text-[var(--text-primary)]">
                {sentimentScore.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartAnalysisCard;