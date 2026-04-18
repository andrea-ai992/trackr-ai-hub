Je vais commencer par le Dashboard Trackr.

**src/pages/Dashboard/Dashboard.jsx**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'react-jss';
import { Hero } from './hero/PortfolioHero';
import { TopMovers } from './TopMovers';
import { FearGreedGauge } from './FearGreedGauge';
import { NewsFeed } from './NewsFeed';
import { QuickActions } from './QuickActions';

const Dashboard = () => {
  const theme = useTheme();

  return (
    <div className={theme.bg}>
      <Hero />
      <TopMovers />
      <FearGreedGauge />
      <NewsFeed />
      <QuickActions />
    </div>
  );
};

export default Dashboard;
```

**src/pages/Dashboard/hero/PortfolioHero.jsx**
```jsx
import React from 'react';
import { useTheme } from 'react-jss';
import { styled } from 'react-jss';

const HeroContainer = styled.div`
  max-width: 520px;
  margin: 0 auto;
  padding: 20px;
  background-color: ${props => props.theme.bg2};
  border: 1px solid ${props => props.theme.border};
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const HeroTitle = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme.t1};
`;

const HeroValue = styled.p`
  font-size: 18px;
  color: ${props => props.theme.t2};
`;

const PortfolioHero = () => {
  const theme = useTheme();

  return (
    <HeroContainer>
      <HeroTitle>Mon portfolio</HeroTitle>
      <HeroValue>€ 10 000</HeroValue>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 50 0 A 50 50 0 0 0 100 100 L 0 100 A 50 50 0 0 0 50 0 Z"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke="${theme.green}"
        />
      </svg>
    </HeroContainer>
  );
};

export default PortfolioHero;
```

**src/pages/Dashboard/TopMovers/TopMovers.jsx**
```jsx
import React from 'react';
import { useTheme } from 'react-jss';
import { styled } from 'react-jss';

const TopMoversContainer = styled.div`
  max-width: 520px;
  margin: 0 auto;
  padding: 20px;
  background-color: ${props => props.theme.bg2};
  border: 1px solid ${props => props.theme.border};
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const TopMoversList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TopMoversItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const TopMoversLink = styled(Link)`
  text-decoration: none;
  color: ${props => props.theme.t1};
`;

const TopMovers = () => {
  const theme = useTheme();

  return (
    <TopMoversContainer>
      <TopMoversList>
        <TopMoversItem>
          <TopMoversLink to="/movers">Movers 1</TopMoversLink>
        </TopMoversItem>
        <TopMoversItem>
          <TopMoversLink to="/movers">Movers 2</TopMoversLink>
        </TopMoversItem>
        <TopMoversItem>
          <TopMoversLink to="/movers">Movers 3</TopMoversLink>
        </TopMoversItem>
      </TopMoversList>
    </TopMoversContainer>
  );
};

export default TopMovers;
```

**src/pages/Dashboard/FearGreedGauge/FearGreedGauge.jsx**
```jsx
import React from 'react';
import { useTheme } from 'react-jss';
import { styled } from 'react-jss';

const FearGreedGaugeContainer = styled.div`
  max-width: 520px;
  margin: 0 auto;
  padding: 20px;
  background-color: ${props => props.theme.bg2};
  border: 1px solid ${props => props.theme.border};
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const FearGreedGauge = () => {
  const theme = useTheme();

  return (
    <FearGreedGaugeContainer>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 50 0 A 50 50 0 0 0 100 100 L 0 100 A 50 50 0 0 0 50 0 Z"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke="${theme.green}"
        />
      </svg>
    </FearGreedGaugeContainer>
  );
};

export default FearGreedGauge;
```

**src/pages/Dashboard/NewsFeed/NewsFeed.jsx**
```jsx
import React from 'react';
import { useTheme } from 'react-jss';
import { styled } from 'react-jss';

const NewsFeedContainer = styled.div`
  max-width: 520px;
  margin: 0 auto;
  padding: 20px;
  background-color: ${props => props.theme.bg2};
  border: 1px solid ${props => props.theme.border};
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const NewsFeedList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NewsFeedItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const NewsFeedLink = styled(Link)`
  text-decoration: none;
  color: ${props => props.theme.t1};
`;

const NewsFeed = () => {
  const theme = useTheme();

  return (
    <NewsFeedContainer>
      <NewsFeedList>
        <NewsFeedItem>
          <NewsFeedLink to="/news">News 1</NewsFeedLink>
        </NewsFeedItem>
        <NewsFeedItem>
          <NewsFeedLink to="/news">News 2</NewsFeedLink>
        </NewsFeedItem>
        <NewsFeedItem>
          <NewsFeedLink to="/news">News 3</NewsFeedLink>
        </NewsFeedItem>
      </NewsFeedList>
    </NewsFeedContainer>
  );
};

export default NewsFeed;
```

**src/pages/Dashboard/QuickActions/QuickActions.jsx**
```jsx
import React from 'react';
import { useTheme } from 'react-jss';
import { styled } from 'react-jss';

const QuickActionsContainer = styled.div`
  max-width: 520px;
  margin: 0 auto;
  padding: 20px;
  background-color: ${props => props.theme.bg2};
  border: 1px solid ${props => props.theme.border};
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const QuickActionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const QuickActionsItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const QuickActionsLink = styled(Link)`
  text-decoration: none;
  color: ${props => props.theme.t1};
`;

const QuickActions = () => {
  const theme = useTheme();

  return (
    <QuickActionsContainer>
      <QuickActionsList>
        <QuickActionsItem>
          <QuickActionsLink to="/actions">Actions 1</QuickActionsLink>
        </QuickActionsItem>
        <QuickActionsItem>
          <QuickActionsLink to="/actions">Actions 2</QuickActionsLink>
        </QuickActionsItem>
        <QuickActionsItem>
          <QuickActionsLink to="/actions">Actions 3</QuickActionsLink>
        </QuickActionsItem>
      </QuickActionsList>
    </QuickActionsContainer>
  );
};

export default QuickActions;
```

Commit : `[AnDy] Initial commit du Dashboard Trackr`

Je vais maintenant commencer à travailler sur le BottomNav.