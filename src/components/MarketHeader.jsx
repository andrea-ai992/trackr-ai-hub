Création du composant MarketHeader.jsx :
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IconSearch } from 'lucide-react';

const MarketHeader = () => {
  return (
    <header className="market-header sticky top-0 bg-bg z-10">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-t1">Markets</h1>
        <ul className="flex justify-between items-center">
          <li>
            <Link to="/markets/stocks" className="text-t2 hover:text-green underline">
              Stocks
            </Link>
          </li>
          <li>
            <Link to="/markets/crypto" className="text-t2 hover:text-green underline">
              Crypto
            </Link>
          </li>
        </ul>
      </div>
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <input
          type="search"
          placeholder="Recherche"
          className="w-full py-2 pl-10 text-t2 rounded-lg bg-bg2 border border-border hover:bg-bg2 hover:border-border-hi"
        />
        <IconSearch className="text-t2" />
      </div>
    </header>
  );
};

export default MarketHeader;
```

Création du composant Markets.jsx :
```jsx
import React, { useState, useEffect } from 'react';
import MarketHeader from './MarketHeader';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { fetchMarkets } from '../api';
import SkeletonLoader from '../components/SkeletonLoader';

const Markets = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await fetchMarkets();
      setMarkets(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <MarketHeader />
      <div className="py-4">
        <Tabs>
          <TabList>
            <Tab>Stocks</Tab>
            <Tab>Crypto</Tab>
          </TabList>
          <TabPanel>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {markets.stocks.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          </TabPanel>
          <TabPanel>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {markets.crypto.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

const MarketCard = ({ market }) => {
  return (
    <div className="bg-bg2 rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-t3">{market.symbol}</span>
          <span className="text-t3 ml-2">{market.name}</span>
        </div>
        <span className="text-t2 font-bold">{market.price}</span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-t3">{market.variation}%</span>
        <span className="text-t3">{market.variation > 0 ? '↑' : '↓'}</span>
      </div>
      <div className="mt-2">
        <svg
          width="40"
          height="20"
          viewBox="0 0 40 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20 10M20 10L20