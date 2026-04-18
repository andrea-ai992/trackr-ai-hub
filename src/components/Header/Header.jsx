import React from 'react';
import { useLocation } from 'react-router-dom';
import { Clock, Badge } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="Header">
      <div className="Header__container">
        <div className="Header__logo">
          <span className="Header__text">Bonjour Andrea</span>
          <span className="Header__time">{heure}</span>
        </div>
        <div className="Header__actions">
          <Badge className="Header__badge" color="#00ff88" pulse>
            Live
          </Badge>
        </div>
      </div>
    </header>
  );
};

export default Header;