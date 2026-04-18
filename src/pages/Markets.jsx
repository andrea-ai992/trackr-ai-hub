import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Stocks from './Stocks';
import Crypto from './Crypto';
import { Icon } from '@lucide-react-native';

const Markets = () => {
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'crypto' ? 'crypto' : 'stocks');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTab(params.get('tab') === 'crypto' ? 'crypto' : 'stocks');
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/markets');
        const json = await response.json();
        setData(json);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  function switchTab(id) {
    setTab(id);
    if (id === 'crypto') setParams({ tab: 'crypto' });
    else setParams({});
  }

  const handleRefresh = () => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch('/api/markets');
        const json = await response.json();
        setData(json);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  };

  return (
    <div className="h-screen overflow-y-scroll">
      {/* Sticky sub-tab header */}
      <div
        className="sticky top-0 z-20 border-b border-white/[0.06]"
        style={{
          background: 'var(--bg2)',
          paddingTop: 'max(52px, env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="flex px-4">
          {[
            { id: 'stocks', label: 'Stocks' },
            { id: 'crypto', label: 'Crypto' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex-1 pb-3 text-sm font-semibold transition-all ${
                tab === t.id ? 'text-white' : 'text-gray-400'
              }`}
              style={{
                borderBottom: `2px solid ${tab === t.id ? 'var(--green)' : 'transparent'}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse h-6 w-6 rounded-full bg-white" />
        </div>
      ) : (
        <div className="p-4">
          {tab === 'stocks' ? (
            <Stocks inMarkets data={data} />
          ) : (
            <Crypto data={data} />
          )}
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-lg font-bold uppercase">Top Gainers</h2>
            <h2 className="text-lg font-bold uppercase">Top Losers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {data &&
              data.tab === tab &&
              data.data.map((asset, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="mr-2">
                      {asset.image ? (
                        <img src={asset.image} alt={asset.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className={`text-2xl font-bold ${asset.symbol === 'AAPL' ? 'text-red-500' : 'text-blue-500'}`}>
                          {asset.symbol}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold">{asset.name}</h2>
                      <p className="text-sm text-gray-400">
                        <span className="text-lg font-bold">
                          {asset.price.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="ml-2 text-sm text-gray-400">
                          {asset.change > 0 ? (
                            <span className="text-green-500">
                              <Icon name="arrow-up" size={16} />
                              {asset.change.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-red-500">
                              <Icon name="arrow-down" size={16} />
                              {asset.change.toFixed(2)}%
                            </span>
                          )}
                        </span>
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div className="h-6 w-6 rounded-full bg-gray-700 mb-2" />
                      <div className="h-6 w-6 rounded-full bg-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      <div className="fixed bottom-0 right-0 p-4 bg-gray-800">
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-300"
        >
          <Icon name="refresh" size={24} />
        </button>
      </div>
    </div>
  );
};

export default Markets;
```

```css
/* src/styles/globals.css */
:root {
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
  --green: #00ff88;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.sticky {
  position: sticky;
  top: 0;
  z-index: 10;
}

.grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

.grid-md {
  grid-template-columns: repeat(2, 1fr);
}

.grid-lg {
  grid-template-columns: repeat(3, 1fr);
}

.card {
  background-color: var(--bg2);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card:hover {
  background-color: var(--bg2);
}

.card .image {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-right: 16px;
}

.card .name {
  font-size: 18px;
  font-weight: bold;
  color: var(--t1);
}

.card .price {
  font-size: 24px;
  font-weight: bold;
  color: var(--t1);
}

.card .change {
  font-size: 14px;
  color: var(--t3);
}

.card .sparkline {
  height: 40px;
  width: 20px;
  margin-left: 16px;
}

.card .sparkline path {
  fill: var(--t1);
}

.card .sparkline rect {
  fill: var(--t1);
}

.card .sparkline line {
  stroke: var(--t1);
}