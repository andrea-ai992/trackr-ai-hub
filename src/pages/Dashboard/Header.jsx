import React from 'react';
import { useLocation } from 'react-router-dom';
import { Clock, Live } from 'lucide-react';
import { useDate } from '../hooks/useDate';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const location = useLocation();
  const { date } = useDate();
  const { theme } = useTheme();

  const heureLocale = new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center">
        <h1 className="text-lg font-bold text--text-primary">Bonjour Andrea</h1>
        <span className="text-sm text--text-secondary ml-2">{heureLocale}</span>
      </div>
      <div className="flex items-center">
        <Live className="text-lg text--neon mr-2 animate-pulse" />
        <span className="text-lg text--text-primary">LIVE</span>
      </div>
    </header>
  );
};

export default Header;