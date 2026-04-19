// src/components/FlightStatusCard.jsx
import React, { useState, useEffect } from 'react';
import { Plane, Clock, MapPin, AlertCircle } from 'lucide-react';

const FlightStatusCard = ({ flight }) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    const pulseInterval = setInterval(() => {
      setPulse(prev => !prev);
    }, 2000);

    return () => clearInterval(pulseInterval);
  }, []);

  if (!flight) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on time':
        return 'text-green-500';
      case 'delayed':
        return 'text-yellow-500';
      case 'cancelled':
        return 'text-red-500';
      case 'boarding':
        return 'text-blue-500';
      default:
        return 'text-text-primary';
    }
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    try {
      const date = new Date(time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return time;
    }
  };

  return (
    <div
      className={`
        w-full max-w-sm p-4 rounded-lg border border-border
        bg-surface shadow-lg
        ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        transition-all duration-500 ease-out
        relative overflow-hidden
        ${pulse ? 'ring-1 ring-neon/20' : ''}
      `}
      style={{
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {/* Neon border effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-neon/5 via-transparent to-neon/5 rounded-lg animate-pulse-slow" />
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-3">
        <Plane size={20} className="text-neon" />
        <span className="text-sm font-semibold text-text-primary">FLIGHT STATUS</span>
      </div>

      {/* Flight info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface-high rounded-md">
            <Plane size={24} className="text-neon" />
          </div>
          <div>
            <div className="text-lg font-bold text-text-primary">{flight.flightNumber || 'N/A'}</div>
            <div className="text-sm text-text-secondary">{flight.airline || 'Unknown Airline'}</div>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="text-text-muted" />
          <span className="text-text-primary">{flight.departure || 'N/A'} → {flight.arrival || 'N/A'}</span>
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-text-muted" />
            <span className="text-text-secondary">Departure</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-text-muted" />
            <span className="text-text-secondary">Arrival</span>
          </div>
          <div className="text-text-primary">{formatTime(flight.departureTime)}</div>
          <div className="text-text-primary">{formatTime(flight.arrivalTime)}</div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className={getStatusColor(flight.status)} />
          <span className={`text-sm font-medium ${getStatusColor(flight.status)}`}>
            {flight.status || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Slow pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }
`;
document.head.appendChild(style);

export default FlightStatusCard;