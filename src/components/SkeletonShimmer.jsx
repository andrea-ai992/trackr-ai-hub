src/components/SkeletonShimmer.jsx
```jsx
import React from 'react';

const SkeletonShimmer = ({ width = '100%', height = '1.5rem', className = '' }) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{ width, height }}
      aria-busy="true"
      aria-live="polite"
    >
      <style jsx>{`
        .skeleton-shimmer {
          position: relative;
          overflow: hidden;
          background-color: var(--bg2);
          border-radius: 0.25rem;
          border: 1px solid var(--border);
        }

        .skeleton-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 136, 0.2),
            transparent
          );
          animation: shimmer 1.5s infinite ease-in-out;
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SkeletonShimmer;
```

src/pages/ChartAnalysis/ChartAnalysis.jsx
```jsx
import React, { useState, useEffect } from 'react';
import SkeletonShimmer from '../../components/SkeletonShimmer';

const ChartAnalysis = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [iaContext, setIaContext] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simuler chargement données
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Données mock TradingView
        setChartData({
          symbol: 'BTCUSD',
          price: 68523.45,
          change: 2.45,
          volume: 1254321,
          chart: 'tradingview-embed-url'
        });

        // Données mock IA contextuelles
        setIaContext({
          sentiment: 'bullish',
          keyLevels: [68000, 69000, 70000],
          patterns: ['Higher Highs', 'Ascending Triangle'],
          recommendations: ['Hold', 'Take Profit at 70000']
        });
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="chart-analysis">
      <style jsx>{`
        .chart-analysis {
          min-height: 100vh;
          background-color: var(--bg);
          color: var(--t1);
          font-family: 'Inter', sans-serif;
          padding: 1rem;
        }

        .header {
          margin-bottom: 1.5rem;
        }

        .chart-container {
          width: 100%;
          height: 300px;
          margin-bottom: 1.5rem;
          background-color: var(--bg2);
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .tradingview-widget-container {
          width: 100%;
          height: 100%;
        }

        .ia-context-container {
          background-color: var(--bg2);
          border-radius: 0.5rem;
          padding: 1rem;
          border: 1px solid var(--border);
        }

        .context-section {
          margin-bottom: 1rem;
        }

        .context-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--green);
          margin-bottom: 0.5rem;
        }

        .context-content {
          font-size: 0.9rem;
          color: var(--t2);
          line-height: 1.5;
        }

        .price-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .price-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--t1);
        }

        .price-change {
          font-size: 1rem;
          font-weight: 600;
          color: var(--green);
        }

        .positive {
          color: var(--green);
        }

        .negative {
          color: #ff4444;
        }
      `}</style>

      <div className="header">
        <h1 className="text-2xl font-bold">Analyse Chart</h1>
        <p className="text-t2 text-sm">Analyse technique et contexte IA en temps réel</p>
      </div>

      {isLoading ? (
        <>
          <div className="chart-container">
            <SkeletonShimmer width="100%" height="100%" />
          </div>

          <div className="ia-context-container">
            <div className="context-section">
              <SkeletonShimmer width="60%" height="1.25rem" />
            </div>
            <div className="context-section">
              <SkeletonShimmer width="80%" height="1rem" />
              <SkeletonShimmer width="70%" height="1rem" className="mt-2" />
            </div>
            <div className="context-section">
              <SkeletonShimmer width="50%" height="1.25rem" />
            </div>
            <div className="context-section">
              <SkeletonShimmer width="90%" height="1rem" />
              <SkeletonShimmer width="85%" height="1rem" className="mt-2" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="chart-container">
            <div className="tradingview-widget-container">
              <iframe
                src={`https://www.tradingview-widget.com/embed-widget/symbol-overview/?symbol=COINBASE:BTCUSD&interval=1D&hidesidetoolbar=1&hidetoptoolbar=1&theme=dark&style=1`}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="ia-context-container">
            <div className="price-info">
              <div>
                <div className="price-value">{chartData.price.toFixed(2)} USD</div>
                <div className={`price-change ${chartData.change >= 0 ? 'positive' : 'negative'}`}>
                  {chartData.change >= 0 ? '+' : ''}{chartData.change.toFixed(2)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-t2 text-sm">Volume: {chartData.volume.toLocaleString()}</div>
                <div className="text-t2 text-sm">Symbole: {chartData.symbol}</div>
              </div>
            </div>

            <div className="context-section">
              <div className="context-title">📊 Contexte IA</div>
              <div className="context-content">
                <p><strong>Sentiment:</strong> {iaContext.sentiment}</p>
                <p><strong>Niveaux clés:</strong> {iaContext.keyLevels.join(', ')}</p>
                <p><strong>Patterns:</strong> {iaContext.patterns.join(', ')}</p>
                <p><strong>Recommandations:</strong> {iaContext.recommendations.join(', ')}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChartAnalysis;