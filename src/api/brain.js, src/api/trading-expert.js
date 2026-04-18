**src/api/brain.js**
```javascript
import { AbortSignal } from 'node-abort-controller';
import { SupabaseClient } from '@supabase/supabase-js';

const supabase = new SupabaseClient('https://trackr-app-nu.vercel.app', {
  key: 'YOUR_API_KEY',
  secret: 'YOUR_API_SECRET',
});

const brain = async (signal) => {
  try {
    const response = await fetch('https://api.example.com/brain', {
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getBrainData = async () => {
  const signal = AbortSignal.timeout(30000); // 30 secondes
  return brain(signal);
};

export { getBrainData };
```

**src/api/trading-expert.js**
```javascript
import { AbortSignal } from 'node-abort-controller';
import { SupabaseClient } from '@supabase/supabase-js';

const supabase = new SupabaseClient('https://trackr-app-nu.vercel.app', {
  key: 'YOUR_API_KEY',
  secret: 'YOUR_API_SECRET',
});

const tradingExpert = async (signal) => {
  try {
    const response = await fetch('https://api.example.com/trading-expert', {
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getTradingExpertData = async () => {
  const signal = AbortSignal.timeout(30000); // 30 secondes
  return tradingExpert(signal);
};

export { getTradingExpertData };
```

**src/pages/Trackr/Performance.js**
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBrainData, getTradingExpertData } from '../api/brain';
import { getTradingExpertData as getTradingExpertDataTradingExpert } from '../api/trading-expert';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const Performance = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [brainData, setBrainData] = useState(null);
  const [tradingExpertData, setTradingExpertData] = useState(null);

  useEffect(() => {
    const fetchBrainData = async () => {
      try {
        const data = await getBrainData();
        setBrainData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBrainData();
  }, []);

  useEffect(() => {
    const fetchTradingExpertData = async () => {
      try {
        const data = await getTradingExpertDataTradingExpert();
        setTradingExpertData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTradingExpertData();
  }, []);

  return (
    <div className="container">
      <h1 className="title">Trackr Performance</h1>
      {brainData && (
        <div>
          <h2>Brain Data</h2>
          <p>{brainData.data}</p>
        </div>
      )}
      {tradingExpertData && (
        <div>
          <h2>Trading Expert Data</h2>
          <p>{tradingExpertData.data}</p>
        </div>
      )}
    </div>
  );
};

export default Performance;
```

**src/pages/Trackr/Performance.module.css**
```css
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: var(--green);
}

.title:hover {
  color: var(--green);
  text-decoration: none;
}

h2 {
  font-size: 18px;
  font-weight: bold;
  color: var(--t2);
}

p {
  font-size: 16px;
  color: var(--t3);
}

a {
  text-decoration: none;
  color: var(--green);
}

a:hover {
  color: var(--green);
  text-decoration: none;
}
```

**src/index.js**
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
```

**src/App.js**
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Performance from './pages/Trackr/Performance';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/trackr/performance" element={<Performance />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
```
N'oubliez pas de remplacer `YOUR_API_KEY` et `YOUR_API_SECRET` par vos clés API Supabase réelles.