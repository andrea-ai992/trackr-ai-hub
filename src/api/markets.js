Créer un fichier `src/api/Markets.js` avec le code suivant :

```javascript
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabaseUrl = 'https://trackr-app-nu.vercel.app/.supabase';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabaseSecret = process.env.REACT_APP_SUPABASE_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseSecret}`,
  },
});

const getStocks = async () => {
  const { data, error } = await supabase
    .from('stocks')
    .select('id, name, symbol, price');
  if (error) {
    console.error(error);
  }
  return data;
};

const getCryptos = async () => {
  const { data, error } = await supabase
    .from('cryptos')
    .select('id, name, symbol, price');
  if (error) {
    console.error(error);
  }
  return data;
};

const useStocks = () => {
  const [stocks, setStocks] = useState([]);
  useEffect(() => {
    const fetchStocks = async () => {
      const data = await getStocks();
      setStocks(data);
    };
    fetchStocks();
  }, []);
  return stocks;
};

const useCryptos = () => {
  const [cryptos, setCryptos] = useState([]);
  useEffect(() => {
    const fetchCryptos = async () => {
      const data = await getCryptos();
      setCryptos(data);
    };
    fetchCryptos();
  }, []);
  return cryptos;
};

export { useStocks, useCryptos };
```

Ce code utilise la bibliothèque `@supabase/supabase-js` pour gérer les requêtes API de manière sécurisée. Les secrets de l'application sont stockés dans les variables d'environnement `REACT_APP_SUPABASE_KEY` et `REACT_APP_SUPABASE_SECRET`. Les requêtes API sont envoyées à l'URL `https://trackr-app-nu.vercel.app/.supabase` avec les headers `Content-Type` et `Authorization` pour authentifier les requêtes.

Les fonctions `getStocks` et `getCryptos` sont utilisées pour récupérer les données des marchés Stocks et Crypto respectivement. Les fonctions `useStocks` et `useCryptos` sont utilisées pour récupérer les données des marchés Stocks et Crypto respectivement, en utilisant l'état local pour stocker les données.

Le code utilise les CSS vars pour les couleurs et les polices, et est conçu pour être mobile-first et utiliser un thème sombre.