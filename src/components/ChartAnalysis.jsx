src/components/Sparkline.jsx
```jsx
import { useEffect, useRef, useState } from 'react';

const Sparkline = ({
  data = [],
  width = '100%',
  height = 40,
  color = 'var(--green)',
  pulse = true,
  strokeWidth = 2,
}) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (svgRef.current) {
      const updateDimensions = () => {
        const { clientWidth, clientHeight } = svgRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  if (data.length === 0) {
    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width, height: '100%' }}
      >
        <rect x="0" y="0" width="100%" height="100%" fill="var(--bg2)" rx="4" />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * dimensions.width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const animatedColor = pulse
    ? `hsl(${color === 'var(--green)' ? '120' : '0'}, 100%, 50%)`
    : color;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${dimensions.width || 1} ${height}`}
      preserveAspectRatio="none"
      style={{ width, height: '100%' }}
    >
      <rect x="0" y="0" width="100%" height="100%" fill="transparent" rx="4" />
      <polyline
        points={points}
        fill="none"
        stroke={animatedColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pulse && (
        <circle
          cx={dimensions.width * 0.8}
          cy={height * 0.5}
          r={strokeWidth * 3}
          fill={animatedColor}
          opacity="0.6"
        >
          <animate
            attributeName="r"
            values={`${strokeWidth * 3};${strokeWidth * 5};${strokeWidth * 3}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0.1;0.6"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );
};

export default Sparkline;
```

src/components/ChartAnalysis.jsx
```jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sparkline from './Sparkline';

const ChartAnalysis = () => {
  const location = useLocation();
  const [chartData, setChartData] = useState({
    labels: [],
    values: [],
    title: '',
    subtitle: '',
    trend: 0,
    change: 0,
    volume: 0,
    sparkline: [],
    color: 'var(--green)',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams(location.search);
        const symbol = queryParams.get('symbol') || 'BTC-USD';
        const timeframe = queryParams.get('timeframe') || '1D';

        let data;
        if (symbol.startsWith('PSG') || symbol.startsWith('NFL') || symbol.startsWith('NBA') || symbol.startsWith('UFC')) {
          data = await fetchSportsData(symbol, timeframe);
        } else if (symbol.endsWith('USD') || symbol.endsWith('EUR')) {
          data = await fetchCryptoData(symbol, timeframe);
        } else {
          data = await fetchStockData(symbol, timeframe);
        }

        setChartData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [location.search]);

  const fetchSportsData = async (symbol, timeframe) => {
    const mockData = {
      'PSG': {
        labels: Array.from({ length: 7 }, (_, i) => `J${i + 1}`),
        values: [1.85, 1.92, 1.88, 1.95, 2.01, 2.05, 2.1],
        title: 'Paris Saint-Germain',
        subtitle: `Cote ${symbol}`,
        trend: 0.25,
        change: '+13.5%',
        volume: '12.4K',
        color: 'var(--green)',
      },
      'NFL': {
        labels: Array.from({ length: 16 }, (_, i) => `W${i + 1}`),
        values: [120, 118, 122, 125, 128, 130, 127, 132, 135, 138, 140, 142, 145, 148, 150, 152],
        title: 'NFL Betting Trends',
        subtitle: 'Over/Under',
        trend: 2.5,
        change: '+12.8%',
        volume: '8.7K',
        color: 'var(--green)',
      },
      'NBA': {
        labels: Array.from({ length: 82 }, (_, i) => `G${i + 1}`),
        values: Array.from({ length: 82 }, () => 1 + Math.random() * 2),
        title: 'NBA Season Performance',
        subtitle: 'Moneyline Average',
        trend: 0.15,
        change: '+8.2%',
        volume: '22.1K',
        color: 'var(--green)',
      },
      'UFC': {
        labels: Array.from({ length: 12 }, (_, i) => `F${i + 1}`),
        values: [2.1, 2.05, 2.2, 2.15, 2.3, 2.25, 2.4, 2.35, 2.5, 2.45, 2.6, 2.55],
        title: 'UFC Betting Trends',
        subtitle: 'Fight Night Moneyline',
        trend: 0.3,
        change: '+15.6%',
        volume: '5.3K',
        color: 'var(--green)',
      },
    };
    return mockData[symbol] || mockData.PSG;
  };

  const fetchCryptoData = async (symbol, timeframe) => {
    const mockData = {
      'BTC-USD': {
        labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin'],
        values: [42000, 43500, 45200, 47800, 49500, 51200],
        title: 'Bitcoin',
        subtitle: 'Price in USD',
        trend: 9200,
        change: '+21.9%',
        volume: '1.2M BTC',
        color: 'var(--green)',
      },
      'ETH-USD': {
        labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin'],
        values: [2800, 2950, 3100, 3250, 3400, 3550],
        title: 'Ethereum',
        subtitle: 'Price in USD',
        trend: 750,
        change: '+26.8%',
        volume: '850K ETH',
        color: '#627eea',
      },
    };
    return mockData[symbol] || mockData['BTC-USD'];
  };

  const fetchStockData = async (symbol, timeframe) => {
    const mockData = {
      'AAPL': {
        labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin'],
        values: [175, 180, 185, 190, 195, 200],
        title: 'Apple Inc.',
        subtitle: 'NASDAQ: AAPL',
        trend: 25,
        change: '+14.3%',
        volume: '32.5M',
        color: 'var(--green)',
      },
      'TSLA': {
        labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin'],
        values: [180, 190, 200, 210, 220, 230],
        title: 'Tesla Inc.',
        subtitle: 'NASDAQ: TSLA',
        trend: 50,
        change: '+27.8%',
        volume: '45.2M',
        color: '#ff0000',
      },
    };
    return mockData[symbol] || mockData.AAPL;
  };

  if (loading) {
    return (
      <div className="chart-analysis">
        <div className="chart-header">
          <div className="skeleton-line" style={{ width: '60%' }}></div>
          <div className="skeleton-line" style={{ width: '40%' }}></div>
        </div>
        <div className="sparkline-container">
          <Sparkline data={[]} pulse={false} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-analysis error">
        <div className="error-message">Failed to load chart data: {error}</div>
      </div>
    );
  }

  return (
    <div className="chart-analysis">
      <div className="chart-header">
        <h2 style={{ color: chartData.color }}>{chartData.title}</h2>
        <p className="subtitle">{chartData.subtitle}</p>
      </div>

      <div className="sparkline-container">
        <Sparkline data={chartData.values} color={chartData.color} pulse={true} />
      </div>

      <div className="chart-stats">
        <div className="stat">
          <span className="label">Trend</span>
          <span className="value" style={{ color: chartData.trend >= 0 ? 'var(--green)' : '#ff4444' }}>
            {chartData.trend >= 0 ? '+' : ''}{chartData.trend.toFixed(2)}
          </span>
        </div>
        <div className="stat">
          <span className="label">Change</span>
          <span className="value" style={{ color: chartData.change.startsWith('+') ? 'var(--green)' : '#ff4444' }}>
            {chartData.change}
          </span>
        </div>
        <div className="stat">
          <span className="label">Volume</span>
          <span className="value">{chartData.volume}</span>
        </div>
      </div>
    </div>
  );
};

export default ChartAnalysis;