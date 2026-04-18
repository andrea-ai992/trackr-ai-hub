Créer un composant de validation des paramètres query pour les pages de trading

```javascript
// src/components/Trading.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const Trading = () => {
  const { symbol, interval, timeframe } = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const validateParams = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('trading_params')
          .select('symbol, interval, timeframe')
          .eq('symbol', symbol)
          .eq('interval', interval)
          .eq('timeframe', timeframe);
        if (error) {
          setError(error.message);
        } else {
          setValidated(true);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    validateParams();
  }, [symbol, interval, timeframe]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!validated) {
    return <div>Params not validated</div>;
  }

  return (
    <div className="container">
      <h1 className="title">Trading</h1>
      <p className="description">Symbol: {symbol}</p>
      <p className="description">Interval: {interval}</p>
      <p className="description">Timeframe: {timeframe}</p>
    </div>
  );
};

export default Trading;
```

```css
/* src/components/Trading.css */
.container {
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: var(--green);
  margin-bottom: 10px;
}

.description {
  font-size: 18px;
  color: var(--t2);
  margin-bottom: 20px;
}

.loading {
  font-size: 18px;
  color: var(--t2);
  margin-bottom: 20px;
}

.error {
  font-size: 18px;
  color: var(--t3);
  margin-bottom: 20px;
}
```

```javascript
// src/App.js
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Trading from './components/Trading';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/trading/:symbol/:interval/:timeframe" element={<Trading />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

```javascript
// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.io';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export default supabase;
```

Assurez-vous de remplacer `your-supabase-url`, `your-supabase-key` et `your-supabase-secret` par vos informations de connexion Supabase.