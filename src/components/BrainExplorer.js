Création du fichier src/components/BrainExplorer.js :

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../services/api/supabase';
import { useTheme } from '../services/theme';

const BrainExplorer = () => {
  const theme = useTheme();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: brainData, error: brainError } = await supabase
          .from('brain')
          .select('*')
          .order('id', { ascending: false });
        setData(brainData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data: brainData, error: brainError } = await supabase
        .from('brain')
        .select('*')
        .order('id', { ascending: false });
      setData(brainData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Brain Explorer</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="cards">
          {data.map((item, index) => (
            <div key={item.id} className="card">
              <h2 className="card-title">{item.title}</h2>
              <p className="card-description">{item.description}</p>
              <Link to={`/brain/${item.id}`} className="card-link">
                Explore
              </Link>
            </div>
          ))}
        </div>
      )}
      <button className="refresh-button" onClick={handleRefresh}>
        Refresh
      </button>
    </div>
  );
};

export default BrainExplorer;
```

Création du fichier src/services/api/brain.js :

```jsx
import { supabase } from '../services/supabase';

const getBrainData = async () => {
  try {
    const { data, error } = await supabase
      .from('brain')
      .select('*')
      .order('id', { ascending: false });
    return { data, error };
  } catch (error) {
    return { error };
  }
};

export { getBrainData };
```

Création du fichier src/services/theme.js :

```jsx
import { createTheme } from '@supabase/ui';

const theme = createTheme({
  colors: {
    primary: '#00ff88',
    secondary: '#080808',
    background: '#111',
    text: {
      primary: '#f0f0f0',
      secondary: '#888',
      tertiary: '#444',
    },
    border: 'rgba(255, 255, 255, 0.07)',
  },
  fonts: {
    body: 'Inter',
  },
});

export default theme;
```

Création du fichier src/services/supabase.js :

```jsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export default supabase;
```

Création du fichier src/styles/global.css :

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
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.card {
  width: calc(33.33% - 20px);
  margin: 20px;
  padding: 20px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.card-description {
  font-size: 14px;
  color: var(--t2);
}

.card-link {
  background-color: var(--green);
  color: var(--t1);
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.card-link:hover {
  background-color: var(--green);
}

.refresh-button {
  background-color: var(--green);
  color: var(--t1);
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.refresh-button:hover {
  background-color: var(--green);
}

.inter {
  font-family: 'Inter', sans-serif;
}
```

Création du fichier src/index.js :

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { BrainExplorer } from './components/BrainExplorer';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
      <BrainExplorer />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);