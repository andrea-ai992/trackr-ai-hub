import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NewsCard } from '../components/NewsCard';
import { SearchBar } from '../components/SearchBar';
import { Tabs } from '../components/Tabs';
import { useFetch } from '../hooks/useFetch';

const News = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data, error } = useFetch('/api/news');

  useEffect(() => {
    if (data) {
      setNews(data);
    }
  }, [data]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category) => {
    // Faire appel à l'API pour récupérer les news pour la catégorie sélectionnée
  };

  const handleTabChange = (tab) => {
    // Faire appel à l'API pour récupérer les news pour la catégorie sélectionnée
  };

  return (
    <div className="news-page">
      <header className="sticky">
        <SearchBar onSearch={handleSearch} />
      </header>
      <main>
        <Tabs
          categories={categories}
          activeCategory={location.pathname}
          onCategoryChange={handleCategoryChange}
          onTabChange={handleTabChange}
        />
        <div className="news-container">
          {loading ? (
            <div className="skeleton-loader">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="skeleton-card" />
              ))}
            </div>
          ) : (
            news.map((newsItem) => <NewsCard key={newsItem.id} newsItem={newsItem} />)
          )}
        </div>
      </main>
    </div>
  );
};

export default News;