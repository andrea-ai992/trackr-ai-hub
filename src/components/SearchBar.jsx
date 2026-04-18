**src/pages/News.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import { Tabs, TabList, TabPanels, TabPanel } from '@lucide-react/core';
import { FaSearch } from 'react-icons/fa';

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tout');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*, categories(*)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setNews(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNews();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    const filteredNews = news.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setNews(filteredNews);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'Tout') {
      setNews(news);
    } else {
      const filteredNews = news.filter((item) => item.categories.includes(tab));
      setNews(filteredNews);
    }
  };

  return (
    <div className="bg-[var(--bg)] h-screen p-4">
      <header className="sticky top-0 bg-[var(--bg)] py-2">
        <div className="flex justify-between items-center">
          <h1 className="text-[var(--t1)] font-bold">News</h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>
      <main className="mt-4">
        <div className="flex justify-center mb-4">
          <Tabs
            active={activeTab}
            onChange={handleTabChange}
            className="flex justify-center gap-4"
          >
            <TabList>
              <Tab> Tout </Tab>
              <Tab> Tech </Tab>
              <Tab> Finance </Tab>
              <Tab> Sports </Tab>
              <Tab> Crypto </Tab>
              <Tab> France </Tab>
            </TabList>
          </Tabs>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array(6)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-[var(--bg2)] rounded-md p-4 animate-pulse"
                />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item, index) => (
              <NewsCard key={index} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default News;
```

**src/components/NewsCard.jsx**
```jsx
import React from 'react';
import { FaClock } from 'react-icons/fa';

function NewsCard({ item }) {
  const sourceColors = {
    'BBC': '#e60026',
    'Bloomberg': '#1a1a1a',
    'CoinDesk': '#f7931a',
    'Le Monde': '#003189',
    'Reuters': '#ff8000',
  };

  const getBadge = (item) => {
    const now = new Date();
    const diff = now.getTime() - item.created_at.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 30) return 'BREAKING';
    if (minutes < 120) return 'NEW';
    return null;
  };

  return (
    <div className="bg-[var(--bg2)] rounded-md p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div
            className="bg-[var(--green)] h-2 w-2 rounded-full mr-2"
            style={{ backgroundColor: sourceColors[item.source] }}
          />
          <span className="text-[var(--t2)]">{item.source}</span>
        </div>
        <span className="text-[var(--t2)]">{item.created_at.toLocaleString()}</span>
      </div>
      <h2 className="text-[var(--t1)] font-bold mb-2">{item.title}</h2>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-[var(--t2)]">{getBadge(item)}</span>
          <span className="text-[var(--t2)] ml-2">{item.categories.join(', ')}</span>
        </div>
        <div className="flex items-center">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-8 h-8 rounded-md object-cover"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
```

**src/components/SearchBar.jsx**
```jsx
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center bg-[var(--bg2)] rounded-md p-2"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Recherche"
        className="bg-transparent outline-none p-2 text-[var(--t2)]"
      />
      <button
        type="submit"
        className="bg-[var(--green)] h-8 w-8 rounded-full ml-2"
      >
        <FaSearch />
      </button>
    </form>
  );
}

export default SearchBar;
```

**src/styles/global.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

h1 {
  font-size: 24px;
  font-weight: bold;
}

h2 {
  font-size: 18px;
  font-weight: bold;
}

a {
  text-decoration: none;
  color: var(--green);
}

a:hover {
  color: var(--t1);
}

button {
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: var(--t1);
  color: var(--green);
}

input[type='search'] {
  padding: 8px;
  border: none;
  border-radius: 4px;
  width: 100%;
}

input[type='search']::placeholder {
  color: var(--t2);
}

input[type='search']:focus {
  outline: none;
  border: 1px solid var(--green);
}

.skeleton {
  background-color: var(--bg2);
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  height: 40px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    background-color: var(--bg2);
  }
  50% {
    background-color: var(--t1);
  }
  100% {
    background-color: var(--bg2);
  }
}