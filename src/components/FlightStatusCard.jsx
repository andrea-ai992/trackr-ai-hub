// src/components/FlightStatusCard.jsx
import { useState, useEffect } from 'react';
import { Plane, Clock, MapPin, Navigation2, AlertCircle } from 'lucide-react';

const FlightStatusCard = ({ flight, isLoading = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="w-full p-4 bg-surface rounded-lg border border-border animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-surface-high rounded-lg flex items-center justify-center">
            <Plane size={24} className="text-text-muted" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-high rounded w-3/4"></div>
            <div className="h-3 bg-surface-high rounded w-1/2"></div>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="h-3 bg-surface-high rounded w-full"></div>
          <div className="h-3 bg-surface-high rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on time':
        return 'text-neon';
      case 'delayed':
        return 'text-yellow-500';
      case 'cancelled':
        return 'text-red-500';
      case 'boarding':
        return 'text-blue-500';
      case 'in air':
        return 'text-green-500';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <div
      className={`w-full p-4 bg-surface rounded-lg border border-border transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionDelay: isVisible ? '0ms' : '100ms',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-surface-high rounded-lg flex items-center justify-center">
          <Plane size={24} className="text-neon" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-text-primary font-medium text-lg">{flight?.flightNumber || 'N/A'}</h3>
            <span className={`text-sm font-mono ${getStatusColor(flight?.status)}`}>
              {flight?.status || 'N/A'}
            </span>
          </div>
          <p className="text-text-secondary text-sm font-mono">
            {flight?.airline || 'Unknown Airline'} • {flight?.aircraft || 'N/A'}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-text-muted" />
          <span className="text-text-secondary text-sm font-mono">
            {flight?.departure?.airport || 'N/A'} ({flight?.departure?.iata || 'N/A'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Navigation2 size={16} className="text-text-muted" />
          <span className="text-text-secondary text-sm font-mono">
            {flight?.arrival?.airport || 'N/A'} ({flight?.arrival?.iata || 'N/A'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} className="text-text-muted" />
          <span className="text-text-secondary text-sm font-mono">
            {flight?.departure?.scheduled || 'N/A'} → {flight?.arrival?.scheduled || 'N/A'}
          </span>
        </div>

        {flight?.gate && (
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-text-muted" />
            <span className="text-text-secondary text-sm font-mono">
              Gate {flight.gate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightStatusCard;