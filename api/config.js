**api/config.js**
```javascript
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabase = new SupabaseClient(supabaseUrl, supabaseKey, {
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiSecrets = {
  stocks: {
    key: 'your-stocks-api-key',
    secret: 'your-stocks-api-secret',
  },
  crypto: {
    key: 'your-crypto-api-key',
    secret: 'your-crypto-api-secret',
  },
};

export { supabase, apiSecrets };
```

**src/api/Markets.js**
```javascript
import { supabase } from '../config';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Markets = () => {
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);

  useEffect(() => {
    const getStocks = async () => {
      try {
        const response = await axios.get('https://api.example.com/stocks', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.session().access_token}`,
          },
        });
        setStocks(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    const getCrypto = async () => {
      try {
        const response = await axios.get('https://api.example.com/crypto', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.session().access_token}`,
          },
        });
        setCrypto(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    getStocks();
    getCrypto();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Markets</h1>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.id}>
            <span className="label">{stock.name}</span>
            <span className="value">{stock.price}</span>
          </li>
        ))}
      </ul>
      <ul>
        {crypto.map((coin) => (
          <li key={coin.id}>
            <span className="label">{coin.name}</span>
            <span className="value">{coin.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Markets;
```

**src/components/MarketCard.js**
```javascript
import React from 'react';

const MarketCard = ({ market }) => {
  return (
    <div className="card">
      <h2 className="title">{market.name}</h2>
      <p className="description">{market.description}</p>
      <p className="price">{market.price}</p>
    </div>
  );
};

export default MarketCard;
```

**src/components/MarketList.js**
```javascript
import React from 'react';
import MarketCard from './MarketCard';

const MarketList = ({ markets }) => {
  return (
    <ul>
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </ul>
  );
};

export default MarketList;
```

**src/pages/Markets.js**
```javascript
import React from 'react';
import Markets from '../api/Markets';
import MarketList from '../components/MarketList';

const MarketsPage = () => {
  return (
    <div className="container">
      <h1 className="title">Markets</h1>
      <MarketList markets={Markets} />
    </div>
  );
};

export default MarketsPage;
```

**src/styles/global.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
  border: 1px solid var(--border);
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.label {
  font-size: 18px;
  font-weight: bold;
  margin-right: 10px;
}

.value {
  font-size: 18px;
  color: var(--t2);
}

.card {
  background-color: var(--bg2);
  padding: 20px;
  border: 1px solid var(--border);
  margin-bottom: 20px;
}

.card .title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.card .description {
  font-size: 14px;
  color: var(--t3);
  margin-bottom: 10px;
}

.card .price {
  font-size: 18px;
  font-weight: bold;
  color: var(--t2);
}
```

**src/index.js**
```javascript
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