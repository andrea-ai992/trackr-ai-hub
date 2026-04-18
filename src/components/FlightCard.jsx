Je vais implémenter un design premium pour FlightTracker avec un statut live en temps réel et des animations fluides. Je commence par créer le composant FlightCard.jsx puis je modifie FlightTracker.jsx pour intégrer ce nouveau composant.

Voici le code pour FlightCard.jsx:

```jsx
import { useState, useEffect } from 'react';
import { Plane, Clock, MapPin, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const FlightCard = ({
  flightNumber,
  departure,
  arrival,
  airline,
  status,
  departureTime,
  arrivalTime,
  gate,
  terminal,
  aircraft,
  progress = 0,
  isLive = false,
  onToggleDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);
  const [localProgress, setLocalProgress] = useState(progress);

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  const getStatusColor = () => {
    switch (localStatus?.toLowerCase()) {
      case 'on time':
        return 'var(--green)';
      case 'delayed':
        return '#ffcc00';
      case 'cancelled':
        return '#ff3333';
      case 'boarding':
        return '#00ccff';
      case 'in air':
        return '#00ccff';
      case 'landed':
        return '#00ccff';
      default:
        return 'var(--t2)';
    }
  };

  const getStatusIcon = () => {
    switch (localStatus?.toLowerCase()) {
      case 'on time':
        return <CheckCircle2 size={16} />;
      case 'delayed':
        return <AlertCircle size={16} />;
      case 'cancelled':
        return <AlertCircle size={16} />;
      case 'boarding':
        return <CheckCircle2 size={16} />;
      case 'in air':
        return <Plane size={16} />;
      case 'landed':
        return <CheckCircle2 size={16} />;
      default:
        return null;
    }
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const duration = (eH * 60 + eM) - (sH * 60 + sM);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flight-card">
      <div className="flight-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flight-info">
          <div className="flight-number">{flightNumber}</div>
          <div className="flight-airline">{airline}</div>
        </div>

        <div className="flight-times">
          <div className="time departure-time">{formatTime(departureTime)}</div>
          <div className="flight-duration">
            {formatDuration(departureTime, arrivalTime)}
          </div>
          <div className="time arrival-time">{formatTime(arrivalTime)}</div>
        </div>

        <div className="flight-status">
          <div className="status-badge" style={{ backgroundColor: getStatusColor() }}>
            {getStatusIcon()}
            <span>{localStatus}</span>
          </div>
          {isLive && (
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span>Live</span>
            </div>
          )}
        </div>

        <button className="expand-button">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="flight-details">
          <div className="detail-row">
            <div className="detail-label">
              <MapPin size={14} />
              <span>Départ</span>
            </div>
            <div className="detail-value">{departure}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">
              <MapPin size={14} />
              <span>Arrivée</span>
            </div>
            <div className="detail-value">{arrival}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">
              <Clock size={14} />
              <span>Terminal</span>
            </div>
            <div className="detail-value">{terminal || 'N/A'}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">
              <Plane size={14} />
              <span>Avion</span>
            </div>
            <div className="detail-value">{aircraft || 'N/A'}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">
              <Clock size={14} />
              <span>Porte</span>
            </div>
            <div className="detail-value">{gate || 'N/A'}</div>
          </div>

          {localProgress > 0 && (
            <div className="flight-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${localProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {localProgress}% de trajet
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .flight-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .flight-card:hover {
          background: rgba(0, 255, 136, 0.05);
          border-color: var(--green);
        }

        .flight-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .flight-info {
          flex: 1;
          min-width: 0;
        }

        .flight-number {
          font-size: 18px;
          font-weight: 600;
          color: var(--t1);
          margin-bottom: 2px;
        }

        .flight-airline {
          font-size: 14px;
          color: var(--t2);
          font-weight: 500;
        }

        .flight-times {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 100px;
        }

        .time {
          font-size: 16px;
          font-weight: 600;
          color: var(--t1);
        }

        .departure-time {
          color: var(--green);
        }

        .arrival-time {
          color: var(--green);
        }

        .flight-duration {
          font-size: 12px;
          color: var(--t3);
          text-align: center;
        }

        .flight-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          background-color: var(--green);
          color: #000;
        }

        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          background-color: rgba(0, 255, 136, 0.2);
          color: var(--green);
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background-color: var(--green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .expand-button {
          background: none;
          border: none;
          color: var(--t2);
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s ease;
        }

        .expand-button:hover {
          color: var(--green);
        }

        .flight-details {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 14px;
        }

        .detail-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--t2);
        }

        .detail-value {
          color: var(--t1);
          font-weight: 500;
        }

        .flight-progress {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .progress-bar {
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--green), #00cc88);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 12px;
          color: var(--t2);
          text-align: right;
          margin-top: 4px;
        }

        @media (min-width: 768px) {
          .flight-header {
            gap: 20px;
          }

          .flight-info {
            flex: 2;
          }

          .flight-times {
            min-width: 120px;
          }

          .flight-status {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default FlightCard;
```

