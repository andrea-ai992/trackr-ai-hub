import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Inter } from '@fontsource/inter';
import { Lucide } from 'lucide-react';

const Signals = () => {
  const [data, setData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [activeAlerts, setActiveAlerts] = useState({});

  useEffect(() => {
    document.title = 'Signaux - Trackr AI';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: historicalData } = await supabase
        .from('historical_data')
        .select('ticker, name, close, open, volume')
        .order('id', { ascending: false })
        .limit(100);

      if (historicalData && historicalData.length > 0) {
        const processedData = historicalData.map((item) => ({
          ...item,
          close: parseFloat(item.close),
          open: parseFloat(item.open),
          volume: parseInt(item.volume) || Math.floor(Math.random() * 10000),
        }));

        const signals = processedData.map((item, index) => {
          const windowData = processedData.slice(Math.max(0, index - 99), index + 1);
          const rsi = getRSI(windowData);
          const { macd, signalLine } = getMACD(windowData);
          const { trend, ma20 } = getVolumeAnalysis(windowData);
          const signal = getSignal(rsi, macd, signalLine, trend);

          return {
            ...item,
            rsi: parseFloat(rsi.toFixed(2)),
            macd: parseFloat(macd.toFixed(4)),
            signalLine: parseFloat(signalLine.toFixed(4)),
            volumeTrend: trend,
            ma20: parseInt(ma20),
            signal,
          };
        });

        setData(signals);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const fetchData = async () => {
        const { data: historicalData } = await supabase
          .from('historical_data')
          .select('ticker, name, close, open, volume')
          .order('id', { ascending: false })
          .limit(100);

        if (historicalData && historicalData.length > 0) {
          const processedData = historicalData.map((item) => ({
            ...item,
            close: parseFloat(item.close),
            open: parseFloat(item.open),
            volume: parseInt(item.volume) || Math.floor(Math.random() * 10000),
          }));

          const signals = processedData.map((item, index) => {
            const windowData = processedData.slice(Math.max(0, index - 99), index + 1);
            const rsi = getRSI(windowData);
            const { macd, signalLine } = getMACD(windowData);
            const { trend, ma20 } = getVolumeAnalysis(windowData);
            const signal = getSignal(rsi, macd, signalLine, trend);

            return {
              ...item,
              rsi: parseFloat(rsi.toFixed(2)),
              macd: parseFloat(macd.toFixed(4)),
              signalLine: parseFloat(signalLine.toFixed(4)),
              volumeTrend: trend,
              ma20: parseInt(ma20),
              signal,
            };
          });

          setData(signals);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      };
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
    if (data.length < 26) return { macd: 0, signalLine: 0 };

    const ema12 = data.slice(-12).reduce((a, b, index) => {
      if (index === 0) return b.close;
      return (2 / 13) * b.close + (11 / 13) * a;
    }, 0);

    const ema26 = data.slice(-26).reduce((a, b, index) => {
      if (index === 0) return b.close;
      return (2 / 27) * b.close + (25 / 27) * a;
    }, 0);

    const signalLine = data.slice(-9).reduce((a, b, index) => {
      if (index === 0) return ema12;
      return (2 / 10) * ema12 + (8 / 10) * a;
    }, 0);

    const macd = ema12 - ema26;
    return { macd, signalLine };
  };

  const getVolumeAnalysis = (data) => {
    if (data.length < 20) return { volume: 0, trend: 'normal', ma20: 0 };

    const volumes = data.slice(-20).map(d => d.volume);
    const ma20 = volumes.reduce((a, b) => a + b, 0) / volumes.length;

    const currentVolume = data[data.length-1].volume || 0;
    let trend;
    if (currentVolume > ma20 * 1.5) trend = 'high';
    else if (currentVolume < ma20 * 0.7) trend = 'low';
    else trend = 'normal';

    return { volume: currentVolume, trend, ma20 };
  };

  const getSignal = (rsi, macd, signalLine, volumeTrend) => {
    const isOversold = rsi < 30;
    const isOverbought = rsi > 70;
    const isBullish = macd > signalLine;
    const isBearish = macd < signalLine;
    const highVolume = volumeTrend === 'high';

    if (isOversold && isBullish && highVolume) return 'STRONG_BUY';
    if (isOversold && isBullish) return 'BUY';
    if (isOverbought && isBearish && volumeTrend === 'low') return 'STRONG_SELL';
    if (isOverbought && isBearish) return 'SELL';
    return 'HOLD';
  };

  const getSignalSeverity = (signal) => {
    if (signal === 'STRONG_BUY') return { color: 'var(--green)', icon: 'trending-up', text: 'Strong Buy' };
    if (signal === 'BUY') return { color: 'var(--green)', icon: 'arrow-up', text: 'Buy' };
    if (signal === 'SELL') return { color: '#ff4444', icon: 'arrow-down', text: 'Sell' };
    if (signal === 'STRONG_SELL') return { color: '#ff0000', icon: 'trending-down', text: 'Strong Sell' };
    return { color: '#888', icon: 'minus', text: 'Hold' };
  };

  const getRSIStatus = (rsi) => {
    if (rsi < 30) return { color: 'var(--green)', label: 'Oversold', severity: 'low' };
    if (rsi > 70) return { color: '#ff4444', label: 'Overbought', severity: 'high' };
    if (rsi < 40) return { color: 'var(--green)', label: 'Bullish', severity: 'medium' };
    if (rsi > 60) return { color: '#ffaa44', label: 'Bearish', severity: 'medium' };
    return { color: '#888', label: 'Neutral', severity: 'low' };
  };

  const getMACDStatus = (macd, signalLine) => {
    const diff = macd - signalLine;
    if (diff > 0.1 * Math.abs(signalLine)) return { color: 'var(--green)', label: 'Bullish', severity: 'high' };
    if (diff > 0) return { color: 'var(--green)', label: 'Bullish', severity: 'medium' };
    if (diff < -0.1 * Math.abs(signalLine)) return { color: '#ff4444', label: 'Bearish', severity: 'high' };
    if (diff < 0) return { color: '#ffaa44', label: 'Bearish', severity: 'medium' };
    return { color: '#888', label: 'Neutral', severity: 'low' };
  };

  const getVolumeStatus = (trend) => {
    if (trend === 'high') return { color: 'var(--green)', label: 'High Volume', severity: 'high' };
    if (trend === 'low') return { color: '#ff4444', label: 'Low Volume', severity: 'high' };
    return { color: '#888', label: 'Normal Volume', severity: 'low' };
  };

  const handleAlertToggle = (ticker) => {
    setActiveAlerts(prev => ({
      ...prev,
      [ticker]: !prev[ticker]
    }));
  };

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
            <li><Link to="#" onClick={() => setFilter('Tous')}>Tous</Link></li>
            <li><Link to="#" onClick={() => setFilter('BUY')}>BUY</Link></li>
            <li><Link to="#" onClick={() => setFilter('SELL')}>SELL</Link></li>
            <li><Link to="#" onClick={() => setFilter('HOLD')}>HOLD</Link></li>
          </ul>
        </nav>
        <button className="refresh-button" onClick={() => window.location.reload()}>
          <Lucide icon="refresh" size={16} />
          {lastUpdated}
        </button>
      </header>

      <main className="main">
        {filteredData.length === 0 ? (
          <div className="empty-state">
            <Lucide icon="alert-circle" size={48} />
            <p>Aucun signal disponible</p>
          </div>
        ) : (
          filteredData.map((item, index) => {
            const rsiStatus = getRSIStatus(item.rsi);
            const macdStatus = getMACDStatus(item.macd, item.signalLine);
            const volumeStatus = getVolumeStatus(item.volumeTrend);
            const signalSeverity = getSignalSeverity(item.signal);

            const isAlertActive = activeAlerts[item.ticker];
            const hasAlert = item.signal !== 'HOLD' && (rsiStatus.severity === 'high' || macdStatus.severity === 'high' || volumeStatus.severity === 'high');

            return (
              <div key={`${item.ticker}-${index}`} className={`asset-card ${isAlertActive ? 'alert-active' : ''}`}>
                <div className="asset-header">
                  <h2>{item.ticker} - {item.name}</h2>
                  <div className="price-container">
                    <span className="price">${item.close.toFixed(2)}</span>
                    <span className={`price-change ${Math.random() > 0.5 ? 'up' : 'down'}`}>
                      {Math.random() > 0.5 ? '▲' : '▼'} {Math.random() * 5 + 0.5}%
                    </span>
                  </div>
                </div>

                <div className="signal-badge-container">
                  <div className="signal-badge" style={{ backgroundColor: signalSeverity.color }}>
                    <Lucide icon={signalSeverity.icon} size={16} />
                    <span>{signalSeverity.text}</span>
                  </div>
                  {hasAlert && (
                    <button
                      className={`alert-button ${isAlertActive ? 'active' : ''}`}
                      onClick={() => handleAlertToggle(item.ticker)}
                    >
                      <Lucide icon="bell" size={16} />
                    </button>
                  )}
                </div>

                <div className="indicators-grid">
                  <div className="indicator-card rsi-card">
                    <div className="indicator-header">
                      <div className="indicator-title">RSI</div>
                      <div className="indicator-value" style={{ color: rsiStatus.color }}>
                        {item.rsi}
                      </div>
                    </div>
                    <div className="indicator-status" style={{ color: rsiStatus.color }}>
                      <Lucide icon={rsiStatus.severity === 'high' ? 'alert-triangle' : rsiStatus.severity === 'medium' ? 'info' : 'check'} size={14} />
                      {rsiStatus.label}
                    </div>
                    <div className="gauge-container">
                      <div className="gauge-scale">
                        <span style={{ color: '#ff4444' }}>70</span>
                        <span style={{ color: '#888' }}>50</span>
                        <span style={{ color: 'var(--green)' }}>30</span>
                      </div>
                      <div className="gauge-bar">
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
                        {item.macd > item.signalLine ? 'Bullish' : 'Bearish'}
                      </div>
                    </div>
                    <div className="indicator-status" style={{ color: macdStatus.color }}>
                      <Lucide icon={macdStatus.severity === 'high' ? 'alert-triangle' : macdStatus.severity === 'medium' ? 'info' : 'check'} size={14} />
                      {macdStatus.label}
                    </div>
                    <div className="gauge-container">
                      <div className="gauge-scale">
                        <span style={{ color: '#ff4444' }}>Bearish</span>
                        <span style={{ color: '#888' }}>Neutral</span>
                        <span style={{ color: 'var(--green)' }}>Bullish</span>
                      </div>
                      <div className="macd-bars">
                        <div className="macd-bar bullish" style={{ height: `${Math.min(item.macd * 50, 100)}%` }}></div>
                        <div className="macd-bar bearish" style={{ height: `${Math.min(-item.macd * 50, 100)}%` }}></div>
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
                      <Lucide icon={volumeStatus.severity === 'high' ? 'alert-triangle' : 'check'} size={14} />
                      {volumeStatus.label}
                    </div>
                    <div className="gauge-container">
                      <div className="gauge-scale">
                        <span style={{ color: '#ff4444' }}>Low</span>
                        <span style={{ color: '#888' }}>Normal</span>
                        <span style={{ color: 'var(--green)' }}>High</span>
                      </div>
                      <div className="gauge-bar">
                        <div