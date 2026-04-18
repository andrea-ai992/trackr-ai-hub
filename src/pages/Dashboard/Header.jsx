import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Badge } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [heure, setHeure] = useState(new Date().toLocaleTimeString());
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    setInterval(() => {
      setHeure(new Date().toLocaleTimeString());
    }, 1000);
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      setIsLive(true);
    } else {
      setIsLive(false);
    }
  }, [location]);

  return (
    <header className="flex justify-between items-center p-4">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-text-primary">Bonjour Andrea</h1>
        <span className="ml-2 text-text-secondary">{heure}</span>
      </div>
      <div className="flex items-center">
        <Badge
          className={`ml-2 ${isLive ? 'bg-neon' : ''}`}
          size={24}
          onClick={() => navigate('/')}
        />
      </div>
    </header>
  );
}

export default Header;