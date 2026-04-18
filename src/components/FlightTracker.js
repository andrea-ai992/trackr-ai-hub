// src/components/FlightTracker.js

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@lucide-react-native/core';
import { supabase } from '../utils/supabase';

const FlightTracker = () => {
  const [flights, setFlights] = useState([]);
  const [alertes, setAlertes] = useState([]);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const { data, error } = await supabase
          .from('flights')
          .select('id, departure, arrival, status');
        if (error) {
          console.error(error);
        } else {
          setFlights(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchFlights();
  }, []);

  useEffect(() => {
    const fetchAlertes = async () => {
      try {
        const { data, error } = await supabase
          .from('alertes')
          .select('id, flight_id, message');
        if (error) {
          console.error(error);
        } else {
          setAlertes(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchAlertes();
  }, []);

  const handleAlerte = (flight) => {
    const existingAlerte = alertes.find((al) => al.flight_id === flight.id);
    if (!existingAlerte) {
      const newAlerte = {
        flight_id: flight.id,
        message: `Perturbation sur le vol ${flight.departure} -> ${flight.arrival}`,
      };
      setAlertes([...alertes, newAlerte]);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Suivi des Vols</h1>
      <ul className="flights">
        {flights.map((flight) => (
          <li key={flight.id} className="flight">
            <span className="departure">{flight.departure}</span>
            <span className="arrival">{flight.arrival}</span>
            <span className="status">{flight.status}</span>
            {alertes.find((al) => al.flight_id === flight.id) && (
              <span className="alerte">
                <Icon name="alert-circle" color="--green" size={20} />
              </span>
            )}
            <button
              className="btn"
              onClick={() => handleAlerte(flight)}
              disabled={alertes.find((al) => al.flight_id === flight.id)}
            >
              Afficher l'alerte
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'var(--bg)',
    padding: '20px',
    fontFamily: 'Inter',
  },
  title: {
    color: 'var(--t1)',
    fontSize: '24px',
    marginBottom: '20px',
  },
  flights: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  flight: {
    padding: '10px',
    borderBottom: '1px solid var(--border)',
  },
  departure: {
    color: 'var(--t2)',
    fontSize: '18px',
  },
  arrival: {
    color: 'var(--t2)',
    fontSize: '18px',
  },
  status: {
    color: 'var(--t3)',
    fontSize: '14px',
  },
  alerte: {
    backgroundColor: 'var(--green)',
    padding: '5px',
    borderRadius: '10px',
  },
  btn: {
    backgroundColor: 'var(--bg2)',
    color: 'var(--t1)',
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
  },
};

FlightTracker.styles = styles;

export default FlightTracker;
```

```css
/* src/styles/globals.css */

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
  margin: 0 auto;
  padding: 20px;
  background-color: var(--bg);
}

.title {
  color: var(--t1);
  font-size: 24px;
  margin-bottom: 20px;
}

.flights {
  list-style: none;
  padding: 0;
  margin: 0;
}

.flight {
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.departure,
.arrival {
  color: var(--t2);
  font-size: 18px;
}

.status {
  color: var(--t3);
  font-size: 14px;
}

.alerte {
  background-color: var(--green);
  padding: 5px;
  border-radius: 10px;
}

.btn {
  background-color: var(--bg2);
  color: var(--t1);
  padding: 10px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}
```

```javascript
// src/App.js

import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import FlightTracker from './components/FlightTracker';

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/flight-tracker" component={FlightTracker} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;