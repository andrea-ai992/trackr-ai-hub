import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import { SOURCE_COLORS } from '../components/NewsCard';

const News = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(['Tout', 'Tech', 'Finance', 'Sports', 'Crypto', 'France']);
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNews(data);
      setLoading(false);
    };
    fetchNews();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const filteredNews = news.filter((article) => {
    if (searchQuery === '') return true;
    return article.title.toLowerCase().includes(searchQuery.toLowerCase()) || article.description.toLowerCase().includes(searchQuery.toLowerCase());
  }).filter((article) => {
    if (selectedCategory === 'Tout') return true;
    return article.category === selectedCategory;
  });

  return (
    <div className="news-page">
      <header className="news-header">
        <input
          type="search"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Recherche"
          className="news-search"
        />
        <button
          className="news-search-button"
          onClick={() => navigate(location.pathname + '?' + searchQuery)}
        >
          <Clock size={12} />
        </button>
        <nav className="news-tabs">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`news-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </nav>
      </header>
      <main className="news-content">
        {loading ? (
          <div className="news-loader">
            <div className="news-loader-item" />
            <div className="news-loader-item" />
            <div className="news-loader-item" />
            <div className="news-loader-item" />
            <div className="news-loader-item" />
            <div className="news-loader-item" />
          </div>
        ) : (
          filteredNews.map((article, index) => (
            <NewsCard key={index} article={article} />
          ))
        )}
      </main>
    </div>
  );
};

export default News;