Je vais améliorer le système de scoring visuel pour les signaux IA dans `Signals.jsx` avec des indicateurs colorés et des alertes dynamiques. Voici les modifications :

```jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Inter } from '@fontsource/inter';
import { Lucide } from 'lucide-react';

const assets = [
  { ticker: 'BTC', name: 'Bitcoin', price: 45000 },
  { ticker: 'ETH', name: 'Ethereum', price: 3500 },
  { ticker: 'NVDA', name: 'NVIDIA', price: 250 },
  { ticker: 'SOL', name: 'Solana', price: 20 },
  { ticker: 'AAPL', name: 'Apple', price: 150 },
  { ticker: 'SPY', name: 'SPDR S&P 500', price: 450 },
  { ticker: 'TSLA', name: 'Tesla', price: 1000 },
  { ticker: 'LINK', name: 'Chainlink', price: 20 },
];

const getRSI = (data) => {
  if (data.length < 14) return 50;
  const gains = [];
  const losses = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i-1].close;
    if (change > 0) gains.push(change);
    else losses.push(Math.abs(change));
  }

  if (gains.length === 0 || losses.length === 0) return 50;

  const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return rsi;
};

const getMACD = (data) => {
  if (data.length < 26) return 0;

  const ema12 = data.slice(-12).reduce((a, b, index) => {
    if (index === 0) return b.close;
    return (0.152 * b.close + 0.848 * a);
  }, 0);

  const ema26 = data.slice(-26).reduce((a, b, index) => {
    if (index === 0) return b.close;
    return (0.074 * b.close + 0.926 * a);
  }, 0);

  const signalLine = data.slice(-9).reduce((a, b, index) => {
    if (index === 0) return ema12;
    return (0.2 * ema12 + 0.8 * a);
  }, 0);

  const macd = ema12 - ema26;
  return { macd, signalLine };
};

const getVolumeAnalysis = (data) => {
  if (data.length < 20) return { volume: 0, trend: 'neutral' };

  const volumeChanges = [];
  for (let i = 1; i < data.length; i++) {
    volumeChanges.push(data[i].volume - data[i-1].volume);
  }

  const avgVolume = volumeChanges.reduce((a, b) => a + b, 0) / volumeChanges.length;
  const currentVolume = data[data.length-1].volume || 0;

  let trend;
  if (currentVolume > avgVolume * 1.5) trend = 'high';
  else if (currentVolume < avgVolume * 0.7) trend = 'low';
  else trend = 'normal';

  return { volume: currentVolume, trend };
};

const getSignal = (data) => {
  const rsi = getRSI(data);
  const { macd, signalLine } = getMACD(data);
  const { trend } = getVolumeAnalysis(data);

  const isOversold = rsi < 30;
  const isOverbought = rsi > 70;
  const isBullish = macd > signalLine;
  const isBearish = macd < signalLine;

  if (isOversold && isBullish && trend === 'high') return 'STRONG_BUY';
  if (isOversold && isBullish) return 'BUY';
  if (isOverbought && isBearish && trend === 'low') return 'STRONG_SELL';
  if (isOverbought && isBearish) return 'SELL';
  return 'HOLD';
};

const getSignalSeverity = (signal) => {
  if (signal === 'STRONG_BUY') return { color: '#00ff88', icon: 'trending-up', text: 'Strong Buy' };
  if (signal === 'BUY') return { color: '#00ffaa', icon: 'arrow-up', text: 'Buy' };
  if (signal === 'SELL') return { color: '#ff4444', icon: 'arrow-down', text: 'Sell' };
  if (signal === 'STRONG_SELL') return { color: '#ff0000', icon: 'trending-down', text: 'Strong Sell' };
  return { color: '#888888', icon: 'minus', text: 'Hold' };
};

const getRSIStatus = (rsi) => {
  if (rsi < 30) return { color: '#00ff88', label: 'Oversold', severity: 'low' };
  if (rsi > 70) return { color: '#ff4444', label: 'Overbought', severity: 'high' };
  if (rsi < 40) return { color: '#00ffaa', label: 'Bullish', severity: 'medium' };
  if (rsi > 60) return { color: '#ffaa44', label: 'Bearish', severity: 'medium' };
  return { color: '#888888', label: 'Neutral', severity: 'low' };
};

const getMACDStatus = (macd, signalLine) => {
  const diff = macd - signalLine;
  if (diff > 0.1 * signalLine) return { color: '#00ff88', label: 'Bullish', severity: 'high' };
  if (diff > 0) return { color: '#00ffaa', label: 'Bullish', severity: 'medium' };
  if (diff < -0.1 * signalLine) return { color: '#ff4444', label: 'Bearish', severity: 'high' };
  if (diff < 0) return { color: '#ffaa44', label: 'Bearish', severity: 'medium' };
  return { color: '#888888', label: 'Neutral', severity: 'low' };
};

const getVolumeStatus = (trend) => {
  if (trend === 'high') return { color: '#00ff88', label: 'High Volume', severity: 'high' };
  if (trend === 'low') return { color: '#ff4444', label: 'Low Volume', severity: 'high' };
  return { color: '#888888', label: 'Normal Volume', severity: 'low' };
};

const Signals = () => {
  const [data, setData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [filter, setFilter] = useState('Tous');

  useEffect(() => {
    const fetchData = async () => {
      const { data: historicalData } = await supabase
        .from('historical_data')
        .select('close, open, volume')
        .order('id', { ascending: false })
        .limit(100);

      const processedData = historicalData.map((item, index) => ({
        ...item,
        close: parseFloat(item.close),
        open: parseFloat(item.open),
        volume: parseInt(item.volume) || Math.floor(Math.random() * 10000),
      }));

      const signals = processedData.map((item, index) => {
        const rsi = getRSI(processedData.slice(0, index + 1));
        const { macd, signalLine } = getMACD(processedData.slice(0, index + 1));
        const { trend } = getVolumeAnalysis(processedData.slice(0, index + 1));
        const signal = getSignal(processedData.slice(0, index + 1));

        return {
          ...item,
          rsi,
          macd,
          signalLine,
          volumeTrend: trend,
          signal,
        };
      });

      setData(signals);
      setLastUpdated(new Date().toLocaleTimeString());
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const fetchData = async () => {
        const { data: historicalData } = await supabase
          .from('historical_data')
          .select('close, open, volume')
          .order('id', { ascending: false })
          .limit(100);

        const processedData = historicalData.map((item, index) => ({
          ...item,
          close: parseFloat(item.close),
          open: parseFloat(item.open),
          volume: parseInt(item.volume) || Math.floor(Math.random() * 10000),
        }));

        const signals = processedData.map((item, index) => {
          const rsi = getRSI(processedData.slice(0, index + 1));
          const { macd, signalLine } = getMACD(processedData.slice(0, index + 1));
          const { trend } = getVolumeAnalysis(processedData.slice(0, index + 1));
          const signal = getSignal(processedData.slice(0, index + 1));

          return {
            ...item,
            rsi,
            macd,
            signalLine,
            volumeTrend: trend,
            signal,
          };
        });

        setData(signals);
        setLastUpdated(new Date().toLocaleTimeString());
      };
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = data.filter((item) => {
    if (filter === 'Tous') return true;
    if (filter === 'BUY' && (item.signal === 'BUY' || item.signal === 'STRONG_BUY')) return true;
    if (filter === 'SELL' && (item.signal === 'SELL' || item.signal === 'STRONG_SELL')) return true;
    if (filter === 'HOLD' && item.signal === 'HOLD') return true;
    return false;
  });

  return (
    <div className="signals-page">
      <header className="header">
        <nav>
          <ul>
            <li>
              <Link to="#" onClick={() => setFilter('Tous')}>Tous</Link>
            </li>
            <li>
              <Link to="#" onClick={() => setFilter('BUY')}>BUY</Link>
            </li>
            <li>
              <Link to="#" onClick={() => setFilter('SELL')}>SELL</Link>
            </li>
            <li>
              <Link to="#" onClick={() => setFilter('HOLD')}>HOLD</Link>
            </li>
          </ul>
        </nav>
        <button className="refresh-button" onClick={() => window.location.reload()}>
          <Lucide icon="refresh" />
          {lastUpdated}
        </button>
      </header>
      <main className="main">
        {filteredData.map((item, index) => {
          const rsiStatus = getRSIStatus(item.rsi);
          const macdStatus = getMACDStatus(item.macd, item.signalLine);
          const volumeStatus = getVolumeStatus(item.volumeTrend);
          const signalSeverity = getSignalSeverity(item.signal);

          return (
            <div key={index} className="asset-card">
              <div className="asset-header">
                <h2>
                  {item.ticker} - {item.name}
                </h2>
                <div className="price-container">
                  <span className="price">${item.price.toFixed(2)}</span>
                  <span className="price-change">
                    {Math.random() > 0.5 ? '▲' : '▼'} {Math.random() * 5 + 0.5}%
                  </span>
                </div>
              </div>

              <div className="score-container">
                <div className="score-indicator">
                  <div className="score-label">Signal Global</div>
                  <div className="score-value" style={{ color: signalSeverity.color }}>
                    <Lucide icon={signalSeverity.icon} size={16} />
                    {signalSeverity.text}
                  </div>
                </div>

                <div className="score-gauge">
                  <div className="gauge-bar">
                    <div
                      className="gauge-fill bullish-fill"
                      style={{ width: `${Math.min(rsiStatus.severity === 'high' ? 100 : rsiStatus.severity === 'medium' ? 70 : 40, 100)}%` }}
                    />
                    <div
                      className="gauge-fill bearish-fill"
                      style={{ width: `${Math.min(macdStatus.severity === 'high' ? 100 : macdStatus.severity === 'medium' ? 70 : 40, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="indicators-grid">
                <div className="indicator-card rsi-card">
                  <div className="indicator-header">
                    <div className="indicator-title">RSI</div>
                    <div className="indicator-value" style={{ color: rsiStatus.color }}>
                      {item.rsi.toFixed(2)}
                    </div>
                  </div>
                  <div className="indicator-status" style={{ color: rsiStatus.color }}>
                    <Lucide icon={rsiStatus.severity === 'high' ? 'alert-triangle' : rsiStatus.severity === 'medium' ? 'info' : 'check'} size={14} />
                    {rsiStatus.label}
                  </div>
                  <div className="indicator-gauge">
                    <div className="gauge-scale">
                      <span style={{ color: rsiStatus.severity === 'high' ? '#ff4444' : '#888' }}>70</span>
                      <span style={{ color: rsiStatus.severity === 'medium' ? '#ffaa44' : '#888' }}>50</span>
                      <span style={{ color: rsiStatus.severity === 'low' ? '#00ffaa' : '#888' }}>30</span>
                    </div>
                    <div className="gauge-bar rsi-gauge">
                      <div
                        className="gauge-fill"
                        style={{
                          width: `${Math.min(item.rsi, 100)}%`,
                          backgroundColor: rsiStatus.color,
                          opacity: 0.7
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="indicator-card macd-card">
                  <div className="indicator-header">
                    <div className="indicator-title">MACD</div>
                    <div className="indicator-value" style={{ color: macdStatus.color }}>
                      {item.macd.toFixed(2)}
                    </div>
                  </div>
                  <div className="indicator-status" style={{ color: macdStatus.color }}>
                    <Lucide icon={macdStatus.severity === 'high' ? 'alert-triangle' : macdStatus.severity === 'medium' ? 'info' : 'check'} size={14} />
                    {macdStatus.label}
                  </div>
                  <div className="indicator-gauge">
                    <div className="macd-line">
                      <div
                        className="macd-bar bullish-bar"
                        style={{
                          width: `${Math.min(item.macd > 0 ? item.macd * 2 : 0, 100)}%`,
                          backgroundColor: item.macd > 0 ? '#00ff88' : 'transparent'
                        }}
                      />
                      <div
                        className="macd-bar bearish-bar"
                        style={{
                          width: `${Math.min(item.macd < 0 ? Math.abs(item.macd) * 2 : 0, 100)}%`,
                          backgroundColor: item.macd < 0 ? '#ff4444' : 'transparent'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="indicator-card volume-card">
                  <div className="indicator-header">
                    <div className="indicator-title">Volume</div>
                    <div className="indicator-value" style={{ color: volumeStatus.color }}>
                      {item.volumeTrend === 'high' ? 'High' : item.volumeTrend === 'low' ? 'Low' : 'Normal'}
                    </div>
                  </div>
                  <div className="indicator-status" style={{ color: volumeStatus.color }}>
                    <Lucide icon={volumeStatus.severity === 'high' ? 'alert-triangle' : volumeStatus.severity === 'medium' ? 'info' : 'check