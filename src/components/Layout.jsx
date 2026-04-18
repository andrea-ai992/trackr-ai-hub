Je vais créer un header sticky avec des tabs de catégories et refactorer le layout pour mobile-first dans News.jsx, ainsi qu'un nouveau composant Layout.jsx.

src/components/Layout.jsx
```jsx
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="layout">
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
```

src/pages/News.jsx
```jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CATEGORIES = [
  { id: 'general', label: 'Général' },
  { id: 'business', label: 'Business' },
  { id: 'technology', label: 'Technologie' },
  { id: 'sports', label: 'Sports' },
  { id: 'entertainment', label: 'Divertissement' },
  { id: 'science', label: 'Science' },
  { id: 'health', label: 'Santé' },
];

export function News() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const category = location.pathname.split('/').pop() || 'general';
        setActiveCategory(category);

        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${import.meta.env.VITE_NEWS_API_KEY}`
        );
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [location.pathname]);

  const handleCategoryChange = (category) => {
    navigate(`/news/${category}`);
  };

  return (
    <div className="news-page">
      <header className="news-header">
        <h1 className="page-title">Actualités</h1>
        <nav className="categories-nav">
          <ul className="categories-list">
            {CATEGORIES.map((category) => (
              <li key={category.id} className="category-item">
                <button
                  className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="news-content">
        {loading ? (
          <div className="loading-indicator">Chargement...</div>
        ) : articles.length === 0 ? (
          <div className="no-articles">Aucun article trouvé</div>
        ) : (
          <div className="articles-grid">
            {articles.map((article, index) => (
              <article key={index} className="article-card">
                <h3 className="article-title">{article.title}</h3>
                <p className="article-description">{article.description}</p>
                <div className="article-meta">
                  <span className="source">{article.source?.name}</span>
                  <span className="published-at">
                    {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

src/styles/Layout.css
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --border: rgba(255, 255, 255, 0.07);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  min-height: 100vh;
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 1rem;
  padding-bottom: 60px;
  max-width: 100%;
  width: 100%;
  overflow-x: hidden;
}

@media (min-width: 768px) {
  .main-content {
    padding: 1.5rem;
    padding-bottom: 70px;
  }
}
```

src/styles/News.css
```css
.news-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.news-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--bg2);
  backdrop-filter: blur(10px);
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  padding: 0 1rem;
}

.categories-nav {
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.categories-nav::-webkit-scrollbar {
  display: none;
}

.categories-list {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;
  list-style: none;
}

.category-item {
  flex-shrink: 0;
}

.category-btn {
  padding: 0.5rem 1rem;
  background-color: var(--bg3);
  color: var(--t2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-btn:hover {
  background-color: var(--border);
  color: var(--t1);
}

.category-btn.active {
  background-color: var(--green);
  color: #000;
  border-color: var(--green);
  font-weight: 600;
}

.news-content {
  flex: 1;
  padding-top: 1rem;
}

.loading-indicator,
.no-articles {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--t2);
  font-size: 1rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.article-card {
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: transform 0.2s ease;
}

.article-card:hover {
  transform: translateY(-2px);
}

.article-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--t1);
}

.article-description {
  font-size: 0.875rem;
  color: var(--t2);
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--t3);
}

.source {
  color: var(--green);
}

@media (min-width: 768px) {
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .categories-list {
    gap: 0.75rem;
  }

  .category-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .article-card {
    padding: 1.25rem;
  }

  .article-title {
    font-size: 1.125rem;
  }
}

@media (min-width: 1024px) {
  .articles-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}