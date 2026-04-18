Je vais créer un système complet d'alertes pour perturbations aériennes avec notifications visuelles et sonores. Voici les fichiers demandés :

src/hooks/useFlightAlerts.js
```javascript
import { useState, useEffect, useCallback } from 'react';

export const useFlightAlerts = (initialAlerts = []) => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  // Notification sonore pour les alertes
  const playAlertSound = useCallback(() => {
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }, [soundEnabled]);

  // Ajouter une nouvelle alerte
  const addAlert = useCallback((newAlert) => {
    setAlerts(prev => {
      const updatedAlerts = [newAlert, ...prev];
      if (newAlert.severity === 'high') {
        playAlertSound();
        setNotificationCount(prev => prev + 1);
      }
      return updatedAlerts;
    });
  }, [playAlertSound]);

  // Supprimer une alerte
  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Marquer une alerte comme lue
  const markAsRead = useCallback((id) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, read: true } : alert
    ));
  }, []);

  // Effacer toutes les alertes
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
    setNotificationCount(0);
  }, []);

  // Effacer les alertes lues
  const clearReadAlerts = useCallback(() => {
    setAlerts(prev => {
      const unreadAlerts = prev.filter(alert => !alert.read);
      return unreadAlerts;
    });
  }, []);

  // Vérifier les alertes expirées
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setAlerts(prev => prev.filter(alert => {
        if (alert.expiry && now > alert.expiry) {
          return false;
        }
        return true;
      }));
    }, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, []);

  return {
    alerts,
    addAlert,
    removeAlert,
    markAsRead,
    clearAllAlerts,
    clearReadAlerts,
    soundEnabled,
    setSoundEnabled,
    notificationCount,
    setNotificationCount
  };
};
```

src/components/FlightAlerts.jsx
```javascript
import { useState, useEffect } from 'react';
import { useFlightAlerts } from '../hooks/useFlightAlerts';
import { Bell, X, Check, Volume2, VolumeX } from 'lucide-react';

const FlightAlerts = ({ initialAlerts = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    alerts,
    addAlert,
    removeAlert,
    markAsRead,
    clearAllAlerts,
    clearReadAlerts,
    soundEnabled,
    setSoundEnabled,
    notificationCount,
    setNotificationCount
  } = useFlightAlerts(initialAlerts);

  // Écouter les événements de perturbations (simulé)
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:4000/api/flight-alerts');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addAlert({
          id: Date.now().toString(),
          ...data,
          read: false,
          timestamp: new Date().toISOString(),
          expiry: data.expiry ? new Date(data.expiry).getTime() : null
        });
      } catch (error) {
        console.error('Erreur de parsing des alertes:', error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [addAlert]);

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'var(--red)';
      case 'medium':
        return 'var(--yellow)';
      case 'low':
        return 'var(--green)';
      default:
        return 'var(--t2)';
    }
  };

  return (
    <div className="flight-alerts-container">
      <button
        className="alerts-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {notificationCount > 0 && (
          <span className="notification-badge">{notificationCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="alerts-dropdown">
          <div className="alerts-header">
            <h3>Alertes Perturbations</h3>
            <div className="alerts-controls">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                aria-label={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button onClick={clearReadAlerts} disabled={alerts.every(a => a.read)}>
                Effacer lues
              </button>
              <button onClick={clearAllAlerts} disabled={alerts.length === 0}>
                Tout effacer
              </button>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="alerts-empty">
              <p>Aucune alerte pour le moment</p>
            </div>
          ) : (
            <div className="alerts-list">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`alert-item ${alert.read ? 'read' : 'unread'}`}
                  style={{
                    borderLeft: `3px solid ${getAlertColor(alert.severity)}`
                  }}
                >
                  <div className="alert-header">
                    <span className="alert-icon">{getAlertIcon(alert.severity)}</span>
                    <span className="alert-title">{alert.title}</span>
                    <span className="alert-time">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    <button
                      className="alert-close"
                      onClick={() => removeAlert(alert.id)}
                      aria-label="Fermer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="alert-body">
                    <p>{alert.message}</p>
                    {alert.flightNumber && (
                      <div className="alert-details">
                        <span>Vol: {alert.flightNumber}</span>
                        {alert.departure && <span>Départ: {alert.departure}</span>}
                        {alert.arrival && <span>Arrivée: {alert.arrival}</span>}
                      </div>
                    )}
                  </div>
                  {!alert.read && (
                    <button
                      className="alert-mark-read"
                      onClick={() => markAsRead(alert.id)}
                    >
                      <Check size={16} />
                      Marquer comme lu
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightAlerts;
```

Ajoutez également ces styles dans votre fichier CSS global ou dans un module CSS dédié :

```css
.flight-alerts-container {
  position: relative;
  display: inline-block;
}

.alerts-toggle {
  position: relative;
  background: transparent;
  border: none;
  color: var(--t1);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.alerts-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--red);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.alerts-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  margin-top: 8px;
}

.alerts-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alerts-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--t1);
}

.alerts-controls {
  display: flex;
  gap: 8px;
}

.alerts-controls button {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--t2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.alerts-controls button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.alerts-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alerts-empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--t2);
}

.alerts-list {
  display: flex;
  flex-direction: column;
}

.alert-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  transition: background 0.2s;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.alert-item.read {
  opacity: 0.7;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.alert-icon {
  font-size: 18px;
}

.alert-title {
  flex: 1;
  font-weight: 600;
  color: var(--t1);
  font-size: 14px;
}

.alert-time {
  font-size: 12px;
  color: var(--t3);
}

.alert-close {
  background: transparent;
  border: none;
  color: var(--t3);
  cursor: pointer;
  padding: 4px;
}

.alert-close:hover {
  color: var(--t1);
}

.alert-body {
  padding-left: 26px;
  font-size: 13px;
  color: var(--t2);
  line-height: 1.4;
}

.alert-details {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--t3);
}

.alert-mark-read {
  margin-top: 8px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--t2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.alert-mark-read:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Animation pour les nouvelles alertes */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.alert-item.unread {
  animation: pulse 1.5s ease;
}