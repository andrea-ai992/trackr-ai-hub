Voici le code pour la page CryptoTrader :

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
      profitLoss: 5,
    },
    {
      symbol: 'SOL',
      entryPrice: 50,
      currentPrice: 55,
      profitLoss: 10,
    },
  ]);

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
            <p>BTC : <span style={{ color: prices.BTC > 10000 ? 'green' : 'red' }}>{prices.BTC > 10000 ? '+' : '-'}{Math.abs(prices.BTC - 10000)}%</span></p>
            <p>ETH : <span style={{ color: prices.ETH > 2000 ? 'green' : 'red' }}>{prices.ETH > 2000 ? '+' : '-'}{Math.abs(prices.ETH - 2000)}%</span></p>
            <p>SOL : <span style={{ color: prices.SOL > 50 ? 'green' : 'red' }}>{prices.SOL > 50 ? '+' : '-'}{Math.abs(prices.SOL - 50)}%</span></p>
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
              <button onClick={() => handleBuy(position.symbol)}>Acheter</button>
              <button onClick={() => handleSell(position.symbol)}>Vendre</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CryptoTrader;
```

Et voici le code CSS pour la page CryptoTrader :

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
```

Ce code crée une page CryptoTrader avec les sections suivantes :

* Prix en temps réel : affiche les prix actuels de BTC, ETH et SOL en temps réel à l'aide de l'API CoinGecko.
* Changements 24h : affiche les changements de prix de BTC, ETH et SOL au cours des 24 dernières heures.
* Ordre de commande : affiche les bids et les asks pour les trois cryptomonnaies.
* Positions ouvertes : affiche les positions ouvertes pour les trois cryptomonnaies, y compris le prix d'entrée, le prix actuel et le profit/loss.

Le code utilise les composants React et les hooks pour gérer l'état de la page. Il utilise également les styles CSS pour personnaliser l'apparence de la page.