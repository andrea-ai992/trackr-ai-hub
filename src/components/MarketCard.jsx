Je vais créer les deux composants avec des animations de stagger fadeUp. Cependant, je dois préciser que Framer Motion n'est pas disponible dans les librairies installées. Je vais donc implémenter les animations avec des transitions CSS natives pour respecter les contraintes.

Voici le code pour les deux composants:

src/components/SportsCard.jsx
```jsx
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const SportsCard = ({ sport, team, logo, score, status, time, link }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <Link
      to={link}
      ref={cardRef}
      className="sports-card"
      style={{
        opacity: 0,
        transform: 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        transitionDelay: '0.1s',
        display: 'block',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div className="sports-card-container">
        <div className="sports-card-header">
          <div className="sports-card-logo">
            <img src={logo} alt={`${team} logo`} width={40} height={40} />
          </div>
          <div className="sports-card-info">
            <h3 className="sports-card-team">{team}</h3>
            <p className="sports-card-sport">{sport}</p>
          </div>
        </div>

        <div className="sports-card-content">
          <div className="sports-card-score">
            <span className="sports-card-score-value">{score}</span>
          </div>
          <div className="sports-card-status">
            <span className="sports-card-status-text">{status}</span>
            {time && <span className="sports-card-time">{time}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SportsCard;
```

src/components/MarketCard.jsx
```jsx
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const MarketCard = ({
  symbol,
  name,
  logo,
  price,
  change,
  changePercent,
  volume,
  marketCap,
  link
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const getChangeColor = () => {
    if (change > 0) return 'var(--green)';
    if (change < 0) return '#ff4444';
    return 'var(--t2)';
  };

  return (
    <Link
      to={link}
      ref={cardRef}
      className="market-card"
      style={{
        opacity: 0,
        transform: 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        transitionDelay: '0.1s',
        display: 'block',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div className="market-card-container">
        <div className="market-card-header">
          <div className="market-card-logo">
            {logo && <img src={logo} alt={`${symbol} logo`} width={32} height={32} />}
            <span className="market-card-symbol">{symbol}</span>
          </div>
          <h3 className="market-card-name">{name}</h3>
        </div>

        <div className="market-card-content">
          <div className="market-card-price">
            <span className="market-card-price-value">${price.toFixed(2)}</span>
          </div>

          <div className="market-card-change" style={{ color: getChangeColor() }}>
            <span className="market-card-change-value">
              {change > 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>

          <div className="market-card-details">
            <div className="market-card-detail">
              <span className="market-card-detail-label">Vol</span>
              <span className="market-card-detail-value">{volume.toLocaleString()}</span>
            </div>
            <div className="market-card-detail">
              <span className="market-card-detail-label">Cap</span>
              <span className="market-card-detail-value">${marketCap.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MarketCard;
```

Pour que les animations fonctionnent correctement, vous devez ajouter les styles CSS suivants dans votre fichier global ou dans un module CSS dédié:

```css
/* Ajoutez ces styles à votre fichier CSS global ou à un module CSS */

.sports-card-container,
.market-card-container {
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--bg2);
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.sports-card-container:hover,
.market-card-container:hover {
  background: var(--bg);
  border-color: var(--border-hi);
  transform: translateY(-2px);
}

.sports-card-header,
.market-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.sports-card-logo img,
.market-card-logo img {
  border-radius: 50%;
}

.market-card-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sports-card-team,
.market-card-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--t1);
}

.sports-card-sport,
.market-card-sport {
  font-size: 0.8rem;
  color: var(--t2);
}

.sports-card-content,
.market-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sports-card-score,
.market-card-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--t1);
}

.sports-card-status,
.market-card-change {
  font-size: 0.9rem;
}

.sports-card-time {
  margin-left: auto;
  color: var(--t3);
}

.market-card-details {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.market-card-detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.market-card-detail-label {
  font-size: 0.7rem;
  color: var(--t3);
}

.market-card-detail-value {
  font-size: 0.8rem;
  color: var(--t1);
  font-weight: 600;
}
```

Ces composants implémentent des animations de fadeUp avec un léger délai pour créer un effet de stagger. Les cartes apparaissent progressivement avec une transition fluide depuis le bas. L'animation est déclenchée lorsque les cartes entrent dans le viewport grâce à l'Intersection Observer.