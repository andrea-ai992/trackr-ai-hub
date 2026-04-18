// src/components/SuggestionsBar.jsx
import { useState, useEffect, useRef } from 'react';

const SuggestionsBar = ({ onSelect, suggestions = [], placeholder = "Ask Andy anything..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredSuggestions([]);
      return;
    }

    const filtered = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [inputValue, suggestions]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    onSelect(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      onSelect(inputValue);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="suggestions-bar-container" ref={suggestionsRef}>
      <div className="suggestions-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="suggestions-input"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.trim() !== '' && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="suggestions-dropdown">
            <ul className="suggestions-list">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsBar;
```

```css
/* src/components/SuggestionsBar.css */
.suggestions-bar-container {
  width: 100%;
  position: relative;
  font-family: 'Inter', sans-serif;
}

.suggestions-input-wrapper {
  position: relative;
  width: 100%;
}

.suggestions-input {
  width: 100%;
  padding: 12px 16px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--t1);
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.suggestions-input:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.2);
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  padding: 10px 16px;
  color: var(--t1);
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.suggestion-item:hover {
  background-color: rgba(0, 255, 136, 0.1);
  color: var(--green);
}

/* Scrollbar styling */
.suggestions-dropdown::-webkit-scrollbar {
  width: 6px;
}

.suggestions-dropdown::-webkit-scrollbar-track {
  background: var(--bg2);
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 3px;
}

@media (max-width: 768px) {
  .suggestions-input {
    padding: 10px 14px;
    font-size: 13px;
  }

  .suggestion-item {
    padding: 8px 14px;
    font-size: 13px;
  }
}