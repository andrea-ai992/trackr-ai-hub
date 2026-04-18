**src/pages/More.jsx**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IoIosSettings } from 'lucide-react';
import MoreGrid from './MoreGrid';

const modules = [
  {
    id: 1,
    title: 'FlightTracker',
    subtitle: 'Suivi des vols',
    icon: '✈️',
    badge: 'LIVE',
    link: '/flighttracker',
  },
  {
    id: 2,
    title: 'CryptoTrader',
    subtitle: 'Trading de cryptomonnaies',
    icon: '📈',
    badge: 'NEW',
    link: '/cryptotrader',
  },
  {
    id: 3,
    title: 'Signals',
    subtitle: 'Signaux de trading',
    icon: '⚡',
    badge: 'PRO',
    link: '/signals',
  },
  {
    id: 4,
    title: 'Portfolio',
    subtitle: 'Gestion de portefeuille',
    icon: '💼',
    badge: 'LIVE',
    link: '/portfolio',
  },
  {
    id: 5,
    title: 'Patterns',
    subtitle: 'Analyse de données',
    icon: '📊',
    badge: 'NEW',
    link: '/patterns',
  },
  {
    id: 6,
    title: 'Sports',
    subtitle: 'Suivi des sports',
    icon: '🏆',
    badge: 'PRO',
    link: '/sports',
  },
  {
    id: 7,
    title: 'Translator',
    subtitle: 'Traducteur',
    icon: '🌐',
    badge: 'LIVE',
    link: '/translator',
  },
  {
    id: 8,
    title: 'RealEstate',
    subtitle: 'Immobilier',
    icon: '🏠',
    badge: 'NEW',
    link: '/realestate',
  },
  {
    id: 9,
    title: 'Sneakers',
    subtitle: 'Collecte de chaussures',
    icon: '👟',
    badge: 'PRO',
    link: '/sneakers',
  },
  {
    id: 10,
    title: 'Watches',
    subtitle: 'Montres',
    icon: '⌚',
    badge: 'LIVE',
    link: '/watches',
  },
];

const More = () => {
  return (
    <div className="container">
      <h1 className="t1">Plus</h1>
      <p className="t3">Découvrez nos modules supplémentaires</p>
      <MoreGrid modules={modules} />
      <div className="settings">
        <IoIosSettings className="icon" />
        <span className="t2">Mode sombre</span>
        <input type="checkbox" id="dark-mode" />
        <label htmlFor="dark-mode">Activer</label>
        <span className="t2">Version app</span>
        <span className="t2">{process.env.VERSION}</span>
      </div>
    </div>
  );
};

export default More;
```

**src/pages/More/MoreGrid.js**
```jsx
import React from 'react';
import { styled } from 'react-css-styled-components';

const MoreGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
  background-color: ${props => props.theme.colors.bg2};
  min-height: 140px;
`;

const Module = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  background-color: ${props => props.theme.colors.bg};
  color: ${props => props.theme.colors.t1};

  &.live {
    background-color: ${props => props.theme.colors.green};
  }

  &.new {
    background-color: ${props => props.theme.colors.bg3};
  }

  &.pro {
    background-color: ${props => props.theme.colors.bg};
  }
`;

const Icon = styled.span`
  font-size: 24px;
  margin-bottom: 10px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Badge = styled.span`
  font-size: 14px;
  background-color: ${props => props.theme.colors.green};
  color: ${props => props.theme.colors.t1};
  padding: 2px 10px;
  border-radius: 10px;
`;

const Description = styled.p`
  font-size: 14px;
  margin-bottom: 20px;
`;

const MoreGrid = ({ modules }) => {
  return (
    <MoreGridContainer>
      {modules.map(module => (
        <Module key={module.id} className={`${module.badge.toLowerCase()}`}>
          <Icon>{module.icon}</Icon>
          <Title>{module.title}</Title>
          <Description>{module.subtitle}</Description>
          <Badge>{module.badge}</Badge>
          <Link to={module.link}>Découvrir</Link>
        </Module>
      ))}
    </MoreGridContainer>
  );
};

export default MoreGrid;
```

**src/pages/More/index.css**
```css
.container {
  padding: 20px;
  background-color: ${props => props.theme.colors.bg};
}

.t1 {
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme.colors.t1};
}

.t3 {
  font-size: 14px;
  color: ${props => props.theme.colors.t3};
}

.settings {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: ${props => props.theme.colors.bg2};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
}

.icon {
  font-size: 24px;
  margin-right: 10px;
}

.t2 {
  font-size: 14px;
  color: ${props => props.theme.colors.t2};
}

#dark-mode {
  margin-right: 10px;
}