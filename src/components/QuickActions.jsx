// src/components/QuickActions.jsx
import { useState } from 'react';
import { Search, Plus, Send, RefreshCw, Settings } from 'lucide-react';

const sanitizeInput = (input) => {
  if (!input) return '';
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const QuickActions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(sanitizeInput(value));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Search query:', searchQuery);
    }
  };

  return (
    <div className="quick-actions">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className={`search-container ${isSearchFocused ? 'focused' : ''}`}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search assets..."
            className="search-input"
          />
        </div>
      </form>

      <div className="action-buttons">
        <button className="action-button" aria-label="Add asset">
          <Plus size={20} />
        </button>
        <button className="action-button" aria-label="Send">
          <Send size={20} />
        </button>
        <button className="action-button" aria-label="Refresh">
          <RefreshCw size={20} />
        </button>
        <button className="action-button" aria-label="Settings">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default QuickActions;