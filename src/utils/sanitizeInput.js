**src/utils/sanitizeInput.js**
```javascript
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<!DOCTYPE html><p></p>`);
const document = dom.window.document;

const whitelist = [/^[a-zA-Z0-9\s\.,!?-]+$/];

function sanitizeInput(input) {
  const domElement = document.createElement('div');
  domElement.innerHTML = input;
  const text = domElement.textContent;
  return text.replace(/[^a-zA-Z0-9\s\.,!?-]/g, '');
}

export default sanitizeInput;
```

**src/pages/More/Search.js**
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sanitizeInput from '../utils/sanitizeInput';

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const sanitizedQuery = sanitizeInput(searchQuery);
    navigate(`/results?q=${sanitizedQuery}`);
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Recherchez..."
          className="input-search"
        />
        <button type="submit" className="btn-search">
          Rechercher
        </button>
      </form>
    </div>
  );
};

export default Search;
```

**src/pages/More/Search.css**
```css
.container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.input-search {
  width: 100%;
  padding: 10px;
  font-size: 18px;
  font-family: Inter;
  color: var(--t1);
  background-color: var(--bg);
  border: none;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.btn-search {
  width: 100%;
  padding: 10px;
  font-size: 18px;
  font-family: Inter;
  color: var(--t1);
  background-color: var(--green);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-search:hover {
  background-color: var(--green);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}
```

**src/pages/More/index.js**
```javascript
import React from 'react';
import Search from './Search';

const More = () => {
  return (
    <div className="container">
      <h1 className="title">Recherche</h1>
      <Search />
    </div>
  );
};

export default More;