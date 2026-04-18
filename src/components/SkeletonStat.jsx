**src/components/PremiumSkeletonLoader.jsx**
```jsx
import React from 'react';
import { Skeleton, Box } from '@supabase/ui';
import { styled } from 'styled-components';

const SkeletonCard = styled(Skeleton)`
  height: 80px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const SkeletonStat = styled(Skeleton)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const SkeletonList = styled(Skeleton)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const SkeletonChart = styled(Skeleton)`
  width: 100%;
  height: 200px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const SkeletonNewsList = styled(Skeleton)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const SkeletonPortfolio = styled(Skeleton)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

export { SkeletonCard, SkeletonStat, SkeletonList, SkeletonChart, SkeletonNewsList, SkeletonPortfolio };

export default SkeletonCard;
```

**src/components/SkeletonStat.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const StatContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Stat = styled.div`
  width: 25%;
  height: 100%;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const StatLabel = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: var(--t1);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: var(--t2);
`;

const SkeletonStat = () => {
  return (
    <StatContainer>
      <Stat>
        <StatLabel>Stat 1</StatLabel>
        <StatValue>0</StatValue>
      </Stat>
      <Stat>
        <StatLabel>Stat 2</StatLabel>
        <StatValue>0</StatValue>
      </Stat>
      <Stat>
        <StatLabel>Stat 3</StatLabel>
        <StatValue>0</StatValue>
      </Stat>
      <Stat>
        <StatLabel>Stat 4</StatLabel>
        <StatValue>0</StatValue>
      </Stat>
    </StatContainer>
  );
};

export default SkeletonStat;
```

**src/components/SkeletonList.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Text = styled.div`
  font-size: 16px;
  color: var(--t1);
`;

const SkeletonList = () => {
  return (
    <ListContainer>
      <ListItem>
        <Avatar />
        <Text>Text 1</Text>
      </ListItem>
      <ListItem>
        <Avatar />
        <Text>Text 2</Text>
      </ListItem>
      <ListItem>
        <Avatar />
        <Text>Text 3</Text>
      </ListItem>
      <ListItem>
        <Avatar />
        <Text>Text 4</Text>
      </ListItem>
      <ListItem>
        <Avatar />
        <Text>Text 5</Text>
      </ListItem>
    </ListContainer>
  );
};

export default SkeletonList;
```

**src/components/SkeletonChart.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const ChartContainer = styled.div`
  width: 100%;
  height: 200px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const SkeletonChart = () => {
  return <ChartContainer />;
};

export default SkeletonChart;
```

**src/components/SkeletonNewsList.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const NewsListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const NewsItem = styled.div`
  width: 100%;
  padding: 20px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Thumbnail = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 10px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Text = styled.div`
  font-size: 16px;
  color: var(--t1);
`;

const SkeletonNewsList = () => {
  return (
    <NewsListContainer>
      <NewsItem>
        <Thumbnail />
        <Text>News 1</Text>
      </NewsItem>
      <NewsItem>
        <Thumbnail />
        <Text>News 2</Text>
      </NewsItem>
      <NewsItem>
        <Thumbnail />
        <Text>News 3</Text>
      </NewsItem>
      <NewsItem>
        <Thumbnail />
        <Text>News 4</Text>
      </NewsItem>
      <NewsItem>
        <Thumbnail />
        <Text>News 5</Text>
      </NewsItem>
    </NewsListContainer>
  );
};

export default SkeletonNewsList;
```

**src/components/SkeletonPortfolio.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const PortfolioContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const PortfolioItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Text = styled.div`
  font-size: 16px;
  color: var(--t1);
`;

const SkeletonPortfolio = () => {
  return (
    <PortfolioContainer>
      <PortfolioItem>
        <Logo />
        <Text>Text 1</Text>
      </PortfolioItem>
      <PortfolioItem>
        <Logo />
        <Text>Text 2</Text>
      </PortfolioItem>
      <PortfolioItem>
        <Logo />
        <Text>Text 3</Text>
      </PortfolioItem>
      <PortfolioItem>
        <Logo />
        <Text>Text 4</Text>
      </PortfolioItem>
    </PortfolioContainer>
  );
};

export default SkeletonPortfolio;
```

**src/components/Dashboard.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';
import { SkeletonCard, SkeletonStat, SkeletonList, SkeletonChart } from './PremiumSkeletonLoader';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

const Card = styled.div`
  width: 100%;
  height: 80px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Stat = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Chart = styled.div`
  width: 100%;
  height: 200px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Dashboard = () => {
  return (
    <DashboardContainer>
      <Card />
      <Stat>
        <SkeletonStat />
      </Stat>
      <List>
        <SkeletonList />
      </List>
      <Chart>
        <SkeletonChart />
      </Chart>
    </DashboardContainer>
  );
};

export default Dashboard;
```

**src/components/News.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';
import { SkeletonNewsList } from './PremiumSkeletonLoader';

const NewsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

const NewsItem = styled.div`
  width: 100%;
  padding: 20px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const News = () => {
  return (
    <NewsContainer>
      <NewsItem>
        <SkeletonNewsList />
      </NewsItem>
    </NewsContainer>
  );
};

export default News;
```

**src/components/Markets.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';
import { SkeletonCard, SkeletonStat } from './PremiumSkeletonLoader';

const MarketsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

const Card = styled.div`
  width: 100%;
  height: 80px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Stat = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  background-size: 200% 200%;
  animation: shimmer 1.5s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 100%;
    }
  }
`;

const Markets = () => {
  return (
    <MarketsContainer>
      <Card />
      <Stat>
        <SkeletonStat />
      </Stat>
    </MarketsContainer>
  );
};

export default Markets;