Création de src/api/brain.js

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Brain = () => {
  const navigate = useNavigate();
  const [signals, setSignals] = useState({
    rsi: {
      value: '',
      period: 14,
    },
    macd: {
      value: '',
      fast: 12,
      slow: 26,
    },
    volume: {
      value: '',
      period: 14,
    },
  });

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const rsiValue = query.get('rsi');
    const macdFast = query.get('macd_fast');
    const macdSlow = query.get('macd_slow');
    const volumeValue = query.get('volume');
    const volumePeriod = query.get('volume_period');

    if (rsiValue) {
      setSignals((prevSignals) => ({ ...prevSignals, rsi: { value: rsiValue, period: 14 } }));
    }
    if (macdFast && macdSlow) {
      setSignals((prevSignals) => ({ ...prevSignals, macd: { value: '', fast: parseInt(macdFast), slow: parseInt(macdSlow) } }));
    }
    if (volumeValue && volumePeriod) {
      setSignals((prevSignals) => ({ ...prevSignals, volume: { value: volumeValue, period: parseInt(volumePeriod) } }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('signals')
        .insert([
          {
            rsi: signals.rsi.value,
            macd: signals.macd.value,
            macd_fast: signals.macd.fast,
            macd_slow: signals.macd.slow,
            volume: signals.volume.value,
            volume_period: signals.volume.period,
          },
        ])
        .single();

      if (error) {
        console.error(error);
      } else {
        navigate('/brain-explorer');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container" style={{ backgroundColor: '#080808', padding: '20px' }}>
      <h1 style={{ color: '#00ff88', fontSize: '24px', marginBottom: '20px' }}>Signaux IA</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ color: '#f0f0f0', fontSize: '18px' }}>RSI</label>
          <input
            type="number"
            value={signals.rsi.value}
            onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, rsi: { value: e.target.value, period: 14 } }))}
            style={{
              width: '100%',
              height: '40px',
              padding: '10px',
              fontSize: '18px',
              backgroundColor: '#111',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              color: '#f0f0f0',
            }}
          />
        </div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ color: '#f0f0f0', fontSize: '18px' }}>MACD</label>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label style={{ color: '#f0f0f0', fontSize: '18px' }}>Fast</label>
            <input
              type="number"
              value={signals.macd.fast}
              onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, macd: { value: '', fast: parseInt(e.target.value), slow: signals.macd.slow } }))}
              style={{
                width: '100%',
                height: '40px',
                padding: '10px',
                fontSize: '18px',
                backgroundColor: '#111',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                color: '#f0f0f0',
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label style={{ color: '#f0f0f0', fontSize: '18px' }}>Slow</label>
            <input
              type="number"
              value={signals.macd.slow}
              onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, macd: { value: '', fast: signals.macd.fast, slow: parseInt(e.target.value) } }))}
              style={{
                width: '100%',
                height: '40px',
                padding: '10px',
                fontSize: '18px',
                backgroundColor: '#111',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                color: '#f0f0f0',
              }}
            />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ color: '#f0f0f0', fontSize: '18px' }}>Volume</label>
          <input
            type="number"
            value={signals.volume.value}
            onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, volume: { value: e.target.value, period: 14 } }))}
            style={{
              width: '100%',
              height: '40px',
              padding: '10px',
              fontSize: '18px',
              backgroundColor: '#111',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              color: '#f0f0f0',
            }}
          />
          <input
            type="number"
            value={signals.volume.period}
            onChange={(e) => setSignals((prevSignals) => ({ ...prevSignals, volume: { value: signals.volume.value, period: parseInt(e.target.value) } }))}
            style={{
              width: '100%',
              height: '40px',
              padding: '10px',
              fontSize: '18px',
              backgroundColor: '#111',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              color: '#f0f0f0',
              marginLeft: '10px',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            height: '40px',
            padding: '10px',
            fontSize: '18px',
            backgroundColor: '#00ff88',
            border: 'none',
            color: '#080808',
            cursor: 'pointer',
          }}
        >
          Soumettre
        </button>
      </form>
    </div>
  );
};

export default Brain;
```

Création de src/api/brain-explorer.js

```javascript
import React from 'react';
import { supabase } from '../supabaseClient';

