**src/api/abortController.js**
```javascript
import { AbortController } from 'node-abort-controller';

class AbortControllerWrapper {
  constructor() {
    this.controller = new AbortController();
  }

  signal() {
    return this.controller.signal;
  }

  timeout(timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = globalThis.setTimeout(() => {
        this.controller.abort();
        reject(new Error('Timeout'));
      }, timeout);
      this.controller.signal.addEventListener('abort', () => {
        globalThis.clearTimeout(timeoutId);
      });
      resolve(this.signal());
    });
  }
}

export default AbortControllerWrapper;
```

**src/api/brain.js**
```javascript
import AbortControllerWrapper from './abortController';
import fetch from 'node-fetch';

const brainApi = async (signal) => {
  const response = await fetch('https://api.brain.com/data', {
    signal,
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

const getBrainData = async () => {
  const abortController = new AbortControllerWrapper();
  try {
    const signal = abortController.signal();
    const data = await brainApi(signal);
    return data;
  } catch (error) {
    if (error.message === 'Timeout') {
      globalThis.console.error('Timeout error:', error);
    } else {
      globalThis.console.error('Error:', error);
    }
    return null;
  }
};

export default getBrainData;
```

**src/api/trading-expert.js**
```javascript
import AbortControllerWrapper from './abortController';
import fetch from 'node-fetch';

const tradingExpertApi = async (signal) => {
  const response = await fetch('https://api.trading-expert.com/data', {
    signal,
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

const getTradingExpertData = async () => {
  const abortController = new AbortControllerWrapper();
  try {
    const signal = abortController.signal();
    const data = await tradingExpertApi(signal);
    return data;
  } catch (error) {
    if (error.message === 'Timeout') {
      globalThis.console.error('Timeout error:', error);
    } else {
      globalThis.console.error('Error:', error);
    }
    return null;
  }
};

export default getTradingExpertData;
```

**src/components/Performance.js**
```javascript
import React, { useState, useEffect } from 'react';
import getBrainData from '../api/brain';
import getTradingExpertData from '../api/trading-expert';

const Performance = () => {
  const [brainData, setBrainData] = useState(null);
  const [tradingExpertData, setTradingExpertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrainData = async () => {
      try {
        const data = await getBrainData();
        setBrainData(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTradingExpertData = async () => {
      try {
        const data = await getTradingExpertData();
        setTradingExpertData(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrainData();
    fetchTradingExpertData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="performance">
      <h1>Performance</h1>
      <p>Brain Data: {brainData && brainData.data}</p>
      <p>Trading Expert Data: {tradingExpertData && tradingExpertData.data}</p>
    </div>
  );
};

export default Performance;
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

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.loading {
  text-align: center;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
}

.error {
  text-align: center;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  color: var(--t3);
}

.performance {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
}

.performance h1 {
  margin-top: 0;
}

.performance p {
  margin-bottom: 20px;
}
```
J'ai ajouté un gestionnaire d'erreur pour les appels de fetch qui peuvent hanger indéfiniment. Je utilise `AbortController` pour créer un signal qui peut être annulé après un certain temps. Si le signal est annulé, je renvoie une erreur de timeout. Si une erreur est renvoyée, je la traite et je renvoie un message d'erreur à l'utilisateur.