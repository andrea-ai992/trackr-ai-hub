import { useState, useEffect, useRef } from 'react';
import { Line } from 'lucide-react';

const SignalsChart = ({ data, symbol }) => {
  const [activeTab, setActiveTab] = useState('rsi');
  const [chartWidth, setChartWidth] = useState(375);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = chartWidth * dpr;
    canvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const padding = 20;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(0,255,136,0.08)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight * i) / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      for (let i = 0; i <= 10; i++) {
        const x = padding + (chartWidth * i) / 10;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
    };

    const drawRSI = () => {
      if (!data.rsi) return;

      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;

      const values = data.rsi.values;
      const oversold = 30;
      const overbought = 70;

      ctx.beginPath();
      for (let i = 0; i < values.length; i++) {
        const x = padding + (chartWidth * i) / (values.length - 1);
        const y = padding + chartHeight - ((values[i] - 0) / 100) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0,255,255,0.5)';
      ctx.beginPath();
      ctx.moveTo(padding, padding + chartHeight - ((overbought - 0) / 100) * chartHeight);
      ctx.lineTo(width - padding, padding + chartHeight - ((overbought - 0) / 100) * chartHeight);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,0,0,0.5)';
      ctx.beginPath();
      ctx.moveTo(padding, padding + chartHeight - ((oversold - 0) / 100) * chartHeight);
      ctx.lineTo(width - padding, padding + chartHeight - ((oversold - 0) / 100) * chartHeight);
      ctx.stroke();
    };

    const drawMACD = () => {
      if (!data.macd) return;

      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;

      const values = data.macd.values;
      const signal = data.macd.signal;

      ctx.beginPath();
      for (let i = 0; i < values.length; i++) {
        const x = padding + (chartWidth * i) / (values.length - 1);
        const y = padding + chartHeight - ((values[i] - Math.min(...values)) / (Math.max(...values) - Math.min(...values))) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,0,0.7)';
      ctx.beginPath();
      for (let i = 0; i < signal.length; i++) {
        const x = padding + (chartWidth * i) / (signal.length - 1);
        const y = padding + chartHeight - ((signal[i] - Math.min(...signal)) / (Math.max(...signal) - Math.min(...signal))) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const drawVolume = () => {
      if (!data.volume) return;

      ctx.fillStyle = '#00ff88';
      const values = data.volume.values;

      for (let i = 0; i < values.length; i++) {
        const x = padding + (chartWidth * i) / (values.length - 1);
        const barWidth = chartWidth / (values.length - 1) * 0.8;
        const barHeight = (values[i] / Math.max(...values)) * chartHeight;
        ctx.fillRect(x - barWidth / 2, padding + chartHeight - barHeight, barWidth, barHeight);
      }
    };

    const drawScore = () => {
      if (!data.signals) return;

      const bullish = data.signals.bullish || 0;
      const bearish = data.signals.bearish || 0;
      const total = bullish + bearish;
      const bullishPercent = total > 0 ? (bullish / total) * 100 : 0;
      const bearishPercent = total > 0 ? (bearish / total) * 100 : 0;

      ctx.font = '12px JetBrains Mono';
      ctx.fillStyle = '#00ff88';
      ctx.textAlign = 'left';
      ctx.fillText(`Bullish: ${bullish} (${bullishPercent.toFixed(1)}%)`, padding, padding - 10);
      ctx.fillStyle = '#ff0000';
      ctx.fillText(`Bearish: ${bearish} (${bearishPercent.toFixed(1)}%)`, padding + 120, padding - 10);
    };

    drawGrid();
    drawScore();

    if (activeTab === 'rsi') drawRSI();
    else if (activeTab === 'macd') drawMACD();
    else if (activeTab === 'volume') drawVolume();
  }, [data, activeTab, chartWidth]);

  if (!data) return <div style={{ color: 'var(--text-muted)' }}>No data available</div>;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        backgroundColor: 'var(--surface)',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('rsi')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'rsi' ? 'var(--neon)' : 'var(--surface-low)',
            color: activeTab === 'rsi' ? 'var(--bg)' : 'var(--text-primary)',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          RSI
        </button>
        <button
          onClick={() => setActiveTab('macd')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'macd' ? 'var(--neon)' : 'var(--surface-low)',
            color: activeTab === 'macd' ? 'var(--bg)' : 'var(--text-primary)',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          MACD
        </button>
        <button
          onClick={() => setActiveTab('volume')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'volume' ? 'var(--neon)' : 'var(--surface-low)',
            color: activeTab === 'volume' ? 'var(--bg)' : 'var(--text-primary)',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Volume
        </button>
      </div>

      <div style={{ position: 'relative', height: '200px' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '200px' }} />
      </div>

      <div style={{ marginTop: '16px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-secondary)' }}>
        {symbol}
      </div>
    </div>
  );
};

export default SignalsChart;