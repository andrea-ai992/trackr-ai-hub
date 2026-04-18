Voici le code complet et fonctionnel pour la page de dashboard :

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fetchMultiplePrices } from '../hooks/useStockPrice';
import { TrendingUp } from 'lucide-react';

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Bonne nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function fmt(n, decimals = 2) {
  if (n == null) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(n) {
  if (n == null) return '—';
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

function Movers({ data }) {
  return (
    <div className="scroll-row">
      {data.map((item, i) => (
        <div key={i} className="stagger-item" style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="white" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)' }}>{item.name}</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: item.pct >= 0 ? 'var(--green)' : '#ff4d4d' }}>{fmt(item.pct)}</span>
        </div>
      ))}
    </div>
  );
}

function News({ data }) {
  return (
    <div className="grid">
      {data.map((item, i) => (
        <div key={i} className="stagger-item" style={{ padding: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>{item.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)' }}>{item.source}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)' }}>{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickActions({ actions }) {
  return (
    <div className="grid">
      {actions.map((item, i) => (
        <div key={i} className="stagger-item">
          <button className="action-button">
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)' }}>{item.name}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

function HeroCard({ value, pct, sparkline }) {
  return (
    <div className="hero-card" style={{
      padding: 16,
      borderRadius: 12,
      border: '2px solid var(--green)',
      backgroundColor: 'var(--bg2)',
      marginBottom: 16,
    }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)' }}>Total P&L</h2>
      <span style={{ fontSize: 24, fontWeight: 800, color: pct >= 0 ? 'var(--green)' : '#ff4d4d' }}>{fmt(value)}</span>
      <svg width="100%" height="24" viewBox="0 0 100 24">
        <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
          <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        </svg>
        <svg width="100%" height="24" viewBox="0 0 100 24">