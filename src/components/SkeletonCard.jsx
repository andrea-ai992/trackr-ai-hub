Création des composants de skeleton loader

**src/components/SkeletonLoader.jsx**
```jsx
import React from 'react';
import { SkeletonCard, SkeletonStat, SkeletonList, SkeletonChart, SkeletonNewsList, SkeletonPortfolio } from './SkeletonCard';

const SkeletonLoader = () => {
  return (
    <div className="skeleton-loader">
      <SkeletonCard />
      <SkeletonStat />
      <SkeletonList />
      <SkeletonChart />
      <SkeletonNewsList />
      <SkeletonPortfolio />
    </div>
  );
};

export default SkeletonLoader;
```

**src/components/SkeletonCard.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonCardContainer = styled.div`
  width: 80px;
  height: 80px;
  background-color: var(--bg2);
  border-radius: 10px;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonCard = () => {
  return (
    <SkeletonCardContainer />
  );
};

export { SkeletonCard };
```

**src/components/SkeletonStat.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonStatContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const SkeletonStatItem = styled.div`
  width: 60px;
  height: 60px;
  background-color: var(--bg2);
  border-radius: 10px;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonStat = () => {
  return (
    <SkeletonStatContainer>
      <SkeletonStatItem />
      <SkeletonStatItem />
      <SkeletonStatItem />
      <SkeletonStatItem />
    </SkeletonStatContainer>
  );
};

export { SkeletonStat };
```

**src/components/SkeletonList.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const SkeletonListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SkeletonAvatar = styled.div`
  width: 40px;
  height: 40px;
  background-color: var(--bg2);
  border-radius: 50%;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonListItemText = styled.div`
  font-size: 14px;
  color: var(--t1);
`;

const SkeletonList = () => {
  return (
    <SkeletonListContainer>
      <SkeletonListItem>
        <SkeletonAvatar />
        <SkeletonListItemText>Text 1</SkeletonListItemText>
      </SkeletonListItem>
      <SkeletonListItem>
        <SkeletonAvatar />
        <SkeletonListItemText>Text 2</SkeletonListItemText>
      </SkeletonListItem>
      <SkeletonListItem>
        <SkeletonAvatar />
        <SkeletonListItemText>Text 3</SkeletonListItemText>
      </SkeletonListItem>
      <SkeletonListItem>
        <SkeletonAvatar />
        <SkeletonListItemText>Text 4</SkeletonListItemText>
      </SkeletonListItem>
      <SkeletonListItem>
        <SkeletonAvatar />
        <SkeletonListItemText>Text 5</SkeletonListItemText>
      </SkeletonListItem>
    </SkeletonListContainer>
  );
};

export { SkeletonList };
```

**src/components/SkeletonChart.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonChartContainer = styled.div`
  width: 200px;
  height: 200px;
  background-color: var(--bg2);
  border-radius: 10px;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonChart = () => {
  return (
    <SkeletonChartContainer />
  );
};

export { SkeletonChart };
```

**src/components/SkeletonNewsList.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonNewsListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const SkeletonNewsListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SkeletonNewsThumbnail = styled.div`
  width: 80px;
  height: 80px;
  background-color: var(--bg2);
  border-radius: 10px;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonNewsListItemText = styled.div`
  font-size: 14px;
  color: var(--t1);
`;

const SkeletonNewsList = () => {
  return (
    <SkeletonNewsListContainer>
      <SkeletonNewsListItem>
        <SkeletonNewsThumbnail />
        <SkeletonNewsListItemText>News 1</SkeletonNewsListItemText>
      </SkeletonNewsListItem>
      <SkeletonNewsListItem>
        <SkeletonNewsThumbnail />
        <SkeletonNewsListItemText>News 2</SkeletonNewsListItemText>
      </SkeletonNewsListItem>
      <SkeletonNewsListItem>
        <SkeletonNewsThumbnail />
        <SkeletonNewsListItemText>News 3</SkeletonNewsListItemText>
      </SkeletonNewsListItem>
      <SkeletonNewsListItem>
        <SkeletonNewsThumbnail />
        <SkeletonNewsListItemText>News 4</SkeletonNewsListItemText>
      </SkeletonNewsListItem>
      <SkeletonNewsListItem>
        <SkeletonNewsThumbnail />
        <SkeletonNewsListItemText>News 5</SkeletonNewsListItemText>
      </SkeletonNewsListItem>
    </SkeletonNewsListContainer>
  );
};

export { SkeletonNewsList };
```

