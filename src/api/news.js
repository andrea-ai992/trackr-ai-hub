src/api/news.js
```javascript
// src/api/news.js
// Gestion des appels API pour les flux d'actualités avec timeouts et gestion d'erreur robuste

const API_TIMEOUT_MS = 8000; // Timeout global pour les requêtes

// Configuration des flux RSS par catégorie
const RSS_FEEDS = {
  general: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'https://www.theguardian.com/world/rss'
  ],
  technology: [
    'https://feeds.bbci.co.uk/news/technology/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
    'https://www.theverge.com/rss/index.xml'
  ],
  business: [
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    'https://www.bloomberg.com/feeds/podcasts/etf_report.xml'
  ],
  sports: [
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
    'https://www.espn.com/espn/rss/news'
  ],
  entertainment: [
    'https://feeds.bbci.co.uk/entertainment_and_arts/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
    'https://www.hollywoodreporter.com/feed/'
  ]
};

// Fonction utilitaire pour parser les flux RSS
const parseRSS = (text) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  const items = xmlDoc.querySelectorAll('item');

  return Array.from(items).map(item => {
    const title = item.querySelector('title')?.textContent || 'No title';
    const link = item.querySelector('link')?.textContent || '#';
    const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
    const description = item.querySelector('description')?.textContent || '';
    const source = link.includes('bbci') ? 'BBC' :
                  link.includes('nytimes') ? 'NYT' :
                  link.includes('theguardian') ? 'The Guardian' :
                  link.includes('theverge') ? 'The Verge' :
                  link.includes('bloomberg') ? 'Bloomberg' :
                  link.includes('espn') ? 'ESPN' :
                  link.includes('hollywoodreporter') ? 'THR' : 'Unknown';

    return {
      id: `${title}-${Date.now()}`,
      title,
      link,
      date: new Date(pubDate).toISOString(),
      description,
      source,
      category: getCategoryFromSource(source)
    };
  });
};

// Déterminer la catégorie à partir de la source
const getCategoryFromSource = (source) => {
  if (['BBC', 'NYT', 'The Guardian'].includes(source)) return 'general';
  if (['The Verge', 'Bloomberg'].includes(source)) return 'technology';
  if (['Bloomberg'].includes(source)) return 'business';
  if (['ESPN'].includes(source)) return 'sports';
  if (['THR'].includes(source)) return 'entertainment';
  return 'general';
};

// Fonction principale pour récupérer les actualités avec timeout
const fetchWithTimeout = async (url, options = {}) => {
  const { timeout = API_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
};

// Récupérer les actualités par catégorie
export const fetchNewsByCategory = async (category = 'general') => {
  const feeds = RSS_FEEDS[category] || RSS_FEEDS.general;

  try {
    const results = await Promise.allSettled(
      feeds.map(url => fetchWithTimeout(url).catch(e => {
        console.error(`Failed to fetch ${url}:`, e.message);
        return null;
      }))
    );

    const validResults = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => parseRSS(result.value))
      .flat();

    // Déduplication par titre et lien
    const uniqueNews = Array.from(new Map(
      validResults.map(item => [item.title + item.link, item])
    ).values());

    // Tri par date décroissante
    return uniqueNews.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error fetching news:', error.message);
    return [];
  }
};

// Récupérer toutes les actualités (toutes catégories)
export const fetchAllNews = async () => {
  try {
    const allCategories = Object.keys(RSS_FEEDS);
    const allNews = await Promise.all(
      allCategories.map(category => fetchNewsByCategory(category))
    );

    return allNews.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error fetching all news:', error.message);
    return [];
  }
};

// Récupérer les actualités par source spécifique
export const fetchNewsBySource = async (source) => {
  const sourceMap = {
    'BBC': RSS_FEEDS.general[0],
    'NYT': RSS_FEEDS.general[1],
    'The Guardian': RSS_FEEDS.general[2],
    'The Verge': RSS_FEEDS.technology[1],
    'Bloomberg': RSS_FEEDS.business[1],
    'ESPN': RSS_FEEDS.sports[1],
    'THR': RSS_FEEDS.entertainment[2]
  };

  const url = sourceMap[source];
  if (!url) return [];

  try {
    const rssText = await fetchWithTimeout(url);
    return parseRSS(rssText);
  } catch (error) {
    console.error(`Error fetching news from ${source}:`, error.message);
    return [];
  }
};

// Fonction pour rafraîchir les actualités avec gestion de cache
export const refreshNews = async (category = 'general', cacheDuration = 300000) => {
  const cacheKey = `news-cache-${category}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    if (Date.now() - timestamp < cacheDuration) {
      return data;
    }
  }

  const freshData = await fetchNewsByCategory(category);

  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: freshData,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Cache disabled or full:', e.message);
  }

  return freshData;
};

// Export des catégories disponibles
export const getNewsCategories = () => Object.keys(RSS_FEEDS);

// Export du timeout par défaut
export const NEWS_TIMEOUT_MS = API_TIMEOUT_MS;