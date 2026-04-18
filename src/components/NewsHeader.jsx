**src/pages/News.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NewsHeader } from './NewsHeader';
import { NewsCard } from './NewsCard';
import { supabase } from '../utils/supabase';
import { useTheme } from '../hooks/useTheme';

const News = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*, categories(*)')
          .eq('category', category)
          .order('created_at', { ascending: false });
        setNews(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchNews();
  }, [category]);

  const handleCategoryChange = (newCategory) => {
    navigate(`/news/${newCategory}`);
  };

  return (
    <div className="container">
      <NewsHeader
        categories={['Top', 'Business', 'Tech', 'Sports']}
        activeCategory={category}
        onCategoryChange={handleCategoryChange}
      />
      <div className="news-grid">
        {loading ? (
          <p>Chargement en cours...</p>
        ) : error ? (
          <p>Erreur : {error}</p>
        ) : (
          news.map((item) => (
            <NewsCard
              key={item.id}
              title={item.title}
              source={item.source}
              date={item.created_at}
              description={item.description}
              category={item.categories[0].name}
              breaking={item.breaking}
              new={item.new}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default News;
```

**src/components/NewsHeader.jsx**
```jsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const NewsHeader = ({ categories, activeCategory, onCategoryChange }) => {
  const theme = useTheme();

  return (
    <header className="news-header">
      <div className="categories">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${category === activeCategory ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <style jsx>{`
        .news-header {
          position: sticky;
          top: 0;
          background-color: ${theme.vars.bg};
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .categories {
          display: flex;
          gap: 1rem;
        }
        .category-btn {
          background-color: ${theme.vars.bg2};
          color: ${theme.vars.t1};
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        .category-btn.active {
          background-color: ${theme.vars.bg3};
        }
      `}</style>
    </header>
  );
};

export default NewsHeader;
```

**src/components/NewsCard.jsx**
```jsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const NewsCard = ({
  title,
  source,
  date,
  description,
  category,
  breaking,
  new,
}) => {
  const theme = useTheme();

  const getAccentColor = () => {
    switch (source) {
      case 'TechCrunch':
        return theme.vars.green;
      case 'Bloomberg':
        return '#ff00ff';
      default:
        return theme.vars.bg;
    }
  };

  return (
    <article className="news-card">
      <header className="news-card-header">
        <h2 className="news-card-title">{title}</h2>
        <p className="news-card-source">
          {source} - {date}
        </p>
      </header>
      <div className="news-card-content">
        <p className="news-card-description">{description}</p>
        <p className="news-card-category">{category}</p>
        {breaking && <span className="breaking-badge">BREAKING</span>}
        {new && <span className="new-badge">NEW</span>}
      </div>
      <style jsx>{`
        .news-card {
          background-color: ${theme.vars.bg2};
          padding: 1rem;
          border: 1px solid ${theme.vars.border};
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        .news-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .news-card-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: ${theme.vars.t1};
        }
        .news-card-source {
          font-size: 1rem;
          color: ${theme.vars.t2};
        }
        .news-card-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .news-card-description {
          font-size: 1rem;
          color: ${theme.vars.t3};
        }
        .news-card-category {
          font-size: 1rem;
          color: ${theme.vars.t2};
        }
        .breaking-badge {
          background-color: ${getAccentColor()};
          color: ${theme.vars.t1};
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
        .new-badge {
          background-color: ${getAccentColor()};
          color: ${theme.vars.t1};
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
      `}</style>
    </article>
  );
};

export default NewsCard;
```

**src/utils/supabase.js**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
```

**src/hooks/useTheme.js**
```javascript
import { useState, useEffect } from 'react';

const useTheme = () => {
  const [theme, setTheme] = useState({
    vars: {
      green: '#00ff88',
      bg: '#080808',
      bg2: '#111',
      bg3: '#444',
      border: 'rgba(255, 255, 255, 0.07)',
      t1: '#f0f0f0',
      t2: '#888',
      t3: '#444',
    },
  });

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme) {
      setTheme(JSON.parse(theme));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  return theme;
};

export default useTheme;