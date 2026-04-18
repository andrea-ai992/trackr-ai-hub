**src/components/HeaderSticky/HeaderSticky.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';

const Container = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--bg);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: Inter, sans-serif;
  color: var(--t1);
  z-index: 1;
`;

const Salutation = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 0.5rem;
`;

const Date = styled.span`
  font-size: 1rem;
  color: var(--t2);
`;

const Refresh = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: var(--t1);
  font-size: 1.5rem;
  &:hover {
    color: var(--t3);
  }
`;

const HeaderSticky = ({ salutation, date, refresh }) => {
  return (
    <Container>
      <div>
        <Salutation>{salutation}</Salutation>
        <Date>{date}</Date>
      </div>
      <Refresh onClick={refresh}>⟳</Refresh>
    </Container>
  );
};

export default HeaderSticky;
```

**src/pages/Dashboard.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import HeaderSticky from '../components/HeaderSticky/HeaderSticky';
import { useFetch } from '../hooks/useFetch';
import { useInterval } from '../hooks/useInterval';
import { lucide } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: var(--bg);
`;

const HeroCard = styled.div`
  background-color: var(--bg2);
  padding: 2rem;
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const HeroCardTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: var(--t1);
`;

const HeroCardValue = styled.span`
  font-size: 3rem;
  font-weight: bold;
  color: var(--t1);
`;

const HeroCardPnl = styled.span`
  font-size: 1.5rem;
  color: var(--t2);
`;

const MoversRow = styled.div`
  display: flex;
  overflow-x: auto;
  padding: 1rem;
  background-color: var(--bg);
`;

const Mover = styled.div`
  display: inline-block;
  margin-right: 1rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background-color: var(--bg2);
  width: 150px;
  text-align: center;
`;

const MoverTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
`;

const MoverValue = styled.span`
  font-size: 1.5rem;
  color: var(--t2);
`;

const MoverSparkline = styled.svg`
  width: 50px;
  height: 20px;
  margin-top: 0.5rem;
  fill: none;
  stroke: var(--t1);
  stroke-width: 2;
`;

const FearGreedGauge = styled.svg`
  width: 200px;
  height: 200px;
  margin-bottom: 2rem;
  fill: none;
  stroke: var(--t1);
  stroke-width: 2;
`;

const NewsSection = styled.div`
  padding: 2rem;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  margin-bottom: 2rem;
`;

const NewsItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NewsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
`;

const NewsSource = styled.span`
  font-size: 1rem;
  color: var(--t2);
`;

const NewsTime = styled.span`
  font-size: 1rem;
  color: var(--t2);
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 2rem;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  margin-bottom: 2rem;
`;

const QuickAction = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 1rem;
  font-size: 1.5rem;
  color: var(--t1);
  &:hover {
    color: var(--t3);
  }
`;

const Dashboard = () => {
  const [data, setData] = useState({
    portfolioValue: 0,
    pnl24h: 0,
    movers: [],
    news: [],
    quickActions: [],
  });

  const { fetch: fetchPortfolio } = useFetch('/api/portfolio');
  const { fetch: fetchMovers } = useFetch('/api/movers');
  const { fetch: fetchNews } = useFetch('/api/news');
  const { fetch: fetchQuickActions } = useFetch('/api/quick-actions');

  useEffect(() => {
    fetchPortfolio().then((data) => setData((prevData) => ({ ...prevData, portfolioValue: data.value, pnl24h: data.pnl24h })));
    fetchMovers().then((data) => setData((prevData) => ({ ...prevData, movers: data })));
    fetchNews().then((data) => setData((prevData) => ({ ...prevData, news: data })));
    fetchQuickActions().then((data) => setData((prevData) => ({ ...prevData, quickActions: data })));
  }, []);

  useInterval(() => {
    fetchPortfolio().then((data) => setData((prevData) => ({ ...prevData, portfolioValue: data.value, pnl24h: data.pnl24h })));
  }, 60000);

  return (
    <Container>
      <HeaderSticky salutation="Bonjour" date={new Date().toLocaleString()} refresh={() => console.log('Refresh')} />
      <HeroCard>
        <HeroCardTitle>Total Portfolio Value</HeroCardTitle>
        <HeroCardValue>{data.portfolioValue.toLocaleString()}</HeroCardValue>
        <HeroCardPnl>
          {data.pnl24h > 0 ? (
            <span style={{ color: '#00ff88' }}>{data.pnl24h.toFixed(2)}%</span>
          ) : (
            <span style={{ color: '#ff0000' }}>{data.pnl24h.toFixed(2)}%</span>
          )}
        </HeroCardPnl>
      </HeroCard>
      <MoversRow>
        {data.movers.map((mover) => (
          <Mover key={mover.symbol}>
            <MoverTitle>{mover.symbol}</MoverTitle>
            <MoverValue>{mover.price.toLocaleString()}</MoverValue>
            <MoverSparkline>
              <path d={`M 0 0 L 50 20 L 0 0`} />
            </MoverSparkline>
            <span style={{ color: '#00ff88' }}>{mover.percentChange.toFixed(2)}%</span>
          </Mover>
        ))}
      </MoversRow>
      <FearGreedGauge>
        <circle cx="100" cy="100" r="90" />
        <path d={`M 100 100 L 100 10`} />
      </FearGreedGauge>
      <NewsSection>
        {data.news.map((newsItem) => (
          <NewsItem key={newsItem.id}>
            <NewsTitle>{newsItem.title}</NewsTitle>
            <NewsSource>{newsItem.source}</NewsSource>
            <NewsTime>{newsItem.time}</NewsTime>
          </NewsItem>
        ))}
      </NewsSection>
      <QuickActionsGrid>
        {data.quickActions.map((quickAction) => (
          <QuickAction key={quickAction.id}>
            <lucide icon={quickAction.icon} size={24} />
            <span style={{ marginLeft: '0.5rem' }}>{quickAction.label}</span>
          </QuickAction>
        ))}
      </QuickActionsGrid>
    </Container>
  );
};

export default Dashboard;
```

**src/hooks/useFetch.js**
```jsx
import { useState, useEffect } from 'react';

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, error, loading, fetch: () => fetchData() };
};

export default useFetch;
```

**src/hooks/useInterval.js**
```jsx
import { useState, useEffect } from 'react';

const useInterval = (callback, delay) => {
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const id = setInterval(callback, delay);
    setIntervalId(id);
    return () => clearInterval(id);
  }, [callback, delay]);

  return intervalId;
};

export default useInterval;