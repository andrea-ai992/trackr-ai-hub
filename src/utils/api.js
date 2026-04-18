src/utils/api.js
```javascript
const API_TIMEOUT = 10000; // 10s timeout par défaut

export const fetchWithTimeout = async (url, options = {}, timeout = API_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') throw new Error('Request timeout');
    throw err;
  }
};

export const fetchWithFallback = async (primaryUrl, fallbackUrls = [], options = {}, timeout = API_TIMEOUT) => {
  const errors = [];

  // Essayer l'URL principale d'abord
  try {
    return await fetchWithTimeout(primaryUrl, options, timeout);
  } catch (err) {
    errors.push({ url: primaryUrl, error: err.message });
  }

  // Essayer les fallback URLs en parallèle
  const fallbackPromises = fallbackUrls.map(url =>
    fetchWithTimeout(url, options, timeout)
      .catch(err => ({ url, error: err.message }))
  );

  const results = await Promise.all(fallbackPromises);

  // Filtrer les résultats valides
  const validResult = results.find(result => !result?.error);
  if (validResult) return validResult;

  // Si tous échouent, retourner le premier fallback avec l'erreur
  if (results.length > 0 && results[0]?.error) {
    throw new Error(`All fallback URLs failed: ${errors.concat(results.map(r => r.error)).join(' | ')}`);
  }

  // Cas par défaut
  throw new Error('No fallback URLs provided');
};
```

src/pages/FlightTracker.jsx
```javascript
import { useState, useEffect, useCallback } from 'react';
import { Plane, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { fetchWithFallback } from '../utils/api';

const FlightTracker = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30s par défaut

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    setError(null);

    const primaryUrl = 'https://api.aviationstack.com/v1/flights';
    const fallbackUrls = [
      'https://api.flightapi.io/flights/64a1b2c3d4e5f6g7h8i9j0',
      'https://api.flightradar24.com/common/v1/flights'
    ];

    const params = new URLSearchParams({
      access_key: import.meta.env.VITE_AVIATION_STACK_KEY,
      limit: 20,
      status: 'active'
    });

    try {
      const data = await fetchWithFallback(
        `${primaryUrl}?${params}`,
        fallbackUrls,
        { method: 'GET' },
        8000 // timeout personnalisé pour les requêtes
      );

      if (data?.data) {
        setFlights(data.data);
      } else {
        throw new Error('No flight data received');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();

    const interval = setInterval(fetchFlights, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchFlights, refreshInterval]);

  const handleRefresh = () => {
    fetchFlights();
  };

  const handleIntervalChange = (e) => {
    setRefreshInterval(Number(e.target.value));
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1><Plane size={24} /> FlightTracker</h1>
        <div className="refresh-controls">
          <button onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
          <select value={refreshInterval} onChange={handleIntervalChange}>
            <option value={15000}>15s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1min</option>
          </select>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="flights-grid">
        {flights.map((flight) => (
          <div key={`${flight.flight_iata}-${flight.departure.icao}`} className="flight-card">
            <div className="flight-header">
              <span className="flight-number">{flight.flight_iata || flight.flight_icao}</span>
              <span className="flight-status">{flight.status}</span>
            </div>

            <div className="flight-route">
              <div className="airport">
                <div className="airport-code">{flight.departure.iata || flight.departure.icao}</div>
                <div className="airport-time">
                  {new Date(flight.departure.scheduled).toLocaleTimeString()}
                </div>
              </div>

              <div className="flight-path">
                <div className="path-line"></div>
                <Plane size={16} className="flight-icon" />
              </div>

              <div className="airport">
                <div className="airport-code">{flight.arrival.iata || flight.arrival.icao}</div>
                <div className="airport-time">
                  {new Date(flight.arrival.scheduled).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="flight-details">
              <div className="detail-item">
                <span>Aircraft:</span>
                <span>{flight.aircraft?.model || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span>Airline:</span>
                <span>{flight.airline?.name || flight.airline?.iata || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span>Altitude:</span>
                <span>{flight.latitude ? `${Math.round(flight.latitude)}°` : 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="loading-overlay">
          <Clock size={24} className="spin" />
          <span>Updating flights...</span>
        </div>
      )}
    </div>
  );
};

export default FlightTracker;