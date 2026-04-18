Création de api/market.js avec AbortSignal.timeout() pour les requêtes fetch() :

```javascript
import { supabase } from '../supabase.js';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const getStocks = async () => {
  const signal = AbortSignal.timeout(5000);
  try {
    const { data, error } = await supabase
      .from('stocks')
      .select('symbol, name, price')
      .abortSignal(signal);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données de stocks:', error);
    return [];
  } finally {
    signal.abort();
  }
};

export const getCryptos = async () => {
  const signal = AbortSignal.timeout(5000);
  try {
    const { data, error } = await supabase
      .from('cryptos')
      .select('symbol, name, price')
      .abortSignal(signal);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données de cryptos:', error);
    return [];
  } finally {
    signal.abort();
  }
};

export const getMarketData = async () => {
  const stocks = await getStocks();
  const cryptos = await getCryptos();
  return { stocks, cryptos };
};
```

Création de api/market.css pour l'application :

```css
@font-face {
  font-family: 'Inter';
  src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
}

body {
  font-family: var(--font-inter);
  background-color: var(--bg);
  color: var(--t1);
}

.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--t2);
  margin-bottom: 10px;
}

.subtitle {
  font-size: 18px;
  color: var(--t3);
  margin-bottom: 20px;
}

.card {
  background-color: var(--bg2);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 20px;
}

.card-header {
  background-color: var(--bg);
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.card-body {
  padding: 20px;
}

.card-footer {
  background-color: var(--bg);
  padding: 10px;
  border-top: 1px solid var(--border);
}

.green {
  color: var(--green);
}

.neon {
  color: var(--green);
  text-shadow: 0 0 10px var(--green);
}
```

Modification de api/market.js pour utiliser les CSS variables :

```javascript
import React from 'react';
import styles from './market.module.css';

const Market = () => {
  const { data: stocks, error: stocksError } = useQuery(
    ['stocks'],
    async () => {
      const data = await getStocks();
      return data;
    }
  );

  const { data: cryptos, error: cryptosError } = useQuery(
    ['cryptos'],
    async () => {
      const data = await getCryptos();
      return data;
    }
  );

  if (stocksError || cryptosError) {
    return <div>Error</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Marchés</h1>
      <div className={styles.subtitle}>Stocks et cryptos</div>
      <div className={styles.card}>
        <div className={styles.card-header}>
          <h2 className={styles.title}>Stocks</h2>
        </div>
        <div className={styles.card-body}>
          <ul>
            {stocks.map((stock) => (
              <li key={stock.symbol}>
                <span className={styles.green}>{stock.symbol}</span> -{' '}
                <span className={styles.t1}>{stock.name}</span> -{' '}
                <span className={styles.t1}>{stock.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.card-header}>
          <h2 className={styles.title}>Cryptos</h2>
        </div>
        <div className={styles.card-body}>
          <ul>
            {cryptos.map((crypto) => (
              <li key={crypto.symbol}>
                <span className={styles.green}>{crypto.symbol}</span> -{' '}
                <span className={styles.t1}>{crypto.name}</span> -{' '}
                <span className={styles.t1}>{crypto.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Market;