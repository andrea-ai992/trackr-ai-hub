// src/components/ChartAnalysisCard.jsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const ChartAnalysisCard = ({ analysis, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!analysis && !isLoading) return null;

  return (
    <div className="w-full p-4 border border--border rounded-lg bg--surface surface-high">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text--neon" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text--text-primary font-bold text-lg">Analyse IA</h3>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 text--text-secondary hover:text--neon transition-colors"
            >
              {isOpen ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-sm">Masquer</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span className="text-sm">Voir détails</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text--text-secondary text-sm">Recommandation:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  analysis.recommendation === 'BUY'
                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                    : analysis.recommendation === 'SELL'
                    ? 'bg-red-900/30 text-red-400 border border-red-800'
                    : 'bg-orange-900/30 text-orange-400 border border-orange-800'
                }`}
              >
                {analysis.recommendation}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text--text-secondary text-sm font-mono">Niveaux clés</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text--text-muted">Support:</span>
                    <span className="text--text-primary font-mono">{analysis.support.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text--text-muted">Résistance:</span>
                    <span className="text--text-primary font-mono">{analysis.resistance.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text--text-secondary text-sm font-mono">Patterns détectés</h4>
                <div className="space-y-1">
                  {analysis.patterns.map((pattern, i) => (
                    <div key={i} className="text-sm text--text-primary font-mono">
                      • {pattern}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="text--text-secondary text-sm font-mono">Sentiment</h4>
                <div className="w-24 h-2 bg--surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg--neon transition-all duration-500"
                    style={{ width: `${analysis.sentimentScore * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text--text-primary font-mono">
                {Math.round(analysis.sentimentScore * 100)}%
              </div>
            </div>
          </div>

          {isOpen && (
            <div className="mt-4 pt-4 border-t border--border">
              <h4 className="text--text-secondary text-sm font-mono mb-2">Détails techniques</h4>
              <div className="space-y-2 text-sm text--text-primary font-mono whitespace-pre-wrap">
                {analysis.details}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChartAnalysisCard;