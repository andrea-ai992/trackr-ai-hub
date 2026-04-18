Création de `src/pages/Markets/MarketsHeader.js` :

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineSearch } from 'lucide-react';
import { styled } from 'styled-components';

const Container = styled.header`
  position: sticky;
  top: 0;
  background-color: var(--bg);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
`;

const Tabs = styled.nav`
  display: flex;
  gap: 1rem;
`;

const Tab = styled(Link)`
  color: var(--t2);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background-color: var(--bg2);
  transition: background-color 0.2s ease-in-out;

  &.active {
    background-color: var(--bg);
    color: var(--green);
    text-decoration: underline;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  padding: 0.5rem;
  border-radius: 12px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-radius: 12px;
  background-color: var(--bg2);
  color: var(--t2);
`;

const SearchIcon = styled(AiOutlineSearch)`
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  color: var(--t2);
`;

function MarketsHeader() {
  return (
    <Container>
      <Tabs>
        <Tab to="/markets/stocks" activeClassName="active">
          Stocks
        </Tab>
        <Tab to="/markets/crypto" activeClassName="active">
          Crypto
        </Tab>
      </Tabs>
      <SearchContainer>
        <SearchIcon />
        <SearchInput type="search" placeholder="Recherchez un actif" />
      </SearchContainer>
    </Container>
  );
}

export default MarketsHeader;
```

Modification de `src/pages/Markets.jsx` :

```jsx
import React, { useState, useEffect } from 'react';
import { styled } from 'styled-components';
import MarketsHeader from './MarketsHeader';
import { fetchMarketsData } from '../utils/fetchData';
import { SkeletonLoader } from '../components/SkeletonLoader';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--bg);
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  background-color: var(--bg);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const Tab = styled.div`
  color: var(--t2);
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background-color: var(--bg2);
  transition: background-color 0.2s ease-in-out;

  &.active {
    background-color: var(--bg);
    color: var(--green);
    text-decoration: underline;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  padding: 0.5rem;
  border-radius: 12px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-radius: 12px;
  background-color: var(--bg2);
  color: var(--t2);
`;

const SearchIcon = styled(AiOutlineSearch)`
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  color: var(--t2);
`;

const AssetsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const AssetCard = styled.li`
  padding: 1rem;
  background-color: var(--bg2);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AssetLogo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bg);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--t2);
`;

const AssetName = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
`;

const AssetPrice = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
`;

const AssetVariation = styled.span`
  font-size: 1rem;
  color: var(--t2);
`;

const VariationIcon = styled.span`
  font-size: 1rem;
  margin-left: 0.5rem;
`;

function Markets() {
  const [marketsData, setMarketsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketsData().then((data) => {
      setMarketsData(data);
      setLoading(false);
    });
  }, []);

  return (
    <Container>
      <HeaderContainer>
        <MarketsHeader />
        <SearchContainer>
          <SearchIcon />
          <SearchInput type="search" placeholder="Recherchez un actif" />
        </SearchContainer>
      </HeaderContainer>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          {marketsData.map((asset) => (
            <AssetCard key={asset.id}>
              <AssetLogo>
                {asset.logo ? (
                  <img src={asset.logo} alt={asset.name} />
                ) : (
                  <span style={{ fontSize: 24, color: '#fff' }}>
                    {asset.symbol.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </AssetLogo>
              <div>
                <AssetName>{asset.name}</AssetName>
                <AssetPrice>
                  {asset.price.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </AssetPrice>
                <AssetVariation>
                  {asset.variation > 0 ? (
                    <span style={{ color: '#00ff88' }}>
                      {asset.variation.toFixed(2)}%
                    </span>
                  ) : (
                    <span style={{ color: '#ff0000' }}>
                      {asset.variation.toFixed(2)}%
                    </span>
                  )}
                  <VariationIcon>
                    {asset.variation > 0 ? (
                      <span>&#8593;</span>
                    ) : (
                      <span>&#8595;</span>
                    )}
                  </VariationIcon>
                </AssetVariation>
              </div>
            </AssetCard>
          ))}
          <h2 style={{ fontSize: 18, color: '#fff', marginTop: 20 }}>
            Top Gainers
          </h2>
          <AssetsList>
            {marketsData
              .filter((asset) => asset.variation > 0)
              .map((asset) => (
                <AssetCard key={asset.id}>
                  <AssetLogo>
                    {asset.logo ? (
                      <img src={asset.logo} alt={asset.name} />
                    ) : (
                      <span style={{ fontSize: 24, color: '#fff' }}>
                        {asset.symbol.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </AssetLogo>
                  <div>
                    <AssetName>{asset.name}</AssetName>
                    <AssetPrice>
                      {asset.price.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </AssetPrice>
                    <AssetVariation>
                      <span style={{ color: '#00ff88' }}>
                        {asset.variation.toFixed(2)}%
                      </span>
                      <VariationIcon>
                        <span>&#8593;</span>
                      </VariationIcon>
                    </AssetVariation>
                  </div>
                </AssetCard>
              ))}
          </AssetsList>
          <h2 style={{ fontSize: 18, color: '#fff', marginTop: 20 }}>
            Top Losers
          </h2>
          <AssetsList>
            {marketsData
              .filter((asset) => asset.variation < 0)
              .map((asset) => (
                <AssetCard key={asset.id}>
                  <AssetLogo>
                    {asset.logo ? (
                      <img src={asset.logo} alt={asset.name} />
                    ) : (
                      <span style={{ fontSize: 24, color: '#fff' }}>
                        {asset.symbol.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </AssetLogo>
                  <div>
                    <AssetName>{asset.name}</AssetName>
                    <AssetPrice>
                      {asset.price.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </AssetPrice>
                    <AssetVariation>
                      <span style={{ color: '#ff0000' }}>
                        {asset.variation.toFixed(2)}%
                      </span>
                      <VariationIcon>
                        <span>&#8595;</span>
                      </VariationIcon>
                    </AssetVariation>
                  </div>
                </AssetCard>
              ))}
          </AssetsList>
        </>
      )}
    </Container>
  );
}

export default Markets;
```

Création de `src/components/SkeletonLoader.js` :

```jsx
import React from 'react';
import { styled } from 'styled-components';

const SkeletonLoader = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg);
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const SkeletonRow = styled.div`
  width: 100%;
  height: 40px;
  background-color: var(--bg);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SkeletonColumn = styled.div`
  width: 40px;
  height: 40px;
  background-color: var(--bg);
  border-radius: 50%;
  margin-right: 1rem;
`;

function SkeletonLoaderComponent() {
  return (
    <SkeletonLoader>
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonRow key={i}>
          <SkeletonColumn />
          <SkeletonColumn />
          <SkeletonColumn />
        </SkeletonRow>
      ))}
    </SkeletonLoader>
  );
}

export default SkeletonLoaderComponent;