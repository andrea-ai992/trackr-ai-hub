**src/pages/CryptoTrader.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { supabase } from '../utils/supabase';

const Container = styled.div`
  background-color: var(--bg);
  padding: 16px;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg2);
  padding: 8px;
  border-bottom: 1px solid var(--border);
`;

const Section = styled.section`
  padding: 16px;
  border-bottom: 1px solid var(--border);
`;

const Orderbook = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const OrderbookRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const OrderbookItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--border);
`;

const Position = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
`;

const PositionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--border);
`;

const Button = styled.button`
  background-color: var(--green);
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Tab = styled.button`
  background-color: var(--bg2);
  color: var(--t1);
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
`;

const TabPanel = styled.div`
  display: none;
`;

function CryptoTrader() {
  const [cryptoData, setCryptoData] = useState({
    btc: { price: 0, variation: 0 },
    eth: { price: 0, variation: 0 },
    sol: { price: 0, variation: 0 },
  });
  const [positions, setPositions] = useState([
    { symbol: 'BTC', long: true, entryPrice: 50000, currentPrice: 52000, pl: 1000 },
    { symbol: 'ETH', long: false, entryPrice: 2000, currentPrice: 1900, pl: -100 },
    { symbol: 'SOL', long: true, entryPrice: 50, currentPrice: 56, pl: 600 },
  ]);
  const [tab, setTab] = useState('market');

  useEffect(() => {
    const fetchCryptoData = async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Csolana&vs_currencies=usd');
      const data = await response.json();
      setCryptoData({
        btc: { price: data.bitcoin.usd, variation: Math.random() * 10 - 5 },
        eth: { price: data.ethereum.usd, variation: Math.random() * 10 - 5 },
        sol: { price: data.solana.usd, variation: Math.random() * 10 - 5 },
      });
    };
    fetchCryptoData();
    const intervalId = setInterval(fetchCryptoData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchPositions = async () => {
      // Simuler les positions
      const positions = [
        { symbol: 'BTC', long: true, entryPrice: 50000, currentPrice: 52000, pl: 1000 },
        { symbol: 'ETH', long: false, entryPrice: 2000, currentPrice: 1900, pl: -100 },
        { symbol: 'SOL', long: true, entryPrice: 50, currentPrice: 56, pl: 600 },
      ];
      setPositions(positions);
    };
    fetchPositions();
  }, []);

  const handleTabChange = (tab) => {
    setTab(tab);
  };

  return (
    <Container>
      <Header>
        <h1>Crypto Trader</h1>
        <nav>
          <Tab onClick={() => handleTabChange('market')}>Marché</Tab>
          <Tab onClick={() => handleTabChange('positions')}>Positions</Tab>
          <Tab onClick={() => handleTabChange('historique')}>Historique</Tab>
        </nav>
      </Header>
      <Section>
        {tab === 'market' && (
          <div>
            <h2>Prix en temps réel</h2>
            <div>
              <p>BTC: {cryptoData.btc.price} ({cryptoData.btc.variation}%)</p>
              <p>ETH: {cryptoData.eth.price} ({cryptoData.eth.variation}%)</p>
              <p>SOL: {cryptoData.sol.price} ({cryptoData.sol.variation}%)</p>
            </div>
          </div>
        )}
        {tab === 'positions' && (
          <div>
            <h2>Positions</h2>
            {positions.map((position, index) => (
              <Position key={index}>
                <h3>{position.symbol}</h3>
                <p>Entrée: {position.entryPrice}</p>
                <p>Actuel: {position.currentPrice}</p>
                <p>PL: {position.pl} ({(position.pl / position.entryPrice) * 100}%)</p>
                {position.long ? (
                  <Button>SELL</Button>
                ) : (
                  <Button>BUY</Button>
                )}
              </Position>
            ))}
          </div>
        )}
        {tab === 'historique' && (
          <div>
            <h2>Historique</h2>
            <p>En développement...</p>
          </div>
        )}
      </Section>
      <Section>
        <h2>Ordre de livraison</h2>
        <Orderbook>
          <OrderbookRow>
            <h3>Bids</h3>
            <h3>Asks</h3>
          </OrderbookRow>
          {Array(8).fill(0).map((_, index) => (
            <OrderbookRow key={index}>
              <OrderbookItem>
                <p>100 BTC</p>
                <p>50000 USD</p>
              </OrderbookItem>
              <OrderbookItem>
                <p>50 ETH</p>
                <p>2000 USD</p>
              </OrderbookItem>
            </OrderbookRow>
          ))}
          <p>Spread: 1000 USD</p>
        </Orderbook>
      </Section>
    </Container>
  );
}

export default CryptoTrader;
```

**src/api/crypto.js**
```javascript
import axios from 'axios';

const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Csolana&vs_currencies=usd';

const getCryptoData = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export { getCryptoData };
```

**src/utils/supabase.js**
```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_KEY = 'your-supabase-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export { supabase };
```

Notez que vous devez remplacer `your-supabase-url` et `your-supabase-key` par vos informations de connexion à Supabase.