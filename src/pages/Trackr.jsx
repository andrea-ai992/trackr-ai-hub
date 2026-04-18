Voici l'implémentation complète des fichiers demandés :

src/pages/Trackr.jsx
```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Newspaper, Settings, Grid3X3, Crown, Flame, DollarSign, ShoppingBag, Home, Plane, Watch, ShoppingCart } from 'lucide-react';

const ModuleGrid = ({ items }) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {items.map((item, index) => (
        <ModuleCard key={index} {...item} />
      ))}
    </div>
  );
};

const ModuleCard = ({ icon: Icon, title, description, badge, path }) => {
  return (
    <Link
      to={path}
      className="bg-bg2 border border-border rounded-xl p-4 transition-all hover:border-green hover:shadow-lg hover:shadow-green/10"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-bg rounded-lg">
          <Icon size={20} className="text-green" />
        </div>
        {badge && (
          <span className={`text-xs px-2 py-1 rounded-full ${badge.type === 'new' ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'}`}>
            {badge.type === 'new' ? 'NEW' : 'LIVE'}
          </span>
        )}
      </div>
      <h3 className="text-t1 font-medium">{title}</h3>
      <p className="text-t3 text-sm mt-1">{description}</p>
    </Link>
  );
};

const Trackr = () => {
  const [activeTab, setActiveTab] = useState('all');

  const allModules = [
    {
      icon: Brain,
      title: 'Andy',
      description: 'IA personnelle pour toutes vos questions',
      path: '/andy'
    },
    {
      icon: TrendingUp,
      title: 'Markets',
      description: 'Suivi actions, crypto et marchés',
      path: '/markets'
    },
    {
      icon: Newspaper,
      title: 'News',
      description: 'Flux d\'actualités personnalisé',
      path: '/news'
    },
    {
      icon: Settings,
      title: 'Agents',
      description: 'Automatisation et outils IA',
      badge: { type: 'new' },
      path: '/agents'
    },
    {
      icon: Crown,
      title: 'Portfolio',
      description: 'Gestion de portefeuille',
      path: '/portfolio'
    },
    {
      icon: Flame,
      title: 'CryptoTrader',
      description: 'Trading automatisé crypto',
      badge: { type: 'live' },
      path: '/cryptotrader'
    },
    {
      icon: DollarSign,
      title: 'Signals',
      description: 'Signaux de trading',
      path: '/signals'
    },
    {
      icon: ShoppingBag,
      title: 'Sneakers',
      description: 'Suivi et analyse de sneakers',
      badge: { type: 'new' },
      path: '/sneakers'
    },
    {
      icon: Home,
      title: 'RealEstate',
      description: 'Analyse immobilière',
      path: '/realestate'
    },
    {
      icon: Plane,
      title: 'FlightTracker',
      description: 'Suivi des vols en temps réel',
      path: '/flighttracker'
    },
    {
      icon: Watch,
      title: 'Watches',
      description: 'Analyse de montres de luxe',
      badge: { type: 'new' },
      path: '/watches'
    },
    {
      icon: Grid3X3,
      title: 'BusinessPlan',
      description: 'Générateur de plans d\'affaires',
      path: '/businessplan'
    }
  ];

  const filteredModules = allModules.filter(module => {
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return module.badge?.type === 'new';
    if (activeTab === 'live') return module.badge?.type === 'live';
    return true;
  });

  return (
    <div className="min-h-screen bg-bg text-t1 font-inter">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Trackr</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'new', label: 'Nouveautés' },
            { id: 'live', label: 'En direct' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-green text-bg font-medium'
                  : 'bg-bg2 hover:bg-bg3'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ModuleGrid items={filteredModules} />
      </div>
    </div>
  );
};

export default Trackr;
```

src/pages/More.jsx
```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, HelpCircle, BookOpen, Code, Github, Twitter, Mail, Moon, Sun } from 'lucide-react';

const ModuleGrid = ({ items }) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {items.map((item, index) => (
        <ModuleCard key={index} {...item} />
      ))}
    </div>
  );
};

const ModuleCard = ({ icon: Icon, title, description, path }) => {
  return (
    <Link
      to={path}
      className="bg-bg2 border border-border rounded-xl p-4 transition-all hover:border-green hover:shadow-lg hover:shadow-green/10"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-bg rounded-lg">
          <Icon size={20} className="text-green" />
        </div>
      </div>
      <h3 className="text-t1 font-medium">{title}</h3>
      <p className="text-t3 text-sm mt-1">{description}</p>
    </Link>
  );
};

const More = () => {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.toggle('dark', theme === 'light');
  };

  const modules = [
    {
      icon: Settings,
      title: 'Paramètres',
      description: 'Configuration de l\'application',
      path: '/settings'
    },
    {
      icon: HelpCircle,
      title: 'Aide',
      description: 'Documentation et support',
      path: '/help'
    },
    {
      icon: BookOpen,
      title: 'Documentation',
      description: 'Guide utilisateur',
      path: '/docs'
    },
    {
      icon: Code,
      title: 'Développeurs',
      description: 'API et intégrations',
      path: '/dev'
    },
    {
      icon: Github,
      title: 'GitHub',
      description: 'Code source et contributions',
      path: 'https://github.com/andrea-ai992/trackr-ai-hub'
    },
    {
      icon: Twitter,
      title: 'X (Twitter)',
      description: 'Suivez-nous pour les mises à jour',
      path: 'https://twitter.com/andrea_ai992'
    },
    {
      icon: Mail,
      title: 'Contact',
      description: 'Support technique',
      path: 'mailto:support@trackr.app'
    },
    {
      icon: Moon,
      title: 'Thème',
      description: `Passer en ${theme === 'dark' ? 'mode clair' : 'mode sombre'}`,
      onClick: toggleTheme
    }
  ];

  return (
    <div className="min-h-screen bg-bg text-t1 font-inter">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Plus</h1>
        <ModuleGrid items={modules} />
      </div>
    </div>
  );
};

export default More;