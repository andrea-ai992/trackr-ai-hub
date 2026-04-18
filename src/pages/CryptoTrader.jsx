Voici le code mis à jour pour la page CryptoTrader :

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Inter } from '@fontsource/inter';
import './CryptoTrader.css';

const CryptoTrader = () => {
  const navigate = useNavigate();
  const [prices, setPrices] = useState({
    BTC: 0,
    ETH: 0,
    SOL: 0,
  });
  const [bids, setBids] = useState([
    { price: 10000, quantity: 10 },
    { price: 10050, quantity: 20 },
    { price: 10100, quantity: 30 },
  ]);
  const [asks, setAsks] = useState([
    { price: 9500, quantity: 10 },
    { price: 9600, quantity: 20 },
    { price: 9700, quantity: 30 },
  ]);
  const [positions, setPositions] = useState([
    {
      symbol: 'BTC',
      entryPrice: 10000,
      currentPrice: 10500,
      profitLoss: 5,
    },
    {
      symbol: 'ETH',
      entryPrice: 2000,
      currentPrice: 2100,
      profitLoss: -2,
    },
    {
      symbol: 'SOL',
      entryPrice: 50,
      currentPrice: 55,
      profitLoss: 12,
    },
  ]);
  const [variation24h, setVariation24h] = useState({
    BTC: 0,
    ETH: 0,
    SOL: 0,
  });

  useEffect(() => {
    const fetchPrices = async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
      const data = await response.json();
      setPrices({
        BTC: data.bitcoin.usd,
        ETH: data.ethereum.usd,
        SOL: data.solana.usd,
      });
    };
    fetchPrices();
    const intervalId = setInterval(() => {
      fetchPrices();
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const calculateVariation24h = async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
      const data = await response.json();
      const variationBTC = (data.bitcoin.usd - 10000) / 10000 * 100;
      const variationETH = (data.ethereum.usd - 2000) / 2000 * 100;
      const variationSOL = (data.solana.usd - 50) / 50 * 100;
      setVariation24h({
        BTC: variationBTC,
        ETH: variationETH,
        SOL: variationSOL,
      });
    };
    calculateVariation24h();
    const intervalId = setInterval(() => {
      calculateVariation24h();
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleBuy = (symbol) => {
    navigate(`/crypto/${symbol}/buy`);
  };

  const handleSell = (symbol) => {
    navigate(`/crypto/${symbol}/sell`);
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12, backgroundColor: 'var(--bg)' }}>
      <div className="prices">
        <h2>Prix en temps réel</h2>
        <div className="price-card">
          <p>BTC : {prices.BTC} $</p>
          <p>ETH : {prices.ETH} $</p>
          <p>SOL : {prices.SOL} $</p>
        </div>
        <div className="price-changes">
          <h2>Changements 24h</h2>
          <div className="price-change-card">
            <p>BTC : <span style={{ color: variation24h.BTC > 0 ? 'green' : variation24h.BTC < 0 ? 'red' : 'gray' }}>{variation24h.BTC}%</span></p>
            <p>ETH : <span style={{ color: variation24h.ETH > 0 ? 'green' : variation24h.ETH < 0 ? 'red' : 'gray' }}>{variation24h.ETH}%</span></p>
            <p>SOL : <span style={{ color: variation24h.SOL > 0 ? 'green' : variation24h.SOL < 0 ? 'red' : 'gray' }}>{variation24h.SOL}%</span></p>
          </div>
        </div>
      </div>
      <div className="orderbook">
        <h2>Ordre de commande</h2>
        <div className="orderbook-card">
          <h3>Bids</h3>
          <ul>
            {bids.map((bid, index) => (
              <li key={index}>
                {bid.price} $ x {bid.quantity}
              </li>
            ))}
          </ul>
          <h3>Asks</h3>
          <ul>
            {asks.map((ask, index) => (
              <li key={index}>
                {ask.price} $ x {ask.quantity}
              </li>
            ))}
          </ul>
          <p>Spread : {bids[0].price - asks[0].price} $</p>
        </div>
      </div>
      <div className="positions">
        <h2>Positions ouvertes</h2>
        <div className="position-card">
          {positions.map((position, index) => (
            <div key={index}>
              <p>Symbole : {position.symbol}</p>
              <p>Prix d'entrée : {position.entryPrice} $</p>
              <p>Prix actuel : {position.currentPrice} $</p>
              <p>Profit/Loss : {position.profitLoss}%</p>
              {position.profitLoss > 0 ? (
                <p style={{ color: 'green' }}>Gain</p>
              ) : position.profitLoss < 0 ? (
                <p style={{ color: 'red' }}>Perte</p>
              ) : (
                <p style={{ color: 'gray' }}>Néutre</p>
              )}
              <button style={{ backgroundColor: position.profitLoss > 0 ? '#00ff88' : '#ff0000', color: '#f0f0f0' }} onClick={() => handleBuy(position.symbol)}>Acheter</button>
              <button style={{ backgroundColor: position.profitLoss < 0 ? '#00ff88' : '#ff0000', color: '#f0f0f0' }} onClick={() => handleSell(position.symbol)}>Vendre</button>
            </div>
          ))}
        </div>
      </div>
      <div className="tabs">
        <button className="active">Marché</button>
        <button>Positions</button>
        <button>Historique</button>
      </div>
    </div>
  );
};

export default CryptoTrader;
```

Et voici le code CSS mis à jour :

```css
.page {
  font-family: 'Inter', sans-serif;
  color: var(--t1);
}

.prices {
  background-color: var(--bg2);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.price-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.price-change-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.orderbook {
  background-color: var(--bg2);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.orderbook-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.positions {
  background-color: var(--bg2);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.position-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.position-card > div {
  background-color: var(--bg3);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

button {
  background-color: var(--green);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
}

button:hover {
  background-color: var(--green);
  color: var(--t1);
}

button.active {
  background-color: var(--green);
  color: var(--t1);
  border: 1px solid var(--green);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tabs {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.tabs button {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.tabs button:hover {
  background-color: var(--green);
  color: var(--t1);
}

.tabs button.active {
  background-color: var(--green);
  color: var(--t1);
  border: 1px solid var(--green);
}
```

Ce code met à jour la page CryptoTrader pour afficher les prix en temps réel, les changements 24h, l'ordre de commande, les positions ouvertes et les boutons d'achat et de vente. Il utilise également les styles CSS pour personnaliser l'apparence de la page.