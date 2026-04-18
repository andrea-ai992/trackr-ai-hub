Création de src/components/ModuleCard.jsx
```jsx
import React from 'react';
import { styled } from 'styled-components';
import { ChevronRightIcon } from 'lucide-react';

const ModuleCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px dashed var(--border);
  border-radius: 8px;
  background-color: var(--bg2);
  min-height: 130px;
  width: 100%;
  @media (min-width: 768px) {
    width: calc(50% - 16px);
  }
`;

const ModuleCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  @media (min-width: 768px) {
    width: 50%;
  }
`;

const ModuleCardIcon = styled.div`
  font-size: 28px;
  margin-right: 8px;
`;

const ModuleCardBadge = styled.div`
  background-color: var(--green);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
`;

const ModuleCardTitle = styled.h2`
  font-size: 13px;
  font-weight: bold;
  color: var(--t1);
  margin-bottom: 4px;
`;

const ModuleCardDescription = styled.p`
  font-size: 11px;
  color: var(--t3);
  margin-bottom: 8px;
`;

const ModuleCardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  @media (min-width: 768px) {
    width: 50%;
  }
`;

const ModuleCard = ({ title, description, icon, badge, children }) => {
  return (
    <ModuleCardContainer>
      <ModuleCardHeader>
        <ModuleCardIcon>{icon}</ModuleCardIcon>
        <ModuleCardBadge>{badge}</ModuleCardBadge>
      </ModuleCardHeader>
      <ModuleCardTitle>{title}</ModuleCardTitle>
      <ModuleCardDescription>{description}</ModuleCardDescription>
      <ModuleCardFooter>
        <ChevronRightIcon size={16} />
      </ModuleCardFooter>
      {children}
    </ModuleCardContainer>
  );
};

export default ModuleCard;
```

Création de src/pages/More.jsx
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ModuleCard from '../components/ModuleCard';
import { styled } from 'styled-components';
import { ChevronRightIcon } from 'lucide-react';

const MoreContainer = styled.div`
  padding: 16px;
  background-color: var(--bg);
`;

const MoreHeader = styled.h1`
  font-size: 24px;
  color: var(--t1);
  margin-bottom: 16px;
`;

const ModuleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Settings = styled.div`
  padding: 16px;
  background-color: var(--bg2);
  border-radius: 8px;
  margin-top: 16px;
`;

const SettingsToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--t2);
  cursor: not-allowed;
  &:hover {
    color: var(--t2);
  }
`;

const SettingsVersion = styled.p`
  font-size: 12px;
  color: var(--t3);
  margin-bottom: 8px;
`;

const SettingsGitHub = styled.a`
  font-size: 12px;
  color: var(--green);
  text-decoration: none;
  &:hover {
    color: var(--green);
  }
`;

const More = () => {
  return (
    <MoreContainer>
      <MoreHeader>Plus</MoreHeader>
      <ModuleGrid>
        <ModuleCard
          title="FlightTracker"
          description="Suivi des vols en temps réel"
          icon="✈️"
          badge="LIVE"
          children={<Link to="/flighttracker">Voir plus</Link>}
        />
        <ModuleCard
          title="CryptoTrader"
          description="Analyse et trading de cryptomonnaies"
          icon="📈"
          badge="NEW"
          children={<Link to="/cryptotrader">Voir plus</Link>}
        />
        <ModuleCard
          title="Signals IA"
          description="Signaux de trading générés par l'IA"
          icon="⚡"
          badge="NEW"
          children={<Link to="/signals">Voir plus</Link>}
        />
        <ModuleCard
          title="Portfolio"
          description="Gestion de votre portefeuille"
          icon="💼"
          children={<Link to="/portfolio">Voir plus</Link>}
        />
        <ModuleCard
          title="Patterns"
          description="Analyse de tendances et de modèles"
          icon="📊"
          children={<Link to="/patterns">Voir plus</Link>}
        />
        <ModuleCard
          title="Translator"
          description="Traduction instantanée"
          icon="🌐"
          children={<Link to="/translator">Voir plus</Link>}
        />
        <ModuleCard
          title="RealEstate"
          description="Analyse de marché immobilier"
          icon="🏠"
          badge="PRO"
          children={<Link to="/realestate">Voir plus</Link>}
        />
        <ModuleCard
          title="Sneakers"
          description="Analyse de marché des sneakers"
          icon="👟"
          children={<Link to="/sneakers">Voir plus</Link>}
        />
        <ModuleCard
          title="Watches"
          description="Analyse de marché des montres"
          icon="⌚"
          badge="PRO"
          children={<Link to="/watches">Voir plus</Link>}
        />
        <ModuleCard
          title="BusinessPlan"
          description="Création de plans d'affaires"
          icon="📋"
          children={<Link to="/businessplan">Voir plus</Link>}
        />
      </ModuleGrid>
      <Settings>
        <SettingsToggle>
          <span>Mode sombre</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0L16 8L8 16L0 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </SettingsToggle>
        <SettingsVersion>v3.0</SettingsVersion>
        <SettingsGitHub href="https://github.com/andrea-ai992/trackr-ai-hub" target="_blank">GitHub</SettingsGitHub>
      </Settings>
    </MoreContainer>
  );
};

export default More;