**src/components/SkeletonPortfolio.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonPortfolioContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const SkeletonPortfolioItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SkeletonPortfolioHero = styled.div`
  width: 120px;
  height: 120px;
  background-color: var(--bg2);
  border-radius: 10px;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonPortfolioListItemText = styled.div`
  font-size: 14px;
  color: var(--t1);
`;

const SkeletonPortfolio = () => {
  return (
    <SkeletonPortfolioContainer>
      <SkeletonPortfolioItem>
        <SkeletonPortfolioHero />
        <SkeletonPortfolioListItemText>Portfolio 1</SkeletonPortfolioListItemText>
      </SkeletonPortfolioItem>
      <SkeletonPortfolioItem>
        <SkeletonPortfolioHero />
        <SkeletonPortfolioListItemText>Portfolio 2</SkeletonPortfolioListItemText>
      </SkeletonPortfolioItem>
      <SkeletonPortfolioItem>
        <SkeletonPortfolioHero />
        <SkeletonPortfolioListItemText>Portfolio 3</SkeletonPortfolioListItemText>
      </SkeletonPortfolioItem>
      <SkeletonPortfolioItem>
        <SkeletonPortfolioHero />
        <SkeletonPortfolioListItemText>Portfolio 4</SkeletonPortfolioListItemText>
      </SkeletonPortfolioItem>
    </SkeletonPortfolioContainer>
  );
};

export { SkeletonPortfolio };
```

**src/components/SkeletonCard.jsx** (modifié pour utiliser les nouvelles propriétés CSS)
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonCardContainer = styled.div`
  width: 80px;
  height: 80px;
  background-color: var(--bg2);
  border-radius: 10px;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonCard = () => {
  return (
    <SkeletonCardContainer />
  );
};

export { SkeletonCard };
```

**src/components/SkeletonStat.jsx** (modifié pour utiliser les nouvelles propriétés CSS)
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonStatContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const SkeletonStatItem = styled.div`
  width: 60px;
  height: 60px;
  background-color: var(--bg2);
  border-radius: 10px;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonStat = () => {
  return (
    <SkeletonStatContainer>
      <SkeletonStatItem />
      <SkeletonStatItem />
      <SkeletonStatItem />
      <SkeletonStatItem />
    </SkeletonStatContainer>
  );
};

export { SkeletonStat };
```

**src/components/SkeletonList.jsx** (modifié pour utiliser les nouvelles propriétés CSS)
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const SkeletonListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SkeletonAvatar = styled.div`
  width: 40px;
  height: 40px;
  background-color: var(--bg2);
  border-radius: 50%;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonListItemText = styled.div`
  font-size: 14px;
  color: var(--t1);
`;

const SkeletonList = () => {
  return (
    <SkeletonListContainer>
      <SkeletonListItem>
        <SkeletonAvatar />
        <SkeletonListItemText>Text 1</SkeletonListItemText>
      </SkeletonListItem>
      <SkeletonListItem>
        <SkeletonAvatar />
        <SkeletonListItemText>Text 2</SkeletonListItemText>
      </SkeletonListItem>
      <SkeletonListItem>
        <SkeletonAvatar />
        <SkeletonListItemText>Text 3</SkeletonListItemText>
      </SkeletonListItem>
      <SkeletonListItem>
        <SkeletonAvatar />
        <SkeletonListItemText>Text 4</SkeletonListItemText>
      </SkeletonListItem>
      <SkeletonListItem>
        <SkeletonAvatar />
        <SkeletonListItemText>Text 5</SkeletonListItemText>
      </SkeletonListItem>
    </SkeletonListContainer>
  );
};

export { SkeletonList };
```

**src/components/SkeletonChart.jsx** (modifié pour utiliser les nouvelles propriétés CSS)
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonChartContainer = styled.div`
  width: 200px;
  height: 200px;
  background-color: var(--bg2);
  border-radius: 10px;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonChart = () => {
  return (
    <SkeletonChartContainer />
  );
};

export { SkeletonChart };
```

