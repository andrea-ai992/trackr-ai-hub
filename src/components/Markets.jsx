// src/components/FearGreedGauge.jsx
import { useEffect, useState } from 'react';
import './FearGreedGauge.css';

const FearGreedGauge = () => {
  const [index, setIndex] = useState(50);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFearGreedIndex = async () => {
      try {
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setIndex(parseInt(data.data[0].value));
        }
      } catch (error) {
        console.error('Error fetching Fear & Greed Index:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFearGreedIndex();
    const interval = setInterval(fetchFearGreedIndex, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getGaugeColor = (value) => {
    if (value < 25) return '#ff4757';
    if (value < 50) return '#ffa502';
    if (value < 75) return '#2ed573';
    return '#1e90ff';
  };

  const getGaugePosition = (value) => {
    const min = 0;
    const max = 100;
    const position = ((value - min) / (max - min)) * 100;
    return `calc(${position}% - 8px)`;
  };

  const getFearGreedLabel = (value) => {
    if (value < 25) return 'Extreme Fear';
    if (value < 45) return 'Fear';
    if (value < 55) return 'Neutral';
    if (value < 75) return 'Greed';
    return 'Extreme Greed';
  };

  if (isLoading) {
    return (
      <div className="fear-greed-gauge">
        <div className="gauge-container">
          <div className="gauge-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fear-greed-gauge">
      <div className="gauge-container">
        <div className="gauge-label">Fear & Greed Index</div>
        <div className="gauge-value">{index}</div>
        <div className="gauge-label">{getFearGreedLabel(index)}</div>
        <div className="gauge-track">
          <div
            className="gauge-fill"
            style={{
              left: getGaugePosition(index),
              backgroundColor: getGaugeColor(index),
            }}
          ></div>
        </div>
        <div className="gauge-scale">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};

export default FearGreedGauge;