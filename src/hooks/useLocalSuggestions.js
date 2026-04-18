// src/hooks/useLocalSuggestions.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'andy_suggestions_history';

export function useLocalSuggestions(maxItems = 5) {
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState([]);

  // Charger l'historique depuis localStorage au montage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load suggestions history:', error);
    }
  }, []);

  // Sauvegarder l'historique dans localStorage quand il change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save suggestions history:', error);
    }
  }, [history]);

  const addToHistory = (query) => {
    if (!query.trim()) return;

    // Mettre à jour l'historique
    const updatedHistory = [
      query.trim(),
      ...history.filter(item => item !== query.trim())
    ].slice(0, maxItems);

    setHistory(updatedHistory);
  };

  const removeFromHistory = (query) => {
    const updatedHistory = history.filter(item => item !== query);
    setHistory(updatedHistory);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    suggestions,
    setSuggestions,
    inputValue,
    setInputValue,
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
}
```

```jsx
// src/pages/Andy/SuggestionsBar.jsx
import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Trash2 } from 'lucide-react';
import { useLocalSuggestions } from '../../hooks/useLocalSuggestions';

export function SuggestionsBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const {
    suggestions,
    setSuggestions,
    inputValue,
    setInputValue,
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  } = useLocalSuggestions();

  // Gestion des suggestions (simulées pour l'exemple)
  useEffect(() => {
    if (!inputValue) {
      setSuggestions([]);
      return;
    }

    // Simuler des suggestions basées sur l'historique ou des requêtes courantes
    const simulatedSuggestions = [
      `${inputValue} stats`,
      `${inputValue} analysis`,
      `${inputValue} news`,
      `${inputValue} predictions`,
      `${inputValue} historical data`
    ].filter(suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !history.includes(suggestion)
    );

    setSuggestions(simulatedSuggestions);
  }, [inputValue, history, setSuggestions]);

  // Gestion du focus et des événements clavier
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveIndex(-1);
      }

      if (!isOpen) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault();
        setInputValue(suggestions[activeIndex]);
        setIsOpen(false);
        addToHistory(suggestions[activeIndex]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, suggestions, activeIndex, addToHistory]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(e.target.value.length > 0);
    setActiveIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setIsOpen(false);
    addToHistory(suggestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addToHistory(inputValue);
      // Ici tu pourrais déclencher une recherche ou une action
      console.log('Recherche:', inputValue);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
  };

  return (
    <div className="suggestions-container">
      <div className="suggestions-input-wrapper">
        <form onSubmit={handleSubmit} className="suggestions-form">
          <div className="suggestions-input-icon">
            <Search size={20} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => inputValue.length > 0 && setIsOpen(true)}
            placeholder="Ask Andy anything..."
            className="suggestions-input"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                setIsOpen(false);
              }}
              className="suggestions-clear-btn"
            >
              <X size={20} />
            </button>
          )}
        </form>
      </div>

      {isOpen && (suggestions.length > 0 || history.length > 0) && (
        <div ref={suggestionsRef} className="suggestions-dropdown">
          {history.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestions-section-header">
                <Clock size={16} />
                <span>Recent searches</span>
                <button
                  onClick={handleClearHistory}
                  className="suggestions-clear-history"
                  title="Clear history"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="suggestions-list">
                {history.map((item, index) => (
                  <div
                    key={`history-${index}`}
                    className={`suggestions-item ${activeIndex === index + suggestions.length ? 'active' : ''}`}
                    onClick={() => handleSuggestionClick(item)}
                  >
                    <Clock size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestions-section-header">
                <Search size={16} />
                <span>Suggestions</span>
              </div>
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`suggestion-${index}`}
                    className={`suggestions-item ${activeIndex === index ? 'active' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search size={16} />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .suggestions-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .suggestions-input-wrapper {
          position: relative;
        }

        .suggestions-form {
          display: flex;
          align-items: center;
          background: var(--bg2);
          border-radius: 8px;
          border: 1px solid var(--border);
          padding: 8px 12px;
          transition: all 0.2s ease;
        }

        .suggestions-form:focus-within {
          border-color: var(--border-hi);
          box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
        }

        .suggestions-input-icon {
          color: var(--t2);
          margin-right: 12px;
        }

        .suggestions-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--t1);
          font-size: 16px;
          outline: none;
          font-family: 'Inter', sans-serif;
        }

        .suggestions-input::placeholder {
          color: var(--t2);
        }

        .suggestions-clear-btn {
          background: none;
          border: none;
          color: var(--t2);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .suggestions-clear-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--t1);
        }

        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          background: var(--bg2);
          border-radius: 8px;
          border: 1px solid var(--border);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          max-height: 400px;
          overflow-y: auto;
        }

        .suggestions-section {
          padding: 8px;
        }

        .suggestions-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          color: var(--t2);
          font-size: 14px;
          font-weight: 500;
        }

        .suggestions-clear-history {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--t2);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .suggestions-clear-history:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--t1);
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
        }

        .suggestions-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          color: var(--t1);
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .suggestions-item:hover {
          background: rgba(0, 255, 136, 0.1);
          color: var(--green);
        }

        .suggestions-item.active {
          background: rgba(0, 255, 136, 0.2);
          color: var(--green);
        }

        @media (max-width: 768px) {
          .suggestions-dropdown {
            left: 0;
            right: 0;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}