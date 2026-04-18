Je vais créer le fichier `src/layouts/Footer.jsx` from scratch avec un toggle dark mode complet et fonctionnel.

```jsx
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const Footer = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--bg', '#080808');
      root.style.setProperty('--bg2', '#111');
      root.style.setProperty('--bg3', '#1a1a1a');
      root.style.setProperty('--t1', '#f0f0f0');
      root.style.setProperty('--t2', '#888');
      root.style.setProperty('--t3', '#444');
      root.style.setProperty('--border', 'rgba(255,255,255,0.07)');
      root.style.setProperty('--border-hi', 'rgba(0,255,136,0.3)');
      root.style.setProperty('--green', '#00ff88');
    } else {
      root.style.setProperty('--bg', '#f8f9fa');
      root.style.setProperty('--bg2', '#e9ecef');
      root.style.setProperty('--bg3', '#dee2e6');
      root.style.setProperty('--t1', '#212529');
      root.style.setProperty('--t2', '#6c757d');
      root.style.setProperty('--t3', '#adb5bd');
      root.style.setProperty('--border', 'rgba(0,0,0,0.1)');
      root.style.setProperty('--border-hi', 'rgba(0,0,0,0.2)');
      root.style.setProperty('--green', '#008040');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <p>© {new Date().getFullYear()} Trackr AI Hub. Tous droits réservés.</p>
          <p>IA autonome 24/7 - Andrea Matlega</p>
        </div>
        <button
          onClick={toggleDarkMode}
          className="theme-toggle"
          aria-label={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <style jsx>{`
        .footer {
          width: 100%;
          padding: 1rem 1.5rem;
          background-color: var(--bg2);
          border-top: 1px solid var(--border);
          font-family: 'Inter', sans-serif;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          gap: 1rem;
        }

        .footer-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          color: var(--t2);
          font-size: 0.875rem;
        }

        .theme-toggle {
          background: transparent;
          border: none;
          color: var(--t2);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-toggle:hover {
          background-color: var(--border);
          color: var(--green);
        }

        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
            text-align: center;
          }

          .footer-info {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;