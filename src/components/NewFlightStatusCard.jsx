// src/components/NewFlightStatusCard.jsx
import { useState, useEffect } from 'react';
import { Plane, Clock, MapPin, AlertCircle } from 'lucide-react';

const NewFlightStatusCard = ({ flight }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    if (!flight) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const departureTime = new Date(flight.departureTime);
      const diff = departureTime - now;

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
        setIsDelayed(false);
      } else {
        setTimeLeft('Départ imminent');
        setIsDelayed(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [flight]);

  if (!flight) return null;

  return (
    <div className="flight-status-card">
      <div className="flight-header">
        <div className="flight-airline">
          <Plane size={20} color="#00ff88" />
          <span>{flight.airline}</span>
        </div>
        <div className="flight-number">{flight.flightNumber}</div>
      </div>

      <div className="flight-route">
        <div className="route-point">
          <MapPin size={16} color="#aaa" />
          <span>{flight.departureAirport}</span>
        </div>
        <div className="route-arrow">→</div>
        <div className="route-point">
          <MapPin size={16} color="#aaa" />
          <span>{flight.arrivalAirport}</span>
        </div>
      </div>

      <div className="flight-times">
        <div className="time-departure">
          <Clock size={14} color="#aaa" />
          <span>{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="time-arrival">
          <Clock size={14} color="#aaa" />
          <span>{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="flight-status">
        <div className={`status-badge ${isDelayed ? 'delayed' : 'on-time'}`}>
          {isDelayed ? (
            <>
              <AlertCircle size={14} />
              <span>Retardé</span>
            </>
          ) : (
            <>
              <Clock size={14} />
              <span>À l'heure</span>
            </>
          )}
        </div>
        <div className="time-left">{timeLeft}</div>
      </div>

      <div className="flight-gate">
        <span>Porte: {flight.gate || 'Non assignée'}</span>
      </div>
    </div>
  );
};

export default NewFlightStatusCard;