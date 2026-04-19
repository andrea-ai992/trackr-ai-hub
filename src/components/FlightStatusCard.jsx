import { useState, useEffect } from 'react';
import { Plane, Clock, MapPin, Navigation, AlertTriangle } from 'lucide-react';

const FlightStatusCard = ({ flight }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!flight) return null;

  const {
    flightNumber,
    departure,
    arrival,
    status,
    gate,
    terminal,
    airline,
    scheduledDeparture,
    actualDeparture,
    scheduledArrival,
    actualArrival,
    aircraft,
    delayMinutes,
  } = flight;

  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'on time':
        return 'var(--neon)';
      case 'delayed':
        return '#ffcc00';
      case 'cancelled':
        return '#ff3333';
      case 'boarding':
        return '#00ccff';
      case 'departed':
        return '#6666ff';
      default:
        return 'var(--neon)';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  return (
    <div
      className={`w-full max-w-sm mx-auto p-4 rounded-lg border ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        transition-all duration-500 ease-out
        bg-[var(--surface)] border-[var(--border)]
        shadow-lg shadow-[var(--neon)]/10`}
      style={{
        animation: isVisible ? 'fadeUp 0.5s ease-out forwards' : 'none',
        boxShadow: `0 0 15px 2px ${getStatusColor()}20`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Plane size={20} color={getStatusColor()} />
          <span className="text-lg font-bold text-[var(--neon)] font-[JetBrains_Mono]">
            {flightNumber}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-1 rounded-full font-[JetBrains_Mono]"
            style={{
              backgroundColor: `${getStatusColor()}15`,
              color: getStatusColor(),
              border: `1px solid ${getStatusColor()}30`,
            }}
          >
            {status}
          </span>
          {delayMinutes > 0 && (
            <span className="text-xs text-[#ffcc00] font-[JetBrains_Mono] flex items-center gap-1">
              <AlertTriangle size={12} />
              {delayMinutes}min
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} color="var(--text-secondary)" />
            <span className="text-[var(--text-secondary)] font-[JetBrains_Mono]">
              Scheduled
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--text-primary)] font-[JetBrains_Mono]">
              {formatTime(scheduledDeparture)}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-[JetBrains_Mono]">
              {formatDate(scheduledDeparture)}
            </span>
          </div>
          {actualDeparture && (
            <div className="flex items-center gap-2 text-xs">
              <Clock size={12} color="#ffcc00" />
              <span className="text-[var(--text-muted)] font-[JetBrains_Mono]">
                Actual: {formatTime(actualDeparture)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Navigation size={14} color="var(--text-secondary)" />
            <span className="text-[var(--text-secondary)] font-[JetBrains_Mono]">
              Aircraft
            </span>
          </div>
          <div className="text-lg font-bold text-[var(--text-primary)] font-[JetBrains_Mono]">
            {aircraft}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MapPin size={12} color="var(--text-secondary)" />
            <span className="text-[var(--text-muted)] font-[JetBrains_Mono]">
              {airline}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} color="var(--text-secondary)" />
            <span className="text-[var(--text-secondary)] font-[JetBrains_Mono]">
              Departure
            </span>
          </div>
          <div className="text-lg font-bold text-[var(--text-primary)] font-[JetBrains_Mono]">
            {departure}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)] font-[JetBrains_Mono]">
              Terminal {terminal}
            </span>
            <span className="text-[var(--text-muted)] font-[JetBrains_Mono]">
              Gate {gate}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Navigation size={14} color="var(--text-secondary)" />
            <span className="text-[var(--text-secondary)] font-[JetBrains_Mono]">
              Arrival
            </span>
          </div>
          <div className="text-lg font-bold text-[var(--text-primary)] font-[JetBrains_Mono]">
            {arrival}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)] font-[JetBrains_Mono]">
              {formatTime(scheduledArrival)}
            </span>
            {actualArrival && (
              <span className="text-[var(--text-muted)] font-[JetBrains_Mono]">
                Actual: {formatTime(actualArrival)}
              </span>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FlightStatusCard;