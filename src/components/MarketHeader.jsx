import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const MarketHeader = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-10 bg-bg border-b border-border">
      <div className="flex justify-between items-center p-4">
        <div className="flex space-x-4 overflow-x-auto">
          <Link
            to="/markets/stocks"
            className={`text-t1 font-bold py-2 px-4 rounded-lg ${activeTab === 'stocks' ? 'border-b-2 border-green' : ''}`}
            onClick={() => setActiveTab('stocks')}
          >
            Stocks
          </Link>
          <Link
            to="/markets/crypto"
            className={`text-t1 font-bold py-2 px-4 rounded-lg ${activeTab === 'crypto' ? 'border-b-2 border-green' : ''}`}
            onClick={() => setActiveTab('crypto')}
          >
            Crypto
          </Link>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-bg2 text-t1 rounded-full pl-10 pr-4 py-2 focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-t2" />
        </div>
      </div>
    </header>
  );
};

export default MarketHeader;

import React, { useEffect, useState } from 'react';
import MarketHeader from '../components/MarketHeader';

const Markets = () => {
  const [activeTab, setActiveTab] = useState('stocks');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      // Fetch data logic here
      setLoading(false);
    };

    fetchAssets();
  }, [activeTab]);

  return (
    <div className="bg-bg min-h-screen">
      <MarketHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="sticky top-16 bg-bg2 p-4 rounded-lg">
        {/* Pull to refresh visual can be implemented here */}
      </div>
      {loading ? (
        <div className="animate-pulse">
          {/* Skeleton loader shimmer effect */}
        </div>
      ) : (
        <div>
          <h2 className="text-t1 uppercase text-sm">Top Gainers</h2>
          {/* Map through assets to display cards */}
          <h2 className="text-t1 uppercase text-sm">Top Losers</h2>
          {/* Map through assets to display cards */}
        </div>
      )}
    </div>
  );
};

export default Markets;