**src/components/SkeletonNewsList.jsx** (modifié pour utiliser les nouvelles propriétés CSS)
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonNewsListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const SkeletonNewsListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SkeletonNewsThumbnail = styled.div`
  width: 80px;
  height: 80px;
  background-color: var(--bg2);
  border-radius: 10px;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonNewsListItemText = styled.div`
  font-size: 14px;
  color: var(--t1);
`;

const SkeletonNewsList = () => {
  return (
    <SkeletonNewsListContainer>
      <SkeletonNewsListItem>
        <SkeletonNewsThumbnail />
        <SkeletonNewsListItemText>News 1</SkeletonNewsListItemText>
      </SkeletonNewsListItem>
      <SkeletonNewsListItem>
        <SkeletonNewsThumbnail />
        <SkeletonNewsListItemText>News 2</SkeletonNewsListItemText>
      </SkeletonNewsListItem>
      <SkeletonNewsListItem>
        <SkeletonNewsThumbnail />
        <SkeletonNewsListItemText>News 3</SkeletonNewsListItemText>
      </SkeletonNewsListItem>
      <SkeletonNewsListItem>
        <SkeletonNewsThumbnail />
        <SkeletonNewsListItemText>News 4</SkeletonNewsListItemText>
      </SkeletonNewsListItem>
      <SkeletonNewsListItem>
        <SkeletonNewsThumbnail />
        <SkeletonNewsListItemText>News 5</SkeletonNewsListItemText>
      </SkeletonNewsListItem>
    </SkeletonNewsListContainer>
  );
};

export { SkeletonNewsList };
```

**src/components/SkeletonPortfolio.jsx** (modifié pour utiliser les nouvelles propriétés CSS)
```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonPortfolioContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const SkeletonPortfolioItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SkeletonPortfolioHero = styled.div`
  width: 120px;
  height: 120px;
  background-color: var(--bg2);
  border-radius: 10px;
  background-size: 200%;
  animation: shimmer 2s infinite;
  @keyframes shimmer {
    0% {
      background-position: -100%;
    }
    100% {
      background-position: 100%;
    }
  }
`;

const SkeletonPortfolioListItemText = styled.div`
  font-size: 14px;
  color: var(--t1);
`;

const SkeletonPortfolio = () => {
  return (
    <SkeletonPortfolioContainer>
      <SkeletonPortfolioItem>
        <SkeletonPortfolioHero />
        <SkeletonPortfolioListItemText>Portfolio 1</SkeletonPortfolioListItemText>
      </SkeletonPortfolioItem>
      <SkeletonPortfolioItem>
        <SkeletonPortfolioHero />
        <SkeletonPortfolioListItemText>Portfolio 2</SkeletonPortfolioListItemText>
      </SkeletonPortfolioItem>
      <SkeletonPortfolioItem>
        <SkeletonPortfolioHero />
        <SkeletonPortfolioListItemText>Portfolio 3</SkeletonPortfolioListItemText>
      </SkeletonPortfolioItem>
      <SkeletonPortfolioItem>
        <SkeletonPortfolioHero />
        <SkeletonPortfolioListItemText>Portfolio 4</SkeletonPortfolioListItemText>
      </SkeletonPortfolioItem>
    </SkeletonPortfolioContainer>
  );
};

export { SkeletonPortfolio };
```

**src/pages/Dashboard.jsx**
```jsx
import React from 'react';
import { SkeletonLoader } from '../components/SkeletonLoader';

const Dashboard = () => {
  return (
    <div>
      <SkeletonLoader />
    </div>
  );
};

export default Dashboard;
```

**src/pages/News.jsx**
```jsx
import React from 'react';
import { SkeletonNewsList } from '../components/SkeletonNewsList';

const News = () => {
  return (
    <div>
      <SkeletonNewsList />
    </div>
  );
};

export default News;
```

**src/pages/Markets.jsx**
```jsx
import React from 'react';
import { SkeletonStat } from '../components/SkeletonStat';

const Markets = () => {
  return (
    <div>
      <SkeletonStat />
    </div>
  );
};

export default Markets;
```

Maintenant, vous pouvez utiliser les nouveaux composants de skeleton loader dans vos pages.