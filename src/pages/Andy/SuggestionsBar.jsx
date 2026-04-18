src/pages/Andy/SuggestionsBar.jsx
```jsx
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import useLocalSuggestions from '../../hooks/useLocalSuggestions';

const SuggestionsBar = ({ onSelectSuggestion }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  const {
    suggestions,
    addSuggestion,
    removeSuggestion,
    clearSuggestions
  } = useLocalSuggestions();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    onSelectSuggestion(suggestion);
    addSuggestion(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleSuggestionClick(inputValue.trim());
    }
  };

  const handleClearHistory = () => {
    clearSuggestions();
  };

  const handleRemoveSuggestion = (e, suggestion) => {
    e.stopPropagation();
    removeSuggestion(suggestion);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="suggestions-bar-container">
      <div className="suggestions-input-wrapper">
        <Search size={20} className="suggestions-icon" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher ou poser une question..."
          className="suggestions-input"
        />
        {inputValue.length > 0 && (
          <button
            onClick={() => {
              setInputValue('');
              setShowSuggestions(false);
            }}
            className="suggestions-clear-btn"
            aria-label="Effacer la recherche"
          >
            ×
          </button>
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || inputValue.length > 0) && (
        <div ref={suggestionsRef} className="suggestions-dropdown">
          {inputValue.length > 0 && !suggestions.includes(inputValue.trim()) && (
            <div
              className="suggestions-item suggestion-new"
              onClick={() => handleSuggestionClick(inputValue.trim())}
            >
              <Search size={16} />
              <span>Rechercher "{inputValue}"</span>
            </div>
          )}

          {suggestions.length > 0 && (
            <>
              <div className="suggestions-header">
                <span>Historique</span>
                <button
                  onClick={handleClearHistory}
                  className="suggestions-clear-history"
                  aria-label="Effacer l'historique"
                >
                  Effacer tout
                </button>
              </div>

              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestions-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Search size={16} />
                  <span>{suggestion}</span>
                  <button
                    onClick={(e) => handleRemoveSuggestion(e, suggestion)}
                    className="suggestions-remove-btn"
                    aria-label="Supprimer de l'historique"
                  >
                    ×
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionsBar;
```

src/hooks/useLocalSuggestions.js
```jsx
import { useState, useEffect } from 'react';

const SUGGESTIONS_STORAGE_KEY = 'andy_suggestions_history';

const useLocalSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const loadSuggestions = () => {
      try {
        const saved = localStorage.getItem(SUGGESTIONS_STORAGE_KEY);
        if (saved) {
          setSuggestions(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load suggestions:', error);
      }
    };

    loadSuggestions();
  }, []);

  const saveSuggestions = (updatedSuggestions) => {
    try {
      localStorage.setItem(SUGGESTIONS_STORAGE_KEY, JSON.stringify(updatedSuggestions));
      setSuggestions(updatedSuggestions);
    } catch (error) {
      console.error('Failed to save suggestions:', error);
    }
  };

  const addSuggestion = (suggestion) => {
    if (!suggestion || suggestion.trim() === '') return;

    const trimmedSuggestion = suggestion.trim();
    const updatedSuggestions = [trimmedSuggestion, ...suggestions.filter(s => s !== trimmedSuggestion)];
    saveSuggestions(updatedSuggestions);
  };

  const removeSuggestion = (suggestion) => {
    const updatedSuggestions = suggestions.filter(s => s !== suggestion);
    saveSuggestions(updatedSuggestions);
  };

  const clearSuggestions = () => {
    saveSuggestions([]);
  };

  return {
    suggestions,
    addSuggestion,
    removeSuggestion,
    clearSuggestions
  };
};

export default useLocalSuggestions;