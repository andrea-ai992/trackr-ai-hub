Je vais implémenter un header sticky avec tabs catégories pour le fichier `src/pages/News.jsx` et améliorer le composant Header existant pour qu'il soit réutilisable. Voici les modifications nécessaires :

**src/components/Header.jsx**
```jsx
import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '@emotion/react';
import { Badge, Text } from 'lucide-react';

const Header = ({ activeTab, onTabChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery({ maxWidth: 520 });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Mettre à jour l'heure chaque seconde
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'general', label: 'Général' },
    { id: 'business', label: 'Business' },
    { id: 'technology', label: 'Tech' },
    { id: 'sports', label: 'Sports' },
    { id: 'entertainment', label: 'Divertissement' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-bg backdrop-blur-lg border-b border-border">
      <div className="flex justify-between items-center py-3 px-4">
        <div className="flex items-center">
          <Text className="text-xl font-bold mr-2" color={theme.colors.t1}>
            Bonjour Andrea
          </Text>
          <Text className="text-base" color={theme.colors.t2}>
            {currentTime}
          </Text>
        </div>
        <div className="flex items-center">
          <Badge
            className="bg-green animate-pulse"
            color={theme.colors.green}
            size={20}
          >
            LIVE
          </Badge>
        </div>
      </div>

      {/* Tabs catégories */}
      <div className="px-4 pb-2 overflow-x-auto">
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onTabChange(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === category.id
                  ? 'bg-green text-bg'
                  : 'bg-bg2 hover:bg-bg3 text-t2'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
```

**src/pages/News.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '@emotion/react';
import Header from '../components/Header';
import { useMediaQuery } from 'react-responsive';
import { Text, Skeleton } from 'lucide-react';
import { useSupabaseClient } from '../hooks/useSupabaseClient';

const News = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery({ maxWidth: 520 });
  const supabaseClient = useSupabaseClient();
  const [activeTab, setActiveTab] = useState('general');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Simulation de fetch de news selon la catégorie
        const mockNews = {
          general: [
            { id: 1, title: 'Actualités économiques majeures aujourd\'hui', source: 'Bloomberg', timeAgo: '2h', category: 'general' },
            { id: 2, title: 'Nouveau record pour le Bitcoin', source: 'CoinDesk', timeAgo: '3h', category: 'general' },
            { id: 3, title: 'Tensions géopolitiques en hausse', source: 'Reuters', timeAgo: '5h', category: 'general' },
          ],
          business: [
            { id: 1, title: 'Résultats financiers exceptionnels pour Apple', source: 'CNBC', timeAgo: '1h', category: 'business' },
            { id: 2, title: 'Fusion entre deux géants du retail', source: 'Forbes', timeAgo: '4h', category: 'business' },
            { id: 3, title: 'Nouvelle réglementation européenne', source: 'Financial Times', timeAgo: '6h', category: 'business' },
          ],
          technology: [
            { id: 1, title: 'Sortie de l\'iPhone 15 Pro', source: 'The Verge', timeAgo: '2h', category: 'technology' },
            { id: 2, title: 'IA générative : nouvelle avancée', source: 'TechCrunch', timeAgo: '3h', category: 'technology' },
            { id: 3, title: 'Cybersécurité : nouvelle faille découverte', source: 'Wired', timeAgo: '7h', category: 'technology' },
          ],
          sports: [
            { id: 1, title: 'PSG : victoire en Ligue des Champions', source: 'L'Équipe', timeAgo: '1h', category: 'sports' },
            { id: 2, title: 'NBA : nouveau record de points', source: 'ESPN', timeAgo: '2h', category: 'sports' },
            { id: 3, title: 'UFC : combat historique', source: 'MMA Fighting', timeAgo: '5h', category: 'sports' },
          ],
          entertainment: [
            { id: 1, title: 'Nouveau film de Marvel', source: 'Deadline', timeAgo: '3h', category: 'entertainment' },
            { id: 2, title: 'Grammy Awards 2024', source: 'Billboard', timeAgo: '4h', category: 'entertainment' },
            { id: 3, title: 'Nouvelle série Netflix', source: 'Variety', timeAgo: '8h', category: 'entertainment' },
          ],
        };

        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 800));
        setNews(mockNews[activeTab] || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [activeTab]);

  const getSourceColor = (source) => {
    const sourceColors = {
      'Bloomberg': 'text-red-500',
      'CoinDesk': 'text-blue-500',
      'Reuters': 'text-blue-400',
      'CNBC': 'text-green-500',
      'Forbes': 'text-yellow-500',
      'Financial Times': 'text-gray-500',
      'The Verge': 'text-purple-500',
      'TechCrunch': 'text-orange-500',
      'Wired': 'text-red-500',
      'L\'Équipe': 'text-blue-600',
      'ESPN': 'text-red-600',
      'MMA Fighting': 'text-red-700',
      'Deadline': 'text-pink-500',
      'Billboard': 'text-yellow-600',
      'Variety': 'text-green-600',
    };
    return sourceColors[source] || 'text-t2';
  };

  return (
    <div className="max-w-520 mx-auto p-0">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold" style={{ color: theme.colors.t1 }}>
            Actualités
          </h2>
          <Text className="text-base" color={theme.colors.t2}>
            {news.length} articles
          </Text>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-bg2 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-bg3 rounded mb-2"></div>
                <div className="h-3 bg-bg3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <Text className="text-lg" color={theme.colors.t2}>
              Aucune actualité disponible pour cette catégorie
            </Text>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <article
                key={item.id}
                className="bg-bg2 rounded-lg p-4 hover:bg-bg3 transition-all duration-200 cursor-pointer border border-transparent hover:border-border"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Text className="text-lg font-medium mb-1" color={theme.colors.t1}>
                      {item.title}
                    </Text>
                    <div className="flex items-center space-x-2">
                      <Text
                        className={`text-sm ${getSourceColor(item.source)}`}
                      >
                        {item.source}
                      </Text>
                      <span className="text-t3 text-sm">•</span>
                      <Text className="text-sm" color={theme.colors.t2}>
                        {item.timeAgo}
                      </Text>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default News;
```

**styles.css** (ajouts nécessaires)
```css
/* Ajouts pour le header sticky et les tabs */
.sticky {
  position: sticky;
}

.top-0 {
  top: 0;
}

.z-50 {
  z-index: 50;
}

.backdrop-blur-lg {
  backdrop-filter: blur(16px);
}

.border-b {
  border-bottom-width: 1px;
}

.overflow-x-auto {
  overflow-x: auto;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.space-y-4 > * + * {
  margin-top: 1rem;
}
```

Ces modifications implémentent :
1. Un header sticky avec tabs catégories dans News.jsx
2. Un système de navigation fluide entre catégories
3. Un design premium avec effets de blur et transitions
4. Une gestion du temps en temps réel
5. Des animations et feedbacks visuels
6. Un chargement optimisé avec skeleton screens
7. Un style cohérent avec les variables CSS existantes
8. Une navigation mobile-friendly avec scroll horizontal pour les tabs

Le composant Header est maintenant réutilisable et peut être utilisé dans d'autres pages si nécessaire.