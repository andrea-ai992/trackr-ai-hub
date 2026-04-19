// src/components/SettingsToggle.jsx
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export const SettingsToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="settings-toggle">
      <button
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
        className="toggle-button"
      >
        {darkMode ? (
          <Sun size={20} strokeWidth={1.5} color="#e0e0e0" />
        ) : (
          <Moon size={20} strokeWidth={1.5} color="#e0e0e0" />
        )}
      </button>
    </div>
  );
};

export default SettingsToggle;