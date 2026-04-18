**src/components/FlightTrackerStatus.js**
```jsx
import React from 'react';
import { useSupabaseClient } from '@supabase/supabase-js';

const FlightTrackerStatus = () => {
  const supabase = useSupabaseClient();
  const [status, setStatus] = React.useState(null);

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('flight_tracker')
          .select('status')
          .eq('id', 1); // ID de l'enregistrement à récupérer
        if (error) {
          console.error(error);
        } else {
          setStatus(data[0].status);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchStatus();
  }, []);

  return (
    <div className="flight-tracker-status">
      <h2 className="title">Statut en direct</h2>
      <p className="status">{status}</p>
    </div>
  );
};

export default FlightTrackerStatus;
```

**src/components/FlightTracker.js** (modification)
```jsx
import React from 'react';
import FlightTrackerStatus from './FlightTrackerStatus';

const FlightTracker = () => {
  return (
    <div className="flight-tracker">
      <div className="container">
        <h1 className="title">Suivi des vols</h1>
        <FlightTrackerStatus />
        {/* Ajoutez les autres éléments de la page ici */}
      </div>
    </div>
  );
};

export default FlightTracker;
```

**src/components/FlightTrackerStatus.css**
```css
.flight-tracker-status {
  background-color: var(--bg);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--green);
  margin-bottom: 10px;
}

.status {
  font-size: 1.2rem;
  color: var(--t1);
  margin-bottom: 20px;
}
```

**src/App.js** (ajout du CSS)
```jsx
import React from 'react';
import FlightTracker from './components/FlightTracker';

const App = () => {
  return (
    <div className="app">
      <FlightTracker />
    </div>
  );
};

export default App;
```

**src/index.js** (ajout du CSS)
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

**src/index.css** (ajout des CSS vars)
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