Voici le composant `NewsCard` redessiné avec un header sticky pour les onglets de catégories, une barre d'accent colorée pour la source, et des badges BREAKING/NEW en style neon :

```jsx
import { Clock, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const NewsCard = ({
  title,
  description,
  source,
  url,
  timestamp,
  category = 'General',
  isBreaking = false,
  isNew = false
}) => {
  const [activeTab, setActiveTab] = useState(category);

  const getSourceColor = (sourceName) => {
    const sources = {
      'BBC': 'linear-gradient(90deg, #ff0000, #ff8c00)',
      'CNN': 'linear-gradient(90deg, #0066cc, #00ccff)',
      'Reuters': 'linear-gradient(90deg, #ff6600, #ffcc00)',
      'Bloomberg': 'linear-gradient(90deg, #003366, #0099cc)',
      'TechCrunch': 'linear-gradient(90deg, #ff0000, #ff6600)',
      'The Verge': 'linear-gradient(90deg, #3366cc, #6699cc)',
      'default': 'linear-gradient(90deg, var(--green), #00cc66)'
    };
    return sources[sourceName] || sources.default;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const categories = ['General', 'Business', 'Technology', 'Sports', 'Politics', 'Entertainment'];

  return (
    <article className="news-card w-full max-w-md mx-auto p-0 rounded-xl overflow-hidden shadow-lg bg--bg2 border border--border hover:shadow--green/10 transition-all duration-300">
      {/* Header avec onglets sticky */}
      <div className="news-header sticky top-0 z-10 bg--bg2/80 backdrop-blur-sm">
        <div
          className="source-bar h-1 w-full"
          style={{ background: getSourceColor(source) }}
        ></div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text--t1 font-semibold text-base truncate">{source}</h3>
            <div className="flex items-center gap-2">
              {isBreaking && (
                <span className="px-2 py-1 text-xs font-bold text--bg bg--green rounded-md neon-pulse">
                  BREAKING
                </span>
              )}
              {isNew && (
                <span className="px-2 py-1 text-xs font-bold text--bg bg--green rounded-md neon-pulse">
                  NEW
                </span>
              )}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text--t3 hover:text--green transition-colors"
                aria-label="Lire l'article"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
          <p className="text--t2 text-xs mb-2">{formatTime(timestamp)}</p>

          {/* Onglets catégories */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                  activeTab === cat
                    ? 'bg--green/20 text--green font-medium'
                    : 'text--t3 hover:text--green'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="news-content px-4 pb-4">
        <h2 className="text--t1 font-bold text-lg mb-3 leading-tight">{title}</h2>
        <p className="text--t2 text-base leading-relaxed">{description}</p>
      </div>
    </article>
  );
};

export default NewsCard;
```

Et voici le CSS à ajouter dans votre fichier global (ou dans un module CSS dédié) :

```css
/* NewsCard styles */
.news-card {
  font-family: 'Inter', sans-serif;
}

.neon-pulse {
  animation: neonPulse 1.5s infinite alternate;
}

@keyframes neonPulse {
  from {
    box-shadow: 0 0 5px var(--green);
  }
  to {
    box-shadow: 0 0 15px var(--green), 0 0 25px var(--green);
  }
}

/* Scrollbar pour les onglets */
.news-header::-webkit-scrollbar {
  height: 2px;
}

.news-header::-webkit-scrollbar-track {
  background: transparent;
}

.news-header::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 1px;
}