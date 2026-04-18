**src/components/PriceChart/PriceChart.js**
```jsx
import React from 'react';
import { useTheme } from '@emotion/react';
import { styled } from '@emotion/styled';
import { interFont } from '../styles/fonts';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 10px;
  box-shadow: 0 0 10px var(--border);
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 20px;
  background-color: var(--bg2);
  border-radius: 10px;
  padding: 10px;
`;

const PriceChart = ({ data }) => {
  const theme = useTheme();

  return (
    <Container>
      <h2 style={{ fontSize: 24, color: theme.colors.t1, fontFamily: interFont }}>
        Prix en temps réel
      </h2>
      <ChartWrapper>
        {/* Chart here */}
      </ChartWrapper>
    </Container>
  );
};

export default PriceChart;
```

**src/pages/Markets/Stocks.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '@emotion/react';
import { styled } from '@emotion/styled';
import { interFont } from '../styles/fonts';
import PriceChart from '../components/PriceChart/PriceChart';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 10px;
  box-shadow: 0 0 10px var(--border);
`;

const StocksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StockItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid var(--border);
  &:last-child {
    border-bottom: none;
  }
`;

const StockName = styled.span`
  font-size: 18px;
  color: var(--t1);
  font-family: ${interFont};
`;

const StockPrice = styled.span`
  font-size: 24px;
  color: var(--t2);
  font-family: ${interFont};
`;

const Stocks = () => {
  const theme = useTheme();
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    // fetch data from API
    const fetchData = async () => {
      const response = await fetch('https://api.example.com/stocks');
      const data = await response.json();
      setStocks(data);
    };
    fetchData();
  }, []);

  return (
    <Container>
      <h1 style={{ fontSize: 36, color: theme.colors.t1, fontFamily: interFont }}>
        Marchés boursiers
      </h1>
      <StocksList>
        {stocks.map((stock) => (
          <StockItem key={stock.id}>
            <StockName>{stock.name}</StockName>
            <StockPrice>${stock.price}</StockPrice>
          </StockItem>
        ))}
      </StocksList>
      <PriceChart data={stocks} />
    </Container>
  );
};

export default Stocks;
```

**src/pages/Markets/Crypto.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '@emotion/react';
import { styled } from '@emotion/styled';
import { interFont } from '../styles/fonts';
import PriceChart from '../components/PriceChart/PriceChart';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 10px;
  box-shadow: 0 0 10px var(--border);
`;

const CryptoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CryptoItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid var(--border);
  &:last-child {
    border-bottom: none;
  }
`;

const CryptoName = styled.span`
  font-size: 18px;
  color: var(--t1);
  font-family: ${interFont};
`;

const CryptoPrice = styled.span`
  font-size: 24px;
  color: var(--t2);
  font-family: ${interFont};
`;

const Crypto = () => {
  const theme = useTheme();
  const [cryptos, setCryptos] = useState([]);

  useEffect(() => {
    // fetch data from API
    const fetchData = async () => {
      const response = await fetch('https://api.example.com/cryptos');
      const data = await response.json();
      setCryptos(data);
    };
    fetchData();
  }, []);

  return (
    <Container>
      <h1 style={{ fontSize: 36, color: theme.colors.t1, fontFamily: interFont }}>
        Marchés cryptographiques
      </h1>
      <CryptoList>
        {cryptos.map((crypto) => (
          <CryptoItem key={crypto.id}>
            <CryptoName>{crypto.name}</CryptoName>
            <CryptoPrice>${crypto.price}</CryptoPrice>
          </CryptoItem>
        ))}
      </CryptoList>
      <PriceChart data={cryptos} />
    </Container>
  );
};

export default Crypto;
```

**src/components/PriceChart/PriceChart.js (avec chart)**
```jsx
import React from 'react';
import { useTheme } from '@emotion/react';
import { styled } from '@emotion/styled';
import { interFont } from '../styles/fonts';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 10px;
  box-shadow: 0 0 10px var(--border);
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 20px;
  background-color: var(--bg2);
  border-radius: 10px;
  padding: 10px;
`;

const PriceChart = ({ data }) => {
  const theme = useTheme();

  const chartData = data.map((item) => ({
    x: item.name,
    y: item.price,
  }));

  return (
    <Container>
      <h2 style={{ fontSize: 24, color: theme.colors.t1, fontFamily: interFont }}>
        Prix en temps réel
      </h2>
      <ChartWrapper>
        <svg
          width="100%"
          height="300"
          viewBox="0 0 100 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0H100V300H0V0Z"
            fill="var(--bg2)"
            stroke="var(--border)"
            strokeWidth="2"
          />
          {chartData.map((item, index) => (
            <path
              key={index}
              d={`M${index * 2} 300V${300 - item.y * 3}H${(index + 1) * 2}`}
              fill="none"
              stroke="var(--t2)"
              strokeWidth="2"
            />
          ))}
        </svg>
      </ChartWrapper>
    </Container>
  );
};

export default PriceChart;
```
Note : Les données de l'API sont simulées pour les exemples. Vous devrez les remplacer par vos données réelles.