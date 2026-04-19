// src/pages/CryptoTrader.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, DollarSign, Grid, List, Menu, Pencil, Plus, X } from 'lucide-react';
import { supabase } from '../utils/supabase';

const CryptoTrader = () => {
  const location = useLocation();
  const [data, setData] = useState({
    btc: { price: 0, variation: 0 },
    eth: { price: 0, variation: 0 },
    sol: { price: 0, variation: 0 },
    portfolio: 0,
    positions: [
      { symbol: 'BTC', long: true, entryPrice: 30000, currentPrice: 31000, pnl: 500, pnlPercent: 1.67 },
      { symbol: 'ETH', long: false, entryPrice: 2000, currentPrice: 1960, pnl: -40, pnlPercent: -2 },
      { symbol: 'SOL', long: true, entryPrice: 50, currentPrice: 56, pnl: 600, pnlPercent: 12 },
    ],
    orderbook: {
      bids: [
        { price: 30000, amount: 10 },
        { price: 30010, amount: 20 },
        { price: 30020, amount: 30 },
        { price: 30030, amount: 40 },
        { price: 30040, amount: 50 },
        { price: 30050, amount: 60 },
        { price: 30060, amount: 70 },
        { price: 30070, amount: 80 },
      ],
      asks: [
        { price: 31000, amount: 10 },
        { price: 31010, amount: 20 },
        { price: 31020, amount: 30 },
        { price: 31030, amount: 40 },
        { price: 31040, amount: 50 },
        { price: 31050, amount: 60 },
        { price: 31060, amount: 70 },
        { price: 31070, amount: 80 },
      ],
      spread: 100,
    },
  });

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Csolana&vs_currencies=usd');
      const data = await response.json();
      setData((prevData) => ({
        ...prevData,
        btc: { price: data.bitcoin.usd, variation: Math.random() * 10 - 5 },
        eth: { price: data.ethereum.usd, variation: Math.random() * 10 - 5 },
        sol: { price: data.solana.usd, variation: Math.random() * 10 - 5 },
      }));
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleBuy = () => {
    // Simulate buying
    const newPositions = [...data.positions];
    newPositions.push({
      symbol: 'BTC',
      long: true,
      entryPrice: data.btc.price,
      currentPrice: data.btc.price,
      pnl: 0,
      pnlPercent: 0,
    });
    setData((prevData) => ({ ...prevData, positions: newPositions }));
  };

  const handleSell = () => {
    // Simulate selling
    const newPositions = [...data.positions];
    newPositions.pop();
    setData((prevData) => ({ ...prevData, positions: newPositions }));
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center p-4 bg-surface-high">
        <h1 className="text-lg font-bold text-text-primary">Crypto Trader</h1>
        <div className="flex items-center">
          <button className="bg-neon text-text-primary px-4 py-2 rounded-md">
            <Plus />
          </button>
          <button className="bg-neon text-text-primary px-4 py-2 rounded-md">
            <List />
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <section className="px-4 py-4 bg-surface">
          <h2 className="text-lg font-bold text-text-primary">Prix en temps réel</h2>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-text-secondary mr-2">{data.btc.price}</span>
              <span className={`text-text-primary ${data.btc.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.btc.variation.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-text-secondary mr-2">{data.eth.price}</span>
              <span className={`text-text-primary ${data.eth.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.eth.variation.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-text-secondary mr-2">{data.sol.price}</span>
              <span className={`text-text-primary ${data.sol.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.sol.variation.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-secondary">Portfolio : {data.portfolio.toFixed(2)} $</span>
            <button className="bg-neon text-text-primary px-4 py-2 rounded-md" onClick={handleBuy}>
              BUY
            </button>
            <button className="bg-neon text-text-primary px-4 py-2 rounded-md" onClick={handleSell}>
              SELL
            </button>
          </div>
        </section>
        <section className="px-4 py-4 bg-surface">
          <h2 className="text-lg font-bold text-text-primary">Orderbook</h2>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-text-secondary">Bids</span>
              <span className="text-text-secondary ml-2">{data.orderbook.spread}</span>
            </div>
            <div className="flex items-center">
              <span className="text-text-secondary">Asks</span>
              <span className="text-text-secondary ml-2">{data.orderbook.spread}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary">Price</span>
              <span className="text-text-secondary">Amount</span>
            </div>
            {data.orderbook.bids.map((bid, index) => (
              <div key={index} className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">{bid.price}</span>
                <span className="text-text-secondary">{bid.amount}</span>
              </div>
            ))}
            {data.orderbook.asks.map((ask, index) => (
              <div key={index} className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">{ask.price}</span>
                <span className="text-text-secondary">{ask.amount}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="px-4 py-4 bg-surface">
          <h2 className="text-lg font-bold text-text-primary">Positions</h2>
          <div className="flex flex-col">
            {data.positions.map((position, index) => (
              <div key={index} className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-text-secondary">{position.symbol}</span>
                  <span className={`text-text-primary ${position.long ? 'text-green-600' : 'text-red-600'}`}>
                    {position.long ? '+' : '-'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-text-secondary">Entry Price : {position.entryPrice}</span>
                  <span className="text-text-secondary ml-2">Current Price : {position.currentPrice}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-text-secondary">P&L : {position.pnl.toFixed(2)} $</span>
                  <span className={`text-text-primary ${position.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {position.pnlPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <footer className="flex justify-between items-center p-4 bg-surface-high">
          <Link to="/crypto/trader/market" className="bg-neon text-text-primary px-4 py-2 rounded-md">
            Marché
          </Link>
          <Link to="/crypto/trader/positions" className="bg-neon text-text-primary px-4 py-2 rounded-md">
            Positions
          </Link>
          <Link to="/crypto/trader/history" className="bg-neon text-text-primary px-4 py-2 rounded-md">
            Historique
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default CryptoTrader;