const BrainExplorer = () => {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const { data, error } = await supabase
          .from('signals')
          .select('*')
          .order('id', { ascending: false });

        if (error) {
          console.error(error);
        } else {
          setSignals(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSignals();
  }, []);

  return (
    <div className="container" style={{ backgroundColor: '#080808', padding: '20px' }}>
      <h1 style={{ color: '#00ff88', fontSize: '24px', marginBottom: '20px' }}>Explorateur de signaux</h1>
      <ul>
        {signals.map((signal) => (
          <li key={signal.id}>
            <p style={{ color: '#f0f0f0', fontSize: '18px' }}>RSI: {signal.rsi}</p>
            <p style={{ color: '#f0f0f0', fontSize: '18px' }}>MACD: {signal.macd}</p>
            <p style={{ color: '#f0f0f0', fontSize: '18px' }}>Volume: {signal.volume}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BrainExplorer;
```

Modification de src/api/dashboard.js

```javascript
import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="container" style={{ backgroundColor: '#080808', padding: '20px' }}>
      <h1 style={{ color: '#00ff88', fontSize: '24px', marginBottom: '20px' }}>Tableau de bord</h1>
      <ul>
        <li>
          <Link to="/brain" style={{ color: '#f0f0f0', fontSize: '18px' }}>Signaux IA</Link>
        </li>
        <li>
          <Link to="/brain-explorer" style={{ color: '#f0f0f0', fontSize: '18px' }}>Explorateur de signaux</Link>
        </li>
      </ul>
    </div>
  );
};

export default Dashboard;
```

Ajout de la route pour la page Brain dans src/routes.js

```javascript
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Brain from './Brain';
import BrainExplorer from './BrainExplorer';
import Dashboard from './Dashboard';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/brain" element={<Brain />} />
      <Route path="/brain-explorer" element={<BrainExplorer />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
};

export default RoutesComponent;
```

Création de src/styles.css

```css
body {
  font-family: 'Inter', sans-serif;
  background-color: #080808;
  color: #f0f0f0;
}

.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: #111;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

h1 {
  color: #00ff88;
  font-size: 24px;
  margin-bottom: 20px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 10px;
}

a {
  color: #f0f0f0;
  text-decoration: none;
}

a:hover {
  color: #00ff88;
}

input[type='number'] {
  width: 100%;
  height: 40px;
  padding: 10px;
  font-size: 18px;
  background-color: #111;
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: #f0f0f0;
}

button[type='submit'] {
  width: 100%;
  height: 40px;
  padding: 10px;
  font-size: 18px;
  background-color: #00ff88;
  border: none;
  color: #080808;
  cursor: pointer;
}

button[type='submit']:hover {
  background-color: #00ff88;
}
```

Ajout de la page Brain dans src/index.js

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import Brain from './Brain';
import BrainExplorer from './BrainExplorer';
import Dashboard from './Dashboard';
import RoutesComponent from './routes';

ReactDOM.render(
  <React.StrictMode>
    <RoutesComponent />
  </React.StrictMode>,
  document.getElementById('root')
);
```

Modification de src/package.json

```json
{
  "name": "trackr-ai-hub",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@supabase/supabase-js": "^1.3.1",
    "react": "^19.0.2",
    "react-dom": "^19.0.2",
    "react-router-dom": "^6.3.0",
    "react-scripts": "5.0.1",
    "supabase": "^1.3.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

Modification de src/supabaseClient.js

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://trackr-ai-hub.supabase.io';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaGFuIjoiMjMwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
```

Modification de src/package.json

```json
{
  "name": "trackr-ai-hub",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.2",
    "react-dom": "^19.0.2",
    "react-router-dom": "^6.3.0",
    "react-scripts": "5.0.1",
    "supabase": "^1.3.1",
    "@supabase/supabase-js": "^1.3.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

Modification de src/package.json

```json
{
  "name": "trackr-ai-hub",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.2",
    "react-dom": "^19.0.2",
    "react-router-dom": "^6.3.0",
    "react-scripts": "5.0.1",
    "supabase": "^1.3.1",
    "@supabase/supabase-js": "^1.3.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

Modification de src/package.json

```json
{
  "name": "trackr-ai-hub",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.2",
    "react-dom": "^19.0.2",
    "react-router-dom": "^6.3.0",
    "react-scripts": "5.0.1",
    "supabase": "^1.3.1",
    "@supabase/supabase-js": "^1.3.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

Modification de src/package.json

```json
{
  "name": "trackr-ai-hub",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.2",
    "react-dom": "^19.0.2",
    "react-router-dom": "^6.3.0",
    "react-scripts": "5.0.1",
    "supabase": "^1.3.1",
    "@supabase/supabase-js": "^1.3.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [