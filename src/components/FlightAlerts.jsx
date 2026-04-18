FlightAlerts.jsx
```jsx
import { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, Bell, X } from 'lucide-react';

const FlightAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(null);

  const mockAlerts = [
    {
      id: 1,
      flightNumber: 'AF1234',
      departure: 'CDG',
      arrival: 'JFK',
      time: '2024-06-15T14:30:00Z',
      type: 'delay',
      severity: 'high',
      message: 'Vol AF1234 retardé de 2h30 en raison de conditions météo.',
      read: false
    },
    {
      id: 2,
      flightNumber: 'DL5678',
      departure: 'LAX',
      arrival: 'ATL',
      time: '2024-06-15T15:45:00Z',
      type: 'gate',
      severity: 'medium',
      message: 'Changement de porte d embarquement pour le vol DL5678 : passer de B12 à C25.',
      read: false
    },
    {
      id: 3,
      flightNumber: 'BA9012',
      departure: 'LHR',
      arrival: 'DXB',
      time: '2024-06-15T16:20:00Z',
      type: 'cancel',
      severity: 'high',
      message: 'Vol BA9012 annulé en raison d une grève du personnel au sol.',
      read: false
    }
  ];

  useEffect(() => {
    setAlerts(mockAlerts);
  }, []);

  useEffect(() => {
    if (alerts.some(alert => !alert.read)) {
      playNotificationSound();
    }
  }, [alerts]);

  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error('Audio play failed:', e));
    }
  };

  const markAsRead = (id) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'var(--red)';
      case 'medium':
        return 'var(--orange)';
      case 'low':
        return 'var(--yellow)';
      default:
        return 'var(--green)';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertCircle size={18} />;
      case 'medium':
        return <AlertCircle size={18} />;
      case 'low':
        return <CheckCircle2 size={18} />;
      default:
        return null;
    }
  };

  return (
    <div className="flight-alerts">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <button
        className="alert-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle alerts"
      >
        <Bell size={24} />
        {alerts.filter(alert => !alert.read).length > 0 && (
          <span className="alert-badge">{alerts.filter(alert => !alert.read).length}</span>
        )}
      </button>

      {isOpen && (
        <div className="alert-panel">
          <div className="alert-header">
            <h3>Alertes perturbations</h3>
            <div className="alert-actions">
              <button
                className="sound-toggle"
                onClick={toggleSound}
                aria-label={soundEnabled ? 'Désactiver son' : 'Activer son'}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>
              <button
                className="mark-all-read"
                onClick={markAllAsRead}
                disabled={!alerts.some(alert => !alert.read)}
              >
                Tout marquer comme lu
              </button>
              <button
                className="close-panel"
                onClick={() => setIsOpen(false)}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="alert-list">
            {alerts.length === 0 ? (
              <div className="no-alerts">
                <CheckCircle2 size={48} color="var(--green)" />
                <p>Aucune alerte en cours</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`alert-item ${alert.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="alert-icon" style={{ backgroundColor: getSeverityColor(alert.severity) }}>
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <span className="flight-number">{alert.flightNumber}</span>
                      <span className="flight-route">{alert.departure} → {alert.arrival}</span>
                    </div>
                    <div className="alert-time">
                      {new Date(alert.time).toLocaleString()}
                    </div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-type">{alert.type}</div>
                  </div>
                  {!alert.read && <div className="alert-unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightAlerts;
```

FlightAlerts.css
```css
.flight-alerts {
  position: relative;
  font-family: 'Inter', sans-serif;
}

.alert-toggle {
  position: relative;
  background: transparent;
  border: none;
  color: var(--t1);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.alert-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.alert-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: var(--red);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.alert-panel {
  position: absolute;
  right: 0;
  top: 100%;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background-color: rgba(0, 0, 0, 0.2);
}

.alert-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--t1);
}

.alert-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sound-toggle {
  background: transparent;
  border: none;
  color: var(--t1);
  cursor: pointer;
  font-size: 16px;
}

.mark-all-read {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--t1);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.mark-all-read:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-panel {
  background: transparent;
  border: none;
  color: var(--t1);
  cursor: pointer;
  padding: 4px;
}

.alert-list {
  padding: 8px;
}

.no-alerts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--t2);
}

.no-alerts p {
  margin-top: 12px;
  font-size: 14px;
}

.alert-item {
  display: flex;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.alert-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.alert-item.read {
  opacity: 0.8;
}

.alert-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.flight-number {
  font-weight: 600;
  color: var(--t1);
  font-size: 14px;
}

.flight-route {
  font-size: 12px;
  color: var(--t2);
}

.alert-time {
  font-size: 11px;
  color: var(--t3);
  margin-bottom: 4px;
}

.alert-message {
  font-size: 13px;
  color: var(--t1);
  margin-bottom: 4px;
  line-height: 1.4;
}

.alert-type {
  font-size: 11px;
  color: var(--t3);
  text-transform: capitalize;
}

.alert-unread-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background-color: var(--red);
  border-radius: 50%;
}

/* Scrollbar */
.alert-list::-webkit-scrollbar {
  width: 6px;
}

.alert-list::-webkit-scrollbar-track {
  background: var(--bg2);
}

.alert-list::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 3px;
}