Pour ajouter un statut live à la page FlightTracker, nous allons créer un nouveau composant appelé `FlightStatus` qui affichera le statut live du vol. Nous allons également modifier le composant `FlightTracker` pour inclure le nouveau composant.

**src/components/FlightStatus.js**
```jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const FlightStatus = ({ flightId }) => {
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('flights')
          .select('status')
          .eq('id', flightId);
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
  }, [flightId]);

  return (
    <div className="status">
      <span className="label">Statut live :</span>
      <span className="value">{status}</span>
    </div>
  );
};

export default FlightStatus;
```

**src/components/FlightTracker.js**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@lucide-react-native/core';
import { supabase } from '../utils/supabase';
import FlightStatus from './FlightStatus';

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
            <FlightStatus flightId={flight.id} />
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
  status: {
    backgroundColor: 'var(--bg2)',
    padding: '10px',
    borderRadius: '10px',
  },
};

FlightTracker.styles = styles;

export default FlightTracker;
```

**src/styles/globals.css**
```css
.status {
  background-color: var(--bg2);
  padding: 10px;
  border-radius: 10px;
}

.status .label {
  color: var(--t2);
  font-size: 14px;
}

.status .value {
  color: var(--t1);
  font-size: 18px;
}
```

Nous avons ajouté un nouveau composant `FlightStatus` qui affiche le statut live du vol en fonction de l'ID du vol. Nous avons également modifié le composant `FlightTracker` pour inclure le nouveau composant dans chaque élément de la liste des vols.