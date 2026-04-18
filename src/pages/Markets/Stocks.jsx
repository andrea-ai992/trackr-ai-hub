Création de src/pages/Markets/Stocks.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LucideIcon } from 'lucide-react';
import './Stocks.css';

function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const { data, error } = await supabase
          .from('stocks')
          .select('id, name, price, change, percent_change')
          .order('id', { ascending: false });
        if (error) {
          setError(error.message);
        } else {
          setStocks(data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  if (loading) {
    return <div className="loading">Chargement en cours...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="stocks">
      <h1>Marchés boursiers</h1>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.id}>
            <Link to={`/markets/stocks/${stock.id}`}>
              <h2>{stock.name}</h2>
              <p>
                Prix : <span className="price">{stock.price}</span>
              </p>
              <p>
                Variation : <span className="change">{stock.change}</span>
              </p>
              <p>
                Changement (%) : <span className="percent-change">{stock.percent_change}</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Stocks;
```

Création de src/pages/Markets/Crypto.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LucideIcon } from 'lucide-react';
import './Crypto.css';

function Crypto() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const { data, error } = await supabase
          .from('cryptos')
          .select('id, name, price, change, percent_change')
          .order('id', { ascending: false });
        if (error) {
          setError(error.message);
        } else {
          setCryptos(data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCryptos();
  }, []);

  if (loading) {
    return <div className="loading">Chargement en cours...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="cryptos">
      <h1>Marchés cryptos</h1>
      <ul>
        {cryptos.map((crypto) => (
          <li key={crypto.id}>
            <Link to={`/markets/crypto/${crypto.id}`}>
              <h2>{crypto.name}</h2>
              <p>
                Prix : <span className="price">{crypto.price}</span>
              </p>
              <p>
                Variation : <span className="change">{crypto.change}</span>
              </p>
              <p>
                Changement (%) : <span className="percent-change">{crypto.percent_change}</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Crypto;
```

Création de src/pages/Markets/Stocks.css

```css
.stocks {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
}

.stocks h1 {
  color: var(--green);
}

.stocks ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stocks li {
  margin-bottom: 20px;
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.stocks li:last-child {
  border-bottom: none;
}

.stocks a {
  text-decoration: none;
  color: var(--t2);
}

.stocks a:hover {
  color: var(--green);
}

.stocks .price {
  font-weight: bold;
  color: var(--green);
}

.stocks .change {
  color: var(--t3);
}

.stocks .percent-change {
  color: var(--t3);
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}

.error {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: var(--t3);
}
```

Création de src/pages/Markets/Crypto.css

```css
.cryptos {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  padding: 20px;
}

.cryptos h1 {
  color: var(--green);
}

.cryptos ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cryptos li {
  margin-bottom: 20px;
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.cryptos li:last-child {
  border-bottom: none;
}

.cryptos a {
  text-decoration: none;
  color: var(--t2);
}

.cryptos a:hover {
  color: var(--green);
}

.cryptos .price {
  font-weight: bold;
  color: var(--green);
}

.cryptos .change {
  color: var(--t3);
}

.cryptos .percent-change {
  color: var(--t3);
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}

.error {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: var(--t3);
}
```

N'oubliez pas d'installer les dépendances nécessaires dans votre fichier `package.json` :

```json
"dependencies": {
  "react": "^18.2.0",
  "react-router-dom": "^6.4.2",
  "lucide-react": "^3.0.0",
  "@supabase/supabase-js": "^1.5.0"
}