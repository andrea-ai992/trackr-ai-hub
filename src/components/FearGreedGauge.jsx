import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const FearGreedGauge = () => {
  const [score, setScore] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFearGreedIndex = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        if (!response.ok) throw new Error('Failed to fetch Fear & Greed Index');

        const data = await response.json();
        const currentScore = parseInt(data.data[0].value, 10);
        setScore(currentScore);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFearGreedIndex();
    const interval = setInterval(fetchFearGreedIndex, 300000);
    return () => clearInterval(interval);
  }, []);

  const getGaugeColor = (score) => {
    if (score < 20) return 'bg-red-500';
    if (score < 40) return 'bg-orange-500';
    if (score < 60) return 'bg-yellow-500';
    if (score < 80) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const getLabel = (score) => {
    if (score < 20) return 'Extreme Fear';
    if (score < 40) return 'Fear';
    if (score < 60) return 'Neutral';
    if (score < 80) return 'Greed';
    return 'Extreme Greed';
  };

  const normalizedScore = Math.min(Math.max(score, 0), 100);

  return (
    <div className="w-full p-4 bg-surface rounded-lg border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary font-medium text-sm">Fear & Greed Index</h3>
        {error && (
          <div className="flex items-center gap-1 text-red-500 text-xs">
            <AlertTriangle size={14} />
            <span>Error</span>
          </div>
        )}
      </div>

      <div className="relative w-full h-24 flex items-end justify-center">
        <div className="absolute bottom-0 left-0 w-full h-2 bg-surface-low rounded-full overflow-hidden">
          <div
            className={`absolute bottom-0 left-0 h-full ${getGaugeColor(normalizedScore)} transition-all duration-500 ease-out`}
            style={{ width: `${normalizedScore}%` }}
          />
          <div
            className="absolute top-0 left-0 w-full h-px bg-border-bright"
            style={{ left: `${normalizedScore}%`, width: '1px' }}
          />
        </div>

        <div
          className={`absolute bottom-6 w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${getGaugeColor(normalizedScore)}`}
          style={{
            left: `calc(${normalizedScore}% - 4rem)`,
            transform: `translateX(-50%) translateY(50%)`,
          }}
        >
          <span className="text-text-primary font-bold text-sm">{score}</span>
        </div>
      </div>

      <div className="mt-3 flex justify-between text-xs text-text-secondary">
        <span>0</span>
        <span>100</span>
      </div>

      <div className="mt-2 text-center">
        <p className="text-text-primary font-mono text-sm">{getLabel(normalizedScore)}</p>
      </div>

      {isLoading && !error && (
        <div className="mt-2 text-text-muted text-xs text-center">Updating...</div>
      )}
    </div>
  );
};

export default FearGreedGauge;