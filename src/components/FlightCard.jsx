import { useState, useEffect } from 'react';
import { Plane, AlertCircle, Clock, CheckCircle, XCircle, Wind, Calendar, MapPin, Navigation } from 'lucide-react';

const FlightCard = ({
  flightNumber = 'AF123',
  departure = 'CDG',
  arrival = 'JFK',
  departureTime = '14:30',
  arrivalTime = '17:45',
  status = 'on-time',
  gate = 'B23',
  terminal = '2E',
  airline = 'Air France',
  aircraft = 'A350-900',
  delayMinutes = 0,
  live = false,
  onAlertDismiss
}) => {
  const [isLive, setIsLive] = useState(live);
  const [showAlert, setShowAlert] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    setIsLive(live);
  }, [live]);

  useEffect(() => {
    if (status === 'delayed' || status === 'cancelled') {
      setShowAlert(true);
    }
  }, [status]);

  const getStatusConfig = () => {
    const baseConfig = {
      icon: Plane,
      color: 'var(--t2)',
      text: 'En vol',
      bg: 'var(--bg2)',
      border: 'var(--border)'
    };

    switch (status) {
      case 'on-time':
        return {
          ...baseConfig,
          icon: CheckCircle,
          color: 'var(--green)',
          text: 'À l\'heure',
          bg: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid var(--green)'
        };
      case 'delayed':
        return {
          ...baseConfig,
          icon: Clock,
          color: '#ffcc00',
          text: 'Retardé',
          bg: 'rgba(255, 204, 0, 0.1)',
          border: '1px solid #ffcc00'
        };
      case 'cancelled':
        return {
          ...baseConfig,
          icon: XCircle,
          color: '#ff3333',
          text: 'Annulé',
          bg: 'rgba(255, 51, 51, 0.1)',
          border: '1px solid #ff3333'
        };
      case 'boarding':
        return {
          ...baseConfig,
          icon: Navigation,
          color: 'var(--green)',
          text: 'Embarquement',
          bg: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid var(--green)'
        };
      case 'departed':
        return {
          ...baseConfig,
          icon: Plane,
          color: 'var(--t2)',
          text: 'Départ',
          bg: 'var(--bg2)',
          border: 'var(--border)'
        };
      default:
        return baseConfig;
    }
  };

  const statusConfig = getStatusConfig();

  const formatTime = (time) => {
    if (!time) return '--:--';
    return time;
  };

  const handleAlertDismiss = () => {
    setAlertDismissed(true);
    if (onAlertDismiss) onAlertDismiss();
    setTimeout(() => setShowAlert(false), 300);
  };

  return (
    <div className="flight-card" style={{
      fontFamily: 'Inter, sans-serif',
      backgroundColor: 'var(--bg2)',
      border: statusConfig.border,
      borderRadius: '12px',
      padding: '16px',
      margin: '8px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Live Badge */}
      {isLive && (
        <div className="live-badge" style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: 'var(--green)',
          color: 'var(--bg)',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: '600',
          textTransform: 'uppercase',
          zIndex: 2,
          animation: 'pulse 2s infinite'
        }}>
          Live
        </div>
      )}

      {/* Airline Info */}
      <div className="airline-info" style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div className="airline-logo" style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'var(--bg)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {airline.substring(0, 2)}
        </div>
        <div>
          <div style={{
            color: 'var(--t1)',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {airline}
          </div>
          <div style={{
            color: 'var(--t2)',
            fontSize: '12px'
          }}>
            {flightNumber}
          </div>
        </div>
      </div>

      {/* Flight Details */}
      <div className="flight-details" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {/* Departure */}
        <div className="departure" style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            color: 'var(--t2)',
            fontSize: '12px',
            marginBottom: '4px'
          }}>
            Départ
          </div>
          <div style={{
            color: 'var(--t1)',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '2px'
          }}>
            {departure}
          </div>
          <div style={{
            color: 'var(--t3)',
            fontSize: '14px'
          }}>
            {formatTime(departureTime)}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--t3)'
          }}>
            <MapPin size={14} style={{ marginRight: '4px' }} />
            Terminal {terminal} • Porte {gate}
          </div>
        </div>

        {/* Arrival */}
        <div className="arrival" style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            color: 'var(--t2)',
            fontSize: '12px',
            marginBottom: '4px'
          }}>
            Arrivée
          </div>
          <div style={{
            color: 'var(--t1)',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '2px'
          }}>
            {arrival}
          </div>
          <div style={{
            color: 'var(--t3)',
            fontSize: '14px'
          }}>
            {formatTime(arrivalTime)}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--t3)'
          }}>
            <Calendar size={14} style={{ marginRight: '4px' }} />
            {aircraft}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="status" style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: statusConfig.bg,
        borderRadius: '8px',
        marginBottom: '12px'
      }}>
        <statusConfig.icon size={16} style={{
          color: statusConfig.color,
          marginRight: '8px'
        }} />
        <span style={{
          color: statusConfig.color,
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {statusConfig.text}
          {delayMinutes > 0 && status === 'delayed' && (
            <span style={{ marginLeft: '4px' }}>+{delayMinutes}min</span>
          )}
        </span>
      </div>

      {/* Alert Notification */}
      {showAlert && !alertDismissed && (
        <div className="alert-notification" style={{
          backgroundColor: 'rgba(255, 51, 51, 0.15)',
          border: '1px solid #ff3333',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <AlertCircle size={16} style={{
            color: '#ff3333',
            marginRight: '8px'
          }} />
          <span style={{
            color: '#ff3333',
            fontSize: '13px',
            flex: 1
          }}>
            {status === 'delayed' ? `Retard de ${delayMinutes} minutes` : 'Vol annulé'}
          </span>
          <button
            onClick={handleAlertDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff3333',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '12px'
            }}
          >
            Ignorer
          </button>
        </div>
      )}

      {/* Flight Path */}
      <div className="flight-path" style={{
        height: '20px',
        position: 'relative',
        marginTop: '12px'
      }}>
        <div style={{
          position: 'absolute',
          left: '0',
          top: '8px',
          width: '8px',
          height: '4px',
          backgroundColor: 'var(--green)',
          borderRadius: '2px'
        }} />
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '8px',
          width: 'calc(100% - 16px)',
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, var(--green) 50%, transparent 100%)',
          borderRadius: '1px'
        }} />
        <div style={{
          position: 'absolute',
          right: '0',
          top: '8px',
          width: '8px',
          height: '4px',
          backgroundColor: 'var(--green)',
          borderRadius: '2px'
        }} />
      </div>
    </div>
  );
};

export default FlightCard;