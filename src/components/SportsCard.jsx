Je vais créer les fichiers SportsCard.jsx et MarketCard.jsx avec des animations de stagger fadeUp. Cependant, je dois d'abord vérifier si Framer Motion est disponible dans les dépendances. Comme ce n'est pas le cas selon les règles, je vais implémenter les animations avec des transitions CSS natives pour un effet similaire.

Voici le code pour SportsCard.jsx:

```jsx
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, Target, TrendingUp, TrendingDown } from 'lucide-react';

const SportsCard = ({ match, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'var(--green)';
      case 'upcoming':
        return 'var(--t3)';
      case 'finished':
        return 'var(--t2)';
      default:
        return 'var(--t3)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'live':
        return <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>;
      case 'upcoming':
        return <Clock size={16} className="text-gray-400" />;
      case 'finished':
        return <Target size={16} className="text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`sports-card w-full p-4 mb-4 rounded-lg border border-var(--border) bg-var(--bg2) transition-all duration-300 hover:border-var(--border-hi) ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionDelay: `${index * 50}ms`,
        animation: isVisible ? 'fadeUp 0.5s ease-out forwards' : 'none'
      }}
    >
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-var(--bg) flex items-center justify-center border border-var(--border)">
            <span className="text-sm font-bold text-var(--t1)">{match.teams[0].short}</span>
          </div>
          <span className="text-var(--t1) font-medium">{match.teams[0].name}</span>
          <span className="text-var(--t2)">vs</span>
          <span className="text-var(--t1) font-medium">{match.teams[1].name}</span>
          <div className="w-10 h-10 rounded-full bg-var(--bg) flex items-center justify-center border border-var(--border)">
            <span className="text-sm font-bold text-var(--t1)">{match.teams[1].short}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-var(--t1)">{match.score[0]}</span>
            <span className="text-xs text-var(--t3)">{match.score[1]}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-var(--t1)">{match.odds[0]}</span>
            <span className="text-xs text-var(--t3)">{match.odds[1]}</span>
          </div>

          <div
            className="flex items-center space-x-1 px-2 py-1 rounded bg-var(--bg) border border-var(--border)"
            style={{ color: getStatusColor(match.status) }}
          >
            {getStatusIcon(match.status)}
            <span className="text-xs font-medium capitalize">{match.status}</span>
          </div>

          <button
            className="p-1 rounded-full hover:bg-var(--bg) transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp size={20} className="text-var(--t1)" />
            ) : (
              <ChevronDown size={20} className="text-var(--t1)" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-var(--border) animate-[slideDown_0.3s_ease-out]">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} className="text-green-500" />
                <span className="text-sm text-var(--t1)">Forme récente</span>
              </div>
              <div className="flex space-x-1">
                {match.recentForm[0].map((result, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      result === 'W'
                        ? 'bg-green-500/20 text-green-400'
                        : result === 'L'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingDown size={16} className="text-red-500" />
                <span className="text-sm text-var(--t1)">H2H</span>
              </div>
              <div className="flex space-x-1">
                {match.h2h.map((result, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      result === 'W'
                        ? 'bg-green-500/20 text-green-400'
                        : result === 'L'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-var(--t1)">Dernières infos</span>
            </div>
            <p className="text-xs text-var(--t2) leading-relaxed">{match.info}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsCard;
```

Et voici le code pour MarketCard.jsx:

```jsx
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const MarketCard = ({ market, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  const getChangeColor = (change) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? (
      <TrendingUp size={16} className="text-green-400" />
    ) : (
      <TrendingDown size={16} className="text-red-400" />
    );
  };

  return (
    <div
      className={`market-card w-full p-4 mb-4 rounded-lg border border-var(--border) bg-var(--bg2) transition-all duration-300 hover:border-var(--border-hi) ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionDelay: `${index * 50}ms`,
        animation: isVisible ? 'fadeUp 0.5s ease-out forwards' : 'none'
      }}
    >
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-var(--bg) flex items-center justify-center border border-var(--border)">
            <span className="text-sm font-bold text-var(--t1)">{market.symbol.slice(0, 3)}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-var(--t1)}">{market.name}</span>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-var(--t3)}">{market.symbol}</span>
              {market.alert && (
                <AlertTriangle size={12} className="text-yellow-500" />
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end space-x-1">
            <span className="text-lg font-bold text-var(--t1)}">{market.price}</span>
            <span className={`text-sm font-medium ${getChangeColor(market.change)}`}>
              {market.change}%
            </span>
            {getChangeIcon(market.change)}
          </div>
          <div className="text-xs text-var(--t3)}">
            {market.price > 100 ? '$' : ''}
            {market.change > 0 ? '+' : ''}
            {market.volume.toLocaleString()}
          </div>
        </div>

        <button
          className="p-1 rounded-full hover:bg-var(--bg) transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? (
            <ChevronUp size={20} className="text-var(--t1)" />
          ) : (
            <ChevronDown size={20} className="text-var(--t1)" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-var(--border) animate-[slideDown_0.3s_ease-out]">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} className="text-green-400" />
                <span className="text-sm text-var(--t1)">1H Change</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-bold ${getChangeColor(market.change1h)}`}>
                  {market.change1h >= 0 ? '+' : ''}
                  {market.change1h}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingDown size={16} className="text-red-400" />
                <span className="text-sm text-var(--t1)">24H Change</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-bold ${getChangeColor(market.change24h)}`}>
                  {market.change24h >= 0 ? '+' : ''}
                  {market.change24h}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-var(--t1)">Détails</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-var(--t3)}">Open</span>
                <span className="text-var(--t1)}">{market.open}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-var(--t3)}">High</span>
                <span className="text-var(--t1)}">{market.high}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-var(--t3)}">Low</span>
                <span className="text-var(--t1)}">{market.low}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-var(--t3)}">52W High</span>
                <span className="text-var(--t1)}">{market.high52w}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-var(--t3)}">52W Low</span>
                <span className="text-var(--t1)}">{market.low52w}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketCard;
```

Ces composants implémentent des animations de stagger fadeUp avec des transitions CSS natives, des effets de glissement pour l'expansion, et respectent tous les critères de design et de fonctionnalité demandés. Les cartes s'animent avec un délai progressif basé sur l'index, et les sections expandables s'ouvrent avec une animation fluide.