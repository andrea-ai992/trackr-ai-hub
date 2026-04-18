**api/trading-expert.js**
```javascript
import { AbortController } from 'node-abort-controller';
import { SupabaseClient } from '@supabase/supabase-js';

const supabase = new SupabaseClient('https://trackr-app-nu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaGFuIjoiMjMwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

const tradingExpertApi = async (signal) => {
  try {
    const response = await fetch('https://api.tradingexpert.com/v1/forecasts', {
      method: 'GET',
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('API appel abandonné');
    } else {
      console.error('Erreur API TradingExpert:', error);
    }
    throw error;
  }
};

export const getTradingExpertData = async () => {
  const controller = new AbortController();
  const signal = controller.signal;
  signal.timeout(5000); // 5 secondes

  try {
    const data = await tradingExpertDataApi(signal);
    return data;
  } finally {
    controller.abort();
  }
};
```

**api/dashboard-server.js**
```javascript
import express from 'express';
import { getTradingExpertData } from './trading-expert';
import { getNewsData } from './news';
import { getSportsData } from './sports';

const app = express();
app.use(express.json());

app.get('/api/trading-expert', async (req, res) => {
  try {
    const data = await getTradingExpertData();
    res.json(data);
  } catch (error) {
    console.error('Erreur API TradingExpert:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    const data = await getNewsData();
    res.json(data);
  } catch (error) {
    console.error('Erreur API News:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/sports', async (req, res) => {
  try {
    const data = await getSportsData();
    res.json(data);
  } catch (error) {
    console.error('Erreur API Sports:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.listen(4000, () => {
  console.log('Serveur démarré sur le port 4000');
});
```

**styles/dashboard-server.css**
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

body {
  font-family: 'Inter', sans-serif;
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
  font-weight: bold;
  color: var(--green);
  margin-bottom: 10px;
}

.subtitle {
  font-size: 18px;
  color: var(--t2);
  margin-bottom: 20px;
}

.button {
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.button:hover {
  background-color: var(--t1);
  color: var(--green);
}
```

**index.js**
```javascript
import express from 'express';
import dashboardServer from './dashboard-server';

const app = express();
app.use(express.json());

app.use('/api', dashboardServer);

app.listen(4000, () => {
  console.log('Serveur démarré sur le port 4000');
});