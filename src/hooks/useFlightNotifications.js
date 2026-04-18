Je vais créer le hook `useFlightNotifications.js` et intégrer le système de notifications dans `FlightTracker.jsx`. Voici d'abord le hook :

```javascript
// src/hooks/useFlightNotifications.js
import { useState, useEffect, useCallback } from 'react';

const useFlightNotifications = (flights) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFlightStatus = useCallback(async (flightNumber) => {
    if (!flightNumber) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flight-status/${flightNumber}`);
      if (!response.ok) throw new Error('Failed to fetch flight status');

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkForPerturbations = useCallback(async (flightsData) => {
    if (!flightsData || flightsData.length === 0) return;

    const newNotifications = [];

    for (const flight of flightsData) {
      if (!flight.flightNumber) continue;

      const status = await fetchFlightStatus(flight.flightNumber);
      if (!status) continue;

      // Vérifier les perturbations courantes
      const perturbations = [];

      if (status.departure?.delayMinutes > 0) {
        perturbations.push(`Départ retardé de ${status.departure.delayMinutes} minutes`);
      }

      if (status.arrival?.delayMinutes > 0) {
        perturbations.push(`Arrivée retardée de ${status.arrival.delayMinutes} minutes`);
      }

      if (status.status === 'CANCELLED') {
        perturbations.push('Vol annulé');
      }

      if (status.status === 'DIVERTED') {
        perturbations.push(`Vol détourné vers ${status.divertedTo}`);
      }

      if (status.gate?.changed) {
        perturbations.push(`Porte changée: ${status.gate.newGate}`);
      }

      if (status.terminal?.changed) {
        perturbations.push(`Terminal changé: ${status.terminal.newTerminal}`);
      }

      if (perturbations.length > 0) {
        newNotifications.push({
          id: `${flight.flightNumber}-${Date.now()}`,
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          departure: flight.departure,
          arrival: flight.arrival,
          perturbations,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
    }
  }, [fetchFlightStatus]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Vérifier les perturbations à intervalles réguliers
  useEffect(() => {
    const interval = setInterval(() => {
      checkForPerturbations(flights);
    }, 300000); // Toutes les 5 minutes

    return () => clearInterval(interval);
  }, [flights, checkForPerturbations]);

  // Vérifier les perturbations initiales
  useEffect(() => {
    if (flights && flights.length > 0) {
      checkForPerturbations(flights);
    }
  }, [flights, checkForPerturbations]);

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    clearNotification,
    clearAllNotifications,
    checkForPerturbations
  };
};

export default useFlightNotifications;
```

Maintenant, voici les modifications à apporter à `FlightTracker.jsx` :

```javascript
// src/pages/FlightTracker.jsx
import { useState, useEffect, useCallback } from 'react';
import { useFlightNotifications } from '../hooks/useFlightNotifications';
import { Bell, X, Check, AlertTriangle, Plane, Clock, MapPin, AlertCircle } from 'lucide-react';

const FlightTracker = () => {
  const [flights, setFlights] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    notifications,
    markAsRead,
    clearNotification,
    clearAllNotifications,
    checkForPerturbations
  } = useFlightNotifications(flights);

  const fetchFlights = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/flights');
      if (!response.ok) throw new Error('Failed to fetch flights');

      const data = await response.json();
      setFlights(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const filteredFlights = flights.filter(flight =>
    flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.arrival.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasUnreadNotifications = notifications.some(n => !n.read);

  return (
    <div className="flight-tracker-page">
      <header className="page-header">
        <h1><Plane size={24} /> Flight Tracker</h1>
        <div className="notification-icon">
          <Bell size={24} />
          {hasUnreadNotifications && <span className="notification-badge">{notifications.length}</span>}
        </div>
      </header>

      {notifications.length > 0 && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3><AlertTriangle size={18} /> Notifications ({notifications.length})</h3>
            <button onClick={clearAllNotifications} className="clear-all-btn">
              Tout effacer
            </button>
          </div>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-header">
                  <h4>{notification.airline} {notification.flightNumber}</h4>
                  <span className="notification-time">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="notification-details">
                  <p>
                    <MapPin size={16} /> {notification.departure} → {notification.arrival}
                  </p>
                  <ul className="perturbations-list">
                    {notification.perturbations.map((perturbation, index) => (
                      <li key={index} className="perturbation-item">
                        <AlertCircle size={14} />
                        {perturbation}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="mark-read-btn"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => clearNotification(notification.id)}
                    className="clear-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher un vol (numéro, compagnie, aéroport)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {isLoading ? (
        <div className="loading-state">
          <Clock size={24} className="loading-icon" />
          Chargement des vols...
        </div>
      ) : error ? (
        <div className="error-state">
          <AlertCircle size={24} className="error-icon" />
          {error}
          <button onClick={fetchFlights} className="retry-btn">Réessayer</button>
        </div>
      ) : filteredFlights.length === 0 ? (
        <div className="empty-state">
          <Plane size={48} className="empty-icon" />
          <p>Aucun vol trouvé correspondant à votre recherche.</p>
        </div>
      ) : (
        <div className="flights-list">
          {filteredFlights.map(flight => (
            <div
              key={flight.id}
              className={`flight-card ${selectedFlight?.id === flight.id ? 'selected' : ''}`}
              onClick={() => setSelectedFlight(flight)}
            >
              <div className="flight-header">
                <h3>{flight.airline} {flight.flightNumber}</h3>
                <span className={`status-badge ${flight.status.toLowerCase()}`}>
                  {flight.status}
                </span>
              </div>
              <div className="flight-route">
                <div className="departure">
                  <span className="airport-code">{flight.departure}</span>
                  <span className="time">{flight.departureTime}</span>
                </div>
                <div className="arrival">
                  <span className="airport-code">{flight.arrival}</span>
                  <span className="time">{flight.arrivalTime}</span>
                </div>
              </div>
              {flight.gate && (
                <div className="flight-details">
                  <span>Porte: {flight.gate}</span>
                  <span>Terminal: {flight.terminal}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedFlight && (
        <div className="flight-details-modal">
          <div className="modal-content">
            <button
              onClick={() => setSelectedFlight(null)}
              className="close-modal-btn"
            >
              ×
            </button>
            <h2>{selectedFlight.airline} {selectedFlight.flightNumber}</h2>
            <div className="flight-info-grid">
              <div className="info-item">
                <span className="info-label">Départ</span>
                <span className="info-value">{selectedFlight.departure}</span>
                <span className="info-time">{selectedFlight.departureTime}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Arrivée</span>
                <span className="info-value">{selectedFlight.arrival}</span>
                <span className="info-time">{selectedFlight.arrivalTime}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Porte</span>
                <span className="info-value">{selectedFlight.gate || 'Non assignée'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Terminal</span>
                <span className="info-value">{selectedFlight.terminal || 'Non assigné'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Statut</span>
                <span className={`status-badge ${selectedFlight.status.toLowerCase()}`}>
                  {selectedFlight.status}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Dernière mise à jour</span>
                <span className="info-value">
                  {new Date(selectedFlight.lastUpdated).toLocaleString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                checkForPerturbations([selectedFlight]);
                setSelectedFlight(null);
              }}
              className="check-perturbations-btn"
            >
              Vérifier les perturbations
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .flight-tracker-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--t1);
          font-family: 'Inter', sans-serif;
          padding: 1rem;
          position: relative;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .page-header h1 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .notification-icon {
          position: relative;
          cursor: pointer;
        }

        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--green);
          color: var(--bg);
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: bold;
        }

        .notifications-panel {
          background: var(--bg2);
          border-radius: 8px;
          margin-bottom: 1.5rem;
          padding: 1rem;
          border: 1px solid var(--border);
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .notifications-header h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 500;
        }

        .clear-all-btn {
          background: transparent;
          color: var(--t2);
          border: 1px solid var(--border);
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
        }

        .clear-all-btn:hover {
          background: var(--border);
          color: var(--t1);
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .notification-item {
          background: var(--bg);
          border-radius: 6px;
          padding: 0.75rem;
          border: 1px solid var(--border);
          transition: all 0.2s;
        }

        .notification-item.read {
          opacity: 0.8;
        }

        .notification-item.unread {
          border-left: 3px solid var(--green);
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .notification-header h4 {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .notification-time {
          font-size: 0.7rem;
          color: var(--t2);
        }

        .notification-details {
          margin-bottom: 0.75rem;
        }

        .notification-details p {
          font-size: 0.8rem;
          color: var(--t2);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .perturbations-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .perturbation-item {
          font-size: 0.8rem;
          color: var(--green);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .notification-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .mark-read-btn, .clear-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.3rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .mark-read-btn:hover {
          background: var(--border);
        }

        .clear-btn:hover {
          background: rgba(255, 0, 0, 0.1);
          color: #ff4444;
        }

        .search-container {
          margin-bottom: 1.5rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--t1);
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
        }

        .search-input::placeholder {
          color: var(--t2);
        }

        .loading-state, .error-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: