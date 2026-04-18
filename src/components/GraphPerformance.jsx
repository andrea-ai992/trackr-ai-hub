**src/pages/Portfolio.jsx**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Inter } from '@next/font/google';
import GraphPerformance from '../components/GraphPerformance';
import { useSupabaseClient } from '@supabase/supabase-js';

const inter = Inter({ subsets: ['latin'] });

const Portfolio = () => {
  const supabase = useSupabaseClient();
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPortfolio = async () => {
      const { data: portfolio } = await supabase
        .from('portfolio')
        .select('id, name, quantity, price, value, allocation');
      setData(portfolio);
      setLoading(false);
    };
    fetchPortfolio();
  }, []);

  return (
    <div className={`container mx-auto p-4 pt-6 ${inter.className}`}>
      <header className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <Link to="/agents" className="text-blue-500 hover:text-blue-700">
          Ajouter un agent
        </Link>
      </header>
      <GraphPerformance />
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Allocation</h2>
        <PieChart data={[45, 30, 15, 10]} colors={['#4CAF50', '#03A9F4', '#FF9800', '#9C27B0']} />
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Holdings</h2>
        <ul>
          {data.map((item, index) => (
            <li key={item.id} className="flex justify-between mb-4">
              <div className="flex items-center">
                <img src={item.logo} alt={item.name} className="w-8 h-8 mr-2" />
                <span className="text-lg">{item.name}</span>
              </div>
              <div className="flex justify-between w-1/2">
                <span className="text-lg">{item.quantity}</span>
                <span className="text-lg">${item.price}</span>
              </div>
              <div className="flex justify-between w-1/2">
                <span className="text-lg">${item.value}</span>
                <span className="text-lg">{(item.value - item.previousValue) / item.previousValue * 100}%</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Stats globales</h2>
        <div className="flex justify-between mb-4">
          <span className="text-4xl font-bold">${data.reduce((acc, item) => acc + item.value, 0)}</span>
          <span className="text-lg text-green-600">Best performer: {data.find((item) => item.value > data[0].value).name}</span>
          <span className="text-lg text-red-600">Worst performer: {data.find((item) => item.value < data[0].value).name}</span>
          <span className="text-lg">{data.reduce((acc, item) => acc + item.value, 0) / data[0].value}</span>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
```

**src/components/GraphPerformance.jsx**
```jsx
import React from 'react';
import { Inter } from '@next/font/google';

const inter = Inter({ subsets: ['latin'] });

const GraphPerformance = () => {
  return (
    <div className={`w-full h-64 ${inter.className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMinYMin meet"
        className="bg-gray-700"
      >
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00ff88" />
            <stop offset="1" stopColor="#00ff88" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="#080808" rx="10" />
        <path
          d="M 0 0 L 0 100 L 100 100 L 100 0 Z"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          className="stroke-gray-500"
        />
        <path
          d="M 0 0 L 0 100 L 100 100 L 100 0 Z"
          fill="url(#gradient)"
          stroke="#fff"
          strokeWidth="2"
          className="stroke-gray-500"
        />
        <g className="text-lg text-gray-400">
          <text x="10" y="20" textAnchor="middle" dominantBaseline="middle">
            0
          </text>
          <text x="90" y="20" textAnchor="middle" dominantBaseline="middle">
            30
          </text>
          <text x="10" y="80" textAnchor="middle" dominantBaseline="middle">
            10
          </text>
          <text x="90" y="80" textAnchor="middle" dominantBaseline="middle">
            20
          </text>
        </g>
        <animate
          attributeName="d"
          from="M 0 0 L 0 100 L 100 100 L 100 0 Z"
          to="M 0 0 L 0 100 L 100 100 L 100 0 Z"
          dur="800ms"
          repeatCount="indefinite"
          className="animate"
        />
      </svg>
    </div>
  );
};

export default GraphPerformance;
```

**src/components/PieChart.jsx**
```jsx
import React from 'react';
import { Inter } from '@next/font/google';

const inter = Inter({ subsets: ['latin'] });

const PieChart = ({ data, colors }) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMinYMin meet"
      className="bg-gray-700"
    >
      <g className="text-lg text-gray-400">
        <text x="50" y="20" textAnchor="middle" dominantBaseline="middle">
          Stocks
        </text>
        <text x="50" y="40" textAnchor="middle" dominantBaseline="middle">
          45%
        </text>
      </g>
      <g className="text-lg text-gray-400">
        <text x="50" y="60" textAnchor="middle" dominantBaseline="middle">
          Crypto
        </text>
        <text x="50" y="80" textAnchor="middle" dominantBaseline="middle">
          30%
        </text>
      </g>
      <g className="text-lg text-gray-400">
        <text x="50" y="100" textAnchor="middle" dominantBaseline="middle">
          Cash
        </text>
        <text x="50" y="120" textAnchor="middle" dominantBaseline="middle">
          15%
        </text>
      </g>
      <g className="text-lg text-gray-400">
        <text x="50" y="140" textAnchor="middle" dominantBaseline="middle">
          Autres
        </text>
        <text x="50" y="160" textAnchor="middle" dominantBaseline="middle">
          10%
        </text>
      </g>
      <g>
        <path
          d="M 0 0 L 0 100 L 100 100 L 100 0 Z"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          className="stroke-gray-500"
        />
        <path
          d="M 0 0 L 0 100 L 100 100 L 100 0 Z"
          fill={colors[0]}
          stroke="#fff"
          strokeWidth="2"
          className="stroke-gray-500"
          transform={`rotate(${data[0]} 50 50) translate(50 50)`}
        />
        <path
          d="M 0 0 L 0 100 L 100 100 L 100 0 Z"
          fill={colors[1]}
          stroke="#fff"
          strokeWidth="2"
          className="stroke-gray-500"
          transform={`rotate(${data[1]} 50 50) translate(50 50)`}
        />
        <path
          d="M 0 0 L 0 100 L 100 100 L 100 0 Z"
          fill={colors[2]}
          stroke="#fff"
          strokeWidth="2"
          className="stroke-gray-500"
          transform={`rotate(${data[2]} 50 50) translate(50 50)`}
        />
        <path
          d="M 0 0 L 0 100 L 100 100 L 100 0 Z"
          fill={colors[3]}
          stroke="#fff"
          strokeWidth="2"
          className="stroke-gray-500"
          transform={`rotate(${data[3]} 50 50) translate(50 50)`}
        />
      </g>
    </svg>
  );
};

export default PieChart;
```

**styles.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #444;
  --border: rgba(255, 255, 255, 0.07);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--bg);
  color: var(--t1);
}

.container h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.container h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.container p {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.graph-performance {
  width: 100%;
  height: 200px;
  background-color: var(--bg);
  border-radius: 10px;
  overflow: hidden;
}

.graph-performance svg {
  width: 100%;
  height: 100%;
}

.graph-performance path {
  stroke-width: 2;
  stroke: var(--t2);
}

.graph-performance path.animate {
  animation: animate 800ms infinite;
}

.graph-performance g {
  font-size: 1rem;
  font-family: Inter, sans-serif;
}

.graph-performance g text {
  fill: var(--t3);
}

.graph-performance g text:hover {
  fill: var(--t1);
}

.pie-chart {
  width: 100%;
  height: 200px;
  background-color: var(--bg);
  border-radius: 10px;
  overflow: hidden;
}

.pie-chart svg {
  width: 100%;
  height: 100%;
}

.pie-chart path {
  stroke-width: 2;
  stroke: var(--t2);
}

.pie-chart g {
  font-size: 1rem;
  font-family: Inter, sans-serif;
}

.pie-chart g text {
  fill: var(--t3);
}

.pie-chart g text:hover {
  fill: var(--t1);
}
```

**index.js**
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
```

**package.json**
```json
{
  "name": "trackr",
  "version": "1.0.0",
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.3.0",
    "lucide-react": "^1.0.0",
    "@supabase/supabase-js": "^1.9.0"
  },
  "devDependencies": {
    "vite": "^3.2.5",
    "react-refresh": "^0.4.0",
    "typescript": "^4.7.4",
    "sass": "^1.55.0",
    "postcss": "^8.4.14",
    "autoprefixer": "^10.4.7"
  }
}