// src/pages/Signals.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
const Container = ({children,className='',...p}) => <div className={className} {...p}>{children}</div>; const Row = Container; const Col = Container;
import { supabase } from '../lib/supabaseClient';

const Signals = () => {
  const [signals, setSignals] = useState([
    { ticker: 'BTC', name: 'Bitcoin', score: 80, indicators: { rsi: 90, macd: 20, volume: 100 }, signal: 'BUY' },
    { ticker: 'ETH', name: 'Ethereum', score: 60, indicators: { rsi: 50, macd: 10, volume: 50 }, signal: 'HOLD' },
    { ticker: 'NVDA', name: 'NVIDIA', score: 40, indicators: { rsi: 30, macd: 5, volume: 20 }, signal: 'SELL' },
    { ticker: 'SOL', name: 'Solana', score: 90, indicators: { rsi: 95, macd: 25, volume: 150 }, signal: 'BUY' },
    { ticker: 'AAPL', name: 'Apple', score: 70, indicators: { rsi: 80, macd: 15, volume: 70 }, signal: 'HOLD' },
    { ticker: 'SPY', name: 'S&P 500', score: 50, indicators: { rsi: 40, macd: 10, volume: 40 }, signal: 'SELL' },
  ]);

  const [filter, setFilter] = useState('Tous');

  useEffect(() => {
    const getSignals = async () => {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      setSignals(data);
    };
    getSignals();
  }, []);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredSignals = signals.filter((signal) => {
    if (filter === 'Tous') return true;
    if (filter === 'BUY' && signal.signal === 'BUY') return true;
    if (filter === 'SELL' && signal.signal === 'SELL') return true;
    if (filter === 'HOLD' && signal.signal === 'HOLD') return true;
    return false;
  });

  const handleRefresh = () => {
    const getSignals = async () => {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      setSignals(data);
    };
    getSignals();
  };

  return (
    <BrowserRouter>
      <Container className="max-w-7xl mx-auto p-4">
        <Row className="flex justify-between mb-4">
          <Col xs={12} md={6} className="text-lg font-bold text--t1">
            Signaux IA Trading
          </Col>
          <Col xs={12} md={6} className="flex justify-end">
            <select value={filter} onChange={handleFilterChange} className="bg--bg2 p-2 text--t1 border--border">
              <option value="Tous">Tous</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
              <option value="HOLD">HOLD</option>
            </select>
            <button onClick={handleRefresh} className="bg--green p-2 text--t1 border--border">
              Rafraîchir
            </button>
          </Col>
        </Row>
        <Row className="flex flex-wrap -mx-4">
          {filteredSignals.map((signal, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <div className="bg--bg p-4 rounded-lg shadow-md">
                <Row className="flex justify-between mb-2">
                  <Col xs={12} md={6} className="text-lg font-bold text--t1">
                    {signal.ticker} - {signal.name}
                  </Col>
                  <Col xs={12} md={6} className="text-lg font-bold text--t1 text-right">
                    Score : {signal.score}%
                  </Col>
                </Row>
                <Row className="flex justify-between mb-2">
                  <Col xs={12} md={6} className="text-lg font-bold text--t1 text-right">
                    RSI : {signal.indicators.rsi}%
                  </Col>
                  <Col xs={12} md={6} className="text-lg font-bold text--t1 text-right">
                    MACD : {signal.indicators.macd}%
                  </Col>
                  <Col xs={12} md={6} className="text-lg font-bold text--t1 text-right">
                    Volume : {signal.indicators.volume}%
                  </Col>
                </Row>
                <Row className="flex justify-between mb-2">
                  <Col xs={12} md={6} className="text-lg font-bold text--t1 text-right">
                    <span className={`bg--green p-2 text--t1 rounded-lg ${signal.score > 50 ? 'bg--green' : 'bg--red'}`}>
                      {signal.score > 50 ? 'Bullish' : 'Bearish'}
                    </span>
                  </Col>
                  <Col xs={12} md={6} className="text-lg font-bold text--t1 text-right">
                    <span className={`bg--green p-2 text--t1 rounded-lg ${signal.signal === 'BUY' ? 'bg--green' : signal.signal === 'SELL' ? 'bg--red' : 'bg--yellow'}`}>
                      {signal.signal}
                    </span>
                  </Col>
                </Row>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </BrowserRouter>
  );
};

export default Signals;