Maintenant, voici le code mis à jour pour FlightTracker.jsx:

```jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Search, RefreshCw, MapPin, Clock, AlertCircle } from 'lucide-react';
import FlightCard from '../components/FlightCard';

const FlightTracker = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [liveFlights, setLiveFlights] = useState(new Set());
  const [activeFilters, setActiveFilters] = useState({
    onTime: true,
    delayed: true,
    cancelled: true,
    boarding: true,
    inAir: true,
    landed: true
  });

  const flightDataRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Données simulées pour le développement
  const generateMockFlights = () => {
    const airlines = ['Air France', 'Delta', 'United', 'Lufthansa', 'Emirates', 'Qatar'];
    const airports = ['CDG', 'JFK', 'LAX', 'LHR', 'DXB', 'DOH', 'FRA', 'HND'];
    const statuses = ['on time', 'delayed', 'boarding', 'in air', 'landed'];
    const aircrafts = ['A320', 'B787', 'A350', 'B777', 'A380'];

    return Array.from({ length: 15 }, (_, i) => ({
      id: `FL${1000 + i}`,
      flightNumber: `AF${Math.floor(Math.random() * 900) + 100}`,
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      departure: airports[Math.floor(Math.random() * airports.length)],
      arrival: airports[Math.floor(Math.random() * airports.length)],
      departureTime: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60) < 10 ? '0' : ''}${Math.floor(Math.random() * 60)}`,
      arrivalTime: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60) < 10 ? '0' : ''}${Math.floor(Math.random() * 60)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      gate: Math.floor(Math.random() * 50) + 1,
      terminal: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
      aircraft: aircrafts[Math.floor(Math.random() * aircrafts.length)],
      progress: Math.floor(Math.random() * 100),
      isLive: Math.random() > 0.7
    }));
  };

  // Simulation de statut live en temps réel
  useEffect(() => {
    const updateLiveStatus = () => {
      setFlights(prevFlights => {
        return prevFlights.map(flight => {
          if (!flight.isLive) return flight;

          // Simuler des changements de statut
          const statusChanges = {
            'on time': ['boarding', 'delayed'],
            'boarding': ['in air'],
            'delayed': ['on time', 'boarding'],
            'in air': ['landed'],
            'landed': ['on time']
          };

          const possibleStatuses = statusChanges[flight.status] || ['on time'];
          const newStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];

          // Simuler progression du vol
          let newProgress = flight.progress;
          if (flight.status === 'in air') {
            newProgress = Math.min(100, flight.progress + Math.floor(Math.random() * 5) + 1);
          }

          return {
            ...flight,
            status: newStatus,
            progress: newProgress
          };
        });
      });

      setLastUpdated(new Date());
      animationFrameRef.current = requestAnimationFrame(updateLiveStatus);
    };

    animationFrameRef.current = requestAnimationFrame(updateLiveStatus);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Chargement initial
  useEffect(() => {
    const loadFlights = () => {
      setLoading(true);
      setTimeout(() => {
        const mockFlights = generateMockFlights();
        setFlights(mockFlights);
        setLastUpdated(new Date());

        // Identifier les vols live
        const liveSet = new Set(mockFlights.filter(f => f.isLive).map(f => f.id));
        setLiveFlights(liveSet);

        setLoading(false);
      }, 800);
    };

    loadFlights();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Rafraîchissement manuel
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      const mockFlights = generateMockFlights();
      setFlights(mockFlights);
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1000);
  };

  // Filtrage des vols
  const filteredFlights = flights.filter(flight => {
    const matchesSearch = !searchTerm ||
      flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.arrival.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = activeFilters[flight.status.replace(' ', '')];

    return matchesSearch && matchesStatus;
  });

  // Statistiques
  const getStatusStats = () => {
    const stats = {
      onTime: 0,
      delayed: 0,
      cancelled: 0,
      boarding: 0,
      inAir: 0,
      landed: 0
    };

    flights.forEach(flight => {
      stats[flight.status.replace(' ', '')]++;
    });

    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="flight-tracker">
      <div className="tracker-header">