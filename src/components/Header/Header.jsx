import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaGlobe } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="flex justify-between items-center p-4">
      <div className="flex items-center">
        <span className="text-lg font-bold text--text-primary mr-2">
          Bonjour Andrea
        </span>
        <span className="text-lg text--text-secondary">
          {new Date().toLocaleTimeString()}
        </span>
      </div>
      <div className="flex items-center">
        <button
          className={`bg--neon rounded-full p-2 text--text-primary transition duration-300 ${
            isHome ? 'animate-pulse' : ''
          }`}
        >
          <FaGlobe